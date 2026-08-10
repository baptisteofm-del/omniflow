-- ============================================================================
-- OMNIFLOW V1 — 0002_creator_dna.sql
-- Phase 4 (Creator DNA + Commercial Configuration) schema, per:
--   docs/specification/OmniFlow_06_Model_DNA.md
--   docs/specification/OmniFlow_28_Data_Model_Entity_Relationships_Database_Schema_Blueprint.md (28.13-28.14)
--   docs/implementation/REBUILD_PLAN.md (Phase 4)
--
-- Scope: Simple Mode Model DNA fields only (spec 6's Advanced Mode 12-section
-- editor is a later iteration — vertical slice per spec 47.147) + commercial
-- defaults. Depends on 0001_foundation.sql (agencies, creators).
-- ============================================================================

-- ============================================================================
-- CREATOR_AI_PROFILES — Model DNA, Simple Mode (spec 28.13, 6.1-6.10)
-- ============================================================================
create table if not exists creator_ai_profiles (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  creator_id uuid references creators(id) on delete cascade not null,
  version int not null default 1,
  status text not null default 'draft' check (status in ('draft', 'published')),

  -- Simple Mode controls (spec 6.1, 39.10) — 0-100 scale sliders
  warmth int not null default 50 check (warmth between 0 and 100),
  flirt_intensity int not null default 50 check (flirt_intensity between 0 and 100),
  directness int not null default 50 check (directness between 0 and 100),
  sales_aggressiveness int not null default 50 check (sales_aggressiveness between 0 and 100),

  message_length text not null default 'medium' check (message_length in ('very_short', 'short', 'medium', 'long', 'adaptive')),
  emoji_style text not null default 'medium' check (emoji_style in ('off', 'low', 'medium', 'high')),
  tone text,
  persona_description text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz,
  unique(creator_id, version)
);

create index if not exists idx_creator_ai_profiles_creator on creator_ai_profiles(creator_id);

-- Only one published profile per creator at a time — enforced at application
-- layer when publishing a new version (spec 6: "versioned, published version
-- immutable"); this migration only stores the shape, not the publish workflow.

-- ============================================================================
-- CREATOR_COMMERCIAL_SETTINGS — one row per creator (spec 28.14, 39.16)
-- ============================================================================
create table if not exists creator_commercial_settings (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  creator_id uuid references creators(id) on delete cascade not null unique,

  negotiation_enabled boolean not null default false,
  max_discount_percent int not null default 0 check (max_discount_percent between 0 and 100),
  custom_content_enabled boolean not null default false,
  live_session_enabled boolean not null default false,
  minimum_custom_price numeric,
  minimum_live_price numeric,
  follow_up_enabled boolean not null default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_creator_commercial_settings_creator on creator_commercial_settings(creator_id);


-- ============================================================================
-- ROW LEVEL SECURITY — same is_agency_member() helper from 0001_foundation.sql
-- ============================================================================
alter table creator_ai_profiles enable row level security;
alter table creator_commercial_settings enable row level security;

drop policy if exists "Creator AI profiles by agency" on creator_ai_profiles;
create policy "Creator AI profiles by agency" on creator_ai_profiles
  for all using (is_agency_member(agency_id));

drop policy if exists "Creator commercial settings by agency" on creator_commercial_settings;
create policy "Creator commercial settings by agency" on creator_commercial_settings
  for all using (is_agency_member(agency_id));
