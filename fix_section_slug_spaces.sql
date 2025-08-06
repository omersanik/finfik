-- Fix section slugs that have leading or trailing spaces
-- This will trim any whitespace from the slug field in course_path_sections table

UPDATE course_path_sections 
SET slug = TRIM(slug)
WHERE slug != TRIM(slug);

-- Verify the fix by showing sections with their slugs
SELECT id, title, slug, LENGTH(slug) as slug_length
FROM course_path_sections 
WHERE title LIKE '%investing%' OR slug LIKE '%investing%'
ORDER BY title;

-- Show all sections to verify no other slugs have spaces
SELECT id, title, slug, LENGTH(slug) as slug_length
FROM course_path_sections 
ORDER BY title; 