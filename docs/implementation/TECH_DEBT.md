# TECH_DEBT.md

Per spec 47.157–47.158: no hidden shortcuts. This file tracks accepted debt visibly.

---

## Inherited from the old product (not created by this rebuild)

| Item | Description | Disposition |
|---|---|---|
| No `.env.example` ever existed | 33 env vars used across the old codebase with no documented list | Will not be carried forward — new, smaller var set gets a proper `.env.example` from Phase 1 |
| 31 loose, unordered SQL migration files | No migration tool, no guaranteed apply order, several tables defined twice with incompatible shapes | Superseded by Part 28 schema; old files kept in git history only, not executed |
| Zero automated tests, zero CI | Nothing in the old product is regression-tested | New build follows spec Part 32's testing pyramid from Phase 1 onward — this is now a P0 requirement (`REQUIREMENTS_MATRIX.md` row 75), not deferred debt |
| Real RLS/security gaps found in old schema (missing policies on 3 billing tables, public-read bug on `email_drip_log`, unscoped storage bucket policies) | Documented in `CURRENT_STATE_AUDIT.md` §3 | Not exploitable going forward since the old schema is not being deployed; documented for the record only |

## Accepted in this rebuild (none yet)

No implementation work has started yet (Phase 0 = audit only). This section will be updated at the end of each phase per the process in spec 47.150/47.162 — any shortcut taken during a phase must be logged here before that phase is marked `DONE`.
