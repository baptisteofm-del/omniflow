-- ================================
-- Chatting Config — List Config + Fan Notes
-- ================================

-- Config par liste (OF/MYM) par agence
CREATE TABLE IF NOT EXISTS chatting_list_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('onlyfans', 'mym')),
  personality_type TEXT DEFAULT 'gfe',
  ppv_frequency TEXT DEFAULT 'moderate' CHECK (ppv_frequency IN ('never', 'low', 'moderate', 'high', 'always')),
  -- never = jamais auto | low = 1/10 msgs | moderate = 1/5 | high = 1/3 | always = dès que possible
  ppv_price_min INT DEFAULT 5,
  ppv_price_max INT DEFAULT 30,
  relational_mode BOOLEAN DEFAULT true,
  -- si true : l'IA détecte les moments émotionnels et ne pousse pas de PPV
  tone_notes TEXT DEFAULT '',
  -- instructions libres de l'agence : "toujours finir par une question", "utiliser des emojis coeur", etc.
  response_delay_seconds INT DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agency_id, platform)
);

ALTER TABLE chatting_list_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "List config by agency" ON chatting_list_config;
CREATE POLICY "List config by agency" ON chatting_list_config
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- Notes par fan
CREATE TABLE IF NOT EXISTS fan_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  fan_profile_id UUID REFERENCES fan_profiles(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'preferences', 'spending', 'avoid', 'custom')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fan_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Fan notes by agency" ON fan_notes;
CREATE POLICY "Fan notes by agency" ON fan_notes
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

CREATE INDEX IF NOT EXISTS fan_notes_fan_profile ON fan_notes(fan_profile_id);
CREATE INDEX IF NOT EXISTS fan_notes_agency ON fan_notes(agency_id);
CREATE INDEX IF NOT EXISTS fan_notes_created_at ON fan_notes(created_at DESC);
