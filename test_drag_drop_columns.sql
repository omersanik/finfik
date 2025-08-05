-- Test if drag-drop columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'content_item' 
AND column_name LIKE 'drag_drop%'
ORDER BY column_name;

-- If no results, the columns don't exist and need to be added 