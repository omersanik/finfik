-- Fix the incorrect image path in the content_item table
-- First, let's see what the current value is
SELECT id, image_url, type 
FROM content_item 
WHERE image_url LIKE '%Introduction%' OR image_url LIKE '%Valuation%';

-- Update the incorrect path to the correct one
UPDATE content_item 
SET image_url = 'Finance Lingo 101/finance-lingo-101-s1-c1.png'
WHERE image_url LIKE '%Introduction%' OR image_url LIKE '%Valuation%';

-- Verify the update
SELECT id, image_url, type 
FROM content_item 
WHERE image_url LIKE '%Finance%' OR image_url LIKE '%Lingo%'; 