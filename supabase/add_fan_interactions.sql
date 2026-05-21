-- ================================
-- Fan Interactions Table
-- Sync fan data from OnlyFans & MYM
-- Ajouter à Supabase
-- ================================

create table if not exists fan_interactions (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  model_id uuid references models(id) on delete set null,
  platform text not null, -- 'onlyfans' | 'mym'
  fan_id text not null,
  fan_name text,
  last_message text,
  sentiment text default 'neutral', -- 'positive' | 'neutral' | 'negative'
  risk_level text default 'low', -- 'low' | 'medium' | 'high'
  last_purchase_at timestamptz,
  total_spent numeric default 0,
  last_interaction_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, platform, fan_id)
);

-- Enable RLS
alter table fan_interactions enable row level security;

-- RLS Policy
create policy "Fan interactions by agency" on fan_interactions
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

-- Indexes for frequent queries
create index if not exists idx_fan_interactions_agency on fan_interactions(agency_id);
create index if not exists idx_fan_interactions_platform on fan_interactions(agency_id, platform);
create index if not exists idx_fan_interactions_sentiment on fan_interactions(sentiment);
create index if not exists idx_fan_interactions_risk on fan_interactions(risk_level);
create index if not exists idx_fan_interactions_last_interaction on fan_interactions(last_interaction_at);
