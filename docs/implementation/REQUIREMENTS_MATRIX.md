# REQUIREMENTS_MATRIX.md

Requirements extracted from the 46 available spec parts, organized by domain. This is not exhaustive at the level of every individual rule (the spec contains several thousand atomic statements) — it captures every **requirement cluster** at a granularity useful for planning and tracking. The full detail for any row lives in its Source Part(s).

Priority: `P0` mandatory for a safe core, `P1` required for a strong V1, `P2` after core, `P3` future.
Status: corrected 2026-08-11 against the actual codebase (was left at 100% `NOT_STARTED` since before Phase 1, despite ~29 phases having since shipped). Rows not individually annotated below inherit `DONE` if their whole domain section is marked done, else assume `NOT_STARTED`. See `BUILD_PROGRESS.md` for the narrative and `TECH_DEBT.md` for known partial gaps.

**Real gaps (P0, not done)**: #29 Sales Strategy/Negotiation Engine (Full AI sells at listed price, doesn't negotiate), #38 Negotiation Engine, #41 idempotency keys (present in a few spots, not systematic), #45 kill switch (Global scope is SQL-only, no admin UI), #25 AI structured-output server-side schema validation, #66-70 benchmark/Golden Set harness + gates, #74 admin backoffice (doesn't exist in the new app), #75-79 automated testing pyramid. Rows #74-84 (admin backoffice, testing, benchmark gates, legal/compliance review) are pre-production gates the roadmap always scheduled for later — not oversights, just not started yet.
**Also not started (P1)**: #31 Commercial Fatigue tracking, #40 Smart Follow-ups, #39 custom-content config, #82 separate Support AI, #61 failed-payment workflow (billing provider is still mock), #11 Model DNA versioning (Advanced Mode itself is also not built), #20 score calibration against real outcomes.
**Done**: Foundations (#1-7), Fan Memory/Intelligence (#14-19), Model DNA Simple mode (#8-9), AI orchestration core (#21-24, #26-27 partial), Script Engine (#32-34), Media/Pricing (#35-37), Full AI action validator + kill switch minus Global-scope UI (#42-46), MYM real adapter (#47-49, #50 half — MYM done, OnlyFans not), team/permissions (part of Foundations), billing entitlement + commission math with mock provider (#56-60 partial).

| # | Requirement | Source Part(s) | Priority | Status |
|---|---|---|---|---|
| **Foundations** |
| 1 | Multi-tenant isolation at DB/backend level, never frontend-only | 3, 21, 25, 28, 34, 42 | P0 | NOT_STARTED |
| 2 | Agency → Users → Roles → Permissions → Creators core schema | 3, 21, 28 | P0 | NOT_STARTED |
| 3 | Central `authorize(user, permission, agency, resource)` function | 21, 29 | P0 | NOT_STARTED |
| 4 | RBAC roles: Owner, Admin, Manager, Chatter, Viewer/Analyst | 21 | P0 | NOT_STARTED |
| 5 | Every business query tenant-scoped; never trust client-supplied `agency_id` | 21, 28, 29, 42 | P0 | NOT_STARTED |
| 6 | LOCAL / STAGING / PRODUCTION environment separation | 3, 25 | P0 | NOT_STARTED |
| 7 | Centralized env var validation, no secrets in frontend/logs/repo | 3, 25, 42 | P0 | NOT_STARTED |
| **Creator / Model DNA** |
| 8 | Creator entity with per-creator isolated environment | 3, 28 | P0 | NOT_STARTED |
| 9 | Model DNA: identity/personality/writing style/vocabulary/boundaries (Simple + Advanced mode) | 6 | P0 | NOT_STARTED |
| 10 | Model DNA ≠ commercial strategy — strict separation from Sales Strategy Engine | 4, 6, 11 | P0 | NOT_STARTED |
| 11 | Model DNA versioning + Diff-before-apply, never silent overwrite | 6, 17 | P1 | NOT_STARTED |
| 12 | Conversation import pipeline with 5-way signal separation (style/fact/fan/strategy/performance) | 7 | P1 | NOT_STARTED |
| 13 | Historical import never overrides explicit current settings | 6, 7, 17, 25, 30 | P0 | NOT_STARTED |
| **Fan Memory & Intelligence** |
| 14 | Structured Fan Memory (7 categories), confidence/importance/expiry per item | 8, 28 | P0 | NOT_STARTED |
| 15 | Memory isolation: Agency → Creator → Platform → Fan, no cross-contamination | 8, 28, 42 | P0 | NOT_STARTED |
| 16 | Memory retrieval engine: never inject full history, relevance-filtered context | 3, 8, 18, 25 | P0 | NOT_STARTED |
| 17 | Anti-Creepy Guard on memory callbacks | 8, 11 | P1 | NOT_STARTED |
| 18 | 6 core Fan Intelligence scores: Purchase Intent, Relationship, Spending Potential, Engagement, Churn Risk, OmniScore | 9, 28 | P0 | NOT_STARTED |
| 19 | Score explainability (main factors shown, not raw model reasoning) | 9, 24 | P1 | NOT_STARTED |
| 20 | Score calibration against real outcomes before being trusted | 9, 30 | P1 | NOT_STARTED |
| **AI Orchestration** |
| 21 | OmniFlow Brain: single decision-intelligence pipeline (not single-prompt chatbot) | 4 | P0 | NOT_STARTED |
| 22 | Strict separation: Decision Engine (what to do) vs Conversation Engine (how to say it) | 4, 6, 11, 25 | P0 | NOT_STARTED |
| 23 | AI Model Router / provider abstraction, no direct provider calls scattered in code | 5, 18, 25 | P0 | NOT_STARTED |
| 24 | Task-based model tiering (Fast/Standard/Premium), deterministic-first before any LLM call | 5, 18, 37 | P0 | NOT_STARTED |
| 25 | Structured outputs validated server-side; invalid output never executes a commercial action | 4, 5, 25, 29 | P0 | NOT_STARTED |
| 26 | `ai_decisions` / `ai_actions` tables — every decision traceable to an action | 4, 28, 31 | P0 | NOT_STARTED |
| 27 | AI cost ledger + observability (tokens, latency, cost per agency/creator/task) | 5, 18, 31, 37 | P0 | NOT_STARTED |
| 28 | Simulation Mode: Brain decides, nothing sent | 3, 24 | P1 | NOT_STARTED |
| **Sales / Commercial Engine** |
| 29 | Sales Strategy Engine chooses commercial approach; never discounts by default | 4, 12 | P0 | NOT_STARTED |
| 30 | Action taxonomy (CONTINUE_RELATIONSHIP...ESCALATE_HUMAN...STOP_SELLING) as deterministic state | 4, 12 | P0 | NOT_STARTED |
| 31 | Commercial Fatigue tracking, must be consulted before any new sale attempt | 9, 10, 12, 16 | P1 | NOT_STARTED |
| 32 | Script Engine: nodes/edges as a real graph, not free text; purchased/not-purchased branching | 13, 28 | P0 | NOT_STARTED |
| 33 | Script versioning: published version immutable, edits create a new draft | 13, 25, 28 | P0 | NOT_STARTED |
| 34 | Script activation validation (no broken edges, no missing media, no infinite loops) | 13 | P0 | NOT_STARTED |
| 35 | Media Library with pricing hierarchy (Agency→Creator→Media→Script, most restrictive wins) | 14, 15 | P0 | NOT_STARTED |
| 36 | Media Intelligence: filtered retrieval, never send entire library to LLM | 14, 18 | P1 | NOT_STARTED |
| 37 | Pricing Validator: server-side hard gate, LLM cannot bypass minimum price | 4, 10, 15, 24, 25 | P0 | NOT_STARTED |
| 38 | Negotiation Engine: bounded by max discount / minimum price, only if authorized at every level | 10, 15 | P0 | NOT_STARTED |
| 39 | Custom requests / custom content: per-category config, never promise unavailable services | 4, 10, 12 | P1 | NOT_STARTED |
| 40 | Smart Follow-ups: eligibility engine, cooldowns, max attempts, re-check state at execution time | 16 | P1 | NOT_STARTED |
| 41 | Idempotency keys on every commercial action (message, offer, follow-up, transaction, commission) | 3, 13, 16, 25, 29 | P0 | NOT_STARTED |
| **Full AI** |
| 42 | Full AI = explicit per-action-type permission, never a blanket switch | 4, 10 | P0 | NOT_STARTED |
| 43 | Action Validator pipeline before any autonomous send (Context→Decision→Validator→Executor→Audit) | 4, 29, 34 | P0 | NOT_STARTED |
| 44 | Confidence thresholds, agency-configurable per action type | 4, 10 | P0 | NOT_STARTED |
| 45 | Kill switch at 4 scopes: Global / Agency / Creator / Action type | 4, 10, 41 | P0 | NOT_STARTED |
| 46 | Human Takeover: instant, disables AI sending, resumable with revalidated context | 4, 19, 24 | P0 | NOT_STARTED |
| **Platform Integrations** |
| 47 | Platform Adapter abstraction (`authenticate/fetch*/send*/getCapabilities`) | 3, 19, 25 | P0 | NOT_STARTED |
| 48 | Mock Platform Connector implementing full adapter contract, unblocks all dev | 3, 19, 25, 26, 47 | P0 | NOT_STARTED |
| 49 | Capability system: never show/allow a feature the connected platform doesn't support | 3, 19, 24 | P0 | NOT_STARTED |
| 50 | OnlyFans + MYM real adapters — **blocked pending authorized access confirmation** | 19, 42, 47 | P0 (blocked) | NOT_STARTED |
| **Data & Security** |
| 51 | Full Part 28 schema (~55 tables) as the target data model | 28 | P0 | NOT_STARTED |
| 52 | Money as integer minor units or precise decimal, never float; currency always stored | 15, 28 | P0 | NOT_STARTED |
| 53 | RLS policies (Supabase) as a complement to, not replacement for, backend authorization | 21, 25, 28 | P0 | NOT_STARTED |
| 54 | Server-only tables: commission ledger, raw integration events, internal admin, benchmark internals | 28, 42 | P0 | NOT_STARTED |
| 55 | Data retention policy per category (messages, AI logs, raw payloads, analytics, audit, billing) | 28, 42 | P1 | NOT_STARTED |
| **Billing** |
| 56 | Two plans: Copilot (99€/mo) and Full AI (199€/mo + 2.5% commission) | 1, 22 | P0 | NOT_STARTED |
| 57 | Commission Ledger: rate snapshot per transaction, never retroactively recalculated | 1, 15, 22, 28 | P0 | NOT_STARTED |
| 58 | Commission attribution: AI Autonomous / AI Assisted / Human, explicitly distinguished | 1, 15, 22 | P0 | NOT_STARTED |
| 59 | Webhook idempotency for billing events (no duplicate invoice/credit/activation) | 22, 25, 29 | P0 | NOT_STARTED |
| 60 | Commission transparency: visible at pricing, checkout, contract — never hidden | 1, 22, 42 | P0 | NOT_STARTED |
| 61 | Failed payment workflow: retry → grace period → restriction → suspension, never instant data loss | 1, 22 | P1 | NOT_STARTED |
| **Analytics** |
| 62 | Single metric-definition registry, no duplicated/conflicting KPI formulas | 20, 44 | P0 | NOT_STARTED |
| 63 | Revenue attribution never invented; documented logic linking action→offer→purchase | 20, 44 | P0 | NOT_STARTED |
| 64 | "Unavailable" shown instead of fabricated data when a metric can't be computed | 20, 44 | P0 | NOT_STARTED |
| 65 | P0/P1 MVP dashboard: Revenue, AI-attributed Revenue, Sales, Conversion, Creator/Script/AI usage comparison | 20, 44 | P0 | NOT_STARTED |
| **AI Evaluation / Benchmark** |
| 66 | Golden Set benchmark dataset, versioned, covering all core categories | 17, 25, 30 | P0 | NOT_STARTED |
| 67 | Benchmark Phase 1 gate before advancing to Full AI development | 26, 30, 33, 47 | P0 (gate) | NOT_STARTED |
| 68 | Benchmark Phase 2 gate before real pilot traffic | 26, 30, 33, 47 | P0 (gate) | NOT_STARTED |
| 69 | Deterministic evaluators for verifiable rules (price≥min, permissions, etc.); LLM-as-judge only for subjective quality | 17, 30 | P0 | NOT_STARTED |
| 70 | Shadow mode + canary rollout for any new AI version | 17, 30 | P1 | NOT_STARTED |
| **Observability / Ops** |
| 71 | 5 pillars: logs, metrics, traces, alerts, audit — request/correlation IDs propagated everywhere | 31 | P0 | NOT_STARTED |
| 72 | Never log secrets or full conversation text in technical logs | 31, 42 | P0 | NOT_STARTED |
| 73 | Runbooks for Full AI emergency stop, AI provider outage, connector outage, DB incident, billing failure | 27, 31 | P1 | NOT_STARTED |
| 74 | Admin backoffice, fully separate auth from agency app, no default conversation browsing | 27, 41 | P0 | NOT_STARTED |
| **Testing** |
| 75 | Testing pyramid: unit → integration → contract → E2E → AI benchmark → pilot | 25, 32 | P0 | NOT_STARTED |
| 76 | Cross-agency isolation tests must ALL fail (mandatory, explicit) | 21, 25, 32, 45 | P0 | NOT_STARTED |
| 77 | Financial golden tests (2.5% commission on €100/€1,000/€10,000/€100,000) | 28, 32, 45 | P0 | NOT_STARTED |
| 78 | Prompt injection / AI tool injection resistance tests | 32 | P0 | NOT_STARTED |
| 79 | Kill switch functional test before every release | 32, 45 | P0 | NOT_STARTED |
| **Onboarding / Support / Legal** |
| 80 | Activation flow: Agency → Creator → AI configured → first AI interaction, never blocked by missing real connector | 39 | P0 | NOT_STARTED |
| 81 | Full AI Readiness checklist before enabling (DNA, pricing, permissions, takeover available) | 10, 39 | P0 | NOT_STARTED |
| 82 | Support AI architecturally separate from commercial AI, never invents policy | 40 | P1 | NOT_STARTED |
| 83 | Data inventory + retention schedule + compliance checklists (pre-pilot, pre-production) | 42 | P0 (gate) | NOT_STARTED |
| 84 | Legal/platform/AI-provider review completed before production | 42, 45 | P0 (gate) | NOT_STARTED |
| **Growth** |
| 85 | Growth analytics foundations, acquisition attribution, activation funnel (referral program itself is P2) | 43 | P1 | NOT_STARTED |

---

Notes:
- Rows tagged `(gate)` are process checkpoints, not features — they block later phases rather than being "implemented" themselves.
- Row 50 (real platform connectors) is tracked as blocked in `OPEN_QUESTIONS.md`; all other P0 rows are unblocked and can proceed once Phase 1 starts.
- This matrix should be updated (`Status` column) at the end of every phase per `REBUILD_PLAN.md` and the process in Part 47.150/47.162.
