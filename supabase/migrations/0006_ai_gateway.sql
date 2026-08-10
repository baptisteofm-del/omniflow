-- ============================================================================
-- OMNIFLOW V1 — 0006_ai_gateway.sql
-- Phase 7 (AI Gateway + model routing) schema, per:
--   docs/specification/OmniFlow_05_AI_Model_Router.md
--   docs/specification/OmniFlow_28_Data_Model_Entity_Relationships_Database_Schema_Blueprint.md (28.31)
--   docs/implementation/REBUILD_PLAN.md (Phase 7)
--
-- Scope: minimal vertical slice to satisfy Phase 7's exit criteria — "AI can
-- analyze a mock conversation and produce a contextualized structured
-- decision" (spec 47.71). Only ai_decisions is built now (every AI call must
-- log here, spec 28.31); ai_actions/ai_feedback and the full Benchmark/
-- Prompt Registry/Cost Ledger machinery (spec 5.14-5.35) are deferred until
-- a feature that needs them exists (Full AI action execution, Benchmark).
-- ============================================================================

create table if not exists ai_decisions (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  conversation_id uuid references conversations(id) on delete cascade,
  message_id uuid references messages(id) on delete set null,
  fan_id uuid references fans(id) on delete cascade,
  creator_id uuid references creators(id) on delete cascade,
  decision_type text not null,
  objective text,
  strategy text,
  confidence numeric(3,2) check (confidence >= 0 and confidence <= 1),
  model_provider text not null default 'anthropic',
  model_name text not null,
  model_version text,
  prompt_version text not null,
  router_version text not null default 'v1',
  structured_output_json jsonb,
  context_snapshot_reference text,
  status text not null default 'success' check (status in ('success', 'failed', 'fallback')),
  latency_ms int,
  estimated_cost numeric(10,6),
  created_at timestamptz default now()
);

create index if not exists idx_ai_decisions_agency on ai_decisions(agency_id);
create index if not exists idx_ai_decisions_conversation on ai_decisions(conversation_id, created_at);
create index if not exists idx_ai_decisions_type on ai_decisions(decision_type);

alter table ai_decisions enable row level security;

drop policy if exists "AI decisions by agency" on ai_decisions;
create policy "AI decisions by agency" on ai_decisions
  for all using (is_agency_member(agency_id));
