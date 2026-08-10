# BUILD_PROGRESS.md

Per spec 47.194. Updated at the end of every phase.

---

**Current Phase**: Phase 8 (Copilot) validated by owner on the mock environment.
**Current Milestone**: Working toward **spec 33 Milestone 3 — "Copilot Alpha Ready"** (the first genuinely shippable internal product). Gate per spec 33.35: AI suggestion works ✅ · Model routing works ✅ (Fast/Standard tiers) · Structured output validated ⚠️ partial (JSON is parsed, not schema-validated against a strict contract — see Tech Debt) · Feedback recorded ✅ (Human Edit Tracking) · AI cost visible internally ❌ (stored in `ai_decisions.estimated_cost`, no UI reads it yet) · Human remains in control ✅. Not all-green yet — see Next.

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

- **Phase 6 (Fan Memory + Scoring) code written**: `0005_fan_memory_scoring.sql` — `fan_memories` (categories per spec 8.4: profile/relationship/preference/commercial/conversation/temporal/boundary, with confidence/importance/source/status per 8.12-8.14/8.29) and `fan_scores` (5 core scores + OmniScore slot + reasons + version, per spec 9.2/9.11, one current row per fan). UI: a "Fan Intelligence" panel on `/inbox/[id]` (next to the conversation) showing the 5 score bars and the fan's active memories, with manual add/confirm/soft-delete kept permanently as the human-correction path required by spec 8.28.
- **Owner asked, correctly, why scores/memory entry was manual** — clarified that Phase 6's own exit criteria (spec 47.63) only required the data model + a human view/correct path, and that AI-driven extraction was deliberately Phase 7's job per the build order. Owner wants the AI doing this now rather than waiting, so **Phase 7 (AI Gateway) was pulled forward and built immediately after Phase 6**, in the same push.
- **Phase 7 (AI Gateway) code written**: `0006_ai_gateway.sql` — `ai_decisions` (spec 28.31, logs every AI call: task, model, prompt version, structured output, status, latency, estimated cost). `src/lib/ai/gateway.ts` — minimal provider-agnostic `runAiTask()` (spec 5.2: single entry point, nothing calls Anthropic directly outside this file for new-build code), a 2-task Task Registry (`MEMORY_EXTRACTION`, `FAN_SCORING`), Fast-tier Model Registry (spec 5.3/5.12), JSON structured-output parsing, per-call cost estimate and audit logging. `src/lib/ai/tasks.ts` — centralized, versioned prompts (spec 5.14) for both tasks. `src/lib/ai/actions.ts` — `analyzeConversationWithAI()`: reads the mock conversation transcript, calls the AI for memory extraction (with a write gate: confidence threshold + merge-into-existing-memory instead of duplicating, spec 8.16/8.19) and for the 5 scores, writes both into Phase 6's tables tagged `source: 'ai'` / `computed_by: 'system'`. Wired to a new "Analyser avec l'IA" button on the Fan Intelligence panel; the panel now shows whether each memory/score came from a human or the AI. `next build` verified clean (with placeholder env vars locally — no live Supabase/Anthropic reachable from this sandbox).
- **Security note**: the owner pasted a real Anthropic API key directly into chat while we were discussing Phase 7. Flagged immediately: that key must never go into code/commits, the owner was asked to revoke/regenerate it on console.anthropic.com and add the new one only as a Vercel env var (`ANTHROPIC_API_KEY`, scoped to Preview, same pattern as Supabase). No key value was used or stored anywhere in the repo.
- **First live test surfaced a real prompt bug**: on a mock conversation (creator flirting, sending a photo, fan reacting), the AI extracted a `boundary` memory reading "arnaque/sextorsion détectée" and referenced "manipulation"/"exploitation" in the score reasons. Root cause: the Phase 7 prompts (`memory-extraction-v1`, `fan-scoring-v1`) gave the model no business context and no precise definition of the `boundary` category, so Haiku defaulted to a generic safety heuristic and misused a fan-preference category to moralize about the conversation itself — a category-misuse hallucination, not a real detection. Fixed in `memory-extraction-v2` / `fan-scoring-v2` (`src/lib/ai/tasks.ts`): both prompts now state the legitimate business context explicitly (adult-content agency, legal activity between consenting adults), define every memory category precisely (per spec 8.4-8.10, `boundary` = the fan's own personal limits, never a judgment on the exchange), and explicitly forbid moralizing/accusatory language in any extracted field.
- **Owner re-ran the analysis on an unchanged conversation and got a different result** — correctly flagged this. Two causes: (1) the prompt version changed between runs (expected), and (2) `runAiTask()` had no `temperature` set, so Claude sampled non-deterministically even on identical input. Fixed: `temperature: 0` in `src/lib/ai/gateway.ts` for these extraction/scoring tasks (spec 5.13 — structured outputs feeding business logic need to be reliable, not creative).
- **Owner requirement: analysis must be automatic, not a manual click** — `scheduleAnalysis()` added to `src/lib/inbox/actions.ts`; `sendHumanMessage`/`simulateFanMessage`/`simulatePurchase` now call `analyzeConversationWithAI()` via Next's `after()` once the response has been sent, so it never adds latency to sending a message. `ConversationView` schedules a second `router.refresh()` ~4s after any send to pick up the background result (the AI call takes a couple seconds, so the immediate refresh is usually too early). The manual "Ré-analyser" button stays as a force-refresh convenience, not a requirement — the panel now says "Mis à jour automatiquement par l'IA après chaque message." **Owner confirmed working live.**
- **Fan dossier UI, owner-requested after comparing against a competitor (MyFeed)**: `0007_fan_profile_tags_notes.sql` — dedicated `fans` columns (birthday, location, income_amount/frequency, subscription_status, source, per owner's choice of structured fields over freeform AI memory), `tags`/`fan_tags` (agency-scoped "Listes", many-to-many), `fan_notes` (spec 8.30 — human notes, never touched by the AI). New `FanProfileCard` component on `/inbox/[id]` (Valeur Fan — total spent/purchase count computed from real purchase messages, not fabricated; Fan Flow stage badge — New/Connaissance/Prêt/Spender, derived from that real data + the existing purchase-intent score, `src/lib/fans/fanFlow.ts`; editable Profil/Abonnement; Listes; Notes). `/inbox` list now shows each conversation's tags and supports filtering by tag via `?tag=`.
- **Owner flagged the layout: Fan Intelligence and Fan Profile were two separate side-by-side columns, not intentional** — merged into a single sticky, scrollable right column (`/inbox/[id]`), matching a single-panel reference the owner pointed at.
- **Owner explicitly chose to advance "le fond" (substance) over "la forme" (UI polish) next** — proceeding straight to Phase 8 (Copilot) rather than further visual refinement of the fan dossier.
- **Phase 8 (Copilot) shipped**: `0008_copilot.sql` — `copilot_suggestions` (one main suggestion at a time per spec 11.29 "avoid too many choices"; Human Edit Tracking per spec 11.30: `suggested_text`/`final_text`/`edit_distance`/status/who resolved it). AI Gateway extended with a third task, `RESPONSE_GENERATION`, on a new Standard model tier (Sonnet, vs. Fast/Haiku for extraction+scoring — spec 5.12's routing table). `src/lib/ai/tasks.ts` — `buildResponseGenerationPrompt()`: feeds the creator's published Model DNA, the fan's active memory, and the transcript; explicitly forbids the AI from inventing prices/offers ("Decision Engine = what to do, Conversation Engine = how to say it", spec 11.1 — no Decision Engine exists yet, so the AI is instructed to never act as one). `src/lib/copilot/actions.ts` — generate/regenerate (with optional quick-action wording tweak: shorter/direct/affectionate, spec 11.31)/send/discard. Sending always goes through a human clicking Send (spec 11.32). A new `ai_mode` toggle (Humain/Copilot) on `/inbox/[id]` gates the feature per conversation; suggestions generate automatically after each fan message when a conversation is in Copilot mode.
- **Two real bugs found and fixed during first live test**: (1) `runAiTask()` didn't check the error on its own `ai_decisions` audit-log insert, so a missing/broken table failed completely silently — surfaced when the owner hit `0008` before `0006` had actually been applied and got a confusing "relation ai_decisions does not exist", even though the feature itself had been working. Fixed: the insert error is now logged. (2) "Générer une suggestion" failed with a 400 from Anthropic: `temperature is deprecated for this model` — Sonnet 5 (Standard tier) rejects the parameter that Haiku 4.5 (Fast tier) still accepts, which is why Fan Intelligence had never hit this. Fixed: `temperature` is now omitted entirely for tasks without an explicit entry in `TEMPERATURE_BY_TASK`, instead of guessing a replacement param. **Owner confirmed Copilot working end-to-end after both fixes.**

**In Progress**: Nothing blocking — Phase 8 is live and validated. Remaining gaps before spec 33's Milestone 3 gate is fully green (see header): structured-output schema validation (currently parse-or-throw, no retry/fallback chain per spec 5.13/11.28) and an internal view of AI cost (data exists in `ai_decisions.estimated_cost`, no UI reads it). Neither blocks daily use on mock data. Phase 1's remaining app-code items (`authorize()` middleware, structured logging, tenant-isolation automated test) remain intentionally deferred until a feature actually needs them.

**Backlog (not blocking)**: Creator DNA "Advanced Mode" (spec Part 6's full 12-section editor) — current form is Simple Mode only; owner flagged it needs more depth, scheduled for a later pass.

**Blocked**: None. Phase 14 (real platform integrations) remains pre-emptively flagged blocked pending Q1/Q2 in `OPEN_QUESTIONS.md`.

**Tests**: None yet — `REQUIREMENTS_MATRIX.md` row 76 (cross-agency isolation tests) remains open, to be closed once a second agency exists to test isolation against.

**Next**:
1. Phase 9 (Script Engine + branching): `scripts`, `script_versions`, `script_nodes`, `script_edges`, `script_runs`; purchased/not-purchased branching; exit criteria — a mock fan can enter a script, buy or not, follow the correct branch, emit an analytics event (spec 47.83). Not started yet — awaiting owner go-ahead.

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
