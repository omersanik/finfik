-- Fix image paths that have leading slashes
-- Update all image_url values that start with '/' to remove the leading slash

UPDATE content_item 
SET image_url = TRIM(LEADING '/' FROM image_url)
WHERE image_url LIKE '/%';

-- Verify the fix
SELECT id, image_url, type 
FROM content_item 
WHERE image_url LIKE 'Finance Lingo 101%'
ORDER BY image_url; 