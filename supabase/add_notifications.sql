-- ================================
-- NOTIFICATIONS SYSTEM
-- ================================

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  type text not null check (type in ('post_published', 'ai_ready', 'fan_at_risk', 'team_invite', 'system')),
  title text not null,
  message text,
  read boolean default false,
  read_at timestamptz,
  action_url text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table notifications enable row level security;

-- RLS Policies
create policy "Users can view notifications of their agency"
  on notifications for select
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "System can create notifications"
  on notifications for insert
  with check (true);

create policy "Users can update their notifications"
  on notifications for update
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

-- Index for performance
create index if not exists idx_notifications_agency_created on notifications(agency_id, created_at desc);
create index if not exists idx_notifications_agency_read on notifications(agency_id, read);
