-- Create media_files table for storing generated and uploaded content
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

-- Enable RLS
alter table media_files enable row level security;

-- Create RLS policy: Users can only see/edit their own agency's media
create policy "Media by agency" on media_files
  for all using (agency_id in (select id from agencies where owner_id = auth.uid()));

-- Create indexes for better query performance
create index if not exists idx_media_files_agency_id on media_files(agency_id);
create index if not exists idx_media_files_created_at on media_files(created_at desc);
create index if not exists idx_media_files_type on media_files(type);
create index if not exists idx_media_files_source on media_files(source);

-- Create storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict do nothing;

-- Create policy for public access to media files
create policy "Public Access" on storage.objects
  for select using (bucket_id = 'media');

-- Create policy for authenticated users to upload
create policy "Authenticated uploads" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');
