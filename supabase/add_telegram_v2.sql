-- ═══════════════════════════════════════════════════════════════
-- TELEGRAM CHANNELS V2 — Nouvelles colonnes
-- À exécuter dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Création de la table si elle n'existe pas encore
CREATE TABLE IF NOT EXISTS telegram_channels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  channel_username text NOT NULL,
  channel_name text,
  model_id uuid REFERENCES models(id) ON DELETE SET NULL,
  posts_per_day int DEFAULT 3,
  content_type text DEFAULT 'text_image',
  post_times text[] DEFAULT ARRAY['09:00', '15:00', '21:00'],
  automation_level text DEFAULT 'semi' CHECK (automation_level IN ('semi', 'auto')),
  is_active boolean DEFAULT true,
  total_posts int DEFAULT 0,
  last_post_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Nouvelles colonnes V2
ALTER TABLE telegram_channels
  ADD COLUMN IF NOT EXISTS post_schedule    jsonb,            -- planning individuel [{time, content_type}]
  ADD COLUMN IF NOT EXISTS media_source     text DEFAULT 'model'
    CHECK (media_source IN ('model', 'global', 'combined')),  -- source des médias
  ADD COLUMN IF NOT EXISTS ai_style         text DEFAULT 'soft',
  ADD COLUMN IF NOT EXISTS ai_examples      text,             -- exemples de posts (1/ligne)
  ADD COLUMN IF NOT EXISTS ai_auto          boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_personality   text,             -- personnalité libre
  ADD COLUMN IF NOT EXISTS channel_chat_id  text,             -- ID numérique Telegram (-100xxxxx)
  ADD COLUMN IF NOT EXISTS member_count     int DEFAULT 0;

-- Migrer automation_level 'manual' → 'semi' pour les enregistrements existants
UPDATE telegram_channels SET automation_level = 'semi' WHERE automation_level = 'manual';

-- Mettre à jour la contrainte CHECK pour exclure 'manual'
ALTER TABLE telegram_channels DROP CONSTRAINT IF EXISTS telegram_channels_automation_level_check;
ALTER TABLE telegram_channels ADD CONSTRAINT telegram_channels_automation_level_check
  CHECK (automation_level IN ('semi', 'auto'));

-- Index
CREATE INDEX IF NOT EXISTS idx_telegram_channels_agency ON telegram_channels(agency_id);
CREATE INDEX IF NOT EXISTS idx_telegram_channels_model  ON telegram_channels(model_id);
CREATE INDEX IF NOT EXISTS idx_telegram_channels_active ON telegram_channels(agency_id) WHERE is_active = true;

-- RLS
ALTER TABLE telegram_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS telegram_channels_agency_policy ON telegram_channels;
CREATE POLICY telegram_channels_agency_policy ON telegram_channels
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
      UNION
      SELECT agency_id FROM team_members WHERE user_id = auth.uid()
    )
  );
