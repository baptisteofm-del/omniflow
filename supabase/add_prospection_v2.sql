-- ─────────────────────────────────────────────────────────────────────────────
-- OmniFlow — Prospection v2 Migration
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend the existing prospects table with new fields
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS profile_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',  -- 'scraper' | 'n8n' | 'csv' | 'manual'
  ADD COLUMN IF NOT EXISTS outreach_count INT DEFAULT 0;

-- Unique constraint to avoid duplicate prospects per agency per platform
ALTER TABLE prospects
  DROP CONSTRAINT IF EXISTS prospects_agency_username_platform_key;
ALTER TABLE prospects
  ADD CONSTRAINT prospects_agency_username_platform_key
  UNIQUE (agency_id, username, platform);

-- 2. Outreach messages table
CREATE TABLE IF NOT EXISTS outreach_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id       UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  prospect_id     UUID REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  message         TEXT NOT NULL,
  platform        TEXT NOT NULL,
  ai_generated    BOOLEAN DEFAULT true,
  status          TEXT DEFAULT 'pending',
  -- status: pending | sent | replied | no_response | signed | rejected
  sent_at         TIMESTAMPTZ,
  replied_at      TIMESTAMPTZ,
  reply_content   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Outreach by agency" ON outreach_messages;
CREATE POLICY "Outreach by agency" ON outreach_messages
  FOR ALL USING (
    agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
  );

-- Index
CREATE INDEX IF NOT EXISTS outreach_messages_agency_id_idx ON outreach_messages(agency_id);
CREATE INDEX IF NOT EXISTS outreach_messages_prospect_id_idx ON outreach_messages(prospect_id);
CREATE INDEX IF NOT EXISTS outreach_messages_status_idx ON outreach_messages(status);

-- 3. Auto-update outreach_count on prospect when a message is inserted
CREATE OR REPLACE FUNCTION increment_outreach_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE prospects SET outreach_count = outreach_count + 1 WHERE id = NEW.prospect_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_outreach_insert ON outreach_messages;
CREATE TRIGGER on_outreach_insert
  AFTER INSERT ON outreach_messages
  FOR EACH ROW EXECUTE FUNCTION increment_outreach_count();
