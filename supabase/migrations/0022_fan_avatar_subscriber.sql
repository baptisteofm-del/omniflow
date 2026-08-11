-- ============================================================================
-- OMNIFLOW V1 — 0022_fan_avatar_subscriber.sql
-- MYM's real API already returns a fan's avatar_url and is_subscriber flag
-- (confirmed in the styx.mym.fans/v1/chats response captured during Phase
-- 14's live discovery) — this was never stored. Surfacing real photos and
-- a subscriber badge in the Inbox list closes a real visual gap against
-- the owner's reference (myfeed.fans), using data we already receive
-- rather than inventing anything.
-- ============================================================================

alter table fans
  add column if not exists avatar_url text,
  add column if not exists is_subscriber boolean not null default false;
