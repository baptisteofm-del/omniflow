# DECISION_LOG.md

Records decisions so they aren't silently re-debated later (spec 47.14, 47.153, 48.110–111). Format: Date / Decision / Context / Reason / Alternatives / Impact.

---

### 2026-08-07 — OmniFlow V1 is a full rebuild, not an iteration on the existing product
- **Context**: the `omniflow` repo already contains a working (if undertested) SaaS for OnlyFans/MYM agency operations — model roster, chatting, trends, prospection, credits billing.
- **Decision**: the new spec (48 parts) is the sole source of truth. The existing product's UX, feature set, and business model do not constrain the new one.
- **Reason**: spec Part 01 §0.5 ("this cahier des charges becomes OmniFlow's source of truth... in case of conflict, the new spec always wins") and Part 48 §48.8 ("REBUILD EVERYTHING FROM A CLEAN BASE").
- **Alternatives considered**: incrementally patch the existing product (rejected — explicitly excluded by the spec itself).
- **Impact**: see `REBUILD_PLAN.md` Keep/Refactor/Replace/Delete-later map.

### 2026-08-07 — Commission rate is 2.5%, not the existing product's 10%
- **Context**: current code (`src/lib/plans.ts`, `AGENTS.md`) defines a 10% "AI chatting" commission. The new spec (Parts 1, 15, 18, 22, 26, 34, 37, 42, 43) states 2.5% consistently across every occurrence, with 10% appearing only as the *marketing comparison baseline* against traditional human chatters.
- **Decision**: 2.5% is the OmniFlow commission rate for V1. Confirmed explicitly by the owner (Baptiste) when asked directly.
- **Reason**: owner confirmation; also the spec's own conflict-resolution priority (Part 34 §34.74: more recent/explicit spec decision wins) already pointed the same direction before confirmation was asked.
- **Alternatives considered**: keep 10% (rejected by owner).
- **Impact**: billing model (Phase 13), pricing page (Phase 2), ROI calculator copy, `commission_ledger` rate field default.

### 2026-08-07 — Parts 02 and 03 are not missing; their content is merged into Part 01
- **Context**: the numbering jumps from `OmniFlow_01` to `OmniFlow_04` in the provided files; spec Part 35/36 both list 02 and 03 as required, separate files.
- **Decision**: treat Part 01 as containing all of Parts 01–03's content (it literally contains "PARTIE 0", "PARTIE 1", "PARTIE 2 — OFFRES & BUSINESS MODEL", and "PARTIE 3 — ARCHITECTURE GÉNÉRALE" as internal sections).
- **Reason**: owner confirmation ("les partie 2 et 3 sont en fait toute la partie 1 c'est normal").
- **Impact**: none — spec is treated as complete (46/48 numbered files present, covering all 48 parts' content).

### 2026-08-07 — The previously-drafted `0001_init.sql` Supabase migration is superseded, not executed
- **Context**: earlier in this engagement (before the new spec was shared), a consolidated migration fixing the old schema's RLS/security gaps was drafted, intended to be run on a fresh Supabase project.
- **Decision**: do not run it. Spec Part 28 defines a different data model for the new product; the old 46-table schema (even fixed) doesn't match it.
- **Reason**: building on the wrong data model would create rework, not save it. No production data exists yet, so there's no cost to starting clean per Part 28 instead.
- **Alternatives considered**: run `0001_init.sql` first, then migrate again later (rejected — pure waste, no data to protect in the interim).
- **Impact**: `supabase/migrations/0001_init.sql` is kept in the repo as a reference for RLS-writing patterns and as a record of security issues found in the old schema, but is explicitly marked "not applicable to the new schema" (see `CURRENT_STATE_AUDIT.md` §3).

### 2026-08-07 — Staging environment = Vercel's automatic Preview Deployments, no second Vercel project
- **Context**: spec 3.25/47.17 requires LOCAL/STAGING/PRODUCTION separation. Only one Vercel project exists for `omniflow`, deploying `main` to production (`www.omniflowapp.ai`, the old product).
- **Decision**: use Vercel's built-in per-branch Preview Deployments as the staging environment, rather than provisioning a second Vercel project. `docs/omniflow-v1-audit` (and its successor branches) get their own preview URL automatically on every push.
- **Reason**: free, zero extra setup, and Vercel-idiomatic; production stays untouched (still deploys only from `main`) until an explicit decision to cut over.
- **Impact**: when the new app starts calling Supabase (~Phase 3), its env vars get set at the Preview scope in Vercel, pointing at the new Supabase project — not touching Production's env vars.

### 2026-08-07 — New, separate Supabase project for the rebuild; old project paused, not deleted
- **Context**: owner is on Supabase's free tier, capped on concurrent active projects.
- **Decision**: old project paused (Project Settings → General → Pause), new project created for the V1 rebuild, `0001_foundation.sql` applied successfully (verified: 9 permission rows).
- **Reason**: avoids the schema-collision risk of reusing the old project (old `agencies` table has an incompatible shape; `create table if not exists` would silently skip creating the new one). Pausing (not deleting) keeps the old project as a reference/safety net.
- **Impact**: none blocking — Phase 1 database work proceeds on the new project.

### 2026-08-07 — No production client data exists; this is a greenfield technical rebuild, not a live migration
- **Context**: needed to know whether Phase 0/1 database work must preserve existing rows.
- **Decision**: treat the rebuild as greenfield. No backup/dry-run/rollback machinery is needed for data preservation (though it's still needed for schema correctness before Phase 1 ships).
- **Reason**: owner confirmation ("déployé mais pas encore de vrais clients").
- **Impact**: simplifies Phase 1 — no data migration scripts required, only schema creation.
