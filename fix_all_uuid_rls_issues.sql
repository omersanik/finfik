-- Comprehensive fix for all UUID casting issues in RLS policies
-- This script fixes the auth.uid() vs auth.jwt()->>'sub' problem

-- 1. Fix users table RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (
  clerk_id = auth.jwt()->>'sub'
);

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (
  clerk_id = auth.jwt()->>'sub'
) WITH CHECK (
  clerk_id = auth.jwt()->>'sub'
);

CREATE POLICY "Users can insert own profile" ON users
FOR INSERT WITH CHECK (
  clerk_id = auth.jwt()->>'sub'
);

CREATE POLICY "Admins can manage all users" ON users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.clerk_id = auth.jwt()->>'sub' 
    AND users.role IN ('admin', 'moderator')
  )
);

-- 2. Fix course_enrollments table RLS policies
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can manage own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON course_enrollments;

CREATE POLICY "Users can view own enrollments" ON course_enrollments
FOR SELECT USING (
  clerk_id = auth.jwt()->>'sub'
);

CREATE POLICY "Users can manage own enrollments" ON course_enrollments
FOR ALL USING (
  clerk_id = auth.jwt()->>'sub'
);

CREATE POLICY "Admins can manage all enrollments" ON course_enrollments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.clerk_id = auth.jwt()->>'sub' 
    AND users.role IN ('admin', 'moderator')
  )
);

-- 3. Fix user_streaks table RLS policies
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can manage own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Admins can manage all streaks" ON user_streaks;

CREATE POLICY "Users can view own streaks" ON user_streaks
FOR SELECT USING (
  clerk_id = auth.jwt()->>'sub'
);

CREATE POLICY "Users can manage own streaks" ON user_streaks
FOR ALL USING (
  clerk_id = auth.jwt()->>'sub'
);

CREATE POLICY "Admins can manage all streaks" ON user_streaks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.clerk_id = auth.jwt()->>'sub' 
    AND users.role IN ('admin', 'moderator')
  )
);

-- 4. Fix course_path_section_progress table RLS policies (already created but ensuring consistency)
ALTER TABLE course_path_section_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admins can manage all progress" ON course_path_section_progress;

CREATE POLICY "Users can view own progress" ON course_path_section_progress
FOR SELECT USING (
  clerk_id = auth.jwt()->>'sub'
);

CREATE POLICY "Users can update own progress" ON course_path_section_progress
FOR UPDATE USING (
  clerk_id = auth.jwt()->>'sub'
) WITH CHECK (
  clerk_id = auth.jwt()->>'sub'
);

CREATE POLICY "Users can insert own progress" ON course_path_section_progress
FOR INSERT WITH CHECK (
  clerk_id = auth.jwt()->>'sub'
);

CREATE POLICY "Admins can view all progress" ON course_path_section_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.clerk_id = auth.jwt()->>'sub' 
    AND users.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Admins can manage all progress" ON course_path_section_progress
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.clerk_id = auth.jwt()->>'sub' 
    AND users.role IN ('admin', 'moderator')
  )
);

-- 5. Verify all policies are created correctly
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('users', 'course_enrollments', 'user_streaks', 'course_path_section_progress')
ORDER BY tablename, policyname;

-- 6. Check RLS status on all tables
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'course_enrollments', 'user_streaks', 'course_path_section_progress')
ORDER BY tablename;
