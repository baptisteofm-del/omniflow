-- ═══════════════════════════════════════════════════════════════
-- TRENDS V2 — Nouvelles colonnes + correction content_type
-- À exécuter dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Créer la table trends si elle n'existe pas encore
CREATE TABLE IF NOT EXISTS trends (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id       UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  platform        TEXT NOT NULL DEFAULT 'instagram',
  title           TEXT NOT NULL,
  url             TEXT NOT NULL,
  thumbnail_url   TEXT,
  author_username TEXT,
  author_url      TEXT,
  content_type    TEXT NOT NULL DEFAULT 'reel',
  engagement      BIGINT DEFAULT 0,
  category        TEXT DEFAULT 'lifestyle',
  tags            TEXT[] DEFAULT '{}',
  captured_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Nouvelles colonnes V2
ALTER TABLE trends
  ADD COLUMN IF NOT EXISTS video_url   TEXT,         -- URL directe de la vidéo (depuis Apify)
  ADD COLUMN IF NOT EXISTS likes       BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS post_date   TEXT,          -- Date du post original Instagram
  ADD COLUMN IF NOT EXISTS viral_score INT DEFAULT 0; -- Score de viralité calculé (0-100)

-- Corriger les content_type 'photo' → 'reel' (toutes les tendances Instagram sont des Reels)
UPDATE trends SET content_type = 'reel' WHERE content_type = 'photo';

-- Contrainte pour forcer les types valides
ALTER TABLE trends DROP CONSTRAINT IF EXISTS trends_content_type_check;
ALTER TABLE trends ADD CONSTRAINT trends_content_type_check
  CHECK (content_type IN ('reel', 'video', 'carousel'));

-- Calculer viral_score pour les entrées existantes
UPDATE trends SET viral_score = CASE
  WHEN engagement >= 10000000 THEN 100
  WHEN engagement >= 5000000  THEN 90
  WHEN engagement >= 1000000  THEN 75
  WHEN engagement >= 500000   THEN 60
  WHEN engagement >= 100000   THEN 45
  WHEN engagement >= 10000    THEN 30
  ELSE 15
END;

-- Créer la table trend_runs si absente
CREATE TABLE IF NOT EXISTS trend_runs (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id     UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  trends_count  INT DEFAULT 0,
  platform      TEXT DEFAULT 'instagram',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table trend_feedback si absente
CREATE TABLE IF NOT EXISTS trend_feedback (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id   UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  trend_id    TEXT NOT NULL,
  feedback    TEXT NOT NULL CHECK (feedback IN ('like', 'dislike')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, trend_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_trends_agency        ON trends(agency_id);
CREATE INDEX IF NOT EXISTS idx_trends_platform      ON trends(platform);
CREATE INDEX IF NOT EXISTS idx_trends_captured_at   ON trends(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_trends_engagement    ON trends(engagement DESC);
CREATE INDEX IF NOT EXISTS idx_trends_content_type  ON trends(content_type);
CREATE INDEX IF NOT EXISTS idx_trend_runs_agency    ON trend_runs(agency_id);
CREATE INDEX IF NOT EXISTS idx_trend_feedback_agency ON trend_feedback(agency_id);

-- RLS
ALTER TABLE trends         ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_runs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trends_agency_policy ON trends;
CREATE POLICY trends_agency_policy ON trends
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
      UNION
      SELECT agency_id FROM team_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS trend_runs_agency_policy ON trend_runs;
CREATE POLICY trend_runs_agency_policy ON trend_runs
  USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS trend_feedback_agency_policy ON trend_feedback;
CREATE POLICY trend_feedback_agency_policy ON trend_feedback
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));
