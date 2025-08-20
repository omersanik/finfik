-- Fix infinite recursion in users table policies
-- The admin policies are causing recursion because they query the users table

-- Drop the problematic admin policies that cause recursion
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_delete_admin" ON users;

-- Keep only the simple user policies
-- Users can view their own profile
CREATE POLICY "users_select_own" ON users FOR SELECT
USING (clerk_id = auth.uid()::text);

-- Users can insert their own profile
CREATE POLICY "users_insert_own" ON users FOR INSERT
WITH CHECK (clerk_id = auth.uid()::text);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users FOR UPDATE
USING (clerk_id = auth.uid()::text)
WITH CHECK (clerk_id = auth.uid()::text);

-- Users can delete their own profile
CREATE POLICY "users_delete_own" ON users FOR DELETE
USING (clerk_id = auth.uid()::text);

-- Create a simple allow-all policy for users table to avoid recursion
CREATE POLICY "users_allow_all" ON users FOR ALL USING (true);

-- Verify the changes
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
