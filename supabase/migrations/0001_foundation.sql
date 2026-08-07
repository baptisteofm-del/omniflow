-- ============================================================================
-- OMNIFLOW V1 — 0001_foundation.sql
-- Phase 1 (Technical Foundations) schema, per:
--   docs/specification/OmniFlow_28_Data_Model_Entity_Relationships_Database_Schema_Blueprint.md
--   docs/specification/OmniFlow_21_Team_Roles_Permissions_Agency_Workspace.md
--   docs/implementation/REBUILD_PLAN.md (Phase 1)
--
-- Scope: agencies, users, roles/permissions, agency_memberships, creators only.
-- Everything else (fans, conversations, scripts, media, billing, AI...) is built
-- in later phases, per the spec's own "don't build everything at once" rule
-- (Part 47.147, "vertical slices").
--
-- Idempotent: safe to run once on an empty Supabase project, or re-run.
-- No production data exists yet (confirmed by the project owner) — this is a
-- clean build, not a migration of existing rows.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- ============================================================================
-- AGENCIES — tenant root (spec 28.4)
-- ============================================================================
create table if not exists agencies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  status text not null default 'active' check (status in ('active', 'trialing', 'past_due', 'suspended', 'canceled')),
  default_currency text not null default 'EUR',
  timezone text not null default 'Europe/Paris',
  plan_id text not null default 'copilot' check (plan_id in ('copilot', 'full_ai')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_agencies_slug on agencies(slug);


-- ============================================================================
-- USERS — human account, one row per auth.users entry (spec 28.6)
-- Note: does not duplicate auth credentials; auth.users (Supabase Auth) is
-- the source of truth for login. This table holds product-facing profile data.
-- ============================================================================
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete cascade not null unique,
  email text not null,
  display_name text,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_users_auth_user_id on users(auth_user_id);


-- ============================================================================
-- ROLES — system-wide defaults + agency-custom roles (spec 28.8, Part 21)
-- ============================================================================
create table if not exists roles (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade, -- null = system role, shared across all agencies
  name text not null,
  type text not null default 'custom' check (type in ('system', 'custom')),
  is_system boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, name)
);

