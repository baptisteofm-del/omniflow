-- Migration: Add author and content type fields to trends table
-- Created: 2026-05-22
-- Purpose: Support creator information and content type classification

-- Add new columns to trends table
ALTER TABLE trends
ADD COLUMN IF NOT EXISTS author_username text,
ADD COLUMN IF NOT EXISTS author_url text,
ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'video' CHECK (content_type IN ('video', 'photo', 'text', 'reel', 'carousel'));

-- Create index for faster filtering by content_type
CREATE INDEX IF NOT EXISTS idx_trends_content_type ON trends(content_type);

-- Create index for faster filtering by author
CREATE INDEX IF NOT EXISTS idx_trends_author ON trends(author_username);

-- Create index for combined agency + platform + content_type queries
CREATE INDEX IF NOT EXISTS idx_trends_agency_platform_type ON trends(agency_id, platform, content_type);

-- Add comment for documentation
COMMENT ON COLUMN trends.author_username IS 'Username of the content creator on the platform';
COMMENT ON COLUMN trends.author_url IS 'Direct URL to creator profile on the platform';
COMMENT ON COLUMN trends.content_type IS 'Type of content: video, photo, text, reel, or carousel';
