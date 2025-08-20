-- Fix infinite recursion in users table RLS policies
-- First drop all existing admin policies, then recreate them without recursion

-- 1. Drop ALL existing admin policies from all tables
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can manage all streaks" ON user_streaks;
DROP POLICY IF EXISTS "Admins can manage all progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON course_path_section_progress;

-- 2. Recreate admin policies without recursion (using JWT claims instead of database queries)
CREATE POLICY "Admins can manage all users" ON users
FOR ALL USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

CREATE POLICY "Admins can manage all enrollments" ON course_enrollments
FOR ALL USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

CREATE POLICY "Admins can manage all streaks" ON user_streaks
FOR ALL USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

CREATE POLICY "Admins can manage all progress" ON course_path_section_progress
FOR ALL USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

CREATE POLICY "Admins can view all progress" ON course_path_section_progress
FOR SELECT USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

-- 3. Verify the policies are fixed
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('users', 'course_enrollments', 'user_streaks', 'course_path_section_progress')
ORDER BY tablename, policyname;
