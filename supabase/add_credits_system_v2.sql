-- ============================================================
-- OMNIFLOW — CREDITS SYSTEM v2 (corrigé)
-- ============================================================

-- Activer l'extension UUID si pas déjà fait
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE SOLDE CRÉDITS
CREATE TABLE IF NOT EXISTS agency_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  balance INTEGER DEFAULT 0,
  lifetime_purchased INTEGER DEFAULT 0,
  auto_topup_enabled BOOLEAN DEFAULT false,
  auto_topup_threshold INTEGER DEFAULT 10,
  auto_topup_amount INTEGER DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id)
);
ALTER TABLE agency_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Credits by agency" ON agency_credits;
CREATE POLICY "Credits by agency" ON agency_credits
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_agency_credits_agency ON agency_credits(agency_id);

-- 2. TABLE HISTORIQUE TRANSACTIONS
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'consumption', 'bonus', 'refund', 'promo')),
  description TEXT NOT NULL,
  feature TEXT,
  payment_id TEXT,
  promo_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Transactions by agency" ON credit_transactions;
CREATE POLICY "Transactions by agency" ON credit_transactions
  FOR SELECT USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_credit_transactions_agency ON credit_transactions(agency_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at DESC);

-- 3. TABLE CODES PROMO
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'credits')),
  discount_value NUMERIC NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,
  applicable_to TEXT DEFAULT 'subscription' CHECK (applicable_to IN ('subscription', 'credits', 'both')),
  min_amount NUMERIC DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- 4. TABLE UTILISATIONS CODES PROMO
CREATE TABLE IF NOT EXISTS promo_code_uses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE NOT NULL,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  discount_amount NUMERIC NOT NULL,
  applied_to TEXT NOT NULL CHECK (applied_to IN ('subscription', 'credits')),
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE promo_code_uses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Promo uses by agency" ON promo_code_uses;
CREATE POLICY "Promo uses by agency" ON promo_code_uses
  FOR SELECT USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- 5. TABLE COMMANDES CRÉDITS
CREATE TABLE IF NOT EXISTS credit_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  order_id TEXT UNIQUE NOT NULL,
  invoice_id TEXT,
  run_count INTEGER NOT NULL,
  credit_count INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  final_amount NUMERIC NOT NULL,
  promo_code TEXT,
  credits_bonus INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE credit_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Credit orders by agency" ON credit_orders;
CREATE POLICY "Credit orders by agency" ON credit_orders
  FOR SELECT USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_credit_orders_agency ON credit_orders(agency_id);
CREATE INDEX IF NOT EXISTS idx_credit_orders_order_id ON credit_orders(order_id);

-- 6. INITIALISER CRÉDITS POUR AGENCES EXISTANTES
INSERT INTO agency_credits (agency_id, balance)
SELECT id, 0 FROM agencies
ON CONFLICT (agency_id) DO NOTHING;
