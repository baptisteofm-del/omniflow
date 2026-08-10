-- ============================================================================
-- OMNIFLOW V1 — 0008_copilot.sql
-- Phase 8 (Copilot) schema, per:
--   docs/specification/OmniFlow_11_Conversation_Engine.md (11.29-11.30, 11.32)
--   docs/implementation/REBUILD_PLAN.md (Phase 8)
--
-- Scope: minimal vertical slice — one main suggestion at a time (spec 11.29:
-- "avoid offering too many choices"), always editable/regenerable/sendable
-- by a human (spec 11.32), with Human Edit Tracking (spec 11.30: original
-- vs final text, edit distance). The full Response Validator (spec 11.27 —
-- price/media/script/platform checks) is deferred until Script/Pricing/
-- Media engines (Phase 9/10) exist to validate against.
-- ============================================================================

create table if not exists copilot_suggestions (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  conversation_id uuid references conversations(id) on delete cascade not null,
  ai_decision_id uuid references ai_decisions(id) on delete set null,
  suggested_text text not null,
  final_text text,
  edit_distance int,
  status text not null default 'pending' check (status in ('pending', 'sent', 'edited_sent', 'discarded')),
  message_id uuid references messages(id) on delete set null,
  resolved_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create index if not exists idx_copilot_suggestions_conversation on copilot_suggestions(conversation_id, created_at desc);

alter table copilot_suggestions enable row level security;

drop policy if exists "Copilot suggestions by agency" on copilot_suggestions;
create policy "Copilot suggestions by agency" on copilot_suggestions
  for all using (is_agency_member(agency_id));
