-- ================================
-- Migration: Update Models Table
-- Add separate chatting_platforms and social_networks columns
-- ================================

-- Add new columns if they don't exist
ALTER TABLE models
ADD COLUMN IF NOT EXISTS chatting_platforms text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_networks text[] DEFAULT '{}';

-- Migrate existing platform data (if needed)
-- Legacy models with single 'platform' field will need manual migration
-- For OnlyFans/MYM models: they go to chatting_platforms
-- For Instagram/TikTok/Telegram/Twitter/Reddit: they go to social_networks

-- This is a non-destructive migration - old 'platform' column remains for now
-- Will be deprecated in future versions

-- Valid values reference:
-- chatting_platforms: 'onlyfans', 'mym'
-- social_networks: 'instagram', 'tiktok', 'telegram', 'twitter', 'reddit'
-- (Snapchat and YouTube reserved for future implementation)

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS models_chatting_platforms_idx ON models USING GIN(chatting_platforms);
CREATE INDEX IF NOT EXISTS models_social_networks_idx ON models USING GIN(social_networks);

-- Add comment for clarity
COMMENT ON COLUMN models.chatting_platforms IS 'Array of chatting platforms (onlyfans, mym) where AI handles fan messages';
COMMENT ON COLUMN models.social_networks IS 'Array of social networks (instagram, tiktok, telegram, twitter, reddit) where content is posted via AdsPower/GeeLark/Reddit API';
