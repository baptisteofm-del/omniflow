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
| Anthropic SDK called directly from 6 old `(dashboard)` route files + `src/lib/ai/chatting.ts`, exactly what spec 5.2 forbids ("never scatter direct provider calls across the codebase") | Old product, untouched by the rebuild (still serves Production) | Not migrated; the new `src/lib/ai/gateway.ts` (Phase 7) is the only AI entry point for new-build features. Old routes stay as-is until the features they power are rebuilt or retired |

## Accepted in this rebuild

| Item | Description | Disposition |
|---|---|---|
| `fan_memories` has no version history table yet (spec 8.37: created/updated/confirmed/contradicted/expired should be historized) | Phase 6 vertical slice stores only current state; contradictions are overwritten (most recent wins), not journaled | Add `fan_memory_versions` when a feature actually needs the history (e.g. an audit view or a "why did this change" trace) |
| `fan_scores` has no history table (spec 9.9 implies score evolution should be traceable over time, not just the current value) | Same reasoning — one current row per fan, `version` int increments but old values aren't kept | Add score history once Analytics (Phase 12) or Benchmark needs a time series |
| AI analysis (Phase 7) is manually triggered ("Analyser avec l'IA" button), not automatic per incoming message | Keeps early testing cheap and deterministic while there's no Benchmark or cost guardrails yet (spec 5.29) | Automatic triggering arrives with Copilot (Phase 8), where suggestion generation naturally runs per incoming message anyway |
| AI Gateway ships with a single Fast-tier model for both tasks, no Model Router tiers/escalation/fallback chain (spec 5.7, 5.11, 5.19) yet | Only 2 tasks exist so far; building tiering/escalation logic now would be scaffolding without a second data point to justify it | Revisit once Response Generation (Phase 8) and a second model class are actually needed |
| No Benchmark / eval harness (spec Part 30) exists yet — prompt quality was only caught by the owner manually reading one test conversation, which is exactly how `memory-extraction-v1` shipped with the category-misuse bug (see BUILD_PROGRESS.md) | Part 30's full Benchmark/Gold Dataset machinery is explicitly a later phase, not Phase 7 | Before Phase 11 (Full AI) goes anywhere near real fans, a minimal eval set (a handful of hand-labeled mock conversations checked on every prompt change) should exist — flagged here so it isn't forgotten |
