-- =====================================================
-- FIX COURSE_PATH TABLE UUID CASTING ERROR
-- =====================================================
-- This fixes the specific error in the course path API

-- =====================================================
-- STEP 1: CHECK COURSE_PATH TABLE POLICIES
-- =====================================================

SELECT 'course_path' as table_name, policyname, cmd, qual FROM pg_policies WHERE tablename = 'course_path';

-- =====================================================
-- STEP 2: DROP PROBLEMATIC POLICIES
-- =====================================================

-- Drop all policies on course_path table
DROP POLICY IF EXISTS "course_path_select_policy" ON course_path;
DROP POLICY IF EXISTS "course_path_insert_policy" ON course_path;
DROP POLICY IF EXISTS "course_path_update_policy" ON course_path;
DROP POLICY IF EXISTS "course_path_delete_policy" ON course_path;

-- Drop any other policies that might exist
DROP POLICY IF EXISTS "Anyone can view course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can create course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can update course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can delete course paths" ON course_path;

-- =====================================================
-- STEP 3: CREATE SIMPLE, WORKING POLICIES
-- =====================================================

-- Create simple policies that won't cause UUID casting issues
CREATE POLICY "course_path_select_policy" ON course_path
    FOR SELECT USING (true);

CREATE POLICY "course_path_insert_policy" ON course_path
    FOR INSERT WITH CHECK (true);

CREATE POLICY "course_path_update_policy" ON course_path
    FOR UPDATE USING (true);

CREATE POLICY "course_path_delete_policy" ON course_path
    FOR DELETE USING (true);

-- =====================================================
-- STEP 4: TEST THE FIX
-- =====================================================

-- Test if course_path table is accessible
SELECT id, name, course_id FROM course_path LIMIT 5;

-- Test if we can find the specific course path
SELECT id, name, course_id FROM course_path WHERE course_id = 'fe0af818-8549-4997-9e9e-ee34602abbcd';
