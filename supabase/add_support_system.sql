-- ─────────────────────────────────────────────────────────────────────────────
-- OmniFlow Support System — Migration
-- Run this in the Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_number   TEXT NOT NULL UNIQUE,
  subject         TEXT NOT NULL,
  description     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'open', 'pending', 'resolved', 'closed')),
  priority        TEXT NOT NULL DEFAULT 'normal'
                    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category        TEXT NOT NULL DEFAULT 'other'
                    CHECK (category IN ('technical', 'billing', 'account', 'other')),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agency_id       UUID REFERENCES agencies(id) ON DELETE SET NULL,
  user_email      TEXT,
  screenshot_url  TEXT,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_support_tickets_updated_at();

-- Support messages (conversation history per ticket)
CREATE TABLE IF NOT EXISTS support_messages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id   UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'agent')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_status       ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority     ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id      ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at   ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id   ON support_messages(ticket_id);

-- RLS policies
ALTER TABLE support_tickets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Users can only read their own tickets
DROP POLICY IF EXISTS "users_own_tickets" ON support_tickets;
CREATE POLICY "users_own_tickets" ON support_tickets
  FOR ALL USING (auth.uid() = user_id);

-- Users can read messages from their own tickets
DROP POLICY IF EXISTS "users_own_ticket_messages" ON support_messages;
CREATE POLICY "users_own_ticket_messages" ON support_messages
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM support_tickets WHERE user_id = auth.uid()
    )
  );

-- Service role bypasses RLS (for admin API calls)
-- Already handled by Supabase service role key

-- ─── Useful views ───────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW support_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'new')      AS new_count,
  COUNT(*) FILTER (WHERE status = 'open')     AS open_count,
  COUNT(*) FILTER (WHERE status = 'pending')  AS pending_count,
  COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_count,
  COUNT(*) FILTER (WHERE status = 'closed')   AS closed_count,
  COUNT(*) FILTER (WHERE priority = 'urgent' AND status NOT IN ('resolved', 'closed')) AS urgent_open,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS last_24h,
  ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (
    WHERE resolved_at IS NOT NULL
  ), 1) AS avg_resolution_hours
FROM support_tickets;
