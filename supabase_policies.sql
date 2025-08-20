-- =====================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- This file contains comprehensive RLS policies for all tables
-- Enable RLS on all tables first, then apply policies

-- =====================================================
-- 1. USERS TABLE POLICIES
-- =====================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = clerk_id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Users can insert their own data (for new registrations)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = clerk_id);

-- Users can delete their own data
CREATE POLICY "Users can delete own profile" ON users
    FOR DELETE USING (auth.uid()::text = clerk_id);

-- =====================================================
-- 2. COURSES TABLE POLICIES
-- =====================================================

-- Enable RLS on courses table
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses" ON courses
    FOR SELECT USING (true);

-- Only admins can create courses
CREATE POLICY "Only admins can create courses" ON courses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can update courses
CREATE POLICY "Only admins can update courses" ON courses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can delete courses
CREATE POLICY "Only admins can delete courses" ON courses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- =====================================================
-- 3. COURSE_PATH TABLE POLICIES
-- =====================================================

-- Enable RLS on course_path table
ALTER TABLE course_path ENABLE ROW LEVEL SECURITY;

-- Anyone can view course paths
CREATE POLICY "Anyone can view course paths" ON course_path
    FOR SELECT USING (true);

-- Only admins can create course paths
CREATE POLICY "Only admins can create course paths" ON course_path
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can update course paths
CREATE POLICY "Only admins can update course paths" ON course_path
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can delete course paths
CREATE POLICY "Only admins can delete course paths" ON course_path
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- =====================================================
-- 4. COURSE_PATH_SECTIONS TABLE POLICIES
-- =====================================================

-- Enable RLS on course_path_sections table
ALTER TABLE course_path_sections ENABLE ROW LEVEL SECURITY;

-- Anyone can view course path sections
CREATE POLICY "Anyone can view course path sections" ON course_path_sections
    FOR SELECT USING (true);

-- Only admins can create course path sections
CREATE POLICY "Only admins can create course path sections" ON course_path_sections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can update course path sections
CREATE POLICY "Only admins can update course path sections" ON course_path_sections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can delete course path sections
CREATE POLICY "Only admins can delete course path sections" ON course_path_sections
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- =====================================================
-- 5. COURSE_ENROLLMENTS TABLE POLICIES
-- =====================================================

-- Enable RLS on course_enrollments table
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" ON course_enrollments
    FOR SELECT USING (clerk_id = auth.uid()::text);

-- Users can create their own enrollments
CREATE POLICY "Users can create own enrollments" ON course_enrollments
    FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);

-- Users can update their own enrollments
CREATE POLICY "Users can update own enrollments" ON course_enrollments
    FOR UPDATE USING (clerk_id = auth.uid()::text);

-- Users can delete their own enrollments
CREATE POLICY "Users can delete own enrollments" ON course_enrollments
    FOR DELETE USING (clerk_id = auth.uid()::text);

-- Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments" ON course_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- =====================================================
-- 6. COURSE_PATH_SECTION_PROGRESS TABLE POLICIES
-- =====================================================

-- Enable RLS on course_path_section_progress table
ALTER TABLE course_path_section_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own progress" ON course_path_section_progress
    FOR SELECT USING (clerk_id = auth.uid()::text);

-- Users can create their own progress records
CREATE POLICY "Users can create own progress" ON course_path_section_progress
    FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON course_path_section_progress
    FOR UPDATE USING (clerk_id = auth.uid()::text);

-- Users can delete their own progress
CREATE POLICY "Users can delete own progress" ON course_path_section_progress
    FOR DELETE USING (clerk_id = auth.uid()::text);

-- Admins can view all progress
CREATE POLICY "Admins can view all progress" ON course_path_section_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- =====================================================
-- 7. CONTENT_BLOCK TABLE POLICIES
-- =====================================================

-- Enable RLS on content_block table
ALTER TABLE content_block ENABLE ROW LEVEL SECURITY;

-- Anyone can view content blocks
CREATE POLICY "Anyone can view content blocks" ON content_block
    FOR SELECT USING (true);

