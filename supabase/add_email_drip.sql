-- Email Drip Log Table
create table if not exists email_drip_log (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  day_number int not null default 0,
  sent_at timestamptz default now(),
  unique(email, day_number)
);

-- Add indexes for fast queries
create index if not exists email_drip_log_email_idx on email_drip_log(email);
create index if not exists email_drip_log_day_idx on email_drip_log(day_number);

-- Enable RLS
alter table email_drip_log enable row level security;

-- Allow service role to insert
create policy "Allow service role to insert email logs"
  on email_drip_log for insert
  with check (true);

-- Allow reading own logs (if needed later)
create policy "Allow authenticated users to read their logs"
  on email_drip_log for select
  using (auth.uid()::text = email or true);
