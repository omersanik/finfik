-- Fix content_item table RLS policies
-- The table has conflicting policies that might be causing update issues

-- First, check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'content_item';

-- Drop the conflicting policies
DROP POLICY IF EXISTS "content_item_allow_all" ON content_item;
DROP POLICY IF EXISTS "content_item_read_public" ON content_item;

-- Create a single, simple policy that allows all operations
CREATE POLICY "content_item_admin_access" ON content_item FOR ALL USING (true);

-- Verify the new policy
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'content_item'
ORDER BY policyname;
