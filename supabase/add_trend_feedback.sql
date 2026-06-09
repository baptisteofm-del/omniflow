-- ============================================================
-- Migration : Système de feedback trends (like/dislike)
-- + Colonne dailyTrendsCount + préférences agence
-- ============================================================

-- Table principal de feedback trends
CREATE TABLE IF NOT EXISTS trend_feedback (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id    UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  trend_id     TEXT NOT NULL,          -- ID du trend (UUID DB ou seed ID)
  feedback     TEXT NOT NULL CHECK (feedback IN ('like', 'dislike')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agency_id, trend_id)
);

CREATE INDEX IF NOT EXISTS idx_trend_feedback_agency ON trend_feedback(agency_id);
CREATE INDEX IF NOT EXISTS idx_trend_feedback_trend  ON trend_feedback(trend_id);

-- RLS
ALTER TABLE trend_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency can manage own trend_feedback"
  ON trend_feedback FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- Table préférences agence (pour le système de recommandation)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agency_preferences (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id        UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  preference_key   TEXT NOT NULL,
  preference_value TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agency_id, preference_key)
);

CREATE INDEX IF NOT EXISTS idx_agency_preferences_agency ON agency_preferences(agency_id);

ALTER TABLE agency_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency can manage own preferences"
  ON agency_preferences FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- Ajout colonne user_feedback dans la table trends (cache)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE trends
  ADD COLUMN IF NOT EXISTS has_feedback BOOLEAN DEFAULT FALSE;

-- ─────────────────────────────────────────────────────────────
-- Mise à jour des limites : s'assure que trend_runs = 30/mois
-- pour tous les plans (déjà géré côté code plans.ts)
-- ─────────────────────────────────────────────────────────────

-- Commentaire sur les quotas (documentation DB)
COMMENT ON TABLE trend_feedback IS
  'Feedback utilisateur sur les trends Instagram (like/dislike). 
   Utilisé par le système de recommandation évolutif.
   Starter: 5 trends/jour | Pro: 10/jour | Agency: 20/jour.
   RUN manuel = 10 trends = 9€.';
