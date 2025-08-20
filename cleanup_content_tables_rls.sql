-- Clean up all conflicting and duplicate RLS policies on content tables
-- Remove policies that use auth.uid() and keep only clean ones

-- 1. Drop ALL existing policies on content_block table
DROP POLICY IF EXISTS "Users can view blocks for enrolled or free courses" ON content_block;
DROP POLICY IF EXISTS "content_block_delete_admin" ON content_block;
DROP POLICY IF EXISTS "content_block_delete_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_insert_admin" ON content_block;
DROP POLICY IF EXISTS "content_block_insert_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_read_public" ON content_block;
DROP POLICY IF EXISTS "content_block_select_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_update_admin" ON content_block;
DROP POLICY IF EXISTS "content_block_update_policy" ON content_block;

-- 2. Drop ALL existing policies on content_item table
DROP POLICY IF EXISTS "Premium content access control" ON content_item;
DROP POLICY IF EXISTS "Users can view content for enrolled or free courses" ON content_item;
DROP POLICY IF EXISTS "content_item_delete_admin" ON content_item;
DROP POLICY IF EXISTS "content_item_delete_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_insert_admin" ON content_item;
DROP POLICY IF EXISTS "content_item_insert_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_read_public" ON content_item;
DROP POLICY IF EXISTS "content_item_select_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_update_admin" ON content_item;
DROP POLICY IF EXISTS "content_item_update_policy" ON content_item;

-- 3. Create clean, simple policies for content_block
-- Anyone can view content blocks (for course display)
CREATE POLICY "content_block_select_policy" ON content_block
FOR SELECT USING (true);

-- Only admins can create/edit/delete content blocks
CREATE POLICY "content_block_insert_policy" ON content_block
FOR INSERT WITH CHECK (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

CREATE POLICY "content_block_update_policy" ON content_block
FOR UPDATE USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

CREATE POLICY "content_block_delete_policy" ON content_block
FOR DELETE USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

-- 4. Create clean, simple policies for content_item
-- Anyone can view content items (for course display)
CREATE POLICY "content_item_select_policy" ON content_item
FOR SELECT USING (true);

-- Only admins can create/edit/delete content items
CREATE POLICY "content_item_insert_policy" ON content_item
FOR INSERT WITH CHECK (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

CREATE POLICY "content_item_update_policy" ON content_item
FOR UPDATE USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

CREATE POLICY "content_item_delete_policy" ON content_item
FOR DELETE USING (
  (auth.jwt()->>'role')::text IN ('admin', 'moderator')
);

-- 5. Verify the clean policies are created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('content_item', 'content_block')
ORDER BY tablename, policyname;
