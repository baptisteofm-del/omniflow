-- OmniFlow — Usage Tracking Migration
-- Run in Supabase SQL Editor

-- Add plan_id to agencies if not exists
ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'starter';

-- AI generations tracking table
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'kling' | 'chatting' | 'outreach' | 'other'
  model TEXT,
  cost_cents INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_generations_agency" ON ai_generations;
CREATE POLICY "ai_generations_agency" ON ai_generations
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

CREATE INDEX IF NOT EXISTS ai_generations_agency_month ON ai_generations(agency_id, created_at);

-- Telegram bots table (if not exists)
CREATE TABLE IF NOT EXISTS telegram_bots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  token TEXT,
  channel_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE telegram_bots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "telegram_bots_agency" ON telegram_bots;
CREATE POLICY "telegram_bots_agency" ON telegram_bots
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));
