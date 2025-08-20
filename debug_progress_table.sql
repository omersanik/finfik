-- Check the structure of course_path_section_progress table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'course_path_section_progress' 
ORDER BY ordinal_position;

-- Check if there are any existing records
SELECT COUNT(*) as total_records FROM course_path_section_progress;

-- Check the first few records to see the data structure
SELECT * FROM course_path_section_progress LIMIT 3;
