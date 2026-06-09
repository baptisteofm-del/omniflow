-- ============================================================
-- OMNIFLOW — CREDITS SYSTEM + PROMO CODES
-- Système de crédits unifié (auto top-up) + codes promo
-- ============================================================

-- 1. SOLDE DE CRÉDITS PAR AGENCE
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

CREATE POLICY "Credits by agency" ON agency_credits
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_agency_credits_agency ON agency_credits(agency_id);

-- 2. HISTORIQUE TRANSACTIONS CRÉDITS
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

CREATE POLICY "Transactions by agency" ON credit_transactions
  FOR SELECT USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_credit_transactions_agency ON credit_transactions(agency_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at DESC);

-- 3. CODES PROMO
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'credits')),
  discount_value NUMERIC NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,
  applicable_plans TEXT[] DEFAULT NULL,
  applicable_to TEXT DEFAULT 'subscription' CHECK (applicable_to IN ('subscription', 'credits', 'both')),
  min_amount NUMERIC DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_expires ON promo_codes(expires_at);

-- 4. UTILISATIONS CODES PROMO
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

CREATE POLICY "Promo uses by agency" ON promo_code_uses
  FOR SELECT USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_promo_code_uses_promo ON promo_code_uses(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_uses_agency ON promo_code_uses(agency_id, user_email);

-- 5. TRIGGERS & FUNCTIONS

-- Fonction pour mettre à jour balance_after lors de l'insertion
CREATE OR REPLACE FUNCTION update_credit_transactions_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- On récupère le solde actuel de l'agence
  UPDATE credit_transactions
  SET balance_after = (SELECT balance FROM agency_credits WHERE agency_id = NEW.agency_id)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier et appliquer auto top-up après consommation
CREATE OR REPLACE FUNCTION check_auto_topup()
RETURNS TRIGGER AS $$
DECLARE
  v_balance INTEGER;
  v_threshold INTEGER;
  v_amount INTEGER;
BEGIN
  SELECT balance, auto_topup_threshold, auto_topup_amount
  INTO v_balance, v_threshold, v_amount
  FROM agency_credits
  WHERE agency_id = NEW.agency_id AND auto_topup_enabled = true;

  IF FOUND AND v_balance <= v_threshold THEN
    -- Insérer une transaction d'achat automatique
    INSERT INTO credit_transactions (
      agency_id, amount, balance_after, type, description, feature
    ) VALUES (
      NEW.agency_id,
      v_amount,
      v_balance + v_amount,
      'purchase',
      'Auto top-up automatique',
      'auto_topup'
    );

    -- Mettre à jour le solde
    UPDATE agency_credits
    SET balance = balance + v_amount,
        lifetime_purchased = lifetime_purchased + v_amount
    WHERE agency_id = NEW.agency_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trg_update_credit_balance ON credit_transactions;
CREATE TRIGGER trg_update_credit_balance
AFTER INSERT ON credit_transactions
FOR EACH ROW EXECUTE FUNCTION update_credit_transactions_balance();

DROP TRIGGER IF EXISTS trg_check_auto_topup ON credit_transactions;
CREATE TRIGGER trg_check_auto_topup
AFTER INSERT ON credit_transactions
FOR EACH ROW
WHEN (NEW.type = 'consumption')
EXECUTE FUNCTION check_auto_topup();

-- 6. COMMANDES DE CRÉDITS (pour tracker les paiements NOWPayments)
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

CREATE POLICY "Credit orders by agency" ON credit_orders
  FOR SELECT USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_credit_orders_agency ON credit_orders(agency_id);
CREATE INDEX IF NOT EXISTS idx_credit_orders_order_id ON credit_orders(order_id);

-- 7. INITIALISER CRÉDITS POUR LES AGENCES EXISTANTES
INSERT INTO agency_credits (agency_id, balance)
SELECT id FROM agencies
WHERE id NOT IN (SELECT agency_id FROM agency_credits)
ON CONFLICT (agency_id) DO NOTHING;
