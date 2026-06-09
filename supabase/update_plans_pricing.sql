-- ================================
-- MISE À JOUR PLANS ET ESSAI
-- Nouveaux prix + structures commission/packs
-- ================================

-- S'assurer que la colonne plan_id accepte 'trial'
ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS trial_plan_id text DEFAULT 'trial';

-- Index pour les requêtes de trial expiry
CREATE INDEX IF NOT EXISTS idx_agencies_trial_ends_at
  ON agencies(trial_ends_at)
  WHERE subscription_status = 'trialing';

-- Vue helper pour le suivi des essais
CREATE OR REPLACE VIEW trial_overview AS
SELECT
  id,
  name,
  plan_id,
  subscription_status,
  trial_ends_at,
  EXTRACT(DAY FROM (trial_ends_at - NOW())) AS days_remaining,
  created_at
FROM agencies
WHERE subscription_status = 'trialing'
ORDER BY trial_ends_at ASC;

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- Table pour tracker les ventes et commissions (10% Omniflow)
-- ═══════════════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agency_sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  period_month date NOT NULL, -- premier jour du mois (ex: 2026-06-01)
  gross_revenue numeric(12,2) DEFAULT 0,
  commission_amount numeric(12,2) GENERATED ALWAYS AS (gross_revenue * 0.10) STORED,
  commission_status text DEFAULT 'pending' CHECK (commission_status IN ('pending', 'invoiced', 'paid', 'disputed')),
  data_source text DEFAULT 'manual' CHECK (data_source IN ('manual', 'api', 'webhook')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(agency_id, period_month)
);

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- Table pour les packs de crédits achetés
-- ═══════════════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS credit_purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  pack_id text NOT NULL, -- ex: 'kling_100', 'trend_500'
  pack_type text NOT NULL CHECK (pack_type IN ('kling', 'trend')),
  credits_purchased int NOT NULL,
  credits_remaining int NOT NULL,
  amount_paid numeric(8,2) NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  expires_at timestamptz -- null = pas d'expiration
);

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- Table pour les modèles supplémentaires (au-delà de 10 inclus)
-- ═══════════════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agency_extra_models (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  extra_model_count int DEFAULT 0, -- nombre de modèles au-delà de 10
  monthly_surcharge numeric(8,2) GENERATED ALWAYS AS (extra_model_count * 99.00) STORED,
  updated_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- INDEX POUR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_agency_sales_period ON agency_sales(agency_id, period_month);
CREATE INDEX IF NOT EXISTS idx_agency_sales_status ON agency_sales(commission_status);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_agency ON credit_purchases(agency_id, pack_type);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_remaining ON credit_purchases(agency_id) WHERE credits_remaining > 0;
CREATE INDEX IF NOT EXISTS idx_extra_models_agency ON agency_extra_models(agency_id);

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- VUE COMMISSION OVERVIEW
-- ═══════════════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW commission_overview AS
SELECT 
  a.id as agency_id,
  a.name as agency_name,
  s.period_month,
  s.gross_revenue,
  s.commission_amount,
  s.commission_status,
  SUM(s.gross_revenue) OVER (PARTITION BY s.agency_id) as total_gross,
  SUM(s.commission_amount) OVER (PARTITION BY s.agency_id) as total_commission,
  s.data_source,
  s.notes
FROM agencies a
LEFT JOIN agency_sales s ON s.agency_id = a.id
WHERE a.plan_id = 'agency' -- Uniquement pour les agences Agency (avec commission)
ORDER BY s.period_month DESC, a.name ASC;

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- FONCTION CALCUL SUPPLÉMENT MODÈLES
-- ═══════════════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_model_surcharge(p_agency_id uuid)
RETURNS numeric AS $$
  SELECT COALESCE(monthly_surcharge, 0)
  FROM agency_extra_models
  WHERE agency_id = p_agency_id;
$$ LANGUAGE sql STABLE;

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- FONCTION POUR VÉRIFIER LES CRÉDITS RESTANTS (KLING/TREND)
-- ═══════════════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_available_credits(p_agency_id uuid, p_pack_type text)
RETURNS int AS $$
  SELECT COALESCE(SUM(credits_remaining), 0)::int
  FROM credit_purchases
  WHERE agency_id = p_agency_id
    AND pack_type = p_pack_type
    AND (expires_at IS NULL OR expires_at > NOW())
    AND credits_remaining > 0;
$$ LANGUAGE sql STABLE;

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- FONCTION DÉCRÉMENTER CRÉDITS APRÈS USAGE
-- ═══════════════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION consume_credit(
  p_agency_id uuid,
  p_pack_type text,
  p_quantity int DEFAULT 1
)
RETURNS boolean AS $$
DECLARE
  v_consumed int := 0;
  v_pack record;
BEGIN
  -- Parcourir les packs actifs du plus ancien au plus récent
  FOR v_pack IN 
    SELECT id, credits_remaining 
    FROM credit_purchases
    WHERE agency_id = p_agency_id
      AND pack_type = p_pack_type
      AND (expires_at IS NULL OR expires_at > NOW())
      AND credits_remaining > 0
    ORDER BY purchased_at ASC
  LOOP
    IF v_consumed >= p_quantity THEN
      EXIT;
    END IF;
    
    -- Calculer combien on peut décrémenter de ce pack
    IF (v_pack.credits_remaining + v_consumed) <= p_quantity THEN
      -- Consommer tout ce pack
      UPDATE credit_purchases
      SET credits_remaining = 0
      WHERE id = v_pack.id;
      v_consumed := v_consumed + v_pack.credits_remaining;
    ELSE
      -- Consommer partiellement
      UPDATE credit_purchases
      SET credits_remaining = credits_remaining - (p_quantity - v_consumed)
      WHERE id = v_pack.id;
      v_consumed := p_quantity;
    END IF;
  END LOOP;
  
  RETURN v_consumed >= p_quantity;
END;
$$ LANGUAGE plpgsql;
