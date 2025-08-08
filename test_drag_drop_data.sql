-- Test and fix drag drop data issues

-- 1. First, let's see what drag-drop items exist
SELECT 
    id, 
    type, 
    drag_drop_title, 
    drag_drop_instructions, 
    drag_drop_items, 
    drag_drop_categories,
    created_at
FROM content_item 
WHERE type = 'drag-drop'
ORDER BY created_at DESC;

-- 2. Check if there are any items with empty drag_drop data
SELECT 
    id, 
    type, 
    drag_drop_title, 
    drag_drop_instructions, 
    drag_drop_items, 
    drag_drop_categories
FROM content_item 
WHERE type = 'drag-drop' 
AND (
    drag_drop_items IS NULL OR 
    drag_drop_items = '' OR 
    drag_drop_categories IS NULL OR 
    drag_drop_categories = ''
);

-- 3. Example of how to insert a test drag-drop item with proper data
-- (Uncomment and modify as needed)
/*
INSERT INTO content_item (
    block_id,
    type,
    order_index,
    drag_drop_title,
    drag_drop_instructions,
    drag_drop_items,
    drag_drop_categories
) VALUES (
    'your-block-id-here',  -- Replace with actual block_id
    'drag-drop',
    1,
    'Test Drag Drop Activity',
    'Drag the items to their correct categories',
    'Apple → Fruits
Carrot → Vegetables
Chicken → Meat
Bread → Grains',
    'Fruits
Vegetables
Meat
Grains'
);
*/

-- 4. Update existing items that might have empty data
-- (Uncomment and modify as needed)
/*
UPDATE content_item 
SET 
    drag_drop_title = 'Financial Terms Matching',
    drag_drop_instructions = 'Match each financial term with its correct category',
    drag_drop_items = 'Compound Interest → Investment
Budget → Planning
Credit Score → Credit
Diversification → Investment
Emergency Fund → Savings',
    drag_drop_categories = 'Investment
Planning
Credit
Savings'
WHERE type = 'drag-drop' 
AND (drag_drop_items IS NULL OR drag_drop_items = '');
*/
