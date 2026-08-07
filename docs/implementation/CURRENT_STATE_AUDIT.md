# CURRENT_STATE_AUDIT.md

Audit of the existing `omniflow` repository against the OmniFlow V1 specification (`/docs/specification/`, parts 01–48).
Date: 2026-08-07.

This document does not judge the old product's business decisions. It answers one question per area: **is this technically healthy enough to reuse as infrastructure, or does it need to be rebuilt to match the new spec?**

Per spec Part 35/47/48: the old product experience (landing, dashboard, navigation, feature structure) is **not** the reference. Only technically sound infrastructure is a reuse candidate.

---

## 1. Framework & stack

| Item | Current state |
|---|---|
| Framework | Next.js 16.2.6 (Turbopack), App Router |
| Language | TypeScript, `strict: true` |
| UI | React 19, Tailwind CSS 4, Radix UI primitives, Framer Motion, lucide-react |
| State | Zustand |
| DB/Auth | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| AI | `@anthropic-ai/sdk` (only Claude, called directly from route handlers — no router/abstraction layer) |
| Billing | Paddle (`@paddle/paddle-js`) + NOWPayments (crypto) |
| Media | ffmpeg.wasm (client-side video processing) |
| Other integrations | Kling (video gen), Higgsfield (referenced in lib but not audited in depth), n8n (webhook orchestration), Resend (email), Telegram Bot API |
| Build | `next build` succeeds cleanly; `npx tsc --noEmit` passes with zero errors once `next-env.d.ts` exists |
| Tests | **None.** Zero test files anywhere in the repo. |
| CI | **None.** No `.github/workflows`. |

**Verdict: the toolchain itself (Next.js/TS/Supabase/Tailwind) is healthy and can be reused.** The application built on top of it cannot (see below).

---

## 2. Routes & application structure

- `src/app/(marketing)`, `(auth)`, `(dashboard)`, `admin` — route groups exist and are reasonably organized.
- 93 API routes under `src/app/api/`, covering: accounts, admin, ai, auth, chatting, content, credits, dashboard, email, finance, integrations, invite, media, models, notifications, nowpayments, onboarding, paddle, posting, promos, prospection, referral, reports, settings, support, team, telegram, trends, tutorial, usage.
- This route set maps to the **old OmniFlow product** (agency ops tool: model roster, content posting, trend scraping, prospection, chatting reports) — none of it maps to the **new spec's** core loop (Copilot/Full AI conversation engine, Fan Memory, Sales Decision Engine, Script branching, Commission Ledger).

**Verdict: REBUILD.** Per spec 47.38/47.44 ("Create the new connected interface from scratch") and 24.1 ("DO NOT PATCH THE OLD CONNECTED APP"), the authenticated app and its routes are not extended — they are replaced. A handful of route *patterns* (auth callback, webhook signature verification in `/api/paddle`) are worth reading as reference before rebuilding equivalents, not reused directly.

---

## 3. Database (Supabase)

