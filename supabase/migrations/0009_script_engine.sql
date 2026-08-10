-- ============================================================================
-- OMNIFLOW V1 — 0009_script_engine.sql
-- Phase 9 (Script Engine + Branching) schema, per:
--   docs/specification/OmniFlow_13_Script_Engine_Branching_System.md
--   docs/specification/OmniFlow_28_Data_Model_Entity_Relationships_Database_Schema_Blueprint.md (28.36-28.42)
--   docs/implementation/REBUILD_PLAN.md (Phase 9)
--
-- Scope: the generic node/edge graph from spec 28.36-28.42, but only 4 node
-- types (start, message, paid_media, end) and 3 edge condition types
-- (always, purchased, not_purchased) — exactly what's needed for spec 13's
-- core purchase/not-purchase branching. The graph shape itself is generic
-- and extensible (CONDITION/WAIT/NEGOTIATION/etc. node types, arbitrary
-- edges) so later phases add rows, not a schema rewrite. No visual canvas
-- (spec 13.34's "prevoir l'architecture", not "build it now") — the builder
-- is forms/cards editing a linear sequence, per spec 13.33's own guidance.
-- ============================================================================

create table if not exists scripts (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  creator_id uuid references creators(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_scripts_agency on scripts(agency_id);

create table if not exists script_versions (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  script_id uuid references scripts(id) on delete cascade not null,
  version_number int not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  unique(script_id, version_number)
);

create index if not exists idx_script_versions_script on script_versions(script_id);

create table if not exists script_nodes (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  script_version_id uuid references script_versions(id) on delete cascade not null,
  node_key text not null,
  node_type text not null check (node_type in ('start', 'message', 'paid_media', 'end')),
  title text,
  message_template text,
  price_amount numeric,
  currency text default 'EUR',
  sequence_order int not null default 0,
  created_at timestamptz default now(),
  unique(script_version_id, node_key)
);

create index if not exists idx_script_nodes_version on script_nodes(script_version_id, sequence_order);

create table if not exists script_edges (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  script_version_id uuid references script_versions(id) on delete cascade not null,
  from_node_id uuid references script_nodes(id) on delete cascade not null,
  to_node_id uuid references script_nodes(id) on delete cascade not null,
  condition_type text not null default 'always' check (condition_type in ('always', 'purchased', 'not_purchased')),
  priority int not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_script_edges_from on script_edges(from_node_id, condition_type);

create table if not exists script_runs (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  script_version_id uuid references script_versions(id) on delete cascade not null,
  conversation_id uuid references conversations(id) on delete cascade not null,
  fan_id uuid references fans(id) on delete cascade not null,
  creator_id uuid references creators(id) on delete cascade not null,
  current_node_id uuid references script_nodes(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'completed', 'converted', 'stopped', 'abandoned')),
  started_at timestamptz default now(),
  completed_at timestamptz,
  abandoned_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_script_runs_conversation on script_runs(conversation_id);

-- Script Locking (spec 13.29), simplified: only one active run per
-- conversation at a time.
create unique index if not exists idx_script_runs_one_active on script_runs(conversation_id) where status = 'active';

create table if not exists script_run_events (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  script_run_id uuid references script_runs(id) on delete cascade not null,
  node_id uuid references script_nodes(id) on delete set null,
  event_type text not null check (event_type in (
    'entered_node', 'message_sent', 'offer_sent', 'purchased', 'not_purchased', 'completed', 'stopped'
  )),
  outcome text,
  metadata_json jsonb,
  occurred_at timestamptz default now()
);

create index if not exists idx_script_run_events_run on script_run_events(script_run_id, occurred_at);

alter table scripts enable row level security;
alter table script_versions enable row level security;
alter table script_nodes enable row level security;
alter table script_edges enable row level security;
alter table script_runs enable row level security;
alter table script_run_events enable row level security;

drop policy if exists "Scripts by agency" on scripts;
create policy "Scripts by agency" on scripts
  for all using (is_agency_member(agency_id));

drop policy if exists "Script versions by agency" on script_versions;
create policy "Script versions by agency" on script_versions
  for all using (is_agency_member(agency_id));

drop policy if exists "Script nodes by agency" on script_nodes;
create policy "Script nodes by agency" on script_nodes
  for all using (is_agency_member(agency_id));

drop policy if exists "Script edges by agency" on script_edges;
create policy "Script edges by agency" on script_edges
  for all using (is_agency_member(agency_id));

drop policy if exists "Script runs by agency" on script_runs;
create policy "Script runs by agency" on script_runs
  for all using (is_agency_member(agency_id));

drop policy if exists "Script run events by agency" on script_run_events;
create policy "Script run events by agency" on script_run_events
  for all using (is_agency_member(agency_id));
