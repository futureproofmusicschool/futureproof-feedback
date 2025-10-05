-- ============================================================================
-- STORAGE BUCKET RLS POLICIES
-- ============================================================================
-- Run this in your Supabase SQL Editor to secure the audio-tracks bucket
-- Dashboard: https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- First, ensure the bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-tracks',
  'audio-tracks',
  true,
  52428800, -- 50 MB in bytes (for 10-minute audio files)
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];

-- ============================================================================
-- STORAGE OBJECT POLICIES
-- ============================================================================

-- Policy 1: Public read access to audio files
-- Anyone can view/download audio files (needed for signed URLs)
CREATE POLICY "Public audio files are accessible to everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-tracks');

-- Policy 2: Authenticated upload
-- Only authenticated users can upload audio files
CREATE POLICY "Authenticated users can upload audio files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio-tracks'
  AND auth.role() = 'authenticated'
);

-- Policy 3: Owner can update
-- Users can only update their own files (based on owner column)
CREATE POLICY "Users can update their own audio files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'audio-tracks'
  AND auth.uid()::text = owner
);

-- Policy 4: Owner can delete
-- Users can only delete their own files
CREATE POLICY "Users can delete their own audio files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio-tracks'
  AND auth.uid()::text = owner
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- Check bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'audio-tracks';

-- Done!
SELECT '✅ Storage RLS policies applied successfully!' as status;

