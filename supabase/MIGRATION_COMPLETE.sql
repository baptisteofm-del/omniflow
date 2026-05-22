-- ============================================================
-- OMNIFLOW — MIGRATION COMPLÈTE
-- Exécuter dans Supabase SQL Editor en une seule fois
-- ============================================================

-- 1. AGENCES — colonnes manquantes
ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- 2. MODÈLES — colonnes manquantes
ALTER TABLE models
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS chatting_platforms TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS social_networks TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS linked_integration_id UUID,
  ADD COLUMN IF NOT EXISTS linked_platform TEXT;

-- 3. INTÉGRATIONS — model_id pour OF/MYM par modèle
ALTER TABLE agency_integrations
  ADD COLUMN IF NOT EXISTS model_id UUID;

-- 4. MODEL PERSONALITIES
CREATE TABLE IF NOT EXISTS model_personalities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL,
  agency_id UUID NOT NULL,
  display_name TEXT,
  personality_type TEXT DEFAULT 'gfe',
  communication_style TEXT DEFAULT '',
  example_messages TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{"fr"}',
  topics_to_avoid TEXT[] DEFAULT '{}',
  ppv_price_range TEXT DEFAULT '',
  tips_strategy TEXT DEFAULT '',
  auto_mode BOOLEAN DEFAULT false,
  response_delay_seconds INT DEFAULT 60,
  schedule_enabled BOOLEAN DEFAULT false,
  schedule JSONB DEFAULT '{"timezone":"Europe/Paris","slots":[]}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(model_id)
);
ALTER TABLE model_personalities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Personalities by agency" ON model_personalities;
CREATE POLICY "Personalities by agency" ON model_personalities
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- 5. CHATTING FEEDBACK
CREATE TABLE IF NOT EXISTS chatting_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL,
  message_id UUID,
  model_id UUID,
  action TEXT NOT NULL CHECK (action IN ('validate', 'correct', 'reject')),
  original_message TEXT NOT NULL,
  corrected_message TEXT,
  reason TEXT,
  fan_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE chatting_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Feedback by agency" ON chatting_feedback;
CREATE POLICY "Feedback by agency" ON chatting_feedback
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));
CREATE INDEX IF NOT EXISTS chatting_feedback_agency_model ON chatting_feedback(agency_id, model_id);

-- 6. CHATTING LIST CONFIG (config OF/MYM par agence)
CREATE TABLE IF NOT EXISTS chatting_list_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('onlyfans', 'mym')),
  personality_type TEXT DEFAULT 'gfe',
  ppv_frequency TEXT DEFAULT 'moderate',
  ppv_price_min INT DEFAULT 5,
  ppv_price_max INT DEFAULT 30,
  relational_mode BOOLEAN DEFAULT true,
  tone_notes TEXT DEFAULT '',
  response_delay_seconds INT DEFAULT 60,
  is_active BOOLEAN DEFAULT false,
  UNIQUE(agency_id, platform)
);
ALTER TABLE chatting_list_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "List config by agency" ON chatting_list_config;
CREATE POLICY "List config by agency" ON chatting_list_config
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- 7. FAN NOTES (CRM)
CREATE TABLE IF NOT EXISTS fan_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL,
  fan_profile_id UUID,
  note TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE fan_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Fan notes by agency" ON fan_notes;
CREATE POLICY "Fan notes by agency" ON fan_notes
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- 8. PROSPECTION LEARNING
CREATE TABLE IF NOT EXISTS prospection_learnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL,
  prospect_id UUID,
  niche TEXT NOT NULL,
  geo_country TEXT,
  follower_range TEXT NOT NULL,
  platform_status TEXT NOT NULL,
  outcome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE prospection_learnings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Learning by agency" ON prospection_learnings;
CREATE POLICY "Learning by agency" ON prospection_learnings
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

CREATE TABLE IF NOT EXISTS prospection_scoring_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL,
  niche TEXT NOT NULL,
  geo_country TEXT,
  follower_range TEXT NOT NULL,
  platform_status TEXT NOT NULL,
  signed_count INT DEFAULT 0,
  rejected_count INT DEFAULT 0,
  no_response_count INT DEFAULT 0,
  success_rate FLOAT DEFAULT 0.5,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agency_id, niche, geo_country, follower_range, platform_status)
);
ALTER TABLE prospection_scoring_weights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Weights by agency" ON prospection_scoring_weights;
CREATE POLICY "Weights by agency" ON prospection_scoring_weights
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- 9. TUTORIAL PROGRESS
CREATE TABLE IF NOT EXISTS tutorial_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL,
  tutorial_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agency_id, tutorial_id)
);
ALTER TABLE tutorial_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tutorial progress by agency" ON tutorial_progress;
CREATE POLICY "Tutorial progress by agency" ON tutorial_progress
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notifications by agency" ON notifications;
CREATE POLICY "Notifications by agency" ON notifications
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- 11. TEAM
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL,
  user_id UUID,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agency_id, email)
);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team by agency" ON team_members;
CREATE POLICY "Team by agency" ON team_members
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- 12. AI GENERATIONS (usage tracking)
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL,
  type TEXT NOT NULL,
  model TEXT,
  cost_cents INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "AI generations by agency" ON ai_generations;
CREATE POLICY "AI generations by agency" ON ai_generations
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- 13. AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID,
  action TEXT NOT NULL,
  resource TEXT,
  ip_address TEXT,
  success BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_agency ON audit_log(agency_id, created_at DESC);

-- 14. TRENDS — colonnes manquantes
ALTER TABLE trends
  ADD COLUMN IF NOT EXISTS author_username TEXT,
  ADD COLUMN IF NOT EXISTS author_url TEXT,
  ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'video';

-- 15. PROSPECTS — colonnes manquantes
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS profile_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS outreach_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_status TEXT DEFAULT 'not_on_platform',
  ADD COLUMN IF NOT EXISTS geo_country TEXT,
  ADD COLUMN IF NOT EXISTS scrape_mode TEXT DEFAULT 'keyword';

-- 16. OUTREACH MESSAGES
CREATE TABLE IF NOT EXISTS outreach_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL,
  prospect_id UUID,
  message TEXT NOT NULL,
  platform TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  reply_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Outreach by agency" ON outreach_messages;
CREATE POLICY "Outreach by agency" ON outreach_messages
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- 17. METTRE SON AGENCE EN PLAN AGENCY (pour les tests)
-- Décommenter la ligne ci-dessous si vous êtes le propriétaire :
-- UPDATE agencies SET plan_id = 'agency' WHERE id IN ('3edbb4f6-107b-4ba7-889d-7999b40ba238','a9a90a5a-9378-4791-8bbd-821fe317f866');

-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================
