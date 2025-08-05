-- First, let's see what the current constraint looks like
-- This will show us the existing allowed types
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'content_item'::regclass 
AND contype = 'c' 
AND conname LIKE '%type%';

-- Drop the existing check constraint (we'll need to recreate it)
-- Note: You may need to replace 'content_item_type_check' with the actual constraint name from above
ALTER TABLE content_item DROP CONSTRAINT IF EXISTS content_item_type_check;

-- Add the new check constraint that includes 'drag-drop'
ALTER TABLE content_item 
ADD CONSTRAINT content_item_type_check 
CHECK (type IN ('text', 'image', 'quiz', 'animation', 'calculator', 'math', 'chart', 'table', 'drag-drop')); 