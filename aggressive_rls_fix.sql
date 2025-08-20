-- =====================================================
-- AGGRESSIVE RLS FIX - COMPLETE RESET
-- =====================================================
-- This completely resets all RLS policies to fix the UUID casting issue

-- =====================================================
-- STEP 1: DISABLE RLS ON ALL TABLES
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

-- Users table
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- Courses table
DROP POLICY IF EXISTS "courses_select_policy" ON courses;
DROP POLICY IF EXISTS "courses_insert_policy" ON courses;
DROP POLICY IF EXISTS "courses_update_policy" ON courses;
DROP POLICY IF EXISTS "courses_delete_policy" ON courses;

-- Course path table
DROP POLICY IF EXISTS "course_path_select_policy" ON course_path;
DROP POLICY IF EXISTS "course_path_insert_policy" ON course_path;
DROP POLICY IF EXISTS "course_path_update_policy" ON course_path;
DROP POLICY IF EXISTS "course_path_delete_policy" ON course_path;

-- Course path sections table
DROP POLICY IF EXISTS "course_path_sections_select_policy" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_insert_policy" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_update_policy" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_delete_policy" ON course_path_sections;

-- Content block table
DROP POLICY IF EXISTS "content_block_select_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_insert_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_update_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_delete_policy" ON content_block;

-- Content item table
DROP POLICY IF EXISTS "content_item_select_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_insert_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_update_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_delete_policy" ON content_item;

-- Course enrollments table
DROP POLICY IF EXISTS "course_enrollments_select_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_insert_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_update_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_delete_policy" ON course_enrollments;

-- Course path section progress table
DROP POLICY IF EXISTS "course_path_section_progress_select_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_insert_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_update_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_delete_policy" ON course_path_section_progress;

-- User streaks table
DROP POLICY IF EXISTS "user_streaks_select_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_insert_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_update_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_delete_policy" ON user_streaks;

-- Drop any other policies that might exist
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Only admins can create courses" ON courses;
DROP POLICY IF EXISTS "Only admins can update courses" ON courses;
DROP POLICY IF EXISTS "Only admins can delete courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can create course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can update course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can delete course paths" ON course_path;
DROP POLICY IF EXISTS "Anyone can view course path sections" ON course_path_sections;
DROP POLICY IF EXISTS "Only admins can create course path sections" ON course_path_sections;
DROP POLICY IF EXISTS "Only admins can update course path sections" ON course_path_sections;
DROP POLICY IF EXISTS "Only admins can delete course path sections" ON course_path_sections;
DROP POLICY IF EXISTS "Anyone can view content blocks" ON content_block;
DROP POLICY IF EXISTS "Only admins can create content blocks" ON content_block;
DROP POLICY IF EXISTS "Only admins can update content blocks" ON content_block;
DROP POLICY IF EXISTS "Only admins can delete content blocks" ON content_block;
DROP POLICY IF EXISTS "Anyone can view content items" ON content_item;
DROP POLICY IF EXISTS "Only admins can create content items" ON content_item;
DROP POLICY IF EXISTS "Only admins can update content items" ON content_item;
DROP POLICY IF EXISTS "Only admins can delete content items" ON content_item;
DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can delete own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can view own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can create own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can view own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can create own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can delete own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Admins can view all streaks" ON user_streaks;

-- =====================================================
-- STEP 3: TEST WITHOUT RLS
-- =====================================================

-- Test if tables are accessible without RLS
SELECT 'Testing users table' as test, COUNT(*) as count FROM users WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

SELECT 'Testing course_path table' as test, COUNT(*) as count FROM course_path LIMIT 1;

SELECT 'Testing course_path_sections table' as test, COUNT(*) as count FROM course_path_sections LIMIT 1;

SELECT 'Testing courses table' as test, COUNT(*) as count FROM courses LIMIT 1;

-- Test the specific course path that's failing
SELECT 'Testing specific course path' as test, COUNT(*) as count FROM course_path WHERE course_id = 'fe0af818-8549-4997-9e9e-ee34602abbcd';
