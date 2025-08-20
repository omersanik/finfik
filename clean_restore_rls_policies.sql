-- Clean restore of RLS policies - drop existing ones first, then create new ones
-- This avoids the "policy already exists" error

-- ============================================================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================================================

-- Drop all policies on users table
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_delete_admin" ON users;

-- Drop all policies on user_streaks table
DROP POLICY IF EXISTS "user_streaks_select_own" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_insert_own" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_update_own" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_delete_own" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_select_admin" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_update_admin" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_delete_admin" ON user_streaks;

-- Drop all policies on course_path_section_progress table
DROP POLICY IF EXISTS "course_progress_select_own" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_insert_own" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_update_own" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_delete_own" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_select_admin" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_update_admin" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_delete_admin" ON course_path_section_progress;

-- Drop all policies on course_enrollments table
DROP POLICY IF EXISTS "course_enrollments_select_own" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_insert_own" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_update_own" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_delete_own" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_select_admin" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_update_admin" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_delete_admin" ON course_enrollments;

-- Drop all policies on content tables
DROP POLICY IF EXISTS "content_block_allow_all" ON content_block;
DROP POLICY IF EXISTS "content_item_allow_all" ON content_item;

-- Drop all policies on course structure tables
DROP POLICY IF EXISTS "courses_allow_all" ON courses;
DROP POLICY IF EXISTS "course_path_allow_all" ON course_path;
DROP POLICY IF EXISTS "course_path_sections_allow_all" ON course_path_sections;

-- Drop any other policies that might exist
DROP POLICY IF EXISTS "content_block_select_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_insert_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_update_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_delete_policy" ON content_block;
DROP POLICY IF EXISTS "content_item_select_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_insert_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_update_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_delete_policy" ON content_item;

-- ============================================================================
-- STEP 2: VERIFY ROLE COLUMN TYPE
-- ============================================================================

-- Verify the role column is now text type
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- ============================================================================
-- STEP 3: ENABLE RLS ON ALL TABLES
-- ============================================================================

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
-- STEP 4: CREATE NEW POLICIES
-- ============================================================================

-- Users table policies
CREATE POLICY "users_select_own" ON users FOR SELECT
USING (clerk_id = auth.uid()::text);

CREATE POLICY "users_insert_own" ON users FOR INSERT
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "users_update_own" ON users FOR UPDATE
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "users_delete_own" ON users FOR DELETE
USING (clerk_id = auth.uid()::text);

CREATE POLICY "users_select_admin" ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "users_update_admin" ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "users_delete_admin" ON users FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- User streaks table policies
CREATE POLICY "user_streaks_select_own" ON user_streaks FOR SELECT
USING (clerk_id = auth.uid()::text);

CREATE POLICY "user_streaks_insert_own" ON user_streaks FOR INSERT
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "user_streaks_update_own" ON user_streaks FOR UPDATE
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "user_streaks_delete_own" ON user_streaks FOR DELETE
USING (clerk_id = auth.uid()::text);

CREATE POLICY "user_streaks_select_admin" ON user_streaks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "user_streaks_update_admin" ON user_streaks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "user_streaks_delete_admin" ON user_streaks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Course progress table policies
CREATE POLICY "course_progress_select_own" ON course_path_section_progress FOR SELECT
USING (clerk_id = auth.uid()::text);

CREATE POLICY "course_progress_insert_own" ON course_path_section_progress FOR INSERT
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "course_progress_update_own" ON course_path_section_progress FOR UPDATE
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "course_progress_delete_own" ON course_path_section_progress FOR DELETE
USING (clerk_id = auth.uid()::text);

CREATE POLICY "course_progress_select_admin" ON course_path_section_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "course_progress_update_admin" ON course_path_section_progress FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "course_progress_delete_admin" ON course_path_section_progress FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Course enrollments table policies
CREATE POLICY "course_enrollments_select_own" ON course_enrollments FOR SELECT
USING (clerk_id = auth.uid()::text);

CREATE POLICY "course_enrollments_insert_own" ON course_enrollments FOR INSERT
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "course_enrollments_update_own" ON course_enrollments FOR UPDATE
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "course_enrollments_delete_own" ON course_enrollments FOR DELETE
USING (clerk_id = auth.uid()::text);

CREATE POLICY "course_enrollments_select_admin" ON course_enrollments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "course_enrollments_update_admin" ON course_enrollments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "course_enrollments_delete_admin" ON course_enrollments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Content tables policies (simplified for now)
CREATE POLICY "content_block_allow_all" ON content_block FOR ALL USING (true);
CREATE POLICY "content_item_allow_all" ON content_item FOR ALL USING (true);

-- Course structure tables policies
CREATE POLICY "courses_allow_all" ON courses FOR ALL USING (true);
CREATE POLICY "course_path_allow_all" ON course_path FOR ALL USING (true);
CREATE POLICY "course_path_sections_allow_all" ON course_path_sections FOR ALL USING (true);

-- ============================================================================
-- STEP 5: VERIFICATION
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
