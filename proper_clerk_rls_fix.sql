-- =====================================================
-- PROPER CLERK + SUPABASE RLS FIX
-- =====================================================
-- This keeps security while fixing the type casting issue

-- =====================================================
-- STEP 1: DROP THE RELAXED POLICIES
-- =====================================================

-- Users table policies
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- Course enrollments table policies
DROP POLICY IF EXISTS "course_enrollments_select_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_insert_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_update_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_delete_policy" ON course_enrollments;

-- Course path section progress table policies
DROP POLICY IF EXISTS "course_path_section_progress_select_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_insert_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_update_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_delete_policy" ON course_path_section_progress;

-- User streaks table policies
DROP POLICY IF EXISTS "user_streaks_select_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_insert_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_update_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_delete_policy" ON user_streaks;

-- =====================================================
-- STEP 2: CREATE PROPER CLERK-COMPATIBLE POLICIES
-- =====================================================

-- Users table - users can only access their own data
CREATE POLICY "users_select_policy" ON users
    FOR SELECT USING (clerk_id = auth.uid()::text);

CREATE POLICY "users_insert_policy" ON users
    FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "users_update_policy" ON users
    FOR UPDATE USING (clerk_id = auth.uid()::text);

CREATE POLICY "users_delete_policy" ON users
    FOR DELETE USING (clerk_id = auth.uid()::text);

-- Course enrollments table - users see their own + admins see all
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

-- Course path section progress table - users see their own + admins see all
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

-- User streaks table - users see their own + admins see all
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
-- STEP 3: TEST THE PROPER FIX
-- =====================================================

-- Test if users table is accessible
SELECT id, clerk_id, is_premium, role
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

-- Test if course_enrollments table is accessible
SELECT clerk_id, course_id FROM course_enrollments LIMIT 5;

-- Test if user_streaks table is accessible
SELECT clerk_id, current_streak FROM user_streaks LIMIT 5;
