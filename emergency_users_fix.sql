-- EMERGENCY FIX: Remove ALL policies from users table to stop infinite recursion
-- This will completely reset the users table policies

-- Drop ALL existing policies on users table
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_delete_admin" ON users;
DROP POLICY IF EXISTS "users_allow_all" ON users;

-- Drop any other policies that might exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Admin can update all users" ON users;
DROP POLICY IF EXISTS "Admin can delete all users" ON users;

-- Create ONLY ONE simple policy that allows everything
CREATE POLICY "users_emergency_fix" ON users FOR ALL USING (true);

-- Verify only one policy exists
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
