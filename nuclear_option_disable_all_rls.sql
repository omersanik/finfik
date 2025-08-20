-- Nuclear option: Disable RLS on ALL tables to isolate the "role 'admin' does not exist" error
-- This will help us determine if the issue is with RLS or something else entirely

-- Disable RLS on ALL tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_section_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_block DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_sections DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on ALL tables to be absolutely sure
-- This will remove any potential policy conflicts

-- Drop all policies on users table
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- Drop all policies on user_streaks table
DROP POLICY IF EXISTS "user_streaks_select_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_insert_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_update_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_delete_policy" ON user_streaks;

-- Drop all policies on course_path_section_progress table
DROP POLICY IF EXISTS "course_progress_select_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_insert_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_update_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_delete_policy" ON course_path_section_progress;

-- Drop all policies on course_enrollments table
DROP POLICY IF EXISTS "course_enrollments_select_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_insert_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_update_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_delete_policy" ON course_enrollments;

-- Drop all policies on content tables
DROP POLICY IF EXISTS "content_block_allow_all" ON content_block;
DROP POLICY IF EXISTS "content_item_allow_all" ON content_item;

-- Drop all policies on course structure tables
DROP POLICY IF EXISTS "courses_allow_all" ON courses;
DROP POLICY IF EXISTS "course_path_allow_all" ON course_path;
DROP POLICY IF EXISTS "course_path_sections_allow_all" ON course_path_sections;

-- Verify RLS is disabled on all tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verify no policies remain
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test if the error still occurs by running simple queries
-- This will help us determine if the issue is with RLS or something else
SELECT COUNT(*) FROM users LIMIT 1;
SELECT COUNT(*) FROM user_streaks LIMIT 1;
SELECT COUNT(*) FROM course_path_section_progress LIMIT 1;
