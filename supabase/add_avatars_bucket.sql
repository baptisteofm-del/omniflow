-- ================================
-- Migration: Create avatars storage bucket
-- Required for model profile picture uploads
-- ================================

-- Create avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: anyone can read avatars (public bucket)
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy: authenticated users can upload avatars
CREATE POLICY "Authenticated upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Policy: authenticated users can update (overwrite) their avatars
CREATE POLICY "Authenticated update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

-- Policy: authenticated users can delete their avatars
CREATE POLICY "Authenticated delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');
