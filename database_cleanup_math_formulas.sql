-- Clean up existing math content items
-- This script will move math formulas from content_text to math_formula
-- and clear content_text for math items to prevent duplicate rendering

-- First, let's see what math items we have
SELECT id, type, content_text, math_formula 
FROM content_item 
WHERE type = 'math';

-- Update math items that have formulas in content_text
UPDATE content_item 
SET 
  math_formula = CASE 
    WHEN content_text LIKE '%data-formula="%' THEN 
      SUBSTRING(
        content_text, 
        POSITION('data-formula="' IN content_text) + 14,
        POSITION('"' IN SUBSTRING(content_text, POSITION('data-formula="' IN content_text) + 14)) - 1
      )
    ELSE math_formula
  END,
  content_text = NULL
WHERE type = 'math' 
  AND content_text LIKE '%data-formula="%';

-- Also handle any math items that might have the formula directly in content_text
UPDATE content_item 
SET 
  math_formula = content_text,
  content_text = NULL
WHERE type = 'math' 
  AND content_text IS NOT NULL 
  AND content_text NOT LIKE '%data-formula="%'
  AND content_text NOT LIKE '%<span%'
  AND content_text NOT LIKE '%</span%'
  AND content_text NOT LIKE '%<p>%'
  AND content_text NOT LIKE '%</p>%';

-- Verify the changes
SELECT id, type, content_text, math_formula 
FROM content_item 
WHERE type = 'math'; 