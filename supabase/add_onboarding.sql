-- Add onboarding tracking to agencies
alter table agencies add column if not exists onboarding_completed boolean default false;

-- Create prospects table for prospection module
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on prospects table
alter table prospects enable row level security;

-- Create RLS policy for prospects
create policy "Prospects by agency" on prospects
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));
