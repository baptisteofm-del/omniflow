-- ================================
-- CHATTING AI — Feedback System
-- ================================
-- Allows agencies to correct AI responses and learn from them

CREATE TABLE IF NOT EXISTS chatting_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  message_id UUID REFERENCES ai_messages(id) ON DELETE CASCADE,
  model_id UUID,
  action TEXT NOT NULL CHECK (action IN ('validate', 'correct', 'reject')),
  original_message TEXT NOT NULL,
  corrected_message TEXT,
  reason TEXT,
  fan_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE chatting_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Agencies can only see their own feedback
CREATE POLICY "Feedback by agency" ON chatting_feedback
  FOR ALL USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS chatting_feedback_agency_model ON chatting_feedback(agency_id, model_id);
CREATE INDEX IF NOT EXISTS chatting_feedback_action ON chatting_feedback(action);
CREATE INDEX IF NOT EXISTS chatting_feedback_created ON chatting_feedback(created_at DESC);
