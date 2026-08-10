-- ============================================================================
-- OMNIFLOW V1 — 0010_script_adaptive_mode.sql
-- Owner feedback after first live script test:
--   1. Steps fired back-to-back without waiting for the fan to reply
--      (fixed in code: src/lib/scripts/engine.ts, no schema change needed —
--      spec 13.20 Wait Node: "wait until fan responds").
--   2. Script text should be a base the AI adapts per conversation, not
--      sent verbatim (spec 13.8: LOCKED vs ADAPTIVE message modes).
-- This migration adds the column needed for point 2.
-- ============================================================================

alter table script_nodes add column if not exists generation_mode text not null default 'locked' check (generation_mode in ('locked', 'adaptive'));
