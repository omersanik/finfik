-- Find content items that start with "On auction"
SELECT 
    id,
    content_text,
    type,
    created_at
FROM content_item 
WHERE content_text ILIKE 'On auction%'
ORDER BY created_at DESC;

-- Alternative: Search in any text field that might contain "On auction"
SELECT 
    id,
    content_text,
    drag_drop_title,
    drag_drop_instructions,
    drag_drop_items,
    type,
    created_at
FROM content_item 
WHERE 
    content_text ILIKE '%On auction%' OR
    drag_drop_title ILIKE '%On auction%' OR
    drag_drop_instructions ILIKE '%On auction%' OR
    drag_drop_items ILIKE '%On auction%'
ORDER BY created_at DESC;
