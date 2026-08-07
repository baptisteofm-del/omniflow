-- ============================================================================
-- ⚠️ SUPERSEDED — DO NOT RUN THIS FILE ⚠️
--
-- This schema targets the OLD OmniFlow product (agency ops tool: models,
-- trends, prospection, credits). The product was rebuilt from a clean base
-- per docs/specification/ (48-part spec) starting 2026-08-07. The real,
-- current schema is docs/implementation/../../supabase/migrations/0001_foundation.sql
-- and onward, following docs/implementation/REBUILD_PLAN.md.
--
-- Kept here only as a reference for the RLS-writing patterns used and as a
-- record of the security issues found in the original 31-file schema.
-- See docs/implementation/DECISION_LOG.md, entry "2026-08-07 — The
-- previously-drafted 0001_init.sql Supabase migration is superseded".
-- ============================================================================

-- ============================================================================
-- OMNIFLOW — 0001_init.sql (OLD SCHEMA)
-- Consolidated, idempotent initial schema for a fresh Supabase project.
--
-- This file supersedes (without modifying or deleting) the 31 loose *.sql
-- files in supabase/ plus schema.sql, and the two files already present in
-- supabase/migrations/ (add_trends_fields.sql, fix_invitations_system.sql).
-- It is derived from a full read of every one of those files plus the
-- relevant application code under src/lib and src/app/api, reconciling every
-- conflicting/duplicate table definition to a single, correct shape.
--
-- Safe to run once (or repeatedly — every statement is idempotent) against
-- an empty Supabase project. No production data exists yet, so this file
-- defines the clean end-state rather than a chain of incremental patches.
--
-- Layout:
--   PART 0  — Extensions
--   PART 1  — Core tables (agencies, profiles, models, content, trends, ...)
--   PART 2  — Integrations tables
--   PART 3  — Prospection tables
--   PART 4  — Media tables
--   PART 5  — Chatting tables
--   PART 6  — Team tables
--   PART 7  — Ops / growth tables
--   PART 8  — Credits tables
--   PART 9  — Billing / pricing tables
--   PART 10 — Trends-extras tables
--   PART 11 — Misc tables
--   PART 12 — Access-control helper function (is_agency_member)
--   PART 13 — Row Level Security (grouped in the same order as above)
--   PART 14 — Business-logic functions & triggers
--   PART 15 — Views
--   PART 16 — Storage buckets & policies
--   PART 17 — New-user trigger (handle_new_user) — must run last
-- ============================================================================


-- ============================================================================
-- PART 0 — EXTENSIONS
-- ============================================================================

create extension if not exists "uuid-ossp";
-- pgcrypto is required for gen_random_uuid(), used by several tables below
-- (trend_feedback, team_invitations.token, telegram_channels, agency_sales,
-- credit_purchases, agency_extra_models). None of the 31 source files ever
-- created it explicitly; added defensively so this file has no implicit
-- dependency on an extension Supabase happens to enable by default.
create extension if not exists "pgcrypto";


-- ============================================================================
-- PART 1 — CORE TABLES
-- (schema.sql, merged with later column additions from MIGRATION_COMPLETE.sql,
--  add_model_photo.sql, update_models_platforms.sql, add_referral_tracking.sql,
--  add_onboarding.sql, update_plans_pricing.sql, add_chatting_schedule.sql)
-- ============================================================================

-- AGENCIES (one per SaaS client) ---------------------------------------------
create table if not exists agencies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  plan_id text not null default 'starter',
  subscription_id text,
  subscription_status text default 'trialing',
  trial_ends_at timestamptz default now() + interval '7 days',
  paddle_customer_id text,
  referred_by text,                              -- add_referral_tracking.sql / MIGRATION_COMPLETE.sql
  onboarding_completed boolean default false,     -- add_onboarding.sql
  trial_plan_id text default 'trial',             -- update_plans_pricing.sql
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROFILES (user info) -------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_id uuid references agencies(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'owner',
  created_at timestamptz default now()
);

-- MODELS (managed OF/MYM creators) -------------------------------------------
-- NOTE: linked_integration_id is added later in PART 2, once
-- agency_integrations exists (it references that table).
create table if not exists models (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  name text not null,
  platform text default 'onlyfans',
  status text default 'active',
  telegram_channel_id text,
  followers int default 0,
  monthly_revenue numeric default 0,
  avatar_url text,                                -- add_model_photo.sql / MIGRATION_COMPLETE.sql
  bio text,                                        -- add_model_photo.sql / MIGRATION_COMPLETE.sql
  chatting_platforms text[] default '{}',          -- update_models_platforms.sql / MIGRATION_COMPLETE.sql
  social_networks text[] default '{}',             -- update_models_platforms.sql / MIGRATION_COMPLETE.sql
  linked_platform text,                            -- add_model_photo.sql / MIGRATION_COMPLETE.sql
  created_at timestamptz default now()
);

create index if not exists models_linked_platform_idx on models(linked_platform);
create index if not exists models_chatting_platforms_idx on models using gin(chatting_platforms);
create index if not exists models_social_networks_idx on models using gin(social_networks);

-- CONTENT (processed videos/images) ------------------------------------------
create table if not exists content (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  model_id uuid references models(id) on delete set null,
  type text not null default 'video',
  source_url text,
  processed_url text,
  spoofed boolean default false,
  platform text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- TRENDS (content discovery / veille) ----------------------------------------
-- content_type CHECK: schema.sql's broader list ('video','photo','text',
-- 'reel','carousel') is kept intentionally. add_trends_v2.sql narrowed this
-- to ('reel','video','carousel'), but that narrowing had no clear product
-- justification and, since no data exists to migrate, was NOT applied here.
-- supabase/migrations/add_trends_fields.sql (a file outside the original 31,
-- discovered during this migration's authoring) independently re-declares
-- the same broader 5-value list, corroborating this choice.
create table if not exists trends (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  platform text not null,
  title text,
  url text,
  thumbnail_url text,
  author_username text,
  author_url text,
  content_type text default 'video' check (content_type in ('video', 'photo', 'text', 'reel', 'carousel')),
  engagement int default 0,
  category text,
  tags text[],
  captured_at timestamptz default now(),
  -- add_trends_v2.sql additions:
  video_url text,
  likes bigint default 0,
  post_date text,
  viral_score int default 0,
  -- add_trend_feedback.sql addition:
  has_feedback boolean default false
);

-- SCHEDULED POSTS -------------------------------------------------------------
create table if not exists scheduled_posts (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  model_id uuid references models(id) on delete cascade not null,
  content_id uuid references content(id) on delete set null,
  platform text not null,
  caption text,
  scheduled_at timestamptz not null,
  status text default 'pending',
  created_at timestamptz default now()
);

-- TRANSACTIONS (finance) -------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  model_id uuid references models(id) on delete set null,
  type text not null,
  amount numeric not null,
  currency text default 'EUR',
  category text,
  description text,
  platform text,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- CHATTING REPORTS --------------------------------------------------------------
create table if not exists chatting_reports (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  model_id uuid references models(id) on delete cascade not null,
  date date not null,
  messages_sent int default 0,
  revenue_generated numeric default 0,
  conversion_rate numeric default 0,
  operator_name text,
  created_at timestamptz default now()
);

-- CHATTING AI — Fan Profiles -----------------------------------------------------
create table if not exists fan_profiles (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  model_id uuid references models(id) on delete set null,
  platform text not null,
  fan_id text not null,
  fan_name text,
  country text,
  age_estimate int,
  favorite_topics text[],
  total_spent numeric default 0,
  ppv_purchased int default 0,
  tips_given numeric default 0,
  engagement_level text default 'cold',
  last_message_at timestamptz,
  last_purchase_at timestamptz,
  notes text,
  conversation_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, platform, fan_id)
);

