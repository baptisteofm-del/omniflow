# REBUILD_PLAN.md

Converts the spec's build order (Part 47, "IMPLEMENTATION MASTER ORDER") into a concrete plan against the actual `omniflow` repository, per `CURRENT_STATE_AUDIT.md`.

Status legend: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `READY_FOR_REVIEW`, `DONE`.

---

## Existing → Keep / Refactor / Replace / Delete-later map

| Existing element | Disposition | Notes |
|---|---|---|
| Next.js/TS/Tailwind/Supabase project skeleton | **Keep** | New app builds inside the same repo, same toolchain |
| `src/lib/supabase/{client,server}.ts` | **Refactor** | Pattern is fine; will need to match new schema/types |
| Supabase Auth + `handle_new_user()` trigger pattern | **Refactor** | Reuse the mechanism, rebuild what it provisions (Part 28 schema) |
| 31 loose SQL files + `0001_init.sql` | **Delete later** | Superseded by Part 28 schema; keep in git history, don't execute; safe to archive under `supabase/_legacy/` once owner confirms |
| `src/app/(marketing)`, `(dashboard)`, `(auth)`, `admin`, and their components | **Replace** | Explicit spec mandate; old UI is reference-only if ever consulted |
| 93 existing API routes | **Replace** | New API surface follows Part 29's `/api/v1/*` namespace and module boundaries |
| `src/lib/ai/chatting.ts` (direct Anthropic calls) | **Replace** | New AI Gateway/Model Router (Part 5, Part 18) replaces this entirely |
| Paddle + NOWPayments + credits system | **Replace** | New billing model (subscription + 2.5% commission, Part 22) is incompatible with credits-as-currency |
| Kling / Higgsfield / Apify / n8n / Telegram integrations | **Delete later** | Out of V1 scope (Marketing/Recruitment/content pillars); not deleted immediately, just disconnected from the new app's dependency graph |
| 62 root `.md`/`.txt` reports + old `AGENTS.md` | **Delete later** | Superseded by `/docs/specification/` + `/docs/implementation/`; pending explicit owner go-ahead before deletion (not yet given) |
| `public/logo*.{png,svg}` assets | **Keep (pending review)** | Spec 47.30 says reuse "the validated OmniFlow logo" — owner should confirm which of the 5 logo variants in `public/` is current |

No production data exists to migrate (confirmed by owner) — this is a **greenfield rebuild inside the existing repo/Supabase project**, not a live migration.

---

## Build order (adapted from spec Part 47.145, "Exact Order")

Each phase below lists concrete first tasks against this repo. Phases are sequential; do not start a phase before the previous one's exit criteria (spec 47.x "Phase N Exit") are met.

### Phase 0 — Audit (THIS DELIVERABLE)
- [x] Read all 46 available spec parts
- [x] Audit current repo (`CURRENT_STATE_AUDIT.md`)
- [x] Produce this rebuild plan
- [ ] **Owner Checkpoint 1** (spec 47.184): present Keep/Refactor/Replace/Delete-later map above, get explicit go-ahead before Phase 1

### Phase 1 — Technical foundations
- Set up `LOCAL` / `STAGING` / `PRODUCTION` environment separation (currently only prod-like config exists — needs a staging Supabase project + Vercel preview/staging setup)
- Centralized env var validation (no `.env.example` currently exists — create one for the *new*, smaller var set)
- Implement Part 28's core schema: `agencies`, `users`, `agency_memberships`, `roles`, `permissions`, `role_permissions`, `creators` — in that dependency order, as a new numbered migration (`0001_foundation.sql`), **not** by editing `0001_init.sql`
- Tenant isolation smoke test (2 fake agencies, cross-access must fail) before any feature work — spec 47.21
- RBAC middleware / `authorize(user, permission, agency, resource)` central function (Part 21, Part 29)
- Structured logging + request IDs (Part 31 foundations)
- **Exit**: tenant isolation tested, auth stable, environments separated (spec 47.27)

### Phase 2 — Design system + landing page
- New design tokens (spec 47.28–47.30); confirm which logo asset is canonical with owner first
- Rebuild landing from scratch per Part 23's section list (hero → problem → Copilot/Full AI → ROI calculator → dashboard preview → pricing → FAQ → footer)
- **Exit**: landing coherent, responsive, fast, pricing-ready (spec 47.37)

### Phase 3 — Authenticated app shell
- New navigation: Dashboard, Inbox, Fans, Scripts, Media, Follow-ups, Analytics, Creators, Team, Integrations, Billing, Settings (Part 24)
- Agency/creator context switching, empty states
- **Exit**: app shell navigable before any AI logic is wired in (spec 47.44)

