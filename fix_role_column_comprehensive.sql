-- Comprehensive fix for the role column type issue
-- The problem is that the 'role' column has a custom type called 'role', which conflicts with PostgreSQL's role system
-- We need to drop dependent policies first, then change the column type, then recreate policies

-- Step 1: Find all policies that depend on the 'role' column
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE qual LIKE '%role%'
ORDER BY tablename, policyname;

-- Step 2: Drop all policies that depend on the 'role' column
-- This will allow us to change the column type

-- Drop policies on courses table
DROP POLICY IF EXISTS "courses_insert_admin" ON courses;
DROP POLICY IF EXISTS "courses_update_admin" ON courses;
DROP POLICY IF EXISTS "courses_delete_admin" ON courses;

-- Drop policies on course_path table  
DROP POLICY IF EXISTS "course_path_update_admin" ON course_path;
DROP POLICY IF EXISTS "course_path_delete_admin" ON course_path;

-- Drop policies on course_path_sections table
DROP POLICY IF EXISTS "course_path_sections_update_admin" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_delete_admin" ON course_path_sections;

-- Drop policies on content_block table
DROP POLICY IF EXISTS "content_block_update_admin" ON content_block;
DROP POLICY IF EXISTS "content_block_delete_admin" ON content_block;

-- Drop policies on content_item table
DROP POLICY IF EXISTS "content_item_update_admin" ON content_item;
DROP POLICY IF EXISTS "content_item_delete_admin" ON content_item;

-- Step 3: Now change the column type from 'role' to 'text'
ALTER TABLE users ALTER COLUMN role TYPE text;

-- Step 4: Verify the change
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Step 5: Test if the basic issue is fixed
SELECT role FROM users LIMIT 1;

-- Step 6: Recreate the admin policies using the new text column
-- These policies will now work correctly with the text column

-- Courses table admin policies
CREATE POLICY "courses_insert_admin" ON courses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "courses_update_admin" ON courses FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "courses_delete_admin" ON courses FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Course path table admin policies
CREATE POLICY "course_path_update_admin" ON course_path FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "course_path_delete_admin" ON course_path FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Course path sections table admin policies
CREATE POLICY "course_path_sections_update_admin" ON course_path_sections FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "course_path_sections_delete_admin" ON course_path_sections FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Content block table admin policies
CREATE POLICY "content_block_update_admin" ON content_block FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "content_block_delete_admin" ON content_block FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Content item table admin policies
CREATE POLICY "content_item_update_admin" ON content_item FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY "content_item_delete_admin" ON content_item FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.clerk_id = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- Step 7: Verify all policies are recreated
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('courses', 'course_path', 'course_path_sections', 'content_block', 'content_item')
ORDER BY tablename, policyname;
