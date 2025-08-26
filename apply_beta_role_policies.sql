-- =====================================================
-- APPLY BETA ROLE PREMIUM ACCESS POLICIES
-- =====================================================
-- This script updates the premium course policies to include 'beta' role users
-- Run this in your Supabase SQL editor

-- =====================================================
-- 1. DROP EXISTING PREMIUM POLICIES
-- =====================================================

-- Drop existing premium content policies
DROP POLICY IF EXISTS "Users can view content for enrolled or free courses" ON content_item;
DROP POLICY IF EXISTS "Users can view blocks for enrolled or free courses" ON content_block;
DROP POLICY IF EXISTS "Users can view sections for enrolled or free courses" ON course_path_sections;
DROP POLICY IF EXISTS "Users can enroll in free courses or if premium" ON course_enrollments;
DROP POLICY IF EXISTS "Premium content access control" ON content_item;
DROP POLICY IF EXISTS "Users can only track enrolled course progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can manage own enrollments" ON course_enrollments;

-- Drop existing helper functions
DROP FUNCTION IF EXISTS can_access_course(UUID);
DROP FUNCTION IF EXISTS is_premium_user();

-- =====================================================
-- 2. CREATE UPDATED PREMIUM POLICIES WITH BETA SUPPORT
-- =====================================================

