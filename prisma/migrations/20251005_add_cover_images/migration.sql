-- Add cover image fields to posts table
ALTER TABLE posts 
ADD COLUMN cover_image_path TEXT,
ADD COLUMN cover_image_url TEXT;

-- Add index for potential future queries filtering by cover images
CREATE INDEX idx_posts_cover_image ON posts(cover_image_path) WHERE cover_image_path IS NOT NULL;

