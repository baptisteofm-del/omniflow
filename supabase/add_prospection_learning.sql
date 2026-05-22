-- ─────────────────────────────────────────────────────────────────────────────
-- OmniFlow — Prospection v3 Learning System Migration
-- Adds intelligent scoring based on historical outcomes
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend prospects table with platform_status and refined scoring
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS platform_status TEXT DEFAULT 'not_on_platform',
  -- platform_status: 'not_on_platform' | 'aggregator_detected' | 'already_on_platform'
  ADD COLUMN IF NOT EXISTS source_account TEXT,
  -- Used when scraping followers/similar from a specific account
  ADD COLUMN IF NOT EXISTS geo_country TEXT,
  ADD COLUMN IF NOT EXISTS geo_cities TEXT,
  -- JSON array as string: '["Paris", "Lyon"]'
  ADD COLUMN IF NOT EXISTS scrape_mode TEXT DEFAULT 'keyword',
  -- scrape_mode: 'followers' | 'similar' | 'keyword'
  ADD COLUMN IF NOT EXISTS potential_score_base FLOAT DEFAULT 3.0,
  -- Base score before learning adjustments
  ADD COLUMN IF NOT EXISTS learning_score_weight FLOAT DEFAULT 1.0;
  -- Multiplier applied from prospection_scoring_weights

-- 2. Prospection learnings table — log every outcome
CREATE TABLE IF NOT EXISTS prospection_learnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
  niche TEXT NOT NULL,
  geo_country TEXT,
  follower_range TEXT NOT NULL,
  -- 'micro' (1K-12K) | 'mid' (12K-120K) | 'macro' (120K+)
  platform_status TEXT NOT NULL,
  -- 'not_on_platform' | 'aggregator_detected' | 'already_on_platform'
  outcome TEXT NOT NULL,
  -- 'signed' | 'rejected' | 'no_response'
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE prospection_learnings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Learning by agency" ON prospection_learnings;
CREATE POLICY "Learning by agency" ON prospection_learnings
  FOR ALL USING (
    agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS prospection_learnings_agency_idx ON prospection_learnings(agency_id);
CREATE INDEX IF NOT EXISTS prospection_learnings_outcome_idx ON prospection_learnings(outcome);

-- 3. Prospection scoring weights table — compute success rates by segment
CREATE TABLE IF NOT EXISTS prospection_scoring_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  niche TEXT NOT NULL,
  geo_country TEXT,
  follower_range TEXT NOT NULL,
  platform_status TEXT NOT NULL,
  
  signed_count INT DEFAULT 0,
  rejected_count INT DEFAULT 0,
  no_response_count INT DEFAULT 0,
  
  success_rate FLOAT DEFAULT 0.5,
  -- (signed_count / total) — used as multiplier
  
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(agency_id, niche, geo_country, follower_range, platform_status)
);

ALTER TABLE prospection_scoring_weights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Weights by agency" ON prospection_scoring_weights;
CREATE POLICY "Weights by agency" ON prospection_scoring_weights
  FOR ALL USING (
    agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS prospection_weights_agency_idx ON prospection_scoring_weights(agency_id);

-- 4. Function to upsert learning and recalculate weights
CREATE OR REPLACE FUNCTION upsert_learning_and_recalculate(
  p_agency_id UUID,
  p_prospect_id UUID,
  p_niche TEXT,
  p_geo_country TEXT,
  p_follower_range TEXT,
  p_platform_status TEXT,
  p_outcome TEXT
)
RETURNS TABLE (
  success_rate_output FLOAT
) LANGUAGE plpgsql AS $$
DECLARE
  v_total_count INT;
  v_signed_count INT;
  v_rate FLOAT;
BEGIN
  -- 1. Insert into prospection_learnings
  INSERT INTO prospection_learnings (
    agency_id, prospect_id, niche, geo_country, follower_range,
    platform_status, outcome
  ) VALUES (
    p_agency_id, p_prospect_id, p_niche, p_geo_country, p_follower_range,
    p_platform_status, p_outcome
  );

  -- 2. Count outcomes for this segment
  SELECT
    COUNT(*) INTO v_total_count
  FROM prospection_learnings
  WHERE
    agency_id = p_agency_id
    AND niche = p_niche
    AND (geo_country IS NULL OR geo_country = p_geo_country)
    AND follower_range = p_follower_range
    AND platform_status = p_platform_status;

  SELECT
    COUNT(*) INTO v_signed_count
  FROM prospection_learnings
  WHERE
    agency_id = p_agency_id
    AND niche = p_niche
    AND (geo_country IS NULL OR geo_country = p_geo_country)
    AND follower_range = p_follower_range
    AND platform_status = p_platform_status
    AND outcome = 'signed';

  -- 3. Calculate success rate
  v_rate := CASE
    WHEN v_total_count = 0 THEN 0.5
    ELSE CAST(v_signed_count AS FLOAT) / v_total_count
  END;

  -- 4. Upsert into prospection_scoring_weights
  INSERT INTO prospection_scoring_weights (
    agency_id, niche, geo_country, follower_range, platform_status,
    signed_count, rejected_count, no_response_count, success_rate
  ) VALUES (
    p_agency_id, p_niche, p_geo_country, p_follower_range, p_platform_status,
    v_signed_count,
    (SELECT COUNT(*) FROM prospection_learnings WHERE agency_id = p_agency_id AND niche = p_niche AND (geo_country IS NULL OR geo_country = p_geo_country) AND follower_range = p_follower_range AND platform_status = p_platform_status AND outcome = 'rejected'),
    (SELECT COUNT(*) FROM prospection_learnings WHERE agency_id = p_agency_id AND niche = p_niche AND (geo_country IS NULL OR geo_country = p_geo_country) AND follower_range = p_follower_range AND platform_status = p_platform_status AND outcome = 'no_response'),
    v_rate
  )
  ON CONFLICT (agency_id, niche, geo_country, follower_range, platform_status)
  DO UPDATE SET
    signed_count = v_signed_count,
    rejected_count = EXCLUDED.rejected_count,
    no_response_count = EXCLUDED.no_response_count,
    success_rate = v_rate,
    updated_at = now();

  RETURN QUERY SELECT v_rate;
END;
$$;
