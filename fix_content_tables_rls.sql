-- Fix RLS policies for content tables that are missing policies
-- This will allow admins to create/edit content while maintaining security

-- 1. Enable RLS on content tables
ALTER TABLE content_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_block ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies (if any)
DROP POLICY IF EXISTS "content_item_select_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_insert_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_update_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_delete_policy" ON content_item;

DROP POLICY IF EXISTS "content_block_select_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_insert_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_update_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_delete_policy" ON content_block;

-- 3. Create content_item policies
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

-- 4. Create content_block policies
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

-- 5. Verify the policies are created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('content_item', 'content_block')
ORDER BY tablename, policyname;