-- Policy: Users can only view content items for courses they're enrolled in
-- OR if the course is free (not premium)
CREATE POLICY "Users can view content for enrolled or free courses" ON content_item
    FOR SELECT USING (
        -- Allow access if user is enrolled in the course
        EXISTS (
            SELECT 1 FROM course_enrollments ce
            JOIN content_block cb ON cb.id = content_item.block_id
            JOIN course_path_sections cps ON cps.id = cb.section_id
            JOIN course_path cp ON cp.id = cps.course_path_id
            JOIN courses c ON c.id = cp.course_id
            WHERE ce.clerk_id = auth.uid()::text
            AND ce.course_id = c.id
        )
        OR
        -- Allow access if the course is free (not premium)
        EXISTS (
            SELECT 1 FROM content_block cb
            JOIN course_path_sections cps ON cps.id = cb.section_id
            JOIN course_path cp ON cp.id = cps.course_path_id
            JOIN courses c ON c.id = cp.course_id
            WHERE cb.id = content_item.block_id
            AND c.is_premium_course = false
        )
        OR
        -- Allow admins and moderators to view all content
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Policy: Users can only view content blocks for courses they're enrolled in
-- OR if the course is free
CREATE POLICY "Users can view blocks for enrolled or free courses" ON content_block
    FOR SELECT USING (
        -- Allow access if user is enrolled in the course
        EXISTS (
            SELECT 1 FROM course_enrollments ce
            JOIN course_path_sections cps ON cps.id = content_block.section_id
            JOIN course_path cp ON cp.id = cps.course_path_id
            JOIN courses c ON c.id = cp.course_id
            WHERE ce.clerk_id = auth.uid()::text
            AND ce.course_id = c.id
        )
        OR
        -- Allow access if the course is free
        EXISTS (
            SELECT 1 FROM course_path_sections cps
            JOIN course_path cp ON cp.id = cps.course_path_id
            JOIN courses c ON c.id = cp.course_id
            WHERE cps.id = content_block.section_id
            AND c.is_premium_course = false
        )
        OR
        -- Allow admins and moderators to view all blocks
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Policy: Users can only view course path sections for courses they're enrolled in
-- OR if the course is free
CREATE POLICY "Users can view sections for enrolled or free courses" ON course_path_sections
    FOR SELECT USING (
        -- Allow access if user is enrolled in the course
        EXISTS (
            SELECT 1 FROM course_enrollments ce
            JOIN course_path cp ON cp.id = course_path_sections.course_path_id
            JOIN courses c ON c.id = cp.course_id
            WHERE ce.clerk_id = auth.uid()::text
            AND ce.course_id = c.id
        )
        OR
        -- Allow access if the course is free
        EXISTS (
            SELECT 1 FROM course_path cp
            JOIN courses c ON c.id = cp.course_id
            WHERE cp.id = course_path_sections.course_path_id
            AND c.is_premium_course = false
        )
        OR
        -- Allow admins and moderators to view all sections
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Policy: Users can only enroll in courses if they're premium users (including beta)
-- OR if the course is free
CREATE POLICY "Users can enroll in free courses or if premium" ON course_enrollments
    FOR INSERT WITH CHECK (
        -- Allow enrollment if course is free
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_enrollments.course_id
            AND c.is_premium_course = false
        )
        OR
        -- Allow enrollment if user is premium OR has beta role
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.clerk_id = auth.uid()::text
            AND (u.is_premium = true OR u.role = 'beta')
        )
        OR
        -- Allow admins and moderators to create enrollments
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Policy: Users can only access premium content if they're enrolled and premium (including beta)
-- OR if the content is from a free course
CREATE POLICY "Premium content access control" ON content_item
    FOR SELECT USING (
        -- Allow access to free course content
        EXISTS (
            SELECT 1 FROM content_block cb
            JOIN course_path_sections cps ON cps.id = cb.section_id
            JOIN course_path cp ON cp.id = cps.course_path_id
            JOIN courses c ON c.id = cp.course_id
            WHERE cb.id = content_item.block_id
            AND c.is_premium_course = false
        )
        OR
        -- Allow access to premium content if user is enrolled and premium OR beta
        EXISTS (
            SELECT 1 FROM course_enrollments ce
            JOIN content_block cb ON cb.id = content_item.block_id
            JOIN course_path_sections cps ON cps.id = cb.section_id
            JOIN course_path cp ON cp.id = cps.course_path_id
            JOIN courses c ON c.id = cp.course_id
            JOIN users u ON u.clerk_id = ce.clerk_id
            WHERE ce.clerk_id = auth.uid()::text
            AND ce.course_id = c.id
            AND (u.is_premium = true OR u.role = 'beta')
        )
        OR
        -- Allow admins and moderators to view all content
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Policy: Users can only track progress for courses they're enrolled in
CREATE POLICY "Users can only track enrolled course progress" ON course_path_section_progress
    FOR ALL USING (
        -- Allow progress tracking if user is enrolled in the course
        EXISTS (
            SELECT 1 FROM course_enrollments ce
            JOIN course_path_sections cps ON cps.id = course_path_section_progress.course_path_section_id
            JOIN course_path cp ON cp.id = cps.course_path_id
            WHERE ce.clerk_id = auth.uid()::text
            AND ce.course_id = cp.course_id
        )
        OR
        -- Allow admins and moderators to manage all progress
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Policy: Users can only view enrollments for courses they're enrolled in
-- OR if they're admin/moderator
CREATE POLICY "Users can view own enrollments" ON course_enrollments
    FOR SELECT USING (
        clerk_id = auth.uid()::text
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Policy: Users can only manage their own enrollments
-- OR if they're admin/moderator
CREATE POLICY "Users can manage own enrollments" ON course_enrollments
    FOR ALL USING (
        clerk_id = auth.uid()::text
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- =====================================================
-- 3. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to check if user can access a specific course
CREATE OR REPLACE FUNCTION can_access_course(course_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM course_enrollments ce
        JOIN users u ON u.clerk_id = ce.clerk_id
        WHERE ce.course_id = course_id_param
        AND ce.clerk_id = auth.uid()::text
        AND (u.is_premium = true OR u.role = 'beta' OR EXISTS (
            SELECT 1 FROM courses c 
            WHERE c.id = course_id_param 
            AND c.is_premium_course = false
        ))
    )
    OR
    EXISTS (
        SELECT 1 FROM users 
        WHERE clerk_id = auth.uid()::text 
        AND role IN ('admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is premium (including beta)
CREATE OR REPLACE FUNCTION is_premium_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE clerk_id = auth.uid()::text 
        AND (is_premium = true OR role = 'beta')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. VERIFY THE POLICIES
-- =====================================================

-- Check that all policies were created successfully
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('content_item', 'content_block', 'course_path_sections', 'course_enrollments', 'course_path_section_progress')
ORDER BY tablename, policyname;

-- Check that helper functions were created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('can_access_course', 'is_premium_user');

-- =====================================================
-- 5. TEST THE BETA ROLE SYSTEM
-- =====================================================

-- Test: Check if a user with beta role would be considered premium
-- (This is a test query - replace 'test_user_id' with an actual clerk_id)
/*
SELECT 
    clerk_id,
    is_premium,
    role,
    CASE 
        WHEN is_premium = true OR role = 'beta' THEN 'Has Premium Access'
        ELSE 'No Premium Access'
    END as access_status
FROM users 
WHERE clerk_id = 'test_user_id';
*/

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

-- If you see this message, the policies have been applied successfully!
SELECT 'Beta role premium access policies applied successfully!' as status;
