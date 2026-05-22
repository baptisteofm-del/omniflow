CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  action TEXT NOT NULL,        -- 'integration.connected', 'ai.generated', 'login', etc.
  resource TEXT,               -- 'onlyfans', 'mym', etc.
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_agency ON audit_log(agency_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_action ON audit_log(action);
-- Pas de RLS sur audit_log — admin only
