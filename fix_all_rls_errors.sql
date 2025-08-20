-- Fix all RLS errors - remove problematic policies and create simple ones
-- This will resolve the "role 'admin' does not exist" error

-- 1. First, let's see what policies exist that might be causing issues
-- Run this first to see the current state:
-- SELECT schemaname, tablename, policyname, cmd, qual FROM pg_policies ORDER BY tablename, policyname;

-- 2. Drop ALL existing policies on user-related tables to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Admin can update all users" ON users;
DROP POLICY IF EXISTS "Admin can delete all users" ON users;

DROP POLICY IF EXISTS "Users can view own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can delete own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Admin can view all streaks" ON user_streaks;
DROP POLICY IF EXISTS "Admin can update all streaks" ON user_streaks;
DROP POLICY IF EXISTS "Admin can delete all streaks" ON user_streaks;

DROP POLICY IF EXISTS "Users can view own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admin can view all progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admin can update all progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admin can delete all progress" ON course_path_section_progress;

DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can insert own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can delete own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admin can view all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admin can update all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admin can delete all enrollments" ON course_enrollments;

-- 3. Create simple, working policies that use auth.uid()::text
-- Users table - simple policies
CREATE POLICY "users_select_policy" ON users FOR SELECT 
USING (clerk_id = auth.uid()::text);

CREATE POLICY "users_insert_policy" ON users FOR INSERT 
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "users_update_policy" ON users FOR UPDATE 
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "users_delete_policy" ON users FOR DELETE 
USING (clerk_id = auth.uid()::text);

-- User streaks table - simple policies
CREATE POLICY "user_streaks_select_policy" ON user_streaks FOR SELECT 
USING (clerk_id = auth.uid()::text);

CREATE POLICY "user_streaks_insert_policy" ON user_streaks FOR INSERT 
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "user_streaks_update_policy" ON user_streaks FOR UPDATE 
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "user_streaks_delete_policy" ON user_streaks FOR DELETE 
USING (clerk_id = auth.uid()::text);

-- Course progress table - simple policies
CREATE POLICY "course_progress_select_policy" ON course_path_section_progress FOR SELECT 
USING (clerk_id = auth.uid()::text);

CREATE POLICY "course_progress_insert_policy" ON course_path_section_progress FOR INSERT 
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "course_progress_update_policy" ON course_path_section_progress FOR UPDATE 
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "course_progress_delete_policy" ON course_path_section_progress FOR DELETE 
USING (clerk_id = auth.uid()::text);

-- Course enrollments table - simple policies
CREATE POLICY "course_enrollments_select_policy" ON course_enrollments FOR SELECT 
USING (clerk_id = auth.uid()::text);

CREATE POLICY "course_enrollments_insert_policy" ON course_enrollments FOR INSERT 
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "course_enrollments_update_policy" ON course_enrollments FOR UPDATE 
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "course_enrollments_delete_policy" ON course_enrollments FOR DELETE 
USING (clerk_id = auth.uid()::text);

-- 4. Verify the policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('users', 'user_streaks', 'course_path_section_progress', 'course_enrollments') 
ORDER BY tablename, policyname;
