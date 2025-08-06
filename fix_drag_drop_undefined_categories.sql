-- Identify and report drag drop items that have "undefined" as their category
-- This script helps you find and manually fix items with undefined categories

-- First, let's see what drag drop items currently exist
SELECT 
    id, 
    drag_drop_title,
    drag_drop_items,
    drag_drop_categories,
    CASE 
        WHEN drag_drop_items LIKE '%→ undefined%' THEN 'HAS UNDEFINED CATEGORIES'
        ELSE 'OK'
    END as status
FROM content_item 
WHERE type = 'drag-drop' AND drag_drop_items IS NOT NULL
ORDER BY status DESC, id;

-- Show only items that have undefined categories (need manual fixing)
SELECT 
    id,
    drag_drop_title as title,
    drag_drop_items as items_with_undefined
FROM content_item 
WHERE type = 'drag-drop' 
AND drag_drop_items LIKE '%→ undefined%';

-- MANUAL FIX REQUIRED:
-- The above query shows items that need to be fixed manually.
-- You need to update each item to replace "→ undefined" with the correct category.
-- 
-- Example fix (replace with your actual categories):
-- UPDATE content_item 
-- SET drag_drop_items = REPLACE(drag_drop_items, '→ undefined', '→ YourCorrectCategory')
-- WHERE id = [specific_id];
--
-- Make sure to also update drag_drop_categories to include the new category if needed.