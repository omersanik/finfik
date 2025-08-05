-- Update thumbnail_url column to store bucket paths
-- This will change from storing full URLs to storing paths like "courseName/thumbnail.jpg"

-- First, let's see the current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name = 'thumbnail_url';

-- Update existing thumbnail_url values to use bucket paths
-- Example: if current value is "https://example.com/thumbnail.jpg"
-- Change to: "courseName/thumbnail.jpg"

-- You can run this manually for each course, or create a migration script
-- UPDATE courses 
-- SET thumbnail_url = CONCAT(slug, '/', SUBSTRING(thumbnail_url FROM '([^/]+)$'))
-- WHERE thumbnail_url LIKE 'http%';

-- Add a comment to document the new format
COMMENT ON COLUMN courses.thumbnail_url IS 'Path to thumbnail in Supabase storage bucket (format: courseName/filename.jpg)'; 