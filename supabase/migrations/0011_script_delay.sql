-- ============================================================================
-- OMNIFLOW V1 — 0011_script_delay.sql
-- Owner feedback: steps must not fire instantly one after another — the
-- agency needs to control a realistic delay before each step goes out
-- (spec 11.10 Timing Metadata: immediate/short_delay/natural_delay;
-- spec 28.38 already anticipated a `delay_seconds` field on script_nodes).
-- ============================================================================

alter table script_nodes add column if not exists delay_seconds int not null default 0 check (delay_seconds >= 0);

-- When a run is queued to send its current node once a delay elapses,
-- rather than right away.
alter table script_runs add column if not exists scheduled_at timestamptz;
