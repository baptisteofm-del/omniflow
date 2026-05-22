-- ================================
-- Migration: Add Model Photo and Integration Fields
-- Adds avatar support and integration linking to models
-- ================================

-- Add new columns to models table
ALTER TABLE models
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS linked_integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS linked_platform TEXT; -- 'onlyfans' | 'mym'

-- Create index for faster integration lookups
CREATE INDEX IF NOT EXISTS models_linked_integration_id_idx ON models(linked_integration_id);
CREATE INDEX IF NOT EXISTS models_linked_platform_idx ON models(linked_platform);

-- Add comment for clarity
COMMENT ON COLUMN models.avatar_url IS 'URL to model profile photo/avatar stored in Supabase Storage';
COMMENT ON COLUMN models.bio IS 'Short bio or description for the model';
COMMENT ON COLUMN models.linked_integration_id IS 'Reference to the specific OnlyFans/MYM integration account this model is linked to';
COMMENT ON COLUMN models.linked_platform IS 'The platform type of the linked integration (onlyfans or mym)';