-- CHATTING AI — Chat Scripts --------------------------------------------------
create table if not exists chat_scripts (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  name text not null,
  category text not null,
  content text not null,
  variables text[],
  ai_score int,
  ai_suggestions text,
  usage_count int default 0,
  conversion_rate numeric default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CHATTING AI — Model Personalities -------------------------------------------
-- schedule_enabled / schedule come from add_chatting_schedule.sql.
-- response_delay_seconds is confirmed required by the app (selected/written
-- directly against model_personalities in src/app/api/chatting/cron/route.ts
-- and src/app/api/chatting/ai/personalities/route.ts) but the column is only
-- actually declared, among the 31 source files, inside MIGRATION_COMPLETE.sql's
-- redefinition of this table — not in add_chatting_schedule.sql as one might
-- expect. Included here because the app genuinely depends on it.
create table if not exists model_personalities (
  id uuid primary key default uuid_generate_v4(),
  model_id uuid references models(id) on delete cascade not null,
  agency_id uuid references agencies(id) on delete cascade not null,
  display_name text not null,
  personality_type text default 'warm',
  communication_style text,
  example_messages text[],
  languages text[] default '{fr}',
  topics_to_avoid text[],
  ppv_price_range text,
  tips_strategy text,
  auto_mode boolean default false,
  schedule_enabled boolean default false,
  schedule jsonb default '{"timezone":"Europe/Paris","slots":[]}',
  response_delay_seconds int default 60,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(model_id)
);

create index if not exists model_personalities_schedule_enabled on model_personalities(schedule_enabled);

-- CHATTING AI — AI Messages -----------------------------------------------------
create table if not exists ai_messages (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  model_id uuid references models(id) on delete set null,
  fan_profile_id uuid references fan_profiles(id) on delete cascade,
  platform text not null,
  direction text not null,
  content text not null,
  ai_generated boolean default false,
  script_used uuid references chat_scripts(id) on delete set null,
  approved boolean,
  revenue_attributed numeric default 0,
  sent_at timestamptz default now(),
  created_at timestamptz default now()
);

-- REFERRALS (parrainage) -----------------------------------------------------
create table if not exists referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_agency_id uuid references agencies(id) on delete cascade not null,
  referred_agency_id uuid references agencies(id) on delete cascade,
  referral_code text unique not null,
  referrer_code text,                             -- add_referral_tracking.sql
  status text default 'pending',
  commission_percent numeric default 10,
  created_at timestamptz default now()
);


-- ============================================================================
-- PART 2 — INTEGRATIONS TABLES
-- (add_integrations.sql)
-- ============================================================================

create table if not exists agency_integrations (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  tool text not null,                             -- 'adspower' | 'geelark' | 'telegram' | 'onlyfans' | 'mym' ...
  model_id uuid references models(id) on delete cascade,  -- MIGRATION_COMPLETE.sql added this column with no FK;
                                                            -- added the missing FK here (per-model integrations,
                                                            -- confirmed by src/app/api/integrations/route.ts)
  api_key text not null,
  api_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, tool)
);

create index if not exists idx_agency_integrations_agency on agency_integrations(agency_id);

create table if not exists model_profiles (
  id uuid primary key default uuid_generate_v4(),
  model_id uuid references models(id) on delete cascade not null,
  agency_id uuid references agencies(id) on delete cascade not null,
  tool text not null,                             -- 'adspower' | 'geelark'
  profile_id text not null,
  platform text not null,                         -- 'instagram' | 'tiktok' | 'onlyfans'
  profile_name text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_model_profiles_model on model_profiles(model_id);
create index if not exists idx_model_profiles_agency on model_profiles(agency_id);

-- Bridges models -> agency_integrations now that the latter exists.
-- Fixes add_model_photo.sql's broken "references integrations(id)" (that
-- table never existed anywhere in the schema) to point at the real table.
alter table models add column if not exists linked_integration_id uuid references agency_integrations(id) on delete set null;
create index if not exists models_linked_integration_id_idx on models(linked_integration_id);


-- ============================================================================
-- PART 3 — PROSPECTION TABLES
-- (add_onboarding.sql, add_prospection_v2.sql, add_prospection_learning.sql)
-- ============================================================================

create table if not exists prospects (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  username text not null,
  platform text not null,
  followers_estimate int,
  engagement_rate numeric,
  niche text,
  potential_score int,
  status text default 'discovered',
  notes text,
  -- add_prospection_v2.sql:
  display_name text,
  profile_url text,
  avatar_url text,
  bio text,
  source text default 'manual',                   -- 'scraper' | 'n8n' | 'csv' | 'manual'
  outreach_count int default 0,
  -- add_prospection_learning.sql:
  platform_status text default 'not_on_platform',  -- 'not_on_platform' | 'aggregator_detected' | 'already_on_platform'
  source_account text,
  geo_country text,
  geo_cities text,
  scrape_mode text default 'keyword',              -- 'followers' | 'similar' | 'keyword'
  potential_score_base float default 3.0,
  learning_score_weight float default 1.0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, username, platform)
);

