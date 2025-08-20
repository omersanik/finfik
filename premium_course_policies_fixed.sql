-- =====================================================
-- PREMIUM COURSE ACCESS POLICIES - CORRECTED
-- =====================================================
-- Additional policies for premium course restrictions
-- FIXED: Uses correct table structure (course_id instead of course_path_id)

-- =====================================================
-- PREMIUM COURSE CONTENT ACCESS POLICIES
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
        -- Allow admins to view all content
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
        -- Allow admins to view all blocks
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
        -- Allow admins to view all sections
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- =====================================================
-- PREMIUM COURSE ENROLLMENT POLICIES
-- =====================================================

-- Policy: Users can only enroll in courses if they're premium users
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
        -- Allow enrollment if user is premium
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.clerk_id = auth.uid()::text
            AND u.is_premium = true
        )
        OR
        -- Allow admins to create enrollments
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- =====================================================
-- PREMIUM CONTENT ACCESS POLICIES
-- =====================================================

-- Policy: Users can only access premium content if they're enrolled and premium
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
        -- Allow access to premium content if user is enrolled and premium
        EXISTS (
            SELECT 1 FROM course_enrollments ce
            JOIN content_block cb ON cb.id = content_item.block_id
            JOIN course_path_sections cps ON cps.id = cb.section_id
            JOIN course_path cp ON cp.id = cps.course_path_id
            JOIN courses c ON c.id = cp.course_id
            JOIN users u ON u.clerk_id = ce.clerk_id
            WHERE ce.clerk_id = auth.uid()::text
            AND ce.course_id = c.id
            AND u.is_premium = true
        )
        OR
        -- Allow admins to view all content
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- =====================================================
-- COURSE PROGRESS RESTRICTIONS
-- =====================================================

-- Policy: Users can only track progress for courses they're enrolled in
CREATE POLICY "Users can only track enrolled course progress" ON course_path_section_progress
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM course_enrollments ce
            JOIN course_path_sections cps ON cps.id = course_path_section_progress.course_path_section_id
            JOIN course_path cp ON cp.id = cps.course_path_id
            WHERE ce.clerk_id = auth.uid()::text
            AND ce.course_id = cp.course_id
        )
    );

-- Policy: Users can only update progress for courses they're enrolled in
CREATE POLICY "Users can only update enrolled course progress" ON course_path_section_progress
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM course_enrollments ce
            JOIN course_path_sections cps ON cps.id = course_path_section_progress.course_path_section_id
            JOIN course_path cp ON cp.id = cps.course_path_id
            WHERE ce.clerk_id = auth.uid()::text
            AND ce.course_id = cp.course_id
        )
    );

-- =====================================================
-- THUMBNAIL ACCESS POLICIES
-- =====================================================

-- NOTE: Thumbnails table policies removed as the table doesn't exist in your database
-- If you create a thumbnails table later, you can add policies here
-- For now, course thumbnails are stored in the courses.thumbnail_url field

-- =====================================================
-- HELPER FUNCTIONS FOR PREMIUM ACCESS
-- =====================================================

-- Function to check if user has access to a specific course
CREATE OR REPLACE FUNCTION user_has_course_access(course_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM course_enrollments ce
        JOIN users u ON u.clerk_id = ce.clerk_id
        WHERE ce.course_id = course_id_param
        AND ce.clerk_id = auth.uid()::text
        AND (u.is_premium = true OR EXISTS (
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

-- Function to check if user is premium
CREATE OR REPLACE FUNCTION is_premium_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE clerk_id = auth.uid()::text 
        AND is_premium = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- NOTES ON PREMIUM POLICIES
-- =====================================================

/*
PREMIUM COURSE ACCESS LOGIC:

1. Free courses: Anyone can view content, enroll, and track progress
2. Premium courses: Only premium users can enroll and access content
3. Content access: Users must be enrolled in the course to view content
4. Progress tracking: Only enrolled users can track their progress
5. Admin override: Admins can access all content regardless of enrollment/premium status

ENFORCEMENT:

- These policies work in conjunction with the base RLS policies
- They add an additional layer of security for premium content
- Users cannot bypass premium restrictions by directly querying tables
- All access is controlled at the database level

IMPORTANT FIXES:

- Changed course_enrollments.course_path_id to course_enrollments.course_id
- Updated all JOIN logic to use the correct table structure
- The course_enrollments table has: clerk_id, course_id, enrolled_at, last_accessed

TESTING:

- Test with free user accounts
- Test with premium user accounts  
- Test with admin accounts
- Test enrollment scenarios
- Test content access restrictions
- Test progress tracking permissions
*/
