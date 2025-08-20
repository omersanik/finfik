-- Restore RLS policies correctly after fixing the role column type issue
-- This time we'll avoid all the previous mistakes and create working policies

-- First, let's verify the role column is now text type
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Now let's enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_block ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_path ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_sections ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users FOR SELECT
USING (clerk_id = auth.uid()::text);

-- Users can insert their own profile
CREATE POLICY "users_insert_own" ON users FOR INSERT
WITH CHECK (clerk_id = auth.uid()::text);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users FOR UPDATE
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

-- Users can delete their own profile
CREATE POLICY "users_delete_own" ON users FOR DELETE
USING (clerk_id = auth.uid()::text);

-- Admins can view all users (using text comparison, not role type)
CREATE POLICY "users_select_admin" ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Admins can update all users
CREATE POLICY "users_update_admin" ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Admins can delete all users
CREATE POLICY "users_delete_admin" ON users FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- ============================================================================
-- USER_STREAKS TABLE POLICIES
-- ============================================================================

-- Users can view their own streaks
CREATE POLICY "user_streaks_select_own" ON user_streaks FOR SELECT
USING (clerk_id = auth.uid()::text);

-- Users can insert their own streaks
CREATE POLICY "user_streaks_insert_own" ON user_streaks FOR INSERT
WITH CHECK (clerk_id = auth.uid()::text);

-- Users can update their own streaks
CREATE POLICY "user_streaks_update_own" ON user_streaks FOR UPDATE
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

-- Users can delete their own streaks
CREATE POLICY "user_streaks_delete_own" ON user_streaks FOR DELETE
USING (clerk_id = auth.uid()::text);

-- Admins can view all streaks
CREATE POLICY "user_streaks_select_admin" ON user_streaks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Admins can update all streaks
CREATE POLICY "user_streaks_update_admin" ON user_streaks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Admins can delete all streaks
CREATE POLICY "user_streaks_delete_admin" ON user_streaks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- ============================================================================
-- COURSE_PATH_SECTION_PROGRESS TABLE POLICIES
-- ============================================================================

-- Users can view their own progress
CREATE POLICY "course_progress_select_own" ON course_path_section_progress FOR SELECT
USING (clerk_id = auth.uid()::text);

-- Users can insert their own progress
CREATE POLICY "course_progress_insert_own" ON course_path_section_progress FOR INSERT
WITH CHECK (clerk_id = auth.uid()::text);

-- Users can update their own progress
CREATE POLICY "course_progress_update_own" ON course_path_section_progress FOR UPDATE
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

-- Users can delete their own progress
CREATE POLICY "course_progress_delete_own" ON course_path_section_progress FOR DELETE
USING (clerk_id = auth.uid()::text);

-- Admins can view all progress
CREATE POLICY "course_progress_select_admin" ON course_path_section_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Admins can update all progress
CREATE POLICY "course_progress_update_admin" ON course_path_section_progress FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Admins can delete all progress
CREATE POLICY "course_progress_delete_admin" ON course_path_section_progress FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- ============================================================================
-- COURSE_ENROLLMENTS TABLE POLICIES
-- ============================================================================

-- Users can view their own enrollments
CREATE POLICY "course_enrollments_select_own" ON course_enrollments FOR SELECT
USING (clerk_id = auth.uid()::text);

-- Users can insert their own enrollments
CREATE POLICY "course_enrollments_insert_own" ON course_enrollments FOR INSERT
WITH CHECK (clerk_id = auth.uid()::text);

-- Users can update their own enrollments
CREATE POLICY "course_enrollments_update_own" ON course_enrollments FOR UPDATE
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

-- Users can delete their own enrollments
CREATE POLICY "course_enrollments_delete_own" ON course_enrollments FOR DELETE
USING (clerk_id = auth.uid()::text);

-- Admins can view all enrollments
CREATE POLICY "course_enrollments_select_admin" ON course_enrollments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Admins can update all enrollments
CREATE POLICY "course_enrollments_update_admin" ON course_enrollments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Admins can delete all enrollments
CREATE POLICY "course_enrollments_delete_admin" ON course_enrollments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- ============================================================================
-- CONTENT TABLES POLICIES (Simplified for now)
-- ============================================================================

-- Content blocks - allow all operations for now (can be restricted later)
CREATE POLICY "content_block_allow_all" ON content_block FOR ALL USING (true);

-- Content items - allow all operations for now (can be restricted later)
CREATE POLICY "content_item_allow_all" ON content_item FOR ALL USING (true);

-- ============================================================================
-- COURSE STRUCTURE TABLES POLICIES
-- ============================================================================

-- Courses - allow all operations for now (can be restricted later)
CREATE POLICY "courses_allow_all" ON courses FOR ALL USING (true);

-- Course paths - allow all operations for now (can be restricted later)
CREATE POLICY "course_path_allow_all" ON course_path FOR ALL USING (true);

-- Course path sections - allow all operations for now (can be restricted later)
CREATE POLICY "course_path_sections_allow_all" ON course_path_sections FOR ALL USING (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify RLS is enabled on all tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verify all policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test basic functionality
SELECT COUNT(*) FROM users LIMIT 1;
SELECT COUNT(*) FROM user_streaks LIMIT 1;
SELECT COUNT(*) FROM course_path_section_progress LIMIT 1;
