-- ============================================================================
-- OMNIFLOW V1 — 0004_conversations.sql
-- Phase 5 (Conversation Domain + Mock Platform Adapter) schema, per:
--   docs/specification/OmniFlow_19_Platform_Integrations_OnlyFans_MYM.md
--   docs/specification/OmniFlow_28_Data_Model_Entity_Relationships_Database_Schema_Blueprint.md (28.15-28.30)
--   docs/implementation/REBUILD_PLAN.md (Phase 5)
--
-- Scope: minimal vertical slice to satisfy Phase 5's exit criteria —
-- "fan sends -> human sees -> human replies -> purchase can be simulated" —
-- on a Mock platform only. Real platform fields (encrypted credentials,
-- webhooks, capability discovery) are deferred to Phase 14 when a real
-- connector is actually built; this migration keeps platform_connections
-- minimal on purpose (spec 47.147: vertical slices over premature scaffolding).
-- ============================================================================

-- ============================================================================
-- PLATFORMS — catalog (spec 28.15)
-- ============================================================================
create table if not exists platforms (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now()
);

insert into platforms (code, name, status) values
  ('MOCK', 'Mock (test)', 'active'),
  ('ONLYFANS', 'OnlyFans', 'inactive'),
  ('MYM', 'MYM', 'inactive')
on conflict (code) do nothing;

-- ============================================================================
-- PLATFORM_CONNECTIONS — agency<->platform<->creator link (simplified spec 28.16)
-- ============================================================================
create table if not exists platform_connections (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  creator_id uuid references creators(id) on delete cascade not null,
  platform_id uuid references platforms(id) on delete restrict not null,
  status text not null default 'connected' check (status in ('connected', 'disconnected', 'error')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(creator_id, platform_id)
);

create index if not exists idx_platform_connections_agency on platform_connections(agency_id);

-- ============================================================================
-- FANS — simplified: platform identity folded in for the Mock-only slice
-- (spec 28.18 + 28.19 collapsed; will split into fan_platform_profiles when
-- a second real platform makes the distinction necessary)
-- ============================================================================
create table if not exists fans (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  creator_id uuid references creators(id) on delete cascade not null,
  platform_id uuid references platforms(id) on delete restrict not null,
  external_fan_id text,
  display_name text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_fans_agency on fans(agency_id);
create index if not exists idx_fans_creator on fans(creator_id);

-- ============================================================================
-- CONVERSATIONS (spec 28.25)
-- ============================================================================
create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  creator_id uuid references creators(id) on delete cascade not null,
  fan_id uuid references fans(id) on delete cascade not null,
  platform_id uuid references platforms(id) on delete restrict not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  ai_mode text not null default 'human_takeover' check (ai_mode in ('copilot', 'full_ai', 'human_takeover', 'paused')),
  assigned_user_id uuid references users(id) on delete set null,
  last_message_at timestamptz,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_conversations_agency on conversations(agency_id);
create index if not exists idx_conversations_creator_last_msg on conversations(creator_id, last_message_at desc);

-- ============================================================================
-- MESSAGES (spec 28.27, minimal field set for this slice)
-- ============================================================================
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  conversation_id uuid references conversations(id) on delete cascade not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  sender_type text not null check (sender_type in ('fan', 'human', 'ai', 'system')),
  sender_user_id uuid references users(id) on delete set null,
  text text not null,
  message_type text not null default 'text' check (message_type in ('text', 'system', 'purchase_confirmation')),
  is_paid boolean not null default false,
  price_amount numeric,
  currency text default 'EUR',
  sent_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists idx_messages_conversation on messages(conversation_id, created_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table platforms enable row level security;
alter table platform_connections enable row level security;
alter table fans enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

drop policy if exists "Platforms catalog readable" on platforms;
create policy "Platforms catalog readable" on platforms
  for select using (auth.role() = 'authenticated');

drop policy if exists "Platform connections by agency" on platform_connections;
create policy "Platform connections by agency" on platform_connections
  for all using (is_agency_member(agency_id));

drop policy if exists "Fans by agency" on fans;
create policy "Fans by agency" on fans
  for all using (is_agency_member(agency_id));

drop policy if exists "Conversations by agency" on conversations;
create policy "Conversations by agency" on conversations
  for all using (is_agency_member(agency_id));

drop policy if exists "Messages by agency" on messages;
create policy "Messages by agency" on messages
  for all using (is_agency_member(agency_id));


-- ============================================================================
-- TRIGGER — keep conversations.last_message_at / last_inbound_at / last_outbound_at fresh
-- ============================================================================
create or replace function touch_conversation_on_message()
returns trigger as $$
begin
  update conversations
  set last_message_at = new.sent_at,
      last_inbound_at = case when new.direction = 'inbound' then new.sent_at else last_inbound_at end,
      last_outbound_at = case when new.direction = 'outbound' then new.sent_at else last_outbound_at end,
      updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace trigger on_message_insert
  after insert on messages
  for each row execute procedure touch_conversation_on_message();
