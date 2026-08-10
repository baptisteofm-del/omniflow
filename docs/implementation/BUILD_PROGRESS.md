# BUILD_PROGRESS.md

Per spec 47.194. Updated at the end of every phase.

---

**Current Phase**: Phase 6 — Fan Memory + Scoring (code written, awaiting owner validation)
**Current Milestone**: Milestone B — CHAT CORE READY, complete. Next milestone is Copilot usable daily on mock environment (spec 47.75 / spec 33 Milestone 3), reached via Phases 6-8.

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

- **Landing page V2** shipped per owner's detailed corrections doc: revenue-first hero copy with animated bilingual-correct (French) product demo, dual scrolling banners, 6-capability AI sales engine section, chatters-vs-OmniFlow comparison, interactive economic calculator (explicitly not paired with fabricated stats — see Decision Log), FAQ accordion, final CTA.
- **Phase 3 (auth) validated end-to-end by the owner**: new `(app)` route group (auth-gated layout + `/home`), rebuilt `/login` and `/register` on new schema/design, signup → `handle_new_user()` trigger → agency + user + membership created → login → `/home` shows correct agency name/plan/role. Confirmed working live via the owner's own test on the Preview deployment (new Supabase project's env vars added to Vercel, scoped to Preview only — Production untouched).

- **Phase 4 (Creator DNA + commercial settings) validated end-to-end by the owner**: `0002_creator_dna.sql` (creator_ai_profiles, creator_commercial_settings) + `/creators` list + `/creators/new` form (identity, Simple Mode DNA sliders, commercial toggles) via a `createCreator` server action.
- **Real bug found and fixed in production testing**: `0001_foundation.sql`'s "Agency members can view teammates" policy on `users` caused infinite RLS recursion (a raw correlated subquery on `users` inside a policy defined on `users` itself), breaking every query against that table — surfaced as "Utilisateur introuvable" when creating a creator. Fixed in `0003_fix_users_rls_recursion.sql` by moving the check into a `SECURITY DEFINER` helper function (`shares_agency_with`), the same safe pattern already used by `is_agency_member()`/`has_permission()`. Applied by the owner and confirmed working.

- **Phase 5 (conversations + Mock Connector) validated end-to-end by the owner**: `0004_conversations.sql` (platforms seeded MOCK/ONLYFANS/MYM, platform_connections, fans, conversations, messages) + `/inbox` (list + start-test-conversation) + `/inbox/[id]` (thread, human reply composer, MOCK test panel to simulate a fan message and a purchase). Owner confirmed a full scenario works: start conversation → simulate fan message → reply as creator → simulate purchase. This satisfies Phase 5's exit criteria exactly (spec 47.57) and completes **Milestone B — CHAT CORE READY**.
- Clarified for the owner: the reply composer = agency operator typing as the creator; the MOCK panel = simulates the fan (no real platform yet); no AI is wired in at this stage — that's Phase 7 (AI Gateway) / Phase 8 (Copilot), intentionally not built yet.

- **Phase 6 (Fan Memory + Scoring) code written, awaiting owner to apply the migration and validate**: `0005_fan_memory_scoring.sql` — `fan_memories` (categories per spec 8.4: profile/relationship/preference/commercial/conversation/temporal/boundary, with confidence/importance/source/status per 8.12-8.14/8.29) and `fan_scores` (5 core scores + OmniScore slot + reasons + version, per spec 9.2/9.11, one current row per fan). Scores and memories are human-entered/editable at this stage (spec 8.28) — no AI extraction or auto-scoring yet, that lands with the AI Gateway / Fan Intelligence Engine phases. UI: a "Fan Intelligence" panel added to `/inbox/[id]` (next to the conversation) showing the 5 score bars (editable) and the fan's active memories (add / confirm / soft-delete). `next build` verified clean.

**In Progress**: Phase 6 — waiting on the owner to run `0005_fan_memory_scoring.sql` and validate the panel on `/inbox/[id]` (add a memory, set scores, confirm they persist). Phase 1's remaining app-code items (`authorize()` middleware, structured logging, tenant-isolation automated test) remain intentionally deferred until a feature actually needs them.

**Backlog (not blocking)**: Creator DNA "Advanced Mode" (spec Part 6's full 12-section editor) — current form is Simple Mode only; owner flagged it needs more depth, scheduled for a later pass.

**Blocked**: None. Phase 14 (real platform integrations) remains pre-emptively flagged blocked pending Q1/Q2 in `OPEN_QUESTIONS.md`.

**Tests**: None yet — `REQUIREMENTS_MATRIX.md` row 76 (cross-agency isolation tests) remains open, to be closed once a second agency exists to test isolation against.

**Next**:
1. Owner applies `0005_fan_memory_scoring.sql`, validates Fan Intelligence panel on a mock conversation.
2. Once validated: Phase 7 (AI Gateway) — the first real AI wiring, needed before Copilot suggestions or Full AI replies can exist.

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
