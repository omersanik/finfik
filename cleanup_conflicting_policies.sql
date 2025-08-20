-- Clean up all conflicting and duplicate RLS policies
-- Remove policies that still use auth.uid() and keep only the working ones

-- 1. Clean up course_path_section_progress table
DROP POLICY IF EXISTS "Users can only access their own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can only track enrolled course progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can only update enrolled course progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_delete_self" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_insert_self" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_select_self_or_admin" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_update_self" ON course_path_section_progress;

-- 2. Clean up course_enrollments table
DROP POLICY IF EXISTS "Users can enroll in free courses or if premium" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_delete_self" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_insert_self" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_select_self_or_admin" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_update_self" ON course_enrollments;

-- 3. Clean up user_streaks table
DROP POLICY IF EXISTS "user_streaks_delete_self" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_insert_self" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_select_self_or_admin" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_update_self" ON user_streaks;

-- 4. Clean up users table
DROP POLICY IF EXISTS "users_delete_self" ON users;
DROP POLICY IF EXISTS "users_insert_self" ON users;
DROP POLICY IF EXISTS "users_select_self" ON users;
DROP POLICY IF EXISTS "users_update_self" ON users;

-- 5. Verify only the clean policies remain
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('users', 'course_enrollments', 'user_streaks', 'course_path_section_progress')
ORDER BY tablename, policyname;
