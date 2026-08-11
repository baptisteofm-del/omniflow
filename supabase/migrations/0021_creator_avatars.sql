-- ============================================================================
-- OMNIFLOW V1 — 0021_creator_avatars.sql
-- Public bucket for creator profile photos, uploaded from the new
-- /creators/[id] profile page. Public (unlike the "media" bucket) because
-- a profile photo has none of the media library's price/sensitivity
-- concerns and needs to render as a plain <img src> everywhere without
-- signed-URL refresh logic — same reasoning the old (pre-rebuild) product
-- already used for its own "avatars" bucket.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatars bucket agency access" on storage.objects;
create policy "Avatars bucket agency access" on storage.objects
  for all
  to authenticated
  using (bucket_id = 'avatars' and is_agency_member((storage.foldername(name))[1]::uuid))
  with check (bucket_id = 'avatars' and is_agency_member((storage.foldername(name))[1]::uuid));