-- outreach_messages: MIGRATION_COMPLETE.sql redefines this table without a
-- real FK on agency_id/prospect_id and without updated_at. Per the standing
-- rule that MIGRATION_COMPLETE.sql is not authoritative on conflicts, the
-- richer add_prospection_v2.sql shape (proper FKs + updated_at) is used.
create table if not exists outreach_messages (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  prospect_id uuid references prospects(id) on delete cascade not null,
  message text not null,
  platform text not null,
  ai_generated boolean default true,
  status text default 'pending',                  -- pending | sent | replied | no_response | signed | rejected
  sent_at timestamptz,
  replied_at timestamptz,
  reply_content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists outreach_messages_agency_id_idx on outreach_messages(agency_id);
create index if not exists outreach_messages_prospect_id_idx on outreach_messages(prospect_id);
create index if not exists outreach_messages_status_idx on outreach_messages(status);

create table if not exists prospection_learnings (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  prospect_id uuid references prospects(id) on delete set null,
  niche text not null,
  geo_country text,
  follower_range text not null,                   -- 'micro' (1K-12K) | 'mid' (12K-120K) | 'macro' (120K+)
  platform_status text not null,
  outcome text not null,                           -- 'signed' | 'rejected' | 'no_response'
  created_at timestamptz default now()
);

create index if not exists prospection_learnings_agency_idx on prospection_learnings(agency_id);
create index if not exists prospection_learnings_outcome_idx on prospection_learnings(outcome);

create table if not exists prospection_scoring_weights (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  niche text not null,
  geo_country text,
  follower_range text not null,
  platform_status text not null,
  signed_count int default 0,
  rejected_count int default 0,
  no_response_count int default 0,
  success_rate float default 0.5,
  updated_at timestamptz default now(),
  unique(agency_id, niche, geo_country, follower_range, platform_status)
);

create index if not exists prospection_weights_agency_idx on prospection_scoring_weights(agency_id);


-- ============================================================================
-- PART 4 — MEDIA TABLES
-- (add_media.sql; bucket creation is in PART 16)
-- ============================================================================

create table if not exists media_files (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  model_id uuid references models(id) on delete set null,
  name text not null,
  storage_path text not null,
  public_url text,
  type text not null check (type in ('video', 'image')),
  size_bytes bigint,
  duration_seconds int,
  tags text[] default '{}',
  source text default 'upload' check (source in ('upload', 'ai_generated', 'spoofed')),
  platform text,
  is_published boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_media_files_agency_id on media_files(agency_id);
create index if not exists idx_media_files_created_at on media_files(created_at desc);
create index if not exists idx_media_files_type on media_files(type);
create index if not exists idx_media_files_source on media_files(source);


-- ============================================================================
-- PART 5 — CHATTING TABLES
-- (add_chatting_config.sql, add_chatting_feedback.sql, add_fan_interactions.sql)
-- ============================================================================

-- chatting_list_config: MIGRATION_COMPLETE.sql's redefinition drops the
-- ppv_frequency CHECK constraint that add_chatting_config.sql has; the
-- richer add_chatting_config.sql shape is used per the standing rule.
create table if not exists chatting_list_config (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  platform text not null check (platform in ('onlyfans', 'mym')),
  personality_type text default 'gfe',
  ppv_frequency text default 'moderate' check (ppv_frequency in ('never', 'low', 'moderate', 'high', 'always')),
  -- never = jamais auto | low = 1/10 msgs | moderate = 1/5 | high = 1/3 | always = dès que possible
  ppv_price_min int default 5,
  ppv_price_max int default 30,
  relational_mode boolean default true,
  tone_notes text default '',
  response_delay_seconds int default 60,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, platform)
);

-- fan_notes: MIGRATION_COMPLETE.sql's redefinition lacks the real FK to
-- fan_profiles and the category CHECK; add_chatting_config.sql's shape is
-- used per the standing rule.
create table if not exists fan_notes (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  fan_profile_id uuid references fan_profiles(id) on delete cascade not null,
  note text not null,
  category text default 'general' check (category in ('general', 'preferences', 'spending', 'avoid', 'custom')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists fan_notes_fan_profile on fan_notes(fan_profile_id);
create index if not exists fan_notes_agency on fan_notes(agency_id);
create index if not exists fan_notes_created_at on fan_notes(created_at desc);

-- chatting_feedback: add_chatting_feedback.sql's shape (message_id FK'd to
-- ai_messages) is used; it is a superset of MIGRATION_COMPLETE.sql's version.
create table if not exists chatting_feedback (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  message_id uuid references ai_messages(id) on delete cascade,
  model_id uuid,
  action text not null check (action in ('validate', 'correct', 'reject')),
  original_message text not null,
  corrected_message text,
  reason text,
  fan_message text,
  created_at timestamptz default now()
);

create index if not exists chatting_feedback_agency_model on chatting_feedback(agency_id, model_id);
create index if not exists chatting_feedback_action on chatting_feedback(action);
create index if not exists chatting_feedback_created on chatting_feedback(created_at desc);

create table if not exists fan_interactions (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  model_id uuid references models(id) on delete set null,
  platform text not null,                         -- 'onlyfans' | 'mym'
  fan_id text not null,
  fan_name text,
  last_message text,
  sentiment text default 'neutral',                -- 'positive' | 'neutral' | 'negative'
  risk_level text default 'low',                   -- 'low' | 'medium' | 'high'
  last_purchase_at timestamptz,
  total_spent numeric default 0,
  last_interaction_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, platform, fan_id)
);

create index if not exists idx_fan_interactions_agency on fan_interactions(agency_id);
create index if not exists idx_fan_interactions_platform on fan_interactions(agency_id, platform);
create index if not exists idx_fan_interactions_sentiment on fan_interactions(sentiment);
create index if not exists idx_fan_interactions_risk on fan_interactions(risk_level);
create index if not exists idx_fan_interactions_last_interaction on fan_interactions(last_interaction_at);


-- ============================================================================
-- PART 6 — TEAM TABLES
-- (add_team.sql -> fix_team_roles.sql -> fix_team_invitations_rls.sql ->
--  FIX_TEAM_INVITATIONS_PRODUCTION.sql is the authoritative chain per the
--  audit brief. supabase/migrations/fix_invitations_system.sql — a file
--  outside the original 31, discovered while authoring this migration and
--  confirmed load-bearing via src/app/api/team/accept, src/app/api/invite,
--  src/app/api/settings/team — adds team_invitations.status/opened_at, which
--  the live app code genuinely writes/reads. Those two columns are folded in
--  below; that file's unused accept_team_invitation()/invited_by/
--  last_seen_at/accepted_by were left out as unused, unproven dead weight
--  (see final report for the full reasoning).
-- ============================================================================

create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  role text default 'member',
  joined_at timestamptz default now(),
  created_at timestamptz default now(),
  permissions text[] default '{}',
  status text default 'active',
  unique(agency_id, email)
);

alter table team_members drop constraint if exists team_members_role_check;
alter table team_members
  add constraint team_members_role_check
  -- Base roles from FIX_TEAM_INVITATIONS_PRODUCTION.sql plus 'accountant' /
  -- 'community_manager' / 'chatter', which src/app/api/settings/team/route.ts
  -- (VALID_ROLES) actively allows the app to insert but which no CHECK
  -- constraint in any of the 31 source files actually permitted — a real,
  -- confirmed bug (any invite with those roles would have failed at the DB).
  check (role in ('owner', 'admin', 'member', 'video_editor', 'chatting_manager', 'marketing_manager', 'accountant', 'community_manager', 'chatter'));

alter table team_members drop constraint if exists team_members_status_check;
alter table team_members
  add constraint team_members_status_check
  check (status in ('active', 'invited', 'suspended'));

create index if not exists idx_team_members_agency on team_members(agency_id);
create index if not exists idx_team_members_user on team_members(user_id);
create index if not exists idx_team_members_status on team_members(status);

create table if not exists team_invitations (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  email text not null,
  role text default 'member',
  token text unique not null default gen_random_uuid()::text,
  accepted boolean default false,
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '7 days',
  accepted_at timestamptz,
  permissions text[] default '{}',
  -- status/opened_at: from supabase/migrations/fix_invitations_system.sql,
  -- confirmed in active use by src/app/api/invite/[token]/route.ts and
  -- src/app/api/settings/team/route.ts.
  status text default 'pending',
  opened_at timestamptz
);

alter table team_invitations drop constraint if exists team_invitations_role_check;
alter table team_invitations
  add constraint team_invitations_role_check
  check (role in ('owner', 'admin', 'member', 'video_editor', 'chatting_manager', 'marketing_manager', 'accountant', 'community_manager', 'chatter'));

alter table team_invitations drop constraint if exists team_invitations_status_check;
alter table team_invitations
  add constraint team_invitations_status_check
  check (status in ('pending', 'opened', 'accepted', 'expired', 'cancelled'));

create index if not exists idx_team_invitations_agency on team_invitations(agency_id);
create index if not exists idx_team_invitations_token on team_invitations(token);
create index if not exists idx_team_invitations_email on team_invitations(email);
create index if not exists idx_team_invitations_status on team_invitations(status);


-- ============================================================================
-- PART 7 — OPS / GROWTH TABLES
-- (add_audit_log.sql, add_notifications.sql, add_tutorials.sql,
--  add_support_system.sql, add_usage_tracking.sql, add_telegram_v2.sql)
-- ============================================================================

-- audit_log: add_audit_log.sql's shape (has user_agent + a real FK on
-- agency_id) is a superset of MIGRATION_COMPLETE.sql's version and is used.
-- Intentionally has NO row level security — admin/service-role only, exactly
-- as the original file's own comment states.
create table if not exists audit_log (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete set null,
  action text not null,          -- 'integration.connected', 'ai.generated', 'login', etc.
  resource text,
  ip_address text,
  user_agent text,
  success boolean default true,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists audit_log_agency on audit_log(agency_id, created_at desc);
create index if not exists audit_log_action on audit_log(action);

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

create index if not exists idx_notifications_agency_created on notifications(agency_id, created_at desc);
create index if not exists idx_notifications_agency_read on notifications(agency_id, read);

create table if not exists tutorial_progress (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  tutorial_id text not null,
  completed_at timestamptz default now(),
  unique(agency_id, tutorial_id)
);

create index if not exists tutorial_progress_agency_id_idx on tutorial_progress(agency_id);
create index if not exists tutorial_progress_tutorial_id_idx on tutorial_progress(tutorial_id);

-- support_tickets / support_messages are user-scoped (auth.uid() = user_id),
-- not the agency_id-based pattern used elsewhere, so they are intentionally
-- left out of the is_agency_member() rewrite in PART 13.
create table if not exists support_tickets (
  id              uuid primary key default uuid_generate_v4(),
  ticket_number   text not null unique,
  subject         text not null,
  description     text not null,
  status          text not null default 'new'
                    check (status in ('new', 'open', 'pending', 'resolved', 'closed')),
  priority        text not null default 'normal'
                    check (priority in ('low', 'normal', 'high', 'urgent')),
  category        text not null default 'other'
                    check (category in ('technical', 'billing', 'account', 'other')),
  user_id         uuid references auth.users(id) on delete set null,
  agency_id       uuid references agencies(id) on delete set null,
  user_email      text,
  screenshot_url  text,
  resolved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists support_messages (
  id          uuid primary key default uuid_generate_v4(),
  ticket_id   uuid references support_tickets(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant', 'agent')),
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_support_tickets_status on support_tickets(status);
create index if not exists idx_support_tickets_priority on support_tickets(priority);
create index if not exists idx_support_tickets_user_id on support_tickets(user_id);
create index if not exists idx_support_tickets_created_at on support_tickets(created_at desc);
create index if not exists idx_support_messages_ticket_id on support_messages(ticket_id);

create table if not exists ai_generations (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  type text not null,            -- 'kling' | 'chatting' | 'outreach' | 'other'
  model text,
  cost_cents int default 0,
  created_at timestamptz default now()
);

create index if not exists ai_generations_agency_month on ai_generations(agency_id, created_at);

create table if not exists telegram_bots (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  name text not null,
  token text,
  channel_id text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists telegram_channels (
  id uuid default gen_random_uuid() primary key,
  agency_id uuid references agencies(id) on delete cascade,
  channel_username text not null,
  channel_name text,
  model_id uuid references models(id) on delete set null,
  posts_per_day int default 3,
  content_type text default 'text_image',
  post_times text[] default array['09:00', '15:00', '21:00'],
  automation_level text default 'semi' check (automation_level in ('semi', 'auto')),
  is_active boolean default true,
  total_posts int default 0,
  last_post_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  post_schedule jsonb,                             -- per-channel schedule [{time, content_type}]
  media_source text default 'model' check (media_source in ('model', 'global', 'combined')),
  ai_style text default 'soft',
  ai_examples text,
  ai_auto boolean default false,
  ai_personality text,
  channel_chat_id text,                            -- numeric Telegram ID (-100xxxxx)
  member_count int default 0
);

create index if not exists idx_telegram_channels_agency on telegram_channels(agency_id);
create index if not exists idx_telegram_channels_model on telegram_channels(model_id);
create index if not exists idx_telegram_channels_active on telegram_channels(agency_id) where is_active = true;


-- ============================================================================
-- PART 8 — CREDITS TABLES
-- (add_credits_system.sql merged with add_credits_system_v2.sql: v2's
--  idempotency guards + v1's auto-topup trigger logic + v1's
--  promo_codes.applicable_plans column, which v2 dropped)
-- ============================================================================

create table if not exists agency_credits (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  balance integer default 0,
  lifetime_purchased integer default 0,
  auto_topup_enabled boolean default false,
  auto_topup_threshold integer default 10,
  auto_topup_amount integer default 10,
  updated_at timestamptz default now(),
  unique(agency_id)
);

create index if not exists idx_agency_credits_agency on agency_credits(agency_id);

create table if not exists credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  amount integer not null,
  balance_after integer not null,
  type text not null check (type in ('purchase', 'consumption', 'bonus', 'refund', 'promo')),
  description text not null,
  feature text,
  payment_id text,
  promo_code text,
  created_at timestamptz default now()
);

create index if not exists idx_credit_transactions_agency on credit_transactions(agency_id);
create index if not exists idx_credit_transactions_created on credit_transactions(created_at desc);

create table if not exists promo_codes (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed', 'credits')),
  discount_value numeric not null,
  max_uses integer,
  used_count integer default 0,
  max_uses_per_user integer default 1,
  applicable_plans text[] default null,            -- add_credits_system.sql (v1) only; v2 dropped this column
  applicable_to text default 'subscription' check (applicable_to in ('subscription', 'credits', 'both')),
  min_amount numeric default 0,
  expires_at timestamptz default null,
  is_active boolean default true,
  created_by text,
  created_at timestamptz default now()
);

create index if not exists idx_promo_codes_code on promo_codes(code);
create index if not exists idx_promo_codes_active on promo_codes(is_active);
create index if not exists idx_promo_codes_expires on promo_codes(expires_at);
-- promo_codes intentionally has no RLS (matches both source versions): it is
-- a shared/global lookup table with no agency_id column, managed server-side.

create table if not exists promo_code_uses (
  id uuid primary key default uuid_generate_v4(),
  promo_code_id uuid references promo_codes(id) on delete cascade not null,
  agency_id uuid references agencies(id) on delete cascade not null,
  user_email text not null,
  discount_amount numeric not null,
  applied_to text not null check (applied_to in ('subscription', 'credits')),
  payment_id text,
  created_at timestamptz default now()
);

create index if not exists idx_promo_code_uses_promo on promo_code_uses(promo_code_id);
create index if not exists idx_promo_code_uses_agency on promo_code_uses(agency_id, user_email);

create table if not exists credit_orders (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  order_id text unique not null,
  invoice_id text,
  run_count integer not null,
  credit_count integer not null,
  amount numeric not null,
  final_amount numeric not null,
  promo_code text,
  credits_bonus integer default 0,
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'cancelled')),
  payment_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_credit_orders_agency on credit_orders(agency_id);
create index if not exists idx_credit_orders_order_id on credit_orders(order_id);

-- Backfill credits row for any pre-existing agency (no-op on a fresh project).
insert into agency_credits (agency_id, balance)
select id, 0 from agencies
on conflict (agency_id) do nothing;


-- ============================================================================
-- PART 9 — BILLING / PRICING TABLES
-- (update_plans_pricing.sql)
-- ============================================================================

create index if not exists idx_agencies_trial_ends_at
  on agencies(trial_ends_at)
  where subscription_status = 'trialing';

-- Real gap fixed: agency_sales had NO row level security at all in the
-- source file despite holding per-agency financial data.
create table if not exists agency_sales (
  id uuid default gen_random_uuid() primary key,
  agency_id uuid references agencies(id) on delete cascade,
  period_month date not null,                      -- first day of month, e.g. 2026-06-01
  gross_revenue numeric(12,2) default 0,
  commission_amount numeric(12,2) generated always as (gross_revenue * 0.10) stored,
  commission_status text default 'pending' check (commission_status in ('pending', 'invoiced', 'paid', 'disputed')),
  data_source text default 'manual' check (data_source in ('manual', 'api', 'webhook')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, period_month)
);

-- Real gap fixed: credit_purchases had NO row level security at all.
create table if not exists credit_purchases (
  id uuid default gen_random_uuid() primary key,
  agency_id uuid references agencies(id) on delete cascade,
  pack_id text not null,                           -- e.g. 'kling_100', 'trend_500'
  pack_type text not null check (pack_type in ('kling', 'trend')),
  credits_purchased int not null,
  credits_remaining int not null,
  amount_paid numeric(8,2) not null,
  purchased_at timestamptz default now(),
  expires_at timestamptz                           -- null = no expiration
);

-- Real gap fixed: agency_extra_models had NO row level security at all.
create table if not exists agency_extra_models (
  id uuid default gen_random_uuid() primary key,
  agency_id uuid references agencies(id) on delete cascade,
  extra_model_count int default 0,                 -- models beyond the 10 included
  monthly_surcharge numeric(8,2) generated always as (extra_model_count * 99.00) stored,
  updated_at timestamptz default now()
);

create index if not exists idx_agency_sales_period on agency_sales(agency_id, period_month);
create index if not exists idx_agency_sales_status on agency_sales(commission_status);
create index if not exists idx_credit_purchases_agency on credit_purchases(agency_id, pack_type);
create index if not exists idx_credit_purchases_remaining on credit_purchases(agency_id) where credits_remaining > 0;
create index if not exists idx_extra_models_agency on agency_extra_models(agency_id);


-- ============================================================================
-- PART 10 — TRENDS-EXTRAS TABLES
-- (add_trends_v2.sql, add_trend_feedback.sql)
-- ============================================================================

create table if not exists trend_runs (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references agencies(id) on delete cascade not null,
  trends_count int default 0,
  platform text default 'instagram',
  created_at timestamptz default now()
);

create index if not exists idx_trend_runs_agency on trend_runs(agency_id);

-- trend_feedback is defined twice in the source files: add_trend_feedback.sql
-- (gen_random_uuid(), has updated_at) and add_trends_v2.sql (uuid_generate_v4(),
-- no updated_at). The richer add_trend_feedback.sql shape is used per the
-- audit brief.
create table if not exists trend_feedback (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references agencies(id) on delete cascade,
  trend_id     text not null,          -- DB uuid or seed id
  feedback     text not null check (feedback in ('like', 'dislike')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (agency_id, trend_id)
);

create index if not exists idx_trend_feedback_agency on trend_feedback(agency_id);
create index if not exists idx_trend_feedback_trend on trend_feedback(trend_id);

comment on table trend_feedback is
  'User feedback on trends (like/dislike). Powers the evolving recommendation system.
   Starter: 5 trends/day | Pro: 10/day | Agency: 20/day. Manual RUN = 10 trends = 9EUR.';

create table if not exists agency_preferences (
  id               uuid primary key default gen_random_uuid(),
  agency_id        uuid not null references agencies(id) on delete cascade,
  preference_key   text not null,
  preference_value text,
  updated_at       timestamptz not null default now(),
  unique (agency_id, preference_key)
);

create index if not exists idx_agency_preferences_agency on agency_preferences(agency_id);

-- Additional indexes on trends (add_trends_v2.sql / migrations/add_trends_fields.sql)
create index if not exists idx_trends_agency on trends(agency_id);
create index if not exists idx_trends_platform on trends(platform);
create index if not exists idx_trends_captured_at on trends(captured_at desc);
create index if not exists idx_trends_engagement on trends(engagement desc);
create index if not exists idx_trends_content_type on trends(content_type);
create index if not exists idx_trends_author on trends(author_username);
create index if not exists idx_trends_agency_platform_type on trends(agency_id, platform, content_type);


-- ============================================================================
-- PART 11 — MISC TABLES
-- (add_email_drip.sql)
-- ============================================================================

create table if not exists email_drip_log (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  day_number int not null default 0,
  sent_at timestamptz default now(),
  unique(email, day_number)
);

create index if not exists email_drip_log_email_idx on email_drip_log(email);
create index if not exists email_drip_log_day_idx on email_drip_log(day_number);


-- ============================================================================
-- PART 12 — ACCESS-CONTROL HELPER FUNCTION
-- ============================================================================

-- is_agency_member(): true if the current auth.uid() owns the agency, or is
-- an active team member of it. status = 'active' is the confirmed value used
-- both by the DB CHECK constraint (team_members_status_check, identical
-- across fix_team_roles.sql:33, FIX_TEAM_INVITATIONS_PRODUCTION.sql:38, and
-- supabase/migrations/fix_invitations_system.sql:139) and by the actual app
-- code that inserts membership rows (src/app/api/team/accept/route.ts:99 and
-- src/app/api/auth/invite-register/route.ts:222 both insert status: 'active').
-- There is no 'accepted' status value anywhere in this schema or app code.
--
-- SECURITY DEFINER + a pinned search_path let this function bypass RLS on
-- team_members/agencies (it is owned by the migration-running role, which is
-- exempt from RLS on tables it owns) while remaining safe to call from any
-- policy.
create or replace function is_agency_member(check_agency_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from agencies where id = check_agency_id and owner_id = auth.uid()
  ) or exists (
    select 1 from team_members where agency_id = check_agency_id and user_id = auth.uid() and status = 'active'
  )
$$;


-- ============================================================================
-- PART 13 — ROW LEVEL SECURITY
--
-- Systemic fix: nearly every agency-scoped policy in the source files only
-- checked `agency_id in (select id from agencies where owner_id = auth.uid())`,
-- silently locking out invited team members from everything except
-- telegram_channels and trends (the only two tables whose source files had
-- already hand-rolled a team_members UNION). Every such policy below is
-- rewritten to use is_agency_member(agency_id) instead, for consistency and
-- to fix that lockout.
--
-- Exceptions, by design:
--   * agencies         — owner-only for mutations (plan/billing changes stay
--                         owner-level); an additional is_agency_member(id)
--                         SELECT policy is added so members can read their
--                         own agency row.
--   * profiles          — unchanged (self-access only; not agency-scoped).
--   * team_members /
--     team_invitations  — mutations stay owner-only, matching agencies,
--                         because is_agency_member() itself reads
--                         team_members: letting any active member manage
--                         (insert/update/delete) team_members/team_invitations
--                         would let a regular member alter roles, remove the
--                         owner, or invite new admins — a privilege
--                         escalation this migration does not introduce. A
--                         member-visible SELECT (via is_agency_member) is
--                         added on team_members so members can see their
--                         team roster (matching the intent, though not the
--                         literal policy SQL, found in
--                         supabase/migrations/fix_invitations_system.sql's
--                         "Members can view agency members" policy). The
--                         member's own-record SELECT/INSERT policies from
--                         FIX_TEAM_INVITATIONS_PRODUCTION.sql are preserved.
--   * support_tickets /
--     support_messages  — untouched: user_id-based, not the agency_id
--                         owner-subquery pattern this fix targets.
--   * audit_log,
--     promo_codes       — untouched: intentionally have no RLS (admin/
--                         service-role only), per the original design.
--   * email_drip_log    — RLS enabled, but deliberately given NO policies at
--                         all (see PART 11 note above / final report):
--                         written only by service-role cron code
--                         (src/app/api/email/drip, src/app/api/email/scheduled,
--                         both use the service-role key), never read by an
--                         end user's session anywhere in src/. The original
--                         "OR true" SELECT policy made it public-readable;
--                         removed rather than narrowed, since service role
--                         already bypasses RLS and there is no legitimate
--                         end-user read path.
-- ============================================================================

-- ---- CORE -------------------------------------------------------------------
alter table agencies enable row level security;
alter table profiles enable row level security;
alter table models enable row level security;
alter table content enable row level security;
alter table trends enable row level security;
alter table scheduled_posts enable row level security;
alter table transactions enable row level security;
alter table chatting_reports enable row level security;
alter table fan_profiles enable row level security;
alter table chat_scripts enable row level security;
alter table model_personalities enable row level security;
alter table ai_messages enable row level security;
alter table referrals enable row level security;

drop policy if exists "Agency owner access" on agencies;
drop policy if exists "Agency owner full access" on agencies;
create policy "Agency owner full access" on agencies
  for all using (owner_id = auth.uid());

drop policy if exists "Agency members can view" on agencies;
create policy "Agency members can view" on agencies
  for select using (is_agency_member(id));

drop policy if exists "Profile access" on profiles;
create policy "Profile access" on profiles
  for all using (id = auth.uid());

drop policy if exists "Models by agency" on models;
create policy "Models by agency" on models
  for all using (is_agency_member(agency_id));

drop policy if exists "Content by agency" on content;
create policy "Content by agency" on content
  for all using (is_agency_member(agency_id));

drop policy if exists "Trends by agency" on trends;
drop policy if exists trends_agency_policy on trends;
create policy "Trends by agency" on trends
  for all using (is_agency_member(agency_id));

drop policy if exists "Posts by agency" on scheduled_posts;
create policy "Posts by agency" on scheduled_posts
  for all using (is_agency_member(agency_id));

drop policy if exists "Transactions by agency" on transactions;
create policy "Transactions by agency" on transactions
  for all using (is_agency_member(agency_id));

drop policy if exists "Reports by agency" on chatting_reports;
create policy "Reports by agency" on chatting_reports
  for all using (is_agency_member(agency_id));

drop policy if exists "Fan profiles by agency" on fan_profiles;
create policy "Fan profiles by agency" on fan_profiles
  for all using (is_agency_member(agency_id));

drop policy if exists "Chat scripts by agency" on chat_scripts;
create policy "Chat scripts by agency" on chat_scripts
  for all using (is_agency_member(agency_id));

drop policy if exists "Model personalities by agency" on model_personalities;
drop policy if exists "Personalities by agency" on model_personalities;
create policy "Model personalities by agency" on model_personalities
  for all using (is_agency_member(agency_id));

drop policy if exists "AI messages by agency" on ai_messages;
create policy "AI messages by agency" on ai_messages
  for all using (is_agency_member(agency_id));

-- Real gap fixed: referrals had RLS enabled (schema.sql) but NO policy was
-- ever created for it anywhere across the 31 source files, so every query
-- against it through a normal (non-service-role) client was silently denied.
-- src/app/api/referral/referrals/route.ts and src/app/api/referral/stats/
-- route.ts both query it with the regular cookie-based client and would have
-- always failed/returned nothing. Scoped by referrer_agency_id, since that
-- is the agency that "owns" a referral record.
drop policy if exists "Referrals by referring agency" on referrals;
create policy "Referrals by referring agency" on referrals
  for all using (is_agency_member(referrer_agency_id));

-- ---- INTEGRATIONS -------------------------------------------------------------
alter table agency_integrations enable row level security;
alter table model_profiles enable row level security;

drop policy if exists "Integrations by agency" on agency_integrations;
create policy "Integrations by agency" on agency_integrations
  for all using (is_agency_member(agency_id));

drop policy if exists "Model profiles by agency" on model_profiles;
create policy "Model profiles by agency" on model_profiles
  for all using (is_agency_member(agency_id));

-- ---- PROSPECTION -------------------------------------------------------------
alter table prospects enable row level security;
alter table outreach_messages enable row level security;
alter table prospection_learnings enable row level security;
alter table prospection_scoring_weights enable row level security;

drop policy if exists "Prospects by agency" on prospects;
create policy "Prospects by agency" on prospects
  for all using (is_agency_member(agency_id));

drop policy if exists "Outreach by agency" on outreach_messages;
create policy "Outreach by agency" on outreach_messages
  for all using (is_agency_member(agency_id));

drop policy if exists "Learning by agency" on prospection_learnings;
create policy "Learning by agency" on prospection_learnings
  for all using (is_agency_member(agency_id));

drop policy if exists "Weights by agency" on prospection_scoring_weights;
create policy "Weights by agency" on prospection_scoring_weights
  for all using (is_agency_member(agency_id));

-- ---- MEDIA --------------------------------------------------------------------
alter table media_files enable row level security;

drop policy if exists "Media by agency" on media_files;
create policy "Media by agency" on media_files
  for all using (is_agency_member(agency_id));

-- ---- CHATTING -----------------------------------------------------------------
alter table chatting_list_config enable row level security;
alter table fan_notes enable row level security;
alter table chatting_feedback enable row level security;
alter table fan_interactions enable row level security;

drop policy if exists "List config by agency" on chatting_list_config;
create policy "List config by agency" on chatting_list_config
  for all using (is_agency_member(agency_id));

drop policy if exists "Fan notes by agency" on fan_notes;
create policy "Fan notes by agency" on fan_notes
  for all using (is_agency_member(agency_id));

drop policy if exists "Feedback by agency" on chatting_feedback;
create policy "Feedback by agency" on chatting_feedback
  for all using (is_agency_member(agency_id));

drop policy if exists "Fan interactions by agency" on fan_interactions;
create policy "Fan interactions by agency" on fan_interactions
  for all using (is_agency_member(agency_id));

-- ---- TEAM -----------------------------------------------------------------------
alter table team_members enable row level security;
alter table team_invitations enable row level security;

drop policy if exists "Users can view team members of their agency" on team_members;
drop policy if exists "Only agency owner can manage team members" on team_members;
drop policy if exists "Owner can manage all team members" on team_members;
drop policy if exists "Owner full access to team members" on team_members;
drop policy if exists "User can insert themselves as member" on team_members;
drop policy if exists "Members can view their own record" on team_members;
drop policy if exists "Members can view agency members" on team_members;
drop policy if exists "Team by agency" on team_members;

create policy "Owner can manage all team members" on team_members
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "User can insert themselves as member" on team_members
  for insert with check (user_id = auth.uid());

create policy "Members can view their own record" on team_members
  for select using (user_id = auth.uid());

create policy "Members can view agency roster" on team_members
  for select using (is_agency_member(agency_id));

drop policy if exists "Only agency owner can view invitations" on team_invitations;
drop policy if exists "Only agency owner can create invitations" on team_invitations;
drop policy if exists "Only agency owner can delete invitations" on team_invitations;
drop policy if exists "Owner can manage all invitations" on team_invitations;
drop policy if exists "Owner full access to invitations" on team_invitations;
drop policy if exists "Invited user can read own invitation" on team_invitations;
drop policy if exists "Invitee can read own invitation" on team_invitations;
drop policy if exists "Invited user can update own invitation" on team_invitations;
drop policy if exists "Users can accept their own invitation" on team_invitations;

create policy "Owner can manage all invitations" on team_invitations
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Invited user can read own invitation" on team_invitations
  for select using (email = (select email from auth.users where id = auth.uid()));

create policy "Invited user can update own invitation" on team_invitations
  for update using (email = (select email from auth.users where id = auth.uid()));

-- ---- OPS / GROWTH ---------------------------------------------------------------
alter table notifications enable row level security;
alter table tutorial_progress enable row level security;
alter table support_tickets enable row level security;
alter table support_messages enable row level security;
alter table ai_generations enable row level security;
alter table telegram_bots enable row level security;
alter table telegram_channels enable row level security;
-- audit_log: no RLS by design (see note above).

drop policy if exists "Users can view notifications of their agency" on notifications;
create policy "Users can view notifications of their agency" on notifications
  for select using (is_agency_member(agency_id));

drop policy if exists "System can create notifications" on notifications;
create policy "System can create notifications" on notifications
  for insert with check (true);

drop policy if exists "Users can update their notifications" on notifications;
create policy "Users can update their notifications" on notifications
  for update using (is_agency_member(agency_id));

drop policy if exists "Tutorial progress by agency" on tutorial_progress;
create policy "Tutorial progress by agency" on tutorial_progress
  for all using (is_agency_member(agency_id));

drop policy if exists "users_own_tickets" on support_tickets;
create policy "users_own_tickets" on support_tickets
  for all using (auth.uid() = user_id);

drop policy if exists "users_own_ticket_messages" on support_messages;
create policy "users_own_ticket_messages" on support_messages
  for select using (
    ticket_id in (select id from support_tickets where user_id = auth.uid())
  );

drop policy if exists "ai_generations_agency" on ai_generations;
drop policy if exists "AI generations by agency" on ai_generations;
create policy "ai_generations_agency" on ai_generations
  for all using (is_agency_member(agency_id));

drop policy if exists "telegram_bots_agency" on telegram_bots;
create policy "telegram_bots_agency" on telegram_bots
  for all using (is_agency_member(agency_id));

drop policy if exists telegram_channels_agency_policy on telegram_channels;
create policy telegram_channels_agency_policy on telegram_channels
  using (is_agency_member(agency_id));

-- ---- CREDITS ----------------------------------------------------------------------
alter table agency_credits enable row level security;
alter table credit_transactions enable row level security;
alter table promo_code_uses enable row level security;
alter table credit_orders enable row level security;

drop policy if exists "Credits by agency" on agency_credits;
create policy "Credits by agency" on agency_credits
  for all using (is_agency_member(agency_id));

drop policy if exists "Transactions by agency" on credit_transactions;
create policy "Transactions by agency" on credit_transactions
  for select using (is_agency_member(agency_id));

drop policy if exists "Promo uses by agency" on promo_code_uses;
create policy "Promo uses by agency" on promo_code_uses
  for select using (is_agency_member(agency_id));

drop policy if exists "Credit orders by agency" on credit_orders;
create policy "Credit orders by agency" on credit_orders
  for select using (is_agency_member(agency_id));

-- ---- BILLING ------------------------------------------------------------------------
-- Real gaps fixed: these three tables had NO row level security at all.
-- Read-only for the agency (like their credits-section siblings above),
-- since they are populated by billing/webhook logic, not written directly
-- by end users.
alter table agency_sales enable row level security;
alter table credit_purchases enable row level security;
alter table agency_extra_models enable row level security;

drop policy if exists "Agency sales by agency" on agency_sales;
create policy "Agency sales by agency" on agency_sales
  for select using (is_agency_member(agency_id));

drop policy if exists "Credit purchases by agency" on credit_purchases;
create policy "Credit purchases by agency" on credit_purchases
  for select using (is_agency_member(agency_id));

drop policy if exists "Extra models by agency" on agency_extra_models;
create policy "Extra models by agency" on agency_extra_models
  for select using (is_agency_member(agency_id));

-- ---- TRENDS EXTRAS --------------------------------------------------------------------
alter table trend_runs enable row level security;
alter table trend_feedback enable row level security;
alter table agency_preferences enable row level security;

drop policy if exists trend_runs_agency_policy on trend_runs;
create policy trend_runs_agency_policy on trend_runs
  using (is_agency_member(agency_id));

drop policy if exists trend_feedback_agency_policy on trend_feedback;
drop policy if exists "Agency can manage own trend_feedback" on trend_feedback;
create policy "Agency can manage own trend_feedback" on trend_feedback
  for all using (is_agency_member(agency_id));

drop policy if exists "Agency can manage own preferences" on agency_preferences;
create policy "Agency can manage own preferences" on agency_preferences
  for all using (is_agency_member(agency_id));

-- ---- MISC -------------------------------------------------------------------------------
alter table email_drip_log enable row level security;
-- Deliberately no policies: service role (cron) bypasses RLS to write; no
-- end user ever reads this table through a normal client (see note above).


-- ============================================================================
-- PART 14 — BUSINESS-LOGIC FUNCTIONS & TRIGGERS
-- ============================================================================

-- ---- Credits: balance snapshot + auto top-up (add_credits_system.sql, v1) -----
create or replace function update_credit_transactions_balance()
returns trigger as $$
begin
  update credit_transactions
  set balance_after = (select balance from agency_credits where agency_id = new.agency_id)
  where id = new.id;
  return new;
end;
$$ language plpgsql;

create or replace function check_auto_topup()
returns trigger as $$
declare
  v_balance integer;
  v_threshold integer;
  v_amount integer;
begin
  select balance, auto_topup_threshold, auto_topup_amount
  into v_balance, v_threshold, v_amount
  from agency_credits
  where agency_id = new.agency_id and auto_topup_enabled = true;

  if found and v_balance <= v_threshold then
    insert into credit_transactions (
      agency_id, amount, balance_after, type, description, feature
    ) values (
      new.agency_id,
      v_amount,
      v_balance + v_amount,
      'purchase',
      'Auto top-up automatique',
      'auto_topup'
    );

    update agency_credits
    set balance = balance + v_amount,
        lifetime_purchased = lifetime_purchased + v_amount
    where agency_id = new.agency_id;
  end if;

  return new;
end;
$$ language plpgsql;

create or replace trigger trg_update_credit_balance
after insert on credit_transactions
for each row execute function update_credit_transactions_balance();

create or replace trigger trg_check_auto_topup
after insert on credit_transactions
for each row
when (new.type = 'consumption')
execute function check_auto_topup();

-- ---- Billing: model surcharge / credit-pack helpers (update_plans_pricing.sql) -----
create or replace function get_model_surcharge(p_agency_id uuid)
returns numeric as $$
  select coalesce(monthly_surcharge, 0)
  from agency_extra_models
  where agency_id = p_agency_id;
$$ language sql stable;

create or replace function get_available_credits(p_agency_id uuid, p_pack_type text)
returns int as $$
  select coalesce(sum(credits_remaining), 0)::int
  from credit_purchases
  where agency_id = p_agency_id
    and pack_type = p_pack_type
    and (expires_at is null or expires_at > now())
    and credits_remaining > 0;
$$ language sql stable;

create or replace function consume_credit(
  p_agency_id uuid,
  p_pack_type text,
  p_quantity int default 1
)
returns boolean as $$
declare
  v_consumed int := 0;
  v_pack record;
begin
  for v_pack in
    select id, credits_remaining
    from credit_purchases
    where agency_id = p_agency_id
      and pack_type = p_pack_type
      and (expires_at is null or expires_at > now())
      and credits_remaining > 0
    order by purchased_at asc
  loop
    if v_consumed >= p_quantity then
      exit;
    end if;

    if (v_pack.credits_remaining + v_consumed) <= p_quantity then
      update credit_purchases set credits_remaining = 0 where id = v_pack.id;
      v_consumed := v_consumed + v_pack.credits_remaining;
    else
      update credit_purchases
      set credits_remaining = credits_remaining - (p_quantity - v_consumed)
      where id = v_pack.id;
      v_consumed := p_quantity;
    end if;
  end loop;

  return v_consumed >= p_quantity;
end;
$$ language plpgsql;

-- ---- Prospection: outreach counter (add_prospection_v2.sql) -----------------------
create or replace function increment_outreach_count()
returns trigger language plpgsql as $$
begin
  update prospects set outreach_count = outreach_count + 1 where id = new.prospect_id;
  return new;
end;
$$;

create or replace trigger on_outreach_insert
  after insert on outreach_messages
  for each row execute function increment_outreach_count();

-- ---- Prospection: learning / scoring upsert (add_prospection_learning.sql) --------
create or replace function upsert_learning_and_recalculate(
  p_agency_id uuid,
  p_prospect_id uuid,
  p_niche text,
  p_geo_country text,
  p_follower_range text,
  p_platform_status text,
  p_outcome text
)
returns table (
  success_rate_output float
) language plpgsql as $$
declare
  v_total_count int;
  v_signed_count int;
  v_rate float;
begin
  insert into prospection_learnings (
    agency_id, prospect_id, niche, geo_country, follower_range,
    platform_status, outcome
  ) values (
    p_agency_id, p_prospect_id, p_niche, p_geo_country, p_follower_range,
    p_platform_status, p_outcome
  );

  select count(*) into v_total_count
  from prospection_learnings
  where agency_id = p_agency_id
    and niche = p_niche
    and (geo_country is null or geo_country = p_geo_country)
    and follower_range = p_follower_range
    and platform_status = p_platform_status;

  select count(*) into v_signed_count
  from prospection_learnings
  where agency_id = p_agency_id
    and niche = p_niche
    and (geo_country is null or geo_country = p_geo_country)
    and follower_range = p_follower_range
    and platform_status = p_platform_status
    and outcome = 'signed';

  v_rate := case
    when v_total_count = 0 then 0.5
    else cast(v_signed_count as float) / v_total_count
  end;

  insert into prospection_scoring_weights (
    agency_id, niche, geo_country, follower_range, platform_status,
    signed_count, rejected_count, no_response_count, success_rate
  ) values (
    p_agency_id, p_niche, p_geo_country, p_follower_range, p_platform_status,
    v_signed_count,
    (select count(*) from prospection_learnings where agency_id = p_agency_id and niche = p_niche and (geo_country is null or geo_country = p_geo_country) and follower_range = p_follower_range and platform_status = p_platform_status and outcome = 'rejected'),
    (select count(*) from prospection_learnings where agency_id = p_agency_id and niche = p_niche and (geo_country is null or geo_country = p_geo_country) and follower_range = p_follower_range and platform_status = p_platform_status and outcome = 'no_response'),
    v_rate
  )
  on conflict (agency_id, niche, geo_country, follower_range, platform_status)
  do update set
    signed_count = v_signed_count,
    rejected_count = excluded.rejected_count,
    no_response_count = excluded.no_response_count,
    success_rate = v_rate,
    updated_at = now();

  return query select v_rate;
end;
$$;

-- ---- Support: updated_at bookkeeping (add_support_system.sql) --------------------
create or replace function update_support_tickets_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_support_tickets_updated_at
  before update on support_tickets
  for each row execute function update_support_tickets_updated_at();


-- ============================================================================
-- PART 15 — VIEWS
-- ============================================================================

create or replace view trial_overview as
select
  id,
  name,
  plan_id,
  subscription_status,
  trial_ends_at,
  extract(day from (trial_ends_at - now())) as days_remaining,
  created_at
from agencies
where subscription_status = 'trialing'
order by trial_ends_at asc;

create or replace view commission_overview as
select
  a.id as agency_id,
  a.name as agency_name,
  s.period_month,
  s.gross_revenue,
  s.commission_amount,
  s.commission_status,
  sum(s.gross_revenue) over (partition by s.agency_id) as total_gross,
  sum(s.commission_amount) over (partition by s.agency_id) as total_commission,
  s.data_source,
  s.notes
from agencies a
left join agency_sales s on s.agency_id = a.id
where a.plan_id = 'agency'  -- commission only applies to Agency-plan agencies
order by s.period_month desc, a.name asc;

create or replace view support_stats as
select
  count(*) filter (where status = 'new')      as new_count,
  count(*) filter (where status = 'open')     as open_count,
  count(*) filter (where status = 'pending')  as pending_count,
  count(*) filter (where status = 'resolved') as resolved_count,
  count(*) filter (where status = 'closed')   as closed_count,
  count(*) filter (where priority = 'urgent' and status not in ('resolved', 'closed')) as urgent_open,
  count(*) filter (where created_at > now() - interval '24 hours') as last_24h,
  round(avg(extract(epoch from (resolved_at - created_at))/3600) filter (
    where resolved_at is not null
  ), 1) as avg_resolution_hours
from support_tickets;


-- ============================================================================
-- PART 16 — STORAGE BUCKETS & POLICIES
--
-- Real gap fixed: both buckets' insert/update/delete policies previously let
-- ANY authenticated user write to ANY object in the bucket, regardless of
-- agency. App code uploads under an `{agencyId}/...` folder convention —
-- confirmed in src/app/api/models/avatar/route.ts (`${agency.id}/${modelId}.${ext}`,
-- bucket 'avatars') and src/app/api/media/route.ts (`${agency.id}/${fileName}`,
-- bucket 'media'). Policies below are rewritten to check that the first path
-- segment (storage.foldername(name))[1] is an agency the caller belongs to.
--
-- media bucket previously had no UPDATE/DELETE policy at all (only SELECT +
-- INSERT), which — combined with RLS being enabled — meant
-- src/app/api/media/route.ts's `.storage.from('media').remove(...)` call
-- would always have been denied for a normal (non-admin) client. Scoped
-- UPDATE/DELETE policies are added here to both fix that and close the
-- "any object" gap consistently with avatars.
--
-- NOTE: a third bucket, 'content', is referenced by
-- src/app/api/content/process/route.ts but is never created by any bucket
-- statement in any of the 31 source files (nor is it part of the audited gap
-- list this migration was scoped to fix). It is intentionally NOT created
-- here — see final report.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- avatars ---------------------------------------------------------------------
drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Authenticated upload avatars" on storage.objects;
drop policy if exists "Agency scoped upload avatars" on storage.objects;
create policy "Agency scoped upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and is_agency_member(((storage.foldername(name))[1])::uuid));

drop policy if exists "Authenticated update avatars" on storage.objects;
drop policy if exists "Agency scoped update avatars" on storage.objects;
create policy "Agency scoped update avatars"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and is_agency_member(((storage.foldername(name))[1])::uuid));

drop policy if exists "Authenticated delete avatars" on storage.objects;
drop policy if exists "Agency scoped delete avatars" on storage.objects;
create policy "Agency scoped delete avatars"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and is_agency_member(((storage.foldername(name))[1])::uuid));

-- media -------------------------------------------------------------------------
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "Authenticated uploads" on storage.objects;
drop policy if exists "Agency scoped upload media" on storage.objects;
create policy "Agency scoped upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and is_agency_member(((storage.foldername(name))[1])::uuid));

drop policy if exists "Agency scoped update media" on storage.objects;
create policy "Agency scoped update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and is_agency_member(((storage.foldername(name))[1])::uuid));

drop policy if exists "Agency scoped delete media" on storage.objects;
create policy "Agency scoped delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and is_agency_member(((storage.foldername(name))[1])::uuid));


-- ============================================================================
-- PART 17 — NEW-USER TRIGGER (must run last: needs agencies + profiles)
-- ============================================================================

create or replace function handle_new_user()
returns trigger as $$
declare
  new_agency_id uuid;
begin
  insert into agencies (name, owner_id, plan_id)
  values (
    coalesce(new.raw_user_meta_data->>'agency_name', 'Mon Agence'),
    new.id,
    coalesce(new.raw_user_meta_data->>'plan_id', 'starter')
  )
  returning id into new_agency_id;

  insert into profiles (id, agency_id, full_name, role)
  values (
    new.id,
    new_agency_id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'owner'
  );

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