### Phase 4 — Creator DNA + commercial configuration
- `creator_ai_profiles` (Model DNA), `creator_commercial_settings` tables (Part 28.13–28.14)
- Onboarding for creator identity/personality/boundaries (Part 6, Part 39)
- **Exit**: a complete creator can be created with no external platform connected (spec 47.50)

### Phase 5 — Conversation domain + Mock Platform Adapter
- `fans`, `conversations`, `messages`, `platforms`, `platform_connections` (Part 28.15–28.30)
- Mock Connector implementing the full `PlatformAdapter` interface (Part 3.13, Part 19) — unblocks all further development without OnlyFans/MYM access
- Manual (human) chat working end-to-end on mock data first
- **Exit**: `fan sends → human sees → human replies → purchase can be simulated` (spec 47.57)

### Phase 6 — Fan Memory + Scoring
- `fan_memories`, `fan_scores`, `fan_score_history` (Part 28.20–28.24)
- 5 core scores: Purchase Intent, Relationship, Spending Potential, Engagement, Churn Risk (Part 9)
- **Exit**: memory + scores correctly retrieved for a mock conversation (spec 47.63)

### Phase 7 — AI Gateway + model routing
- Provider abstraction (`generate(task, context, options)`), Model Router, Task Registry (Part 5, Part 18)
- `ai_decisions` table + structured-output validation (Part 28.31)
- **Exit**: AI can analyze a mock conversation and produce a contextualized structured decision (spec 47.71)

### Phase 8 — Copilot
- Suggestion generation → human review → edit/regenerate/send, feedback instrumentation (Part 11, Part 4)
- **Exit**: Copilot usable daily on mock environment (spec 47.75) — **this is the first genuinely shippable internal product**, per spec 33 Milestone 3

### Phase 9 — Script Engine + branching
- `scripts`, `script_versions`, `script_nodes`, `script_edges`, `script_runs` (Part 28.36–28.42)
- Purchased/not-purchased branching, recovery strategies (Part 13)
- **Exit**: mock fan can enter a script, buy or not, follow correct branch, emit analytics event (spec 47.83)

### Phase 10 — Media + Offer engine
- `media_assets`, `offers`, pricing hierarchy enforcement (Part 14, Part 15, Part 28.43–28.51)
- Pricing Validator as a hard server-side gate — this is explicitly the most safety-critical component in the entire spec
- **Exit**: mock simulates AI choosing offer → correct media → correct price → purchase/no purchase (spec 47.89)

### Phase 11 — Full AI
- Action Validator, kill switch, human takeover (Part 4, Part 10, Part 24)
- **Exit**: Full AI passes critical scenarios on mock (spec 47.95)

### Phase 12 — Analytics core
- Event pipeline, P0/P1 dashboard KPIs (Part 20, Part 44)
- **Exit**: mock-scenario data matches dashboard exactly (spec 47.100)

### Phase 13 — Billing + Commission
- Subscription (Copilot 99€/mo, Full AI 199€/mo), `commission_ledger` with 2.5% rate snapshot (Part 22, Part 28.53–28.59)
- **Exit**: financial golden tests pass (€100 sale → €2.50 commission, etc. — spec 47.108)

### Phase 14 — Real platform integrations
- **BLOCKED pending owner action** — see `OPEN_QUESTIONS.md`. Confirm authorized OnlyFans/MYM integration method before this phase starts; continue other phases with Mock Connector in the meantime (spec 47.111).

### Phase 15 — Support + Admin + Operations
- Internal admin backoffice (Part 27, Part 41), support (Part 40), observability (Part 31)

### Phase 16 — Benchmark gate
- **Mandatory stop.** Per spec 47.121: at this point, feature expansion stops and the first full AI benchmark runs before any real pilot traffic. Claude Code must say this explicitly when this phase is reached — not skip it.

### Phase 17 — Security/privacy/release readiness
- Execute Part 45's full checklist; resolve Part 42 legal blockers

### Phase 18 — Pilot
- Limited agencies, Copilot-first, instrumented (Part 45, Part 47.132–47.137)

### Phase 19 — Production rollout
### Phase 20 — Continuous improvement (Part 46)

---

## Immediate next step

Phase 0 is complete pending **Owner Checkpoint 1**. Do not start Phase 1 until the owner has reviewed `CURRENT_STATE_AUDIT.md`'s classification table and this plan, and confirmed:
1. Agreement with the Keep/Refactor/Replace/Delete-later map
2. Answers to the blocking items in `OPEN_QUESTIONS.md`
