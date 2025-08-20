-- Temporarily disable RLS on all tables to isolate the "role 'admin' does not exist" error
-- This will help us determine if the issue is with RLS policies or something else

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_section_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_block DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_sections DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Test if the error still occurs by running a simple query
-- This will help us determine if the issue is with RLS or something else
SELECT COUNT(*) FROM users LIMIT 1;
SELECT COUNT(*) FROM user_streaks LIMIT 1;
SELECT COUNT(*) FROM course_path_section_progress LIMIT 1;
