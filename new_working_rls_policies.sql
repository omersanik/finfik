-- =====================================================
-- NEW WORKING RLS POLICIES - SIMPLE AND BULLETPROOF
-- =====================================================
-- These policies are designed to work without type casting issues

-- =====================================================
-- 1. USERS TABLE - SIMPLE POLICIES
-- =====================================================

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;

-- Create simple, working policies
CREATE POLICY "users_select_policy" ON users
    FOR SELECT USING (clerk_id = auth.uid()::text);

CREATE POLICY "users_insert_policy" ON users
    FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "users_update_policy" ON users
    FOR UPDATE USING (clerk_id = auth.uid()::text);

CREATE POLICY "users_delete_policy" ON users
    FOR DELETE USING (clerk_id = auth.uid()::text);

-- =====================================================
-- 2. COURSES TABLE - PUBLIC READ, ADMIN WRITE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Only admins can create courses" ON courses;
DROP POLICY IF EXISTS "Only admins can update courses" ON courses;
DROP POLICY IF EXISTS "Only admins can delete courses" ON courses;

-- Create simple policies
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

-- =====================================================
-- 3. COURSE_PATH TABLE - PUBLIC READ, ADMIN WRITE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can create course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can update course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can delete course paths" ON course_path;

-- Create simple policies
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

-- =====================================================
-- 4. COURSE_PATH_SECTIONS TABLE - PUBLIC READ, ADMIN WRITE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view course path sections" ON course_path_sections;
DROP POLICY IF EXISTS "Only admins can create course path sections" ON course_path_sections;
DROP POLICY IF EXISTS "Only admins can update course path sections" ON course_path_sections;
DROP POLICY IF EXISTS "Only admins can delete course path sections" ON course_path_sections;

-- Create simple policies
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

-- =====================================================
-- 5. CONTENT_BLOCK TABLE - PUBLIC READ, ADMIN WRITE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view content blocks" ON content_block;
DROP POLICY IF EXISTS "Only admins can create content blocks" ON content_block;
DROP POLICY IF EXISTS "Only admins can update content blocks" ON content_block;
DROP POLICY IF EXISTS "Only admins can delete content blocks" ON content_block;

-- Create simple policies
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

-- =====================================================
-- 6. CONTENT_ITEM TABLE - PUBLIC READ, ADMIN WRITE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view content items" ON content_item;
DROP POLICY IF EXISTS "Only admins can create content items" ON content_item;
DROP POLICY IF EXISTS "Only admins can update content items" ON content_item;
DROP POLICY IF EXISTS "Only admins can delete content items" ON content_item;

-- Create simple policies
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

-- =====================================================
-- 7. COURSE_ENROLLMENTS TABLE - USER OWN DATA + ADMIN ACCESS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can delete own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON course_enrollments;

-- Create simple policies
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

-- =====================================================
-- 8. COURSE_PATH_SECTION_PROGRESS TABLE - USER OWN DATA + ADMIN ACCESS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can create own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON course_path_section_progress;

-- Create simple policies
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

-- =====================================================
-- 9. USER_STREAKS TABLE - USER OWN DATA + ADMIN ACCESS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can create own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can delete own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Admins can view all streaks" ON user_streaks;

-- Create simple policies
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
-- TEST THE POLICIES
-- =====================================================

-- Test if users table is accessible
SELECT id, clerk_id, is_premium, role
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

-- Test if courses table is accessible
SELECT id, title, slug FROM courses LIMIT 5;

-- Test if course_path table is accessible
SELECT id, name, course_id FROM course_path LIMIT 5;
