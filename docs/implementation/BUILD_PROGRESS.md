# BUILD_PROGRESS.md

Per spec 47.194. Updated at the end of every phase.

---

**Current Phase**: Phase 2 — Design System + Landing Page (in progress; started in parallel with Phase 1's remaining lightweight items, which are deferred to when Phase 3 actually needs them — see note below)
**Current Milestone**: Milestone A — FOUNDATION READY (database done; app-side auth/RBAC deferred to Phase 3) → moving toward Milestone B

**Completed**:
- Read all 46 available spec parts (`/docs/specification/`)
- Audited current repository — stack, routes, database, security, tests, docs (`CURRENT_STATE_AUDIT.md`)
- Produced rebuild plan mapped to spec Part 47's build order (`REBUILD_PLAN.md`)
- Produced requirements matrix (`REQUIREMENTS_MATRIX.md`)
- Logged locked decisions, including owner-confirmed 2.5% commission rate (`DECISION_LOG.md`)
- Logged 9 open questions, none of which block Phase 1 start except where noted (`OPEN_QUESTIONS.md`)
- Logged inherited technical debt (`TECH_DEBT.md`)

- **Owner Checkpoint 1**: APPROVED (2026-08-07) — owner confirmed to proceed with Phase 1.
- Old schema reference (`0001_init.sql`) relocated to `docs/_legacy/0001_init_OLD_SCHEMA_DO_NOT_RUN.sql`, clearly marked, freeing `supabase/migrations/` for the real sequence.
- First real migration written: `supabase/migrations/0001_foundation.sql` — `agencies`, `users`, `roles`, `permissions`, `role_permissions`, `agency_memberships`, `creators`, `creator_access`; `is_agency_member()` / `has_permission()` RLS helpers; seeded system roles (Owner/Admin/Manager/Chatter/Viewer) and permission catalog; `handle_new_user()` signup trigger rebuilt against the new tables. **Not yet run against any Supabase project.**

- `.env.example` added (Phase 1).
- Owner created a new Supabase project, applied `0001_foundation.sql` successfully (verified: 9 permission rows, no errors).
- Staging environment resolved (Vercel Preview Deployments, see Decision Log).
- **First landing page pass shipped** (Phase 2): new design tokens (violet→blue→cyan gradient from the brand logo), rebuilt Navbar/Hero/Footer, new ProductValue + ModesComparison (Copilot vs Full AI) + PricingSection (99€ Copilot / 199€+2.5% Full AI). Old-product JSON-LD claims and fabricated review numbers removed from the marketing layout. `next build` verified clean. Not yet visually reviewed by the owner — first pass, expect iteration.

**In Progress**: Phase 2 continuing (remaining landing sections per spec Part 23: ROI calculator, dashboard preview, FAQ, final CTA). Phase 1's remaining app-code items (`authorize()` middleware, structured logging, tenant-isolation automated test) are intentionally deferred to Phase 3, when real auth/app-shell code exists to attach them to — building them with no caller yet would be the "premature abstraction" the spec's own vertical-slices principle (47.147) warns against.

**Blocked**: None. Phase 14 (real platform integrations) remains pre-emptively flagged blocked pending Q1/Q2 in `OPEN_QUESTIONS.md`.

**Tests**: None yet — `REQUIREMENTS_MATRIX.md` row 76 (cross-agency isolation tests) remains open, to be closed in Phase 3 alongside `authorize()`.

**Next**:
1. Owner reviews the landing page preview (Vercel → `docs/omniflow-v1-audit` branch → Preview deployment) and gives feedback.
2. Continue Phase 2: ROI calculator, remaining sections.
3. Phase 3: authenticated app shell, real auth wiring, `authorize()`, tenant isolation test.

---

## Reminders that must stay visible until resolved

```
UPCOMING MANDATORY GATE:
Run the first full AI benchmark at Milestone I (Phase 16), before any real pilot traffic.
```

```
EXTERNAL BLOCKER:
Confirm authorized OnlyFans and MYM integration methods (OPEN_QUESTIONS.md Q1/Q2) before Phase 14.
```

```
PRE-PRODUCTION BLOCKER:
Complete legal/privacy/AI-provider/platform review (OPEN_QUESTIONS.md Q8) before Phase 17/25.
```
