-- Find and drop ALL policies that depend on the 'role' column
-- This will allow us to change the column type from 'role' to 'text'

-- Step 1: Find ALL policies that contain 'role' in their definition
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE qual LIKE '%role%'
ORDER BY tablename, policyname;

-- Step 2: Drop ALL policies that depend on the 'role' column
-- We need to be thorough and drop every single one

-- Drop policies on courses table
DROP POLICY IF EXISTS "courses_insert_admin" ON courses;
DROP POLICY IF EXISTS "courses_update_admin" ON courses;
DROP POLICY IF EXISTS "courses_delete_admin" ON courses;

-- Drop policies on course_path table  
DROP POLICY IF EXISTS "course_path_insert_admin" ON course_path;
DROP POLICY IF EXISTS "course_path_update_admin" ON course_path;
DROP POLICY IF EXISTS "course_path_delete_admin" ON course_path;

-- Drop policies on course_path_sections table
DROP POLICY IF EXISTS "course_path_sections_insert_admin" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_update_admin" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_delete_admin" ON course_path_sections;

-- Drop policies on content_block table
DROP POLICY IF EXISTS "content_block_insert_admin" ON content_block;
DROP POLICY IF EXISTS "content_block_update_admin" ON content_block;
DROP POLICY IF EXISTS "content_block_delete_admin" ON content_block;

-- Drop policies on content_item table
DROP POLICY IF EXISTS "content_item_insert_admin" ON content_item;
DROP POLICY IF EXISTS "content_item_update_admin" ON content_item;
DROP POLICY IF EXISTS "content_item_delete_admin" ON content_item;

-- Drop any other policies that might contain 'role'
-- This is a catch-all for any policies we might have missed
DO $$
DECLARE
    policy_rec RECORD;
BEGIN
    FOR policy_rec IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE qual LIKE '%role%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "%s" ON %s.%s', 
                      policy_rec.policyname, 
                      policy_rec.schemaname, 
                      policy_rec.tablename);
        RAISE NOTICE 'Dropped policy % on %.%', policy_rec.policyname, policy_rec.schemaname, policy_rec.tablename;
    END LOOP;
END $$;

-- Step 3: Verify all role-dependent policies are gone
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE qual LIKE '%role%'
ORDER BY tablename, policyname;

-- Step 4: Now we should be able to change the column type
ALTER TABLE users ALTER COLUMN role TYPE text;

-- Step 5: Verify the change
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Step 6: Test if the basic issue is fixed
SELECT role FROM users LIMIT 1;
