-- Create tutorial_progress table
create table if not exists tutorial_progress (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  tutorial_id text not null,
  completed_at timestamptz default now(),
  unique(agency_id, tutorial_id)
);

-- Enable Row Level Security
alter table tutorial_progress enable row level security;

-- RLS Policy: Agencies can only see their own tutorial progress
create policy "Tutorial progress by agency" on tutorial_progress
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

-- Create index for faster lookups
create index if not exists tutorial_progress_agency_id_idx on tutorial_progress(agency_id);
create index if not exists tutorial_progress_tutorial_id_idx on tutorial_progress(tutorial_id);
