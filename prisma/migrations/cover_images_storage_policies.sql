-- ============================================================================
-- COVER IMAGES STORAGE BUCKET & POLICIES
-- ============================================================================
-- Run this in your Supabase SQL Editor to set up cover image storage
-- ============================================================================

-- Create the cover-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cover-images',
  'cover-images',
  true,
  3145728, -- 3 MB in bytes
  ARRAY['image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 3145728,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg'];

-- ============================================================================
-- STORAGE OBJECT POLICIES FOR COVER IMAGES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public cover images are accessible to everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own cover images" ON storage.objects;

-- Policy 1: Public read access to cover images
CREATE POLICY "Public cover images are accessible to everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'cover-images');

-- Policy 2: Authenticated upload
CREATE POLICY "Authenticated users can upload cover images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cover-images'
  AND auth.role() = 'authenticated'
);

-- Policy 3: Owner can update
CREATE POLICY "Users can update their own cover images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cover-images'
  AND owner::uuid = (auth.uid())
);

-- Policy 4: Owner can delete
CREATE POLICY "Users can delete their own cover images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cover-images'
  AND owner::uuid = (auth.uid())
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%cover%'
ORDER BY policyname;

-- Check bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'cover-images';

-- Done!
SELECT '✅ Cover images storage bucket and policies created successfully!' as status;

