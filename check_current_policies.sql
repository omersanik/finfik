-- Check current RLS policies on problematic tables
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('user_streaks', 'users', 'course_path_section_progress') 
ORDER BY tablename, policyname;

-- Also check if RLS is enabled on these tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_streaks', 'users', 'course_path_section_progress');
