-- Fix drag drop items with undefined categories

-- First, let's see what we're working with
SELECT 
    id,
    drag_drop_items,
    drag_drop_categories
FROM content_item 
WHERE type = 'drag-drop' 
AND drag_drop_items LIKE '%undefined%';

-- Fix the first item (Rental property example)
UPDATE content_item 
SET 
    drag_drop_items = 'Rental property you own → Asset
Your Netflix subscription → Liability
Designer handbag → Liability'
WHERE id = 'e026f3ed-ee99-42a1-93c5-542516b022fa';

-- Fix the third item (scam detection example)
UPDATE content_item 
SET 
    drag_drop_items = 'https:// in the URL → Trusted store
90% discount + countdown timer → Potential scam
No customer support phone → Potential scam
Registered domain since 2018 → Trusted store
Payment options: PayPal & credit card → Trusted store
Asking for payment via crypto → Potential scam'
WHERE id = '70a32cba-1122-4e44-a5a5-d23cdef588ad';

-- Verify the fixes
SELECT 
    id,
    drag_drop_items,
    drag_drop_categories
FROM content_item 
WHERE type = 'drag-drop';
