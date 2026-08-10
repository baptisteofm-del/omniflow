-- ============================================================================
-- OMNIFLOW V1 — 0018_billing_commission.sql
-- Phase 13 (Billing + Commission) schema, per:
--   docs/specification/OmniFlow_22_Billing_Subscriptions_Commission_Plan_Management.md
--   docs/specification/OmniFlow_28_Data_Model_Entity_Relationships_Database_Schema_Blueprint.md (28.53-28.59)
--   docs/implementation/REBUILD_PLAN.md (Phase 13), spec 47.101-47.108
--
-- Owner chose Mock billing for this pass (spec 22.61 "Demo/Development Mode"
-- explicitly calls for this: "billing test mode, fake platform transactions,
-- mock commission ledger — no real payment needed to test flows"). No Stripe
-- wiring here; `agencies.billing_provider` exists so real Stripe can be
-- added later without a schema change.
--
-- `agencies.plan_id`/`status` already modeled the subscription concept
-- since 0001_foundation.sql — this migration adds billing period tracking
-- to that table rather than creating a redundant `subscriptions` table.
--
-- Commission Base (spec 22.5, deliberately conservative pending legal/
-- commercial validation — spec explicitly warns "do not implement an
-- ambiguous definition without validation"): this build treats direct
-- content sales (message/media purchases, custom content, live sessions,
-- tips) as eligible, and the platform SUBSCRIPTION fee itself as NOT
-- eligible (a different revenue stream than Chatting-driven sales). See
-- TECH_DEBT.md.
-- ============================================================================

create table if not exists plans (
  id text primary key,
  display_name text not null,
  monthly_price numeric not null check (monthly_price > 0),
  commission_rate numeric not null check (commission_rate >= 0 and commission_rate < 1),
  active boolean not null default true,
  created_at timestamptz default now()
);

insert into plans (id, display_name, monthly_price, commission_rate) values
  ('copilot', 'Copilot', 99, 0.025),
  ('full_ai', 'Full AI', 199, 0.025)
on conflict (id) do nothing;

alter table agencies add column if not exists billing_provider text not null default 'mock' check (billing_provider in ('mock', 'stripe'));
alter table agencies add column if not exists current_period_start timestamptz not null default now();
alter table agencies add column if not exists current_period_end timestamptz not null default (now() + interval '30 days');

-- ============================================================================
-- TRANSACTIONS (spec 28.53) — the financial source of truth for a confirmed
-- sale. platform_id/external_transaction_id/synced_at are nullable and
-- unused until Phase 14's real platform connectors exist; kept here so
-- adding them later is additive, not a schema change.
-- ============================================================================
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  creator_id uuid references creators(id) on delete cascade not null,
  fan_id uuid references fans(id) on delete cascade not null,
  conversation_id uuid references conversations(id) on delete cascade,
  platform_id uuid references platforms(id) on delete set null,
  external_transaction_id text,
  offer_id uuid references offers(id) on delete set null,
  message_id uuid references messages(id) on delete set null,
  transaction_type text not null check (transaction_type in (
    'subscription', 'message_purchase', 'media_purchase', 'tip', 'custom_content', 'live_session', 'other'
  )),
  gross_amount numeric not null check (gross_amount >= 0),
  currency text not null default 'EUR',
  status text not null default 'confirmed' check (status in ('confirmed', 'refunded', 'reversed', 'disputed')),
  occurred_at timestamptz not null default now(),
  synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_transactions_agency on transactions(agency_id, occurred_at desc);

-- ============================================================================
-- TRANSACTION_ATTRIBUTION (spec 28.55-28.56) — was OmniFlow involved in this
-- sale, and how. Conservative by design (spec 44.12/28.56's own caution):
-- 'unknown' unless there's a real, traceable link (a script node or a Full
-- AI decision behind the matching offer) — never guessed from conversation
-- mode alone.
-- ============================================================================
create table if not exists transaction_attribution (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  transaction_id uuid references transactions(id) on delete cascade not null,
  attribution_type text not null check (attribution_type in ('full_ai', 'copilot', 'human', 'follow_up', 'script', 'unknown')),
  ai_decision_id uuid references ai_decisions(id) on delete set null,
  script_run_id uuid references script_runs(id) on delete set null,
  confidence numeric,
  rules_version text not null default 'attribution-v1',
  created_at timestamptz default now()
);

create index if not exists idx_transaction_attribution_transaction on transaction_attribution(transaction_id);

-- ============================================================================
-- COMMISSION_LEDGER (spec 28.57-28.58) — immutable. The rate applied is
-- snapshotted on every row so a future pricing change never rewrites past
-- periods (spec 22.4/28.58). Corrections go through commission_adjustments
-- below, never an update to this table.
-- ============================================================================
create table if not exists commission_ledger (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  transaction_id uuid references transactions(id) on delete cascade not null unique,
  commission_rate numeric not null,
  eligible_amount numeric not null,
  commission_amount numeric not null,
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending', 'reconciled', 'invoiced', 'adjusted')),
  billing_period text not null,
  created_at timestamptz default now(),
  reconciled_at timestamptz
);

create index if not exists idx_commission_ledger_agency_period on commission_ledger(agency_id, billing_period);

-- ============================================================================
-- COMMISSION_ADJUSTMENTS (spec 28.59) — corrections never mutate the
-- original ledger row directly.
-- ============================================================================
create table if not exists commission_adjustments (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  commission_ledger_id uuid references commission_ledger(id) on delete cascade not null,
  adjustment_amount numeric not null,
  reason text not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table plans enable row level security;
alter table transactions enable row level security;
alter table transaction_attribution enable row level security;
alter table commission_ledger enable row level security;
alter table commission_adjustments enable row level security;

drop policy if exists "Plans catalog readable" on plans;
create policy "Plans catalog readable" on plans
  for select using (auth.role() = 'authenticated');

drop policy if exists "Transactions by agency" on transactions;
create policy "Transactions by agency" on transactions
  for all using (is_agency_member(agency_id));

drop policy if exists "Transaction attribution by agency" on transaction_attribution;
create policy "Transaction attribution by agency" on transaction_attribution
  for all using (is_agency_member(agency_id));

drop policy if exists "Commission ledger by agency" on commission_ledger;
create policy "Commission ledger by agency" on commission_ledger
  for all using (is_agency_member(agency_id));

drop policy if exists "Commission adjustments by agency" on commission_adjustments;
create policy "Commission adjustments by agency" on commission_adjustments
  for all using (is_agency_member(agency_id));
