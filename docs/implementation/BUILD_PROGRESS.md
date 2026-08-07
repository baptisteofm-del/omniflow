# BUILD_PROGRESS.md

Per spec 47.194. Updated at the end of every phase.

---

**Current Phase**: Phase 1 — Technical Foundations (in progress)
**Current Milestone**: Milestone A — FOUNDATION READY (spec 47.173)

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

**In Progress**: Phase 1 — remaining tasks: environment separation (staging Supabase project + Vercel staging), `.env.example` for the new (smaller) var set, centralized env var validation, tenant-isolation smoke test, `authorize()` middleware in application code, structured logging foundation.

**Blocked**: None for Phase 1. Phase 14 (real platform integrations) remains pre-emptively flagged blocked pending Q1/Q2 in `OPEN_QUESTIONS.md`.

**Tests**: None yet — `REQUIREMENTS_MATRIX.md` row 76 (cross-agency isolation tests) is the first test debt to close in this phase.

**Next**:
1. Owner runs `0001_foundation.sql` on a Supabase project (new or reset) once ready to test it live.
2. `.env.example` + env validation.
3. Tenant isolation smoke test (2 fake agencies, cross-access must fail).
4. `authorize()` central permission-check function in application code.

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
