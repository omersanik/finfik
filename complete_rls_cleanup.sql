-- Complete RLS cleanup - remove ALL problematic policies
-- This will fix the "role 'admin' does not exist" error once and for all

-- 1. Disable RLS on all tables temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_section_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_block DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_sections DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies (nuclear option)
-- Users table
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- User streaks table
DROP POLICY IF EXISTS "Admins can manage all streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can manage own streaks" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_select_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_insert_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_update_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_delete_policy" ON user_streaks;

-- Course progress table
DROP POLICY IF EXISTS "Admins can manage all progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_select_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_insert_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_update_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_progress_delete_policy" ON course_path_section_progress;

-- Course enrollments table
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can manage own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_select_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_insert_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_update_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_delete_policy" ON course_enrollments;

-- Content block table
DROP POLICY IF EXISTS "Users can view blocks for enrolled or free courses" ON content_block;
DROP POLICY IF EXISTS "content_block_delete_admin" ON content_block;
DROP POLICY IF EXISTS "content_block_delete_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_update_admin" ON content_block;
DROP POLICY IF EXISTS "content_block_update_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_allow_all" ON content_block;

-- Content item table
DROP POLICY IF EXISTS "Premium content access control" ON content_item;
DROP POLICY IF EXISTS "Users can view content for enrolled or free courses" ON content_item;
DROP POLICY IF EXISTS "content_item_delete_admin" ON content_item;
DROP POLICY IF EXISTS "content_item_delete_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_update_admin" ON content_item;
DROP POLICY IF EXISTS "content_item_update_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_allow_all" ON content_item;

-- Course path table
DROP POLICY IF EXISTS "course_path_delete_admin" ON course_path;
DROP POLICY IF EXISTS "course_path_update_admin" ON course_path;

-- Course path sections table
DROP POLICY IF EXISTS "course_path_sections_delete_admin" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_update_admin" ON course_path_sections;

-- Courses table
DROP POLICY IF EXISTS "courses_delete_admin" ON courses;
DROP POLICY IF EXISTS "courses_update_admin" ON courses;

-- 3. Verify all policies are gone
SELECT COUNT(*) as total_policies FROM pg_policies;

-- 4. Re-enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_block ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_path ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_sections ENABLE ROW LEVEL SECURITY;

-- 5. Create clean, simple policies that actually work
-- Users table
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (clerk_id = auth.uid()::text);
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (clerk_id = auth.uid()::text) WITH CHECK (clerk_id = auth.uid()::text);
CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (clerk_id = auth.uid()::text);

-- User streaks table
CREATE POLICY "user_streaks_select_policy" ON user_streaks FOR SELECT USING (clerk_id = auth.uid()::text);
CREATE POLICY "user_streaks_insert_policy" ON user_streaks FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);
CREATE POLICY "user_streaks_update_policy" ON user_streaks FOR UPDATE USING (clerk_id = auth.uid()::text) WITH CHECK (clerk_id = auth.uid()::text);
CREATE POLICY "user_streaks_delete_policy" ON user_streaks FOR DELETE USING (clerk_id = auth.uid()::text);

-- Course progress table
CREATE POLICY "course_progress_select_policy" ON course_path_section_progress FOR SELECT USING (clerk_id = auth.uid()::text);
CREATE POLICY "course_progress_insert_policy" ON course_path_section_progress FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);
CREATE POLICY "course_progress_update_policy" ON course_path_section_progress FOR UPDATE USING (clerk_id = auth.uid()::text) WITH CHECK (clerk_id = auth.uid()::text);
CREATE POLICY "course_progress_delete_policy" ON course_path_section_progress FOR DELETE USING (clerk_id = auth.uid()::text);

-- Course enrollments table
CREATE POLICY "course_enrollments_select_policy" ON course_enrollments FOR SELECT USING (clerk_id = auth.uid()::text);
CREATE POLICY "course_enrollments_insert_policy" ON course_enrollments FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);
CREATE POLICY "course_enrollments_update_policy" ON course_enrollments FOR UPDATE USING (clerk_id = auth.uid()::text) WITH CHECK (clerk_id = auth.uid()::text);
CREATE POLICY "course_enrollments_delete_policy" ON course_enrollments FOR DELETE USING (clerk_id = auth.uid()::text);

-- Content tables - allow all operations for now (you can restrict these later)
CREATE POLICY "content_block_allow_all" ON content_block FOR ALL USING (true);
CREATE POLICY "content_item_allow_all" ON content_item FOR ALL USING (true);

-- Course structure tables - allow all operations for now
CREATE POLICY "courses_allow_all" ON courses FOR ALL USING (true);
CREATE POLICY "course_path_allow_all" ON course_path FOR ALL USING (true);
CREATE POLICY "course_path_sections_allow_all" ON course_path_sections FOR ALL USING (true);

-- 6. Verify the new policies are created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
ORDER BY tablename, policyname;
