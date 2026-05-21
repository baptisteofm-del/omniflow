-- ================================
-- Intégrations multi-tenant
-- Ajouter ces tables à Supabase
-- ================================

-- Intégrations par agence (clés API stockées de façon sécurisée)
create table if not exists agency_integrations (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  tool text not null, -- 'adspower' | 'geelark' | 'telegram'
  api_key text not null,
  api_url text, -- pour adspower local : http://local.adspower.net:50325
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, tool)
);

-- Profils des modèles (lien entre modèle et profil AdsPower/GeeLark)
create table if not exists model_profiles (
  id uuid primary key default uuid_generate_v4(),
  model_id uuid references models(id) on delete cascade not null,
  agency_id uuid references agencies(id) on delete cascade not null,
  tool text not null, -- 'adspower' | 'geelark'
  profile_id text not null, -- ID du profil dans AdsPower ou GeeLark
  platform text not null, -- 'instagram' | 'tiktok' | 'onlyfans'
  profile_name text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table agency_integrations enable row level security;
alter table model_profiles enable row level security;

create policy "Integrations by agency" on agency_integrations
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Model profiles by agency" on model_profiles
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

-- Indexes pour les requêtes fréquentes
create index if not exists idx_agency_integrations_agency on agency_integrations(agency_id);
create index if not exists idx_model_profiles_model on model_profiles(model_id);
create index if not exists idx_model_profiles_agency on model_profiles(agency_id);
