-- ============================================================================
-- OMNIFLOW V1 — 0014_full_ai.sql
-- Phase 11 (Full AI: Action Validator, kill switch, human takeover) schema, per:
--   docs/specification/OmniFlow_04_OmniFlow_Brain.md (Part 4 — Action Validator, kill switch)
--   docs/specification/OmniFlow_10_Agency_Settings_AI_Control_Center.md (Part 10 — kill switch levels, permissions)
--   docs/specification/OmniFlow_24_Application_UX_Navigation_Core_User_Flows.md (Part 24 — Take Over UX)
--   docs/implementation/REBUILD_PLAN.md (Phase 11)
--
-- `conversations.ai_mode` already anticipated COPILOT/FULL_AI/HUMAN_TAKEOVER/
-- PAUSED (0004_conversations.sql) and `assigned_user_id` — nothing to change
-- there. This migration adds: the switch to let an agency actually turn Full
-- AI on for a creator, the kill-switch records (spec 10.29's 4 levels, minus
-- the internal-only "global OmniFlow" level which has no agency-facing UI —
-- an agency can still see one if OmniFlow support inserts it directly, via
-- the select policy below, but can't create/remove it), and `ai_actions`
-- (spec 28.32) — the audit trail of every action Full AI proposed, approved,
-- blocked, or executed, mirroring `copilot_suggestions` but for actions that
-- can execute without a human clicking Send.
-- ============================================================================

alter table creator_commercial_settings add column if not exists full_ai_enabled boolean not null default false;

create table if not exists ai_kill_switches (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade,
  scope text not null check (scope in ('global', 'agency', 'creator', 'action_type')),
  creator_id uuid references creators(id) on delete cascade,
  action_type text,
  reason text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  constraint ai_kill_switches_scope_shape check (
    (scope = 'global' and agency_id is null and creator_id is null and action_type is null) or
    (scope = 'agency' and agency_id is not null and creator_id is null and action_type is null) or
    (scope = 'creator' and agency_id is not null and creator_id is not null and action_type is null) or
    (scope = 'action_type' and agency_id is not null and creator_id is null and action_type is not null)
  )
);

create index if not exists idx_ai_kill_switches_agency on ai_kill_switches(agency_id);

create table if not exists ai_actions (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  conversation_id uuid references conversations(id) on delete cascade not null,
  ai_decision_id uuid references ai_decisions(id) on delete set null,
  action_type text not null check (action_type in ('send_message', 'send_paid_offer', 'escalate')),
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'executed', 'blocked', 'failed')),
  confidence numeric,
  message_text text,
  media_asset_id uuid references media_assets(id) on delete set null,
  price_amount numeric,
  validator_outcome text,
  message_id uuid references messages(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_ai_actions_conversation on ai_actions(conversation_id, created_at desc);

alter table ai_kill_switches enable row level security;
alter table ai_actions enable row level security;

-- Global (agency_id null) rows are readable by everyone so a banner can show
-- "disabled by OmniFlow", but only agency-scoped rows can be created/removed
-- from the app — no self-serve global kill switch.
drop policy if exists "Kill switches visible to agency" on ai_kill_switches;
create policy "Kill switches visible to agency" on ai_kill_switches
  for select using (agency_id is null or is_agency_member(agency_id));

drop policy if exists "Kill switches created by agency" on ai_kill_switches;
create policy "Kill switches created by agency" on ai_kill_switches
  for insert with check (agency_id is not null and is_agency_member(agency_id));

drop policy if exists "Kill switches deleted by agency" on ai_kill_switches;
create policy "Kill switches deleted by agency" on ai_kill_switches
  for delete using (agency_id is not null and is_agency_member(agency_id));

drop policy if exists "AI actions by agency" on ai_actions;
create policy "AI actions by agency" on ai_actions
  for all using (is_agency_member(agency_id));
