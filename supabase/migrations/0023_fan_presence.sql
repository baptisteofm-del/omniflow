-- ============================================================================
-- OMNIFLOW V1 — 0023_fan_presence.sql
-- MYM's real API also returns is_online + last_seen_at per fan (same
-- styx.mym.fans/v1/chats response as avatar_url/is_subscriber, 0022). Owner
-- asked how MyFeed shows an online dot — this is how: it's real data MYM
-- already sends, not something requiring a live/websocket connection.
-- Honest caveat kept in code: since sync is a manual pull (no background
-- scheduler yet, see TECH_DEBT), this reflects state "as of last sync", not
-- truly live — last_seen_at itself stays accurate regardless of when we
-- last synced, so the UI shows a dot only when genuinely recent.
-- ============================================================================

alter table fans
  add column if not exists is_online boolean not null default false,
  add column if not exists last_seen_at timestamptz;
