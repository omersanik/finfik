-- Verify that all RLS policies were created correctly
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('users', 'course_enrollments', 'user_streaks', 'course_path_section_progress')
ORDER BY tablename, policyname;
