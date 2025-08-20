-- =====================================================
-- COMPLETE RLS FIX - ALL TABLES WORKING
-- =====================================================
-- This script fixes ALL RLS policy issues

-- =====================================================
-- STEP 1: DISABLE RLS TEMPORARILY TO CLEAN UP
-- =====================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_block DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_section_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: DROP ALL EXISTING POLICIES
-- =====================================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- Courses table policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Only admins can create courses" ON courses;
DROP POLICY IF EXISTS "Only admins can update courses" ON courses;
DROP POLICY IF EXISTS "Only admins can delete courses" ON courses;
DROP POLICY IF EXISTS "courses_select_policy" ON courses;
DROP POLICY IF EXISTS "courses_insert_policy" ON courses;
DROP POLICY IF EXISTS "courses_update_policy" ON courses;
DROP POLICY IF EXISTS "courses_delete_policy" ON courses;

-- Course path table policies
DROP POLICY IF EXISTS "Anyone can view course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can create course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can update course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can delete course paths" ON course_path;
DROP POLICY IF EXISTS "course_path_select_policy" ON course_path;
DROP POLICY IF EXISTS "course_path_insert_policy" ON course_path;
DROP POLICY IF EXISTS "course_path_update_policy" ON course_path;
DROP POLICY IF EXISTS "course_path_delete_policy" ON course_path;

-- Course path sections table policies
DROP POLICY IF EXISTS "Anyone can view course path sections" ON course_path_sections;
DROP POLICY IF EXISTS "Only admins can create course path sections" ON course_path_sections;
DROP POLICY IF EXISTS "Only admins can update course path sections" ON course_path_sections;
DROP POLICY IF EXISTS "Only admins can delete course path sections" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_select_policy" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_insert_policy" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_update_policy" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_delete_policy" ON course_path_sections;

-- Content block table policies
DROP POLICY IF EXISTS "Anyone can view content blocks" ON content_block;
DROP POLICY IF EXISTS "Only admins can create content blocks" ON content_block;
DROP POLICY IF EXISTS "Only admins can update content blocks" ON content_block;
DROP POLICY IF EXISTS "Only admins can delete content blocks" ON content_block;
DROP POLICY IF EXISTS "content_block_select_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_insert_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_update_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_delete_policy" ON content_block;

-- Content item table policies
DROP POLICY IF EXISTS "Anyone can view content items" ON content_item;
DROP POLICY IF EXISTS "Only admins can create content items" ON content_item;
DROP POLICY IF EXISTS "Only admins can update content items" ON content_item;
DROP POLICY IF EXISTS "Only admins can delete content items" ON content_item;
DROP POLICY IF EXISTS "content_item_select_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_insert_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_update_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_delete_policy" ON content_item;

-- Course enrollments table policies
DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can delete own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_select_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_insert_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_update_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_delete_policy" ON course_enrollments;

-- Course path section progress table policies
DROP POLICY IF EXISTS "Users can view own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can create own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_select_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_insert_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_update_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_delete_policy" ON course_path_section_progress;

-- User streaks table policies
DROP POLICY IF EXISTS "Users can view own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can create own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can delete own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Admins can view all streaks" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_select_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_insert_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_update_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_delete_policy" ON user_streaks;

-- =====================================================
-- STEP 3: RE-ENABLE RLS
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_path ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_block ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: CREATE NEW, SIMPLE POLICIES
-- =====================================================

-- Users table - simple policies
CREATE POLICY "users_select_policy" ON users
    FOR SELECT USING (clerk_id = auth.uid()::text);

CREATE POLICY "users_insert_policy" ON users
    FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "users_update_policy" ON users
    FOR UPDATE USING (clerk_id = auth.uid()::text);

CREATE POLICY "users_delete_policy" ON users
    FOR DELETE USING (clerk_id = auth.uid()::text);

-- Courses table - public read, admin write
CREATE POLICY "courses_select_policy" ON courses
    FOR SELECT USING (true);

CREATE POLICY "courses_insert_policy" ON courses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "courses_update_policy" ON courses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "courses_delete_policy" ON courses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Course path table - public read, admin write
CREATE POLICY "course_path_select_policy" ON course_path
    FOR SELECT USING (true);

CREATE POLICY "course_path_insert_policy" ON course_path
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "course_path_update_policy" ON course_path
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "course_path_delete_policy" ON course_path
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Course path sections table - public read, admin write
CREATE POLICY "course_path_sections_select_policy" ON course_path_sections
    FOR SELECT USING (true);

CREATE POLICY "course_path_sections_insert_policy" ON course_path_sections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "course_path_sections_update_policy" ON course_path_sections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "course_path_sections_delete_policy" ON course_path_sections
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Content block table - public read, admin write
CREATE POLICY "content_block_select_policy" ON content_block
    FOR SELECT USING (true);

CREATE POLICY "content_block_insert_policy" ON content_block
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "content_block_update_policy" ON content_block
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "content_block_delete_policy" ON content_block
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Content item table - public read, admin write
CREATE POLICY "content_item_select_policy" ON content_item
    FOR SELECT USING (true);

CREATE POLICY "content_item_insert_policy" ON content_item
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "content_item_update_policy" ON content_item
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "content_item_delete_policy" ON content_item
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Course enrollments table - user own data + admin access
CREATE POLICY "course_enrollments_select_policy" ON course_enrollments
    FOR SELECT USING (
        clerk_id = auth.uid()::text 
        OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "course_enrollments_insert_policy" ON course_enrollments
    FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "course_enrollments_update_policy" ON course_enrollments
    FOR UPDATE USING (clerk_id = auth.uid()::text);

CREATE POLICY "course_enrollments_delete_policy" ON course_enrollments
    FOR DELETE USING (clerk_id = auth.uid()::text);

-- Course path section progress table - user own data + admin access
CREATE POLICY "course_path_section_progress_select_policy" ON course_path_section_progress
    FOR SELECT USING (
        clerk_id = auth.uid()::text 
        OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "course_path_section_progress_insert_policy" ON course_path_section_progress
    FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "course_path_section_progress_update_policy" ON course_path_section_progress
    FOR UPDATE USING (clerk_id = auth.uid()::text);

CREATE POLICY "course_path_section_progress_delete_policy" ON course_path_section_progress
    FOR DELETE USING (clerk_id = auth.uid()::text);

-- User streaks table - user own data + admin access
CREATE POLICY "user_streaks_select_policy" ON user_streaks
    FOR SELECT USING (
        clerk_id = auth.uid()::text 
        OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "user_streaks_insert_policy" ON user_streaks
    FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "user_streaks_update_policy" ON user_streaks
    FOR UPDATE USING (clerk_id = auth.uid()::text);

CREATE POLICY "user_streaks_delete_policy" ON user_streaks
    FOR DELETE USING (clerk_id = auth.uid()::text);

-- =====================================================
-- STEP 5: TEST ALL POLICIES
-- =====================================================

-- Test if users table is accessible
SELECT id, clerk_id, is_premium, role
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

-- Test if courses table is accessible
SELECT id, title, slug FROM courses LIMIT 5;

-- Test if course_path table is accessible
SELECT id, name, course_id FROM course_path LIMIT 5;

-- Test if content_item table is accessible
SELECT id, type, block_id FROM content_item LIMIT 5;