-- ============================================================================
-- PERMISSIONS — catalog (spec 28.9, Part 21's explicit permission-key list)
-- ============================================================================
create table if not exists permissions (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists role_permissions (
  role_id uuid references roles(id) on delete cascade not null,
  permission_id uuid references permissions(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (role_id, permission_id)
);


-- ============================================================================
-- AGENCY_MEMBERSHIPS — User ↔ Agency relation (spec 28.7)
-- ============================================================================
create table if not exists agency_memberships (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  role_id uuid references roles(id) on delete restrict not null,
  status text not null default 'active' check (status in ('invited', 'active', 'suspended', 'removed')),
  invited_by uuid references users(id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, user_id)
);

create index if not exists idx_agency_memberships_agency on agency_memberships(agency_id);
create index if not exists idx_agency_memberships_user on agency_memberships(user_id);


-- ============================================================================
-- CREATORS — a creator managed by an agency (spec 28.11)
-- ============================================================================
create table if not exists creators (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  display_name text not null,
  internal_name text,
  status text not null default 'draft' check (status in ('draft', 'ready', 'active', 'archived')),
  default_language text not null default 'fr',
  timezone text not null default 'Europe/Paris',
  avatar_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  archived_at timestamptz
);

create index if not exists idx_creators_agency on creators(agency_id);

-- CREATOR_ACCESS — restrict a member to specific creators (spec 28.12)
create table if not exists creator_access (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  creator_id uuid references creators(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  access_level text not null default 'full' check (access_level in ('full', 'limited', 'read_only')),
  created_at timestamptz default now(),
  unique(creator_id, user_id)
);


-- ============================================================================
-- ACCESS-CONTROL HELPER FUNCTION
-- is_agency_member(): true if the current auth.uid() has an ACTIVE membership
-- in the given agency, regardless of role (role-specific checks happen in the
-- application layer's authorize() function per spec Part 21/29 — RLS here
-- only enforces tenant isolation, not fine-grained permissions).
-- ============================================================================
create or replace function is_agency_member(check_agency_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from agency_memberships m
    join users u on u.id = m.user_id
    where m.agency_id = check_agency_id
      and u.auth_user_id = auth.uid()
      and m.status = 'active'
  )
$$;

-- has_permission(): true if the current user's role in the given agency
-- grants the named permission key. Used by RLS policies that need
-- finer-than-membership granularity (e.g. billing.view).
create or replace function has_permission(check_agency_id uuid, permission_key text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from agency_memberships m
    join users u on u.id = m.user_id
    join role_permissions rp on rp.role_id = m.role_id
    join permissions p on p.id = rp.permission_id
    where m.agency_id = check_agency_id
      and u.auth_user_id = auth.uid()
      and m.status = 'active'
      and p.key = permission_key
  )
$$;


-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table agencies enable row level security;
alter table users enable row level security;
alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table agency_memberships enable row level security;
alter table creators enable row level security;
alter table creator_access enable row level security;

-- agencies: members can read their own agency; only Owner-role mutations
-- (enforced at application layer via has_permission — RLS keeps it simple:
-- any active member can read, no direct client-side agency mutation at all,
-- agency updates go through a server action using the service role).
drop policy if exists "Members can view their agency" on agencies;
create policy "Members can view their agency" on agencies
  for select using (is_agency_member(id));

-- users: a user can always read/update their own row
drop policy if exists "Users manage own profile" on users;
create policy "Users manage own profile" on users
  for all using (auth_user_id = auth.uid());

-- users: agency members can view basic profile info of fellow members
drop policy if exists "Agency members can view teammates" on users;
create policy "Agency members can view teammates" on users
  for select using (
    exists (
      select 1 from agency_memberships m1
      join agency_memberships m2 on m2.agency_id = m1.agency_id
      join users u on u.id = m1.user_id
      where u.auth_user_id = auth.uid()
        and m1.status = 'active'
        and m2.user_id = users.id
        and m2.status = 'active'
    )
  );

-- roles: system roles readable by everyone authenticated; agency-custom roles
-- readable by that agency's members only
drop policy if exists "Roles visibility" on roles;
create policy "Roles visibility" on roles
  for select using (is_system = true or is_agency_member(agency_id));

-- permissions: catalog is global and read-only for authenticated users
drop policy if exists "Permissions catalog readable" on permissions;
create policy "Permissions catalog readable" on permissions
  for select using (auth.role() = 'authenticated');

drop policy if exists "Role permissions readable" on role_permissions;
create policy "Role permissions readable" on role_permissions
  for select using (
    exists (
      select 1 from roles r
      where r.id = role_permissions.role_id
        and (r.is_system = true or is_agency_member(r.agency_id))
    )
  );

-- agency_memberships: members can see their agency's roster
drop policy if exists "Members can view agency roster" on agency_memberships;
create policy "Members can view agency roster" on agency_memberships
  for select using (is_agency_member(agency_id));

-- agency_memberships: only users with team.manage can invite/change/remove members
drop policy if exists "Team managers can manage memberships" on agency_memberships;
create policy "Team managers can manage memberships" on agency_memberships
  for all using (has_permission(agency_id, 'team.manage'))
  with check (has_permission(agency_id, 'team.manage'));

-- creators: agency-scoped, standard member access
drop policy if exists "Creators by agency" on creators;
create policy "Creators by agency" on creators
  for all using (is_agency_member(agency_id));

-- creator_access: agency-scoped
drop policy if exists "Creator access by agency" on creator_access;
create policy "Creator access by agency" on creator_access
  for all using (is_agency_member(agency_id));


-- ============================================================================
-- SEED — system roles & permission catalog
-- Permission keys per spec Part 21 §21.9 (extended slightly for foundation
-- scope; later phases add more keys as their tables are created).
-- ============================================================================
insert into permissions (key, description) values
  ('agency.view', 'View agency settings'),
  ('agency.manage', 'Manage agency settings (billing, plan, deletion)'),
  ('creator.view', 'View creators'),
  ('creator.manage', 'Create/edit/archive creators'),
  ('team.view', 'View team roster'),
  ('team.invite', 'Invite new team members'),
  ('team.manage', 'Change roles, suspend, remove team members'),
  ('billing.view', 'View billing and invoices'),
  ('billing.manage', 'Manage subscription and payment method')
on conflict (key) do nothing;

-- System roles (agency_id = null → shared across all agencies)
insert into roles (agency_id, name, type, is_system) values
  (null, 'Owner', 'system', true),
  (null, 'Admin', 'system', true),
  (null, 'Manager', 'system', true),
  (null, 'Chatter', 'system', true),
  (null, 'Viewer', 'system', true)
on conflict (agency_id, name) do nothing;

-- Owner: everything
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'Owner' and r.is_system = true
on conflict do nothing;

-- Admin: everything except agency.manage and billing.manage
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'Admin' and r.is_system = true
  and p.key not in ('agency.manage', 'billing.manage')
on conflict do nothing;

-- Manager: creator + team view, no billing, no agency management
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'Manager' and r.is_system = true
  and p.key in ('creator.view', 'creator.manage', 'team.view')
on conflict do nothing;

-- Chatter: view-only on creator/team, no settings
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'Chatter' and r.is_system = true
  and p.key in ('creator.view', 'team.view')
on conflict do nothing;

-- Viewer: read-only across the board
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'Viewer' and r.is_system = true
  and p.key in ('agency.view', 'creator.view', 'team.view', 'billing.view')
on conflict do nothing;


-- ============================================================================
-- TRIGGER — auto-create agency + owner membership on signup
-- Reused pattern from the old schema (docs/_legacy), rebuilt against the new
-- table set. See docs/implementation/DECISION_LOG.md.
-- ============================================================================
create or replace function handle_new_user()
returns trigger as $$
declare
  new_agency_id uuid;
  new_user_id uuid;
  owner_role_id uuid;
begin
  -- Create the product-facing user row
  insert into users (auth_user_id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  returning id into new_user_id;

  -- Create the agency
  insert into agencies (name, plan_id)
  values (
    coalesce(new.raw_user_meta_data->>'agency_name', 'My Agency'),
    coalesce(new.raw_user_meta_data->>'plan_id', 'copilot')
  )
  returning id into new_agency_id;

  -- Look up the system Owner role
  select id into owner_role_id from roles where name = 'Owner' and is_system = true;

  -- Make the signing-up user the Owner of their new agency
  insert into agency_memberships (agency_id, user_id, role_id, status, joined_at)
  values (new_agency_id, new_user_id, owner_role_id, 'active', now());

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
