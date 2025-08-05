-- Update the content_item_type_check constraint to allow 'table' type
-- First, drop the existing constraint (this will work even if it doesn't exist)
ALTER TABLE content_item DROP CONSTRAINT IF EXISTS content_item_type_check;

-- Then add the new constraint with all allowed types including 'table'
ALTER TABLE content_item ADD CONSTRAINT content_item_type_check 
CHECK (type IN ('text', 'image', 'quiz', 'animation', 'calculator', 'math', 'chart', 'table'));

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'content_item_type_check'; 