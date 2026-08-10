# METRIC_REGISTRY.md

Per spec 44.3 ("chaque KPI doit avoir une définition unique et documentée")
and 44.4 (Metric Registry) — every number `/analytics` shows is computed in
exactly one place, `src/lib/analytics/metrics.ts`. This file is the
human-readable registry; the code comments there are the same definitions,
kept in sync by hand since there's no metric-definition codegen yet.

No frontend component recomputes any of these (spec 44.92) — the analytics
page only renders numbers it receives from `metrics.ts`.

---

## Revenue

- **Definition**: Gross tracked revenue — the sum of `price_amount` on every
  `messages` row with `message_type = 'purchase_confirmation'` in the
  selected period.
- **Source**: `messages` (filtered by `sent_at`).
- **Known limitation**: any purchase logged this way counts, even ones
  triggered via the MOCK "Simuler un achat" button with no real offer behind
  it — this is expected for a mock-data phase, not a bug.

## AI-Attributed Revenue

- **Definition**: The subset of purchases traceable through a real `offers`
  row (`status = 'purchased'`) whose `source_type` is `script_node` or
  `full_ai` — i.e. a message → offer → purchase chain that's unambiguous,
  never guessed from conversation mode or message sender (spec 44.12:
  "a sale must not be arbitrarily attributed to AI").
- **Source**: `offers` (filtered by `updated_at`).
- **Known limitation**: purchases with no matching `offers` row (e.g. a human
  chatter closing a sale outside any script/Full AI offer, or a mock
  purchase not tied to an active offer) are counted in gross Revenue but
  **not** here — this likely under-counts AI's true contribution rather than
  over-claiming it, which is the safer direction to be wrong in.

## Conversion Rate (offers)

- **Definition**: `offers` with `status = 'purchased'` ÷ all `offers`
  created in the period.
- **Source**: `offers` (both counts filtered by `created_at`).
- **Known limitation**: an offer created near the end of the selected period
  may not have had time to convert yet — its eventual purchase would land in
  a later period's numerator, not this one's.

## Creator Comparison

- **Definition**: Revenue and sale count (same Revenue definition above),
  grouped by creator via each purchase's conversation → `creator_id`.
- **Source**: `messages` + `conversations` (joined in application code, not
  a SQL join — see limitation below).
- **Known limitation**: computed by fetching conversations and purchase
  messages separately and grouping in JS. Fine at mock-data volume; would
  need a real aggregation query (or the "Aggregation Layer" spec 44.67
  anticipates) at real scale.

## Script Performance & Step Diagnosis (spec 44.14-44.16)

- **Definition, per script**: `runs` = count of `script_runs` started in
  period; `completed`/`converted` = runs with that `status`; `revenue` = sum
  of purchased `offers` whose `source_type = 'script_node'` and `source_id`
  is one of the script's node ids.
- **Definition, per step**: `entered`/`offerSent`/`purchased`/`notPurchased`/
  `stopped` = counts of the matching `script_run_events.event_type` for that
  node, from runs started in the period.
- **Source**: `scripts`, `script_versions`, `script_nodes`, `script_runs`,
  `script_run_events`, `offers`.
- **Known limitation**: spec 44.15 asks for `Skipped`/`Failed` as distinct
  fields; the Script Engine doesn't emit those event types (it emits
  `stopped` for any hard stop, e.g. a pricing violation or unavailable
  media) — `stopped` is shown instead of inventing a distinction the engine
  doesn't actually make.

## Copilot Acceptance / Edit Rate (spec 44.30-44.31)

- **Definition**: `acceptanceRate` = (`sent` + `edited_sent`) ÷ (all
  suggestions in period minus `pending` ones). `editRate` = `edited_sent` ÷
  (`sent` + `edited_sent`).
- **Source**: `copilot_suggestions.status` (filtered by `created_at`).
- **Known limitation ("Regeneration Rate", spec 44.32)**: `discarded` covers
  both "chatter clicked Écrire moi-même" and "chatter clicked Régénérer" —
  the schema doesn't currently distinguish the two paths (both set
  `status = 'discarded'`), so a true regeneration rate isn't computable yet.
  Shown combined as `discardedOrRegenerated` instead of fabricating a split.

## Full AI Activity (spec 44.29, 44.33-44.34)

- **Definition**: `messagesSent`/`offersSent`/`escalations`/
  `missedOpportunities` = counts of `ai_actions.action_type` in period.
  `fullAiActivations`/`takeovers` = counts of `conversation_mode_events`
  where `to_mode` is `full_ai` / `human_takeover` respectively.
  `takeoverRate` = `takeovers` ÷ `fullAiActivations`.
- **Source**: `ai_actions`, `conversation_mode_events` (new in this phase —
  see below).
- **Escalation Reasons**: the top 5 raw `ai_actions.validator_outcome`
  strings for `action_type = 'escalate'`, grouped by exact text and counted.
  Known limitation: this is real underlying reasons, not spec 44.34's clean
  taxonomy (`Pricing / Custom request / Low confidence / Platform
  limitation / Safety-policy / Technical error / Other`) — no classifier
  maps free text into those buckets yet.

## Fan Segments (spec 44.23)

- **Definition**: Every fan bucketed by `computeFanFlowStage()`
  (`src/lib/fans/fanFlow.ts`) — the exact same function the fan dossier UI
  uses, never a separate formula (spec 44.3's "no divergent recomputation").
- **Source**: `fans`, `fan_scores.purchase_intent`, `conversations`,
  `messages` (spend + message count per fan).

---

## The event pipeline (spec 47.96)

Spec 47.96 asks for an event pipeline covering message / suggestion / offer
/ purchase / script / AI action / takeover. Six of those seven already have
a real, append-only source of truth as operational tables: `messages`,
`copilot_suggestions`, `offers`, `script_run_events`, `ai_actions`. Building
a second, generic `analytics_events` table that re-logs the same facts would
violate the "one definition per KPI" rule above (two logs of the same fact
can drift). `metrics.ts` reads those tables directly instead.

The one genuinely missing fact was **takeover**: `conversations.ai_mode`
only ever stored current state, never *when* or *why* it changed — several
P0/P1 metrics need that history (Takeover Rate, Escalation Reasons over
time). `0017_analytics_events.sql` adds exactly that gap, as an immutable,
append-only `conversation_mode_events` table, written from
`setConversationAiMode()` (human-driven mode changes) and `escalate()` in
`src/lib/ai/fullAi.ts` (AI-driven pause).

## Not built this phase (see TECH_DEBT.md)

Per spec 44.101-44.103, everything outside the P0/P1 block is explicitly
later scope: A/B test analytics, scheduled/weekly reports, the AI Analytics
Assistant (natural-language query layer), goal tracking/alerts, forecasting,
cross-agency benchmarks. Part 20's "ROI OmniFlow" savings calculator
(chatter-cost baseline vs. OmniFlow fee) is also out of scope — it needs a
per-agency baseline setting that doesn't exist yet and isn't in the P0/P1
registry.
