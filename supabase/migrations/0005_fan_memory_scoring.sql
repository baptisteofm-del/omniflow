-- ============================================================================
-- OMNIFLOW V1 — 0005_fan_memory_scoring.sql
-- Phase 6 (Fan Memory + Scoring) schema, per:
--   docs/specification/OmniFlow_08_Fan_Memory.md
--   docs/specification/OmniFlow_09_Fan_Intelligence_Scoring.md
--   docs/implementation/REBUILD_PLAN.md (Phase 6)
--
-- Scope: minimal vertical slice to satisfy Phase 6's exit criteria —
-- "memory + scores correctly retrieved for a mock conversation". Memory
-- entries and scores are human-entered/human-editable at this stage
-- (spec 8.28); automatic AI extraction and score computation are deferred
-- to the AI Gateway / Fan Intelligence Engine phases (7-10), which is
-- exactly what spec 8.31 requires: signals stored now, formulas later.
-- ============================================================================

-- ============================================================================
-- FAN_MEMORIES (spec Part 8 — categories 8.4, memory object 8.12,
-- confidence/importance 8.13-8.14, source traceability 8.29)
-- ============================================================================
create table if not exists fan_memories (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  fan_id uuid references fans(id) on delete cascade not null,
  category text not null check (category in (
    'profile', 'relationship', 'preference', 'commercial',
    'conversation', 'temporal', 'boundary'
  )),
  label text not null,
  value text not null,
  confidence numeric(3,2) not null default 0.80 check (confidence >= 0 and confidence <= 1),
  importance numeric(3,2) not null default 0.50 check (importance >= 0 and importance <= 1),
  source text not null default 'human' check (source in ('human', 'ai', 'import')),
  source_message_id uuid references messages(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'expired', 'contradicted', 'deleted')),
  occurred_at timestamptz,
  last_confirmed_at timestamptz default now(),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_fan_memories_agency on fan_memories(agency_id);
create index if not exists idx_fan_memories_fan on fan_memories(fan_id, status);

-- ============================================================================
-- FAN_SCORES (spec Part 9 — 5 core scores 9.2, scale 9.3, scores are
-- estimates with confidence/version/explanation, not truth: 9.11).
-- One current row per fan; history/decay/recalculation land with the
-- Fan Intelligence Engine phase.
-- ============================================================================
create table if not exists fan_scores (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  fan_id uuid references fans(id) on delete cascade not null unique,
  purchase_intent int not null default 0 check (purchase_intent between 0 and 100),
  relationship_score int not null default 0 check (relationship_score between 0 and 100),
  spending_potential int not null default 0 check (spending_potential between 0 and 100),
  engagement_score int not null default 0 check (engagement_score between 0 and 100),
  churn_risk int not null default 0 check (churn_risk between 0 and 100),
  omni_score int check (omni_score between 0 and 100),
  reasons text,
  computed_by text not null default 'human' check (computed_by in ('human', 'system')),
  version int not null default 1,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_fan_scores_agency on fan_scores(agency_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table fan_memories enable row level security;
alter table fan_scores enable row level security;

drop policy if exists "Fan memories by agency" on fan_memories;
create policy "Fan memories by agency" on fan_memories
  for all using (is_agency_member(agency_id));

drop policy if exists "Fan scores by agency" on fan_scores;
create policy "Fan scores by agency" on fan_scores
  for all using (is_agency_member(agency_id));
