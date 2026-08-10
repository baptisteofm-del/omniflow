-- ============================================================================
-- OMNIFLOW V1 — 0013_media_flex_pricing.sql
-- Owner feedback after Phase 10 testing:
--   1. Upload was broken: Server Actions cap request bodies at 1MB, and even
--      raising that config Vercel itself caps function payloads around
--      4.5MB — unusable for real video files. Fixed in code (browser uploads
--      straight to Supabase Storage, no bytes through a Server Action); no
--      schema change needed for that part.
--   2. Split "deposit" from "configure": a media can be uploaded with just a
--      file + creator; price, folder, free/for-sale are set afterwards.
--   3. Pricing becomes optional: empty means "not priced yet" — spec 15's
--      future AI-suggested-minimum isn't built, this just stops forcing a
--      human to invent a number immediately at upload time.
--   4. Some media is never for sale (free/preview content) — no price at all,
--      distinct from "not priced yet".
-- ============================================================================

alter table media_assets alter column target_price drop not null;
alter table media_assets alter column minimum_price drop not null;

alter table media_assets drop constraint if exists media_assets_target_price_check;
alter table media_assets drop constraint if exists media_assets_minimum_price_check;
alter table media_assets drop constraint if exists media_assets_price_order;

alter table media_assets add constraint media_assets_target_price_check
  check (target_price is null or target_price > 0);
alter table media_assets add constraint media_assets_minimum_price_check
  check (minimum_price is null or minimum_price > 0);
alter table media_assets add constraint media_assets_price_order
  check (target_price is null or minimum_price is null or minimum_price <= target_price);

-- Free / not-for-sale content (spec 14's catalog isn't only PPV — some
-- assets exist purely to be sent for free, e.g. teasers).
alter table media_assets add column if not exists is_for_sale boolean not null default true;

-- Internal folders (spec 14.38's organization need), agency-scoped so the
-- same folder names (e.g. "PPV", "Freebies") are reusable across creators —
-- independent of which creator a media belongs to.
create table if not exists media_folders (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique(agency_id, name)
);

alter table media_assets add column if not exists folder_id uuid references media_folders(id) on delete set null;

alter table media_folders enable row level security;

drop policy if exists "Media folders by agency" on media_folders;
create policy "Media folders by agency" on media_folders
  for all using (is_agency_member(agency_id));
