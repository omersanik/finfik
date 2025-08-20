-- Isolate the RLS issue by temporarily disabling RLS on specific tables
-- This will help us determine which table is causing the "role 'admin' does not exist" error

-- Temporarily disable RLS on tables accessed by failing APIs
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_section_progress DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'user_streaks', 'course_path_section_progress') 
ORDER BY tablename;

-- Test if the error still occurs by running a simple query
-- This will help us determine if the issue is with RLS or something else
SELECT COUNT(*) FROM users LIMIT 1;
SELECT COUNT(*) FROM user_streaks LIMIT 1;
SELECT COUNT(*) FROM course_path_section_progress LIMIT 1;
