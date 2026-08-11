# OPEN_QUESTIONS.md

Format per spec 47.155: Question / Why it matters / Blocking? / Recommended option / Owner / Status.

---

### Q1 — OnlyFans authorized integration path
- **Why it matters**: spec 19.110/47.110 requires confirming a legitimate, technically-verified integration method before building the real connector. No unofficial/scraping-style access is acceptable (spec 3.13, 19, 47.112).
- **Research finding (2026-08-11, live web search)**: no public official OnlyFans API exists. The entire "OF agency CRM" market (Infloww, this product's own pre-rebuild codebase, and dedicated infrastructure providers like OFAuth/OnlyFansAPI.com/OFMAPI) runs on reverse-engineered session-token access — there is no other technical path found. **Separately, and more consequentially**: OnlyFans' 2026 policy explicitly prohibits autonomous AI from sending DMs (human-must-send + mandatory AI-disclosure labeling, ban penalty ladder for violations), per multiple independent third-party sources — not verified against OnlyFans' own primary ToS directly (egress-blocked from the build sandbox). This caps what Full AI can ever do on real OnlyFans conversations regardless of integration method: Copilot-only.
- **Blocking?**: Owner overrode the spec's caution (2026-08-11): "n'écoute pas ma spec sur ce point là, on doit réussir à les connecter et c'est tout." Decision: connect via a third-party provider (OFAuth or OnlyFansAPI.com) rather than in-house reverse-engineering, Copilot-only (no autonomous Full AI sends) to respect the AI-sending policy finding above. Sequenced **after** MYM per owner's explicit choice.
- **Owner**: Baptiste
- **Status**: OVERRIDDEN — proceeding, MYM first. Owner should independently verify the AI-sending-ban finding against OnlyFans' current official Terms/Acceptable Use policy before Full AI (even attempted) touches a real OnlyFans account, and should set up an OFAuth/OnlyFansAPI.com account before that connector can be built.

### Q2 — MYM authorized integration path
- Same shape as Q1. **Research finding**: no public MYM chat API found (only a limited accounting API for top creators); no MYM-specific policy restriction on AI-assisted/autonomous sending was found in research (absence of evidence, not confirmed permission).
- **Blocking?**: Owner overrode the spec's caution (2026-08-11), same as Q1 — MYM goes first specifically because no usage restriction was found for it. Read-only connector (`0019_mym_real_connector.sql`, `src/lib/platforms/mymAdapter.ts`) built reusing the pre-rebuild codebase's already-working reverse-engineered MYM client. Real *sending* (Copilot/Full AI/human replies actually reaching MYM) is a deliberately separate, not-yet-started follow-up — see `BUILD_PROGRESS.md`.
- **Owner**: Baptiste
- **Status**: OVERRIDDEN — in progress. Owner should verify MYM's own terms regarding AI-assisted/autonomous messaging before Full AI is enabled on a real MYM conversation, since no explicit permission was found (only no explicit ban).

### Q3 — Final subscription prices
- **Why it matters**: spec Part 1 gives "99€/mo Copilot, 199€/mo + 2.5% Full AI" as an explicit **starting point, not a locked final price** ("Les montants d'abonnement pourront être modifiés avant le lancement commercial... ils ne doivent donc pas être codés en dur").
- **Blocking?**: Not blocking — build pricing as configurable from day one (already a P0 requirement, row 56 in `REQUIREMENTS_MATRIX.md`), lock exact numbers before Phase 25 (pre-launch).
- **Recommended option**: use 99€/199€+2.5% as the working default; revisit before public pricing page goes live.
- **Owner**: Baptiste
- **Status**: OPEN (non-blocking)

### Q4 — Primary AI provider confirmation
- **Why it matters**: spec Part 5/18 says Anthropic is the likely V1 primary provider "if tests confirm necessary performance," but the architecture must not hard-depend on it. Current code already uses `@anthropic-ai/sdk` directly (no abstraction).
- **Blocking?**: Not blocking Phase 1–6; matters starting Phase 7 (AI Gateway).
- **Recommended option**: keep Anthropic as the initial provider behind the new abstraction layer; no action needed until Phase 7.
- **Owner**: Baptiste (confirm no objection)
- **Status**: OPEN (non-blocking)

### Q5 — What happens to the old omniflow product's non-Chatting pillars (trends, prospection, video gen, Telegram)?
- **Why it matters**: this code exists, is wired to real third-party services (Apify, Kling, Higgsfield, n8n, Telegram Bot API, corresponding API keys), and is explicitly out of V1 scope per spec 34.57–34.61. Deleting vs. archiving vs. leaving it untouched has different repo-hygiene implications.
- **Blocking?**: Not blocking Phase 1.
- **Recommended option**: leave the code in place but disconnected from the new app (per `REBUILD_PLAN.md`, classified "Delete later," not "Delete now"); revisit once V1 Chatting is proven, per spec 34's own framing ("NOT BEFORE THE CORE PRODUCT PROVES VALUE" — these could return as future pillars, not necessarily be discarded).
- **Owner**: Baptiste
- **Status**: OPEN (non-blocking)

### Q6 — Archive/delete the 62 root-level `.md`/`.txt` report files and old `AGENTS.md`?
- **Why it matters**: repo hygiene; these are stale AI session logs, several actively misleading (e.g. `ARCHITECTURE.md` documents one feature, not the architecture; `AGENTS.md` references a 10% commission and a branch that no longer exists).
- **Blocking?**: Not blocking.
- **Recommended option**: archive under a single `docs/_legacy/` folder rather than delete outright, then update/replace `AGENTS.md` with instructions pointing to `/docs/specification/` and `/docs/implementation/`.
- **Owner**: Baptiste
- **Status**: OPEN

### Q7 — Current Vercel/Supabase project state (staging environment)
- **RESOLVED (2026-08-07)**: single Vercel project (`omniflow`), production deploys from `main` (live at `www.omniflowapp.ai` — the old product, untouched by this work). Vercel auto-generates a Preview deployment for every pushed branch, including `docs/omniflow-v1-audit` — this is used as the staging environment, no second Vercel project needed. New Supabase project (created 2026-08-07) will be wired to Preview-scoped env vars when the app starts calling it (~Phase 3).
- Side note: a `clean-main` branch appears in Vercel's "Active Branches" list (stale — referenced in the old `AGENTS.md`) but no longer exists on GitHub (`git branch -a` confirms only `main` + `docs/omniflow-v1-audit`). No action needed, just a leftover Vercel deployment record.
- **Owner**: Baptiste
- **Status**: RESOLVED

### Q8 — Legal entity / commercial terms review
- **Why it matters**: spec Part 42/45 makes legal/privacy/commission-disclosure review a hard pre-production gate (not pre-Phase-1).
- **Blocking?**: Blocks Phase 17/25 only, far downstream.
- **Recommended option**: no action needed now; flag for revisit when approaching pilot readiness.
- **Owner**: Baptiste
- **Status**: OPEN (not urgent)

### Q9 — Logo/brand asset to use
- **Why it matters**: `public/` contains 5 logo variants (`logo.svg`, `logo-v1/v2/v3.svg`, `logo-icon.svg`). Spec 47.30 says reuse "the validated OmniFlow logo," implying one specific version is canonical.
- **Blocking?**: Blocks Phase 2 (design system/landing) only.
- **Recommended option**: owner confirms which variant is current before Phase 2 starts.
- **Owner**: Baptiste
- **Status**: OPEN
