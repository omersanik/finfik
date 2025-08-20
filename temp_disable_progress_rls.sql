-- Temporarily disable RLS on course_path_section_progress table to test
ALTER TABLE course_path_section_progress DISABLE ROW LEVEL SECURITY;

-- Check if RLS is disabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'course_path_section_progress';
