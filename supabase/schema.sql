-- ================================
-- OMNIFLOW — Schéma base de données
-- À exécuter dans Supabase SQL Editor
-- ================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ================================
-- AGENCIES (une par client SaaS)
-- ================================
create table if not exists agencies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  plan_id text not null default 'starter',
  subscription_id text,
  subscription_status text default 'trialing',
  trial_ends_at timestamptz default now() + interval '7 days',
  paddle_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================
-- PROFILES (infos utilisateur)
-- ================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_id uuid references agencies(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'owner',
  created_at timestamptz default now()
);

-- ================================
-- MODELS (les modèles OF gérées)
-- ================================
create table if not exists models (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  name text not null,
  platform text default 'onlyfans',
  status text default 'active',
  telegram_channel_id text,
  followers int default 0,
  monthly_revenue numeric default 0,
  created_at timestamptz default now()
);

-- ================================
-- CONTENT (vidéos/images traitées)
-- ================================
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

-- ================================
-- TRENDS (veille contenu)
-- ================================
create table if not exists trends (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  platform text not null,
  title text,
  url text,
  thumbnail_url text,
  engagement int default 0,
  category text,
  tags text[],
  captured_at timestamptz default now()
);

-- ================================
-- SCHEDULED POSTS
-- ================================
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

-- ================================
-- TRANSACTIONS (finance)
-- ================================
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

-- ================================
-- CHATTING REPORTS
-- ================================
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

-- ================================
-- CHATTING AI — Fan Profiles
-- ================================
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

-- ================================
-- CHATTING AI — Chat Scripts
-- ================================
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

-- ================================
-- CHATTING AI — Model Personalities
-- ================================
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
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(model_id)
);

-- ================================
-- CHATTING AI — AI Messages
-- ================================
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

-- ================================
-- REFERRALS (parrainage)
-- ================================
create table if not exists referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_agency_id uuid references agencies(id) on delete cascade not null,
  referred_agency_id uuid references agencies(id) on delete cascade,
  referral_code text unique not null,
  status text default 'pending',
  commission_percent numeric default 10,
  created_at timestamptz default now()
);

-- ================================
-- ROW LEVEL SECURITY
-- ================================
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

-- Policies : chaque agence ne voit que ses données
create policy "Agency owner access" on agencies
  for all using (owner_id = auth.uid());

create policy "Profile access" on profiles
  for all using (id = auth.uid());

create policy "Models by agency" on models
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Content by agency" on content
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Trends by agency" on trends
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Posts by agency" on scheduled_posts
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Transactions by agency" on transactions
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Reports by agency" on chatting_reports
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Fan profiles by agency" on fan_profiles
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Chat scripts by agency" on chat_scripts
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Model personalities by agency" on model_personalities
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "AI messages by agency" on ai_messages
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

-- ================================
-- TRIGGER : créer le profil + agence auto à l'inscription
-- ================================
create or replace function handle_new_user()
returns trigger as $$
declare
  new_agency_id uuid;
begin
  -- Créer l'agence
  insert into agencies (name, owner_id, plan_id)
  values (
    coalesce(new.raw_user_meta_data->>'agency_name', 'Mon Agence'),
    new.id,
    coalesce(new.raw_user_meta_data->>'plan_id', 'starter')
  )
  returning id into new_agency_id;

  -- Créer le profil
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
