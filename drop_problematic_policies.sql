-- Drop the problematic admin policies that are causing the "role 'admin' does not exist" error
-- Copy and paste this into your Supabase SQL editor and run it

DROP POLICY IF EXISTS "Admins can manage all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can manage all progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admins can manage all streaks" ON user_streaks;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Also drop the old policies that use auth.jwt() ->> 'sub'
DROP POLICY IF EXISTS "Users can manage own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can manage own streaks" ON user_streaks;

-- Verify the problematic policies are gone
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('users', 'user_streaks', 'course_path_section_progress', 'course_enrollments') 
ORDER BY tablename, policyname;
