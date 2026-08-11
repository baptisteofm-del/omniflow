-- ============================================================================
-- OMNIFLOW V1 — 0019_mym_real_connector.sql
-- Phase 14 (Real Platform Integrations), MYM first — per:
--   docs/specification/OmniFlow_19_Platform_Integrations_OnlyFans_MYM.md
--   docs/implementation/REBUILD_PLAN.md (Phase 14), spec 47.110-47.116
--
-- Owner explicitly overrode the spec's "confirm authorized access first"
-- caution for this platform after research found no official API exists for
-- either OnlyFans or MYM — MYM has no known usage restriction on this
-- pattern (unlike OnlyFans' 2026 ban on autonomous AI sending), so it goes
-- first. Reuses the OLD product's already-working reverse-engineered client
-- (src/lib/platforms/mym.ts, untouched) behind a new Adapter Contract (spec
-- 47.113) so OnlyFans can follow the same shape later.
--
-- Progressive Integration order (spec 47.115): Authentication → Read
-- conversations → Receive updates → Send message → Media/offer → Purchase
-- events → Reconciliation. This migration/pass covers the first three
-- (read-only sync) — real *sending* through the adapter is a deliberately
-- separate follow-up (touches several already-tested send paths: human
-- replies, Copilot, Scripts, Full AI) flagged for the owner before starting.
-- ============================================================================

-- Credentials, kept in their own table (not a column on platform_connections)
-- so a normal select on that table never risks returning a credential blob.
-- Encrypted at rest with the same AES-256-GCM helper the old product uses
-- (src/lib/crypto/encrypt.ts, ENCRYPTION_KEY env var — already set in
-- Vercel since the old app depends on it live today).
create table if not exists platform_credentials (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  platform_connection_id uuid references platform_connections(id) on delete cascade not null unique,
  credentials_encrypted text not null,
  last_verified_at timestamptz,
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table platform_connections add column if not exists last_synced_at timestamptz;

-- External-id mapping so a repeated sync updates/dedupes instead of creating
-- duplicate rows (spec 44.69 "avoid double-counting" applies here too, and
-- spec 47.115's "Reconciliation" step needs this link either way). Plain
-- (non-partial) unique constraints — Postgres already allows unlimited NULLs
-- in a unique constraint (each NULL is distinct), so Mock conversations/
-- messages with no external id are unaffected, and this shape is what
-- Supabase's upsert(onConflict:) can actually target (its API can't express
-- a partial-index predicate).
alter table conversations add column if not exists external_conversation_id text;
alter table conversations drop constraint if exists conversations_creator_external_unique;
alter table conversations add constraint conversations_creator_external_unique unique (creator_id, external_conversation_id);

alter table messages add column if not exists external_message_id text;
alter table messages drop constraint if exists messages_conversation_external_unique;
alter table messages add constraint messages_conversation_external_unique unique (conversation_id, external_message_id);

alter table fans drop constraint if exists fans_creator_platform_external_unique;
alter table fans add constraint fans_creator_platform_external_unique unique (creator_id, platform_id, external_fan_id);

-- MYM now has a real (partial — read-only) connector behind it, so it's no
-- longer purely a placeholder row.
update platforms set status = 'active' where code = 'MYM';

alter table platform_credentials enable row level security;

drop policy if exists "Platform credentials by agency" on platform_credentials;
create policy "Platform credentials by agency" on platform_credentials
  for all using (is_agency_member(agency_id));
