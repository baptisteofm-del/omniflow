-- ============================================================================
-- OMNIFLOW V1 — 0020_mym_sync_progress.sql
-- Phase 14 follow-up: live progress for syncMymCreator() (src/lib/platforms/sync.ts).
-- Owner reported the sync "feels long with no feedback" — it genuinely is
-- (one serial network round-trip per conversation to styx.mym.fans, plus
-- upserts). Rather than guess at a fake ETA, sync.ts now writes real
-- progress into these columns as it works through each conversation, and
-- the client polls it live.
-- ============================================================================

alter table platform_connections
  add column if not exists sync_status text not null default 'idle'
    check (sync_status in ('idle', 'syncing', 'done', 'error')),
  add column if not exists sync_total integer,
  add column if not exists sync_done integer,
  add column if not exists sync_current_label text;
