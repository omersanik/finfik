-- =====================================================
-- FIX USERS TABLE RLS POLICIES
-- =====================================================
-- This fixes the UUID casting issue with clerk_id

-- First, drop the existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;

-- Recreate the policies with explicit text casting
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (clerk_id = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (clerk_id = auth.uid()::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "Users can delete own profile" ON users
    FOR DELETE USING (clerk_id = auth.uid()::text);

-- Test the policy
-- This should work now
SELECT id, clerk_id, is_premium, role
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';
