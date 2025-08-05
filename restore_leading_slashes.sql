-- Restore leading slashes to image paths that should have them
-- This will fix the paths that were incorrectly modified

UPDATE content_item 
SET image_url = '/' || image_url
WHERE image_url LIKE 'Finance Lingo 101%' 
AND image_url NOT LIKE '/%';

-- Verify the fix
SELECT id, image_url, type 
FROM content_item 
WHERE image_url LIKE '%Finance Lingo 101%'
ORDER BY image_url; 