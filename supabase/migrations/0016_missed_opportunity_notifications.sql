-- ============================================================================
-- OMNIFLOW V1 — 0016_missed_opportunity_notifications.sql
-- Owner feedback after the first live Full AI escalation: pausing the whole
-- conversation and waiting for a human isn't right for every escalation
-- reason. When the fan wants to buy but nothing is configured to sell
-- (no priced/for-sale media), that's a setup gap on the agency's side, not
-- a trust/safety concern — the fan should never just go silent waiting for
-- someone to notice. Full AI now handles this case by staying active and
-- deflecting naturally instead of pausing (spec-aligned, not a regression:
-- kill switches and low-confidence/ambiguous cases still pause exactly as
-- before — only "nothing available to sell" gets this new path).
--
-- This migration: (1) lets `ai_actions.action_type` record that new outcome
-- rather than misusing "escalate", and (2) adds a lightweight agency-wide
-- notification so the team is alerted their catalog needs attention.
-- ============================================================================

alter table ai_actions drop constraint if exists ai_actions_action_type_check;
alter table ai_actions add constraint ai_actions_action_type_check
  check (action_type in ('send_message', 'send_paid_offer', 'escalate', 'missed_opportunity'));

create table if not exists agency_notifications (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  type text not null check (type in ('escalation', 'missed_opportunity')),
  title text not null,
  body text,
  conversation_id uuid references conversations(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_agency_notifications_agency on agency_notifications(agency_id, created_at desc);

alter table agency_notifications enable row level security;

drop policy if exists "Agency notifications by agency" on agency_notifications;
create policy "Agency notifications by agency" on agency_notifications
  for all using (is_agency_member(agency_id));

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'agency_notifications'
  ) then
    alter publication supabase_realtime add table agency_notifications;
  end if;
end $$;