- **231 commits of history**, but the schema itself lives in **31 loose, unordered `.sql` files** in `supabase/` (`add_*.sql`, `fix_*.sql`, one `MIGRATION_COMPLETE.sql` that is not actually a consolidation) plus a baseline `schema.sql`. No migration tool, no ordering, no way to know with certainty what's applied to any given Supabase project.
- A full static audit of these 31 files (done earlier in this engagement) found: two tables (`trend_feedback`, `notifications`, `chatting_list_config`, `fan_notes`) defined twice with **incompatible shapes**, depending on filesystem execution order; a broken foreign key (`add_model_photo.sql` references a table that doesn't exist); an auto-topup trigger that only exists in the *non-idempotent* v1 credits file, not the "safe" v2 everyone was told to use.
- **Real security gaps found**: `agency_sales`, `credit_purchases`, `agency_extra_models` had **zero RLS** — any agency could read/write another agency's billing data. Storage bucket policies for `avatars`/`media` allowed any authenticated user to overwrite/delete any other agency's files. `email_drip_log`'s RLS policy contained a literal `OR true`, making it public-readable. `referrals` had RLS *enabled* but **no policy at all**, silently breaking the feature. Nearly every table's RLS policy checked `owner_id = auth.uid()` only — invited team members (a fully-built feature) were locked out of almost everything except two tables.
- An initial remediation was produced during this engagement: `supabase/migrations/0001_init.sql`, a single consolidated, idempotent migration fixing all of the above. **It has not been run against any Supabase project.**

**This remediation is now superseded.** Spec Part 28 defines a fundamentally different, AI-native data model (~55 tables: `fan_memories` with confidence/expiry, `ai_decisions`/`ai_actions` as a first-class audit trail, `scripts`/`script_nodes`/`script_edges`/`script_runs` as a real state machine, `offers`/`negotiations`, `commission_ledger` with rate snapshots, `ai_benchmark_*`). The old 46-table schema (prospection, trends, chatting_reports as flat logs, credits-as-currency) does not map onto it. `0001_init.sql` is kept as a reference for RLS-writing patterns and as a record of the security issues found, but **should not be executed** — the new schema per Part 28 supersedes it.

**Verdict: REBUILD**, following Part 28's blueprint. Auth (Supabase Auth itself, `handle_new_user()` trigger pattern, RLS-via-`is_agency_member()`-style helper function) is a pattern worth reusing; the table set is not.

---

## 4. Authentication

- Supabase Auth with email/password, an `agencies` + `profiles` auto-provisioning trigger on signup (`handle_new_user()`), and a team-invitation flow (`team_members`/`team_invitations`) that is fully built in application code but was **functionally broken** by the RLS gap above (owner-only policies almost everywhere).
- No tests of tenant isolation exist anywhere.

**Verdict: KEEP THE PATTERN, REBUILD THE SCHEMA.** The signup→auto-agency-creation trigger pattern and Supabase Auth itself are sound and directly reusable once rebuilt against the new schema (spec 3.4, 47.20, 28.4–28.10 describe the same shape: agency + membership + role).

---

## 5. AI implementation

- `src/lib/ai/chatting.ts` calls the Anthropic SDK **directly** from a route handler. No Model Router, no task registry, no provider abstraction, no structured-output validation layer, no prompt versioning, no cost ledger.
- Chatting IA in the old product is a flat feature gated to one plan tier ("Agency" plan, unlimited Claude Haiku) — not a decision engine. There is no Fan Memory, no Fan Scoring, no Creator DNA, no Sales Strategy Engine, no Script Engine with branching, no Pricing/Negotiation Engine, no AI Benchmark, no observability for AI calls (cost/latency/model tracked nowhere).

**Verdict: REBUILD.** Nothing in the current AI implementation is reusable against spec Parts 4–18 — it's a different order of system (single prompt → reply) versus what's specified (Model Router → Context Builder → Decision Engine → Action Validator → Conversation Engine → Executor). The Anthropic SDK dependency and API key handling pattern (server-only, never in frontend) is the one thing worth carrying forward.

---

## 6. Billing / integrations

- Paddle (subscriptions) + NOWPayments (crypto top-ups) + a credits system (`RUN` packs) — this entire commercial model (Starter 99€/Pro 199€/Agency 349€ tiers, 10% chatting commission, credit packs) **conflicts with the new spec's locked business model** (Copilot 99€/mo, Full AI 199€/mo + 2.5% commission on eligible sales — confirmed by the owner on 2026-08-07, see `DECISION_LOG.md`).
- Kling/Higgsfield (video generation), n8n (webhook orchestration for outreach), Telegram bot integration, Apify (Instagram trend scraping) — all belong to the old product's non-Chatting pillars (trend monitoring, content generation, prospection), which are **explicitly out of scope for V1** per spec 34.57–34.61.

**Verdict: REMOVE (for V1 scope) / REBUILD (billing).** None of these are wired into the new Chatting-only V1. Billing must be rebuilt against the new plan structure and 2.5% commission ledger (spec Part 22). The Paddle webhook-handling *pattern* (signature verification, idempotency) is worth a glance before rebuilding, not reused as-is.

---

## 7. Environment variables

33 distinct env vars found in use (Supabase ×3, Anthropic, Apify, Kling, N8N, NOWPayments, Paddle, Resend, Telegram, cron secrets). **No `.env.example` exists in the repo** — a real onboarding/deployment gap independent of the rebuild.

**Verdict: REBUILD**, matching whatever the new architecture's provider abstraction (spec 47.65–47.68, "AI Gateway + model routing") actually needs — likely a much smaller, cleaner set focused on Supabase, one AI provider initially, one billing provider, and a Mock Platform Connector (no OnlyFans/MYM credentials needed until Phase 14/23).

---

## 8. Deployment

- Vercel, per `vercel.json` and cron references in old commits (`cron horaire → quotidien` fix for Hobby-plan limits). No staging environment configuration found — only local/production implied.

**Verdict: INVESTIGATE.** Vercel itself is a reasonable target (spec 3.25 wants Local/Staging/Production separated — currently only 2 of 3 appear configured). Needs the owner to confirm current Vercel project state and whether a staging project should be created before Phase 1.

---

## 9. Existing tests / security posture

- Zero automated tests of any kind (unit, integration, E2E) — confirmed via full repo search.
- No CI pipeline.
- The RLS/security gaps in section 3 were **not caught by any test** — they were found via manual static analysis during this engagement.

**Verdict: REBUILD**, following spec Part 32's testing pyramid from the start of Phase 1 rather than bolted on later — the spec is explicit that this is how the last product's failure mode (invisible security bugs) gets avoided this time.

---

## 10. Documentation

- 62 loose `.md`/`.txt` files at the repo root (`STATUS.md`, `IMPLEMENTATION_REPORT.md`, `DELIVERY_SUMMARY.txt`, `ARCHITECTURE.md`, etc.) — these are session-by-session AI work logs from prior development, not living documentation. `ARCHITECTURE.md`, despite its name, documents one narrow feature (avatar upload), not the system architecture.
- `AGENTS.md` (repo-level agent instructions) references a branch (`clean-main`) that no longer exists, and an old plan/commission structure (Starter/Pro/Agency, 10%) that the new spec supersedes.

**Verdict: REMOVE/ARCHIVE** (not yet done — pending owner confirmation, since this is destructive-ish and out of the DB-safety-critical path). Superseded by the new `/docs/specification/` + `/docs/implementation/` structure (spec 34.5, 36.45, 48.77).

---

## 11. Summary classification table

| Area | Classification | Why |
|---|---|---|
| Next.js/TS/Tailwind/Supabase toolchain | **KEEP** | Healthy, matches spec's own tech direction (3.15, 25.5) |
| Supabase Auth + signup trigger pattern | **KEEP (pattern), REBUILD (schema)** | Auth mechanism sound; schema it provisions is wrong |
| Database schema (31 loose SQL files + `0001_init.sql`) | **REBUILD** | Wrong data model for the new product; superseded by spec Part 28 |
| Authenticated app / dashboard / navigation | **REBUILD** | Explicit spec mandate (24.1, 47.38); wrong feature set for V1 |
| Landing page | **REBUILD** | Explicit spec mandate (23.3, 47.31) |
| AI implementation (direct Anthropic calls) | **REBUILD** | No router, no decision engine, no memory, no benchmark |
| Billing (Paddle + NOWPayments + credits) | **REBUILD** | Business model conflicts with locked 2.5%-commission decision |
| Trend scraping / prospection / video gen / Telegram / n8n | **REMOVE (V1 scope)** | Out of scope per spec 34.57–34.61 (Marketing/Recruitment pillars) |
| Environment/deployment config | **INVESTIGATE** | Needs owner confirmation of current Vercel/staging state |
| 62 root-level `.md`/`.txt` reports | **ARCHIVE/REMOVE** | Superseded by `/docs/specification/` + `/docs/implementation/`; pending owner go-ahead |
| Tests / CI | **REBUILD (from zero)** | None currently exist |

**No production client data exists yet** (confirmed by the owner, 2026-08-07) — this significantly lowers the risk of the REBUILD classifications above; there is no live-data migration to protect, only decisions about which old code/assets to keep as reference.
