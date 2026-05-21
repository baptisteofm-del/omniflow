-- ================================
-- TEAM INVITATIONS & MEMBERS
-- ================================

-- Team members table
create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(agency_id, email)
);

-- Team invitations table
create table if not exists team_invitations (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  email text not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  token text unique not null default gen_random_uuid()::text,
  accepted boolean default false,
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '7 days'
);

-- Enable RLS
alter table team_members enable row level security;
alter table team_invitations enable row level security;

-- RLS Policies for team_members
create policy "Users can view team members of their agency"
  on team_members for select
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Only agency owner can manage team members"
  on team_members for all
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

-- RLS Policies for team_invitations
create policy "Only agency owner can view invitations"
  on team_invitations for select
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Only agency owner can create invitations"
  on team_invitations for insert
  with check (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Only agency owner can delete invitations"
  on team_invitations for delete
  using (agency_id in (select id from agencies where owner_id = auth.uid()));
