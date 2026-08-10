-- ============================================================================
-- OMNIFLOW V1 — 0012_media_library.sql
-- Phase 10 (Media Library + Pricing Validator) schema, per:
--   docs/specification/OmniFlow_14_Media_Library_Media_Intelligence.md
--   docs/specification/OmniFlow_15_Pricing_Negotiation_Engine.md
--   docs/specification/OmniFlow_28_Data_Model_Entity_Relationships_Database_Schema_Blueprint.md (28.43-28.49)
--   docs/implementation/REBUILD_PLAN.md (Phase 10)
--
-- Scope: real file storage + pricing, no AI selection/ranking, no bundles,
-- no negotiation engine, no A/B testing (all explicitly later per spec).
-- The one hard requirement this phase exists for: a minimum price can never
-- be undercut, anywhere a price gets set (spec 15.6: "this control must be
-- deterministic and server-side").
-- ============================================================================

create table if not exists media_assets (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  creator_id uuid references creators(id) on delete cascade not null,
  storage_key text not null,
  media_type text not null check (media_type in ('image', 'video', 'audio')),
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  target_price numeric not null check (target_price > 0),
  minimum_price numeric not null check (minimum_price > 0),
  currency text not null default 'EUR',
  duration_seconds int,
  standalone_allowed boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  archived_at timestamptz,
  constraint media_assets_price_order check (minimum_price <= target_price)
);

create index if not exists idx_media_assets_agency on media_assets(agency_id);
create index if not exists idx_media_assets_creator on media_assets(creator_id, status);

create table if not exists media_tags (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique(agency_id, name)
);

create table if not exists media_asset_tags (
  media_asset_id uuid references media_assets(id) on delete cascade not null,
  media_tag_id uuid references media_tags(id) on delete cascade not null,
  agency_id uuid references agencies(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (media_asset_id, media_tag_id)
);

-- ============================================================================
-- OFFERS (spec 28.47) — the commercial record of a price actually sent to a
-- fan, distinct from a script node's configured price. One row per priced
-- offer sent, regardless of source.
-- ============================================================================
create table if not exists offers (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  conversation_id uuid references conversations(id) on delete cascade not null,
  fan_id uuid references fans(id) on delete cascade not null,
  creator_id uuid references creators(id) on delete cascade not null,
  offer_type text not null default 'script_media' check (offer_type in (
    'script_media', 'custom_media', 'out_of_script_media', 'live_session', 'custom_request', 'other'
  )),
  source_type text,
  source_id uuid,
  media_asset_id uuid references media_assets(id) on delete set null,
  initial_price numeric not null,
  final_price numeric,
  minimum_allowed_price numeric not null,
  currency text not null default 'EUR',
  status text not null default 'sent' check (status in (
    'draft', 'sent', 'purchased', 'declined', 'expired', 'canceled', 'failed'
  )),
  ai_decision_id uuid references ai_decisions(id) on delete set null,
  sent_message_id uuid references messages(id) on delete set null,
  created_at timestamptz default now(),
  expires_at timestamptz,
  updated_at timestamptz default now()
);

create index if not exists idx_offers_agency on offers(agency_id);
create index if not exists idx_offers_conversation on offers(conversation_id, created_at desc);

-- Script paid steps now reference a real media asset instead of a freeform
-- price (nullable for backward compatibility with steps created before this
-- migration — those keep their old unvalidated price_amount).
alter table script_nodes add column if not exists media_asset_id uuid references media_assets(id) on delete set null;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table media_assets enable row level security;
alter table media_tags enable row level security;
alter table media_asset_tags enable row level security;
alter table offers enable row level security;

drop policy if exists "Media assets by agency" on media_assets;
create policy "Media assets by agency" on media_assets
  for all using (is_agency_member(agency_id));

drop policy if exists "Media tags by agency" on media_tags;
create policy "Media tags by agency" on media_tags
  for all using (is_agency_member(agency_id));

drop policy if exists "Media asset tags by agency" on media_asset_tags;
create policy "Media asset tags by agency" on media_asset_tags
  for all using (is_agency_member(agency_id));

drop policy if exists "Offers by agency" on offers;
create policy "Offers by agency" on offers
  for all using (is_agency_member(agency_id));

-- ============================================================================
-- STORAGE — private bucket for media files. Path convention:
-- media/{agency_id}/{creator_id}/{filename}, enforced by RLS below so an
-- agency can only read/write inside its own folder (spec 14.7/14.48: never
-- a public, unprotected URL; strict tenant isolation).
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

drop policy if exists "Media bucket agency access" on storage.objects;
create policy "Media bucket agency access" on storage.objects
  for all
  to authenticated
  using (bucket_id = 'media' and is_agency_member((storage.foldername(name))[1]::uuid))
  with check (bucket_id = 'media' and is_agency_member((storage.foldername(name))[1]::uuid));
