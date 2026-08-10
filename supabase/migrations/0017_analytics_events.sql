-- ============================================================================
-- OMNIFLOW V1 — 0017_analytics_events.sql
-- Phase 12 (Analytics core) schema, per:
--   docs/specification/OmniFlow_44_Data_Analytics_BI_Executive_Reporting.md
--   docs/specification/OmniFlow_20_Dashboard_Analytics_ROI_Command_Center.md
--   docs/implementation/REBUILD_PLAN.md (Phase 12), spec 47.96-47.100
--
-- Spec 47.96 asks for an event pipeline covering message/suggestion/offer/
-- purchase/script/AI action/takeover. Six of those seven already have a real,
-- append-only source of truth: messages, copilot_suggestions, offers,
-- script_run_events, ai_actions. Duplicating them into a second generic
-- events table would violate spec 44.3 ("one definition per KPI, no
-- divergent recomputation") — src/lib/analytics/metrics.ts reads those
-- tables directly instead. The one genuinely missing fact is "takeover":
-- conversations.ai_mode only stores current state, never *when* or *why* it
-- changed, which several P0/P1 metrics need (Full AI Takeover Rate,
-- Escalation Reasons — spec 44.33-44.34). This migration adds exactly that,
-- as an immutable, append-only log (spec 44.68).
-- ============================================================================

create table if not exists conversation_mode_events (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  conversation_id uuid references conversations(id) on delete cascade not null,
  from_mode text,
  to_mode text not null,
  reason text,
  changed_by uuid references users(id) on delete set null,
  occurred_at timestamptz default now()
);

create index if not exists idx_conversation_mode_events_conversation on conversation_mode_events(conversation_id, occurred_at);
create index if not exists idx_conversation_mode_events_agency on conversation_mode_events(agency_id, occurred_at);

alter table conversation_mode_events enable row level security;

drop policy if exists "Conversation mode events by agency" on conversation_mode_events;
create policy "Conversation mode events by agency" on conversation_mode_events
  for all using (is_agency_member(agency_id));