-- Only admins can create content blocks
CREATE POLICY "Only admins can create content blocks" ON content_block
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can update content blocks
CREATE POLICY "Only admins can update content blocks" ON content_block
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can delete content blocks
CREATE POLICY "Only admins can delete content blocks" ON content_block
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- =====================================================
-- 8. CONTENT_ITEM TABLE POLICIES
-- =====================================================

-- Enable RLS on content_item table
ALTER TABLE content_item ENABLE ROW LEVEL SECURITY;

-- Anyone can view content items
CREATE POLICY "Anyone can view content items" ON content_item
    FOR SELECT USING (true);

-- Only admins can create content items
CREATE POLICY "Only admins can create content items" ON content_item
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can update content items
CREATE POLICY "Only admins can update content items" ON content_item
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can delete content items
CREATE POLICY "Only admins can delete content items" ON content_item
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- =====================================================
-- 9. THUMBNAILS TABLE POLICIES
-- =====================================================

-- Enable RLS on thumbnails table
ALTER TABLE thumbnails ENABLE ROW LEVEL SECURITY;

-- Anyone can view thumbnails
CREATE POLICY "Anyone can view thumbnails" ON thumbnails
    FOR SELECT USING (true);

-- Only admins can create thumbnails
CREATE POLICY "Only admins can create thumbnails" ON thumbnails
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can update thumbnails
CREATE POLICY "Only admins can update thumbnails" ON thumbnails
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can delete thumbnails
CREATE POLICY "Only admins can delete thumbnails" ON thumbnails
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- =====================================================
-- 10. USER_STREAKS TABLE POLICIES
-- =====================================================

-- Enable RLS on user_streaks table
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Users can view their own streaks
CREATE POLICY "Users can view own streaks" ON user_streaks
    FOR SELECT USING (clerk_id = auth.uid()::text);

-- Users can create their own streaks
CREATE POLICY "Users can create own streaks" ON user_streaks
    FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);

-- Users can update their own streaks
CREATE POLICY "Users can update own streaks" ON user_streaks
    FOR UPDATE USING (clerk_id = auth.uid()::text);

-- Users can delete their own streaks
CREATE POLICY "Users can delete own streaks" ON user_streaks
    FOR DELETE USING (clerk_id = auth.uid()::text);

-- Admins can view all streaks
CREATE POLICY "Admins can view all streaks" ON user_streaks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- =====================================================
-- 11. SECTIONS TABLE POLICIES (if different from course_path_sections)
-- =====================================================

-- Enable RLS on sections table (if it exists separately)
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Anyone can view sections
CREATE POLICY "Anyone can view sections" ON sections
    FOR SELECT USING (true);

-- Only admins can create sections
CREATE POLICY "Only admins can create sections" ON sections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can update sections
CREATE POLICY "Only admins can update sections" ON sections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can delete sections
CREATE POLICY "Only admins can delete sections" ON sections
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- =====================================================
-- HELPER FUNCTION FOR ADMIN CHECK
-- =====================================================

-- Create a helper function to check if user is admin or moderator
CREATE OR REPLACE FUNCTION is_admin_or_moderator()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE clerk_id = auth.uid()::text 
        AND role IN ('admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a helper function to check if user is admin only
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE clerk_id = auth.uid()::text 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant necessary permissions to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant sequence usage for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- NOTES AND RECOMMENDATIONS
-- =====================================================

/*
IMPORTANT NOTES:

1. These policies assume you have a 'role' column in your users table with values:
   - 'user' (regular users)
   - 'moderator' (can create/edit content, cannot delete)
   - 'admin' (full access including delete operations)

2. The policies use auth.uid()::text to match with your clerk_id field.
   This assumes you're using Supabase Auth with Clerk integration.

3. Some tables like 'courses', 'course_path', 'course_path_sections', 'content_block', 
   and 'content_item' are set to allow public read access but restricted write access to admins/moderators only.

4. User-specific tables like 'course_enrollments', 'course_path_section_progress', 
   and 'user_streaks' only allow users to access their own data.

5. You may need to adjust these policies based on your specific business logic:
   - Premium course access restrictions
   - Course enrollment requirements
   - Content visibility based on user progress

6. Test these policies thoroughly in your development environment before applying to production.

7. Consider adding more granular policies if you need different access levels for different user roles.
*/
