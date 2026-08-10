-- ============================================================================
-- OMNIFLOW V1 — 0007_fan_profile_tags_notes.sql
-- Fan dossier essentials, per owner request after reviewing a competitor's
-- fan panel (MyFeed): dedicated profile fields, tags/lists (for filtering
-- the inbox), and human notes distinct from AI memory (spec 8.30).
-- ============================================================================

-- ============================================================================
-- FANS — dedicated profile fields (spec 8.5 Profile Memory, structured
-- subset the owner wants as real fields rather than freeform AI memory)
-- ============================================================================
alter table fans add column if not exists birthday date;
alter table fans add column if not exists location text;
alter table fans add column if not exists income_amount numeric;
alter table fans add column if not exists income_frequency text check (income_frequency in ('weekly', 'monthly', 'yearly'));
alter table fans add column if not exists subscription_status text not null default 'active' check (subscription_status in ('active', 'inactive'));
alter table fans add column if not exists source text;

-- ============================================================================
-- TAGS — agency-scoped labels ("Listes" in MyFeed), many-to-many with fans.
-- Used both on the fan dossier and to filter the inbox.
-- ============================================================================
create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique(agency_id, name)
);

create table if not exists fan_tags (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  fan_id uuid references fans(id) on delete cascade not null,
  tag_id uuid references tags(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(fan_id, tag_id)
);

create index if not exists idx_fan_tags_fan on fan_tags(fan_id);
create index if not exists idx_fan_tags_tag on fan_tags(tag_id);

-- ============================================================================
-- FAN_NOTES (spec 8.30) — human notes distinct from AI memory (fan_memories).
-- Never written to by the AI Gateway.
-- ============================================================================
create table if not exists fan_notes (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  fan_id uuid references fans(id) on delete cascade not null,
  author_id uuid references users(id) on delete set null,
  text text not null,
  priority text not null default 'normal' check (priority in ('normal', 'important')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_fan_notes_fan on fan_notes(fan_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table tags enable row level security;
alter table fan_tags enable row level security;
alter table fan_notes enable row level security;

drop policy if exists "Tags by agency" on tags;
create policy "Tags by agency" on tags
  for all using (is_agency_member(agency_id));

drop policy if exists "Fan tags by agency" on fan_tags;
create policy "Fan tags by agency" on fan_tags
  for all using (is_agency_member(agency_id));

drop policy if exists "Fan notes by agency" on fan_notes;
create policy "Fan notes by agency" on fan_notes
  for all using (is_agency_member(agency_id));
