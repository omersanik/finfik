-- Fix infinite recursion in users table RLS policies
-- The issue is that admin policies are trying to query the users table, which triggers RLS again

-- 1. Drop the problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- 2. Create a simpler admin policy that doesn't cause recursion
-- We'll use a different approach - let admins bypass RLS for user management
CREATE POLICY "Admins can manage all users" ON users
FOR ALL USING (
  -- Check if current user has admin role by looking at their JWT claims
  -- This avoids querying the users table from within the policy
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

-- 3. Also fix the same issue in other tables
-- Fix course_enrollments admin policy
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON course_enrollments;
CREATE POLICY "Admins can manage all enrollments" ON course_enrollments
FOR ALL USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

-- Fix user_streaks admin policy  
DROP POLICY IF EXISTS "Admins can manage all streaks" ON user_streaks;
CREATE POLICY "Admins can manage all streaks" ON user_streaks
FOR ALL USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

-- Fix course_path_section_progress admin policies
DROP POLICY IF EXISTS "Admins can manage all progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON course_path_section_progress;

CREATE POLICY "Admins can manage all progress" ON course_path_section_progress
FOR ALL USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

CREATE POLICY "Admins can view all progress" ON course_path_section_progress
FOR SELECT USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

-- 4. Verify the policies are fixed
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('users', 'course_enrollments', 'user_streaks', 'course_path_section_progress')
ORDER BY tablename, policyname;
