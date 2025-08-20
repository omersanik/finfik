-- =====================================================
-- DEBUG USERS TABLE AND RLS POLICIES
-- =====================================================
-- Run this to debug the users table issue

-- 1. Check if RLS is enabled on users table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- 2. List all policies on users table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- 3. Check users table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Check if there are any users with your clerk_id
SELECT id, clerk_id, is_premium, role, created_at
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

-- 5. Check total count of users
SELECT COUNT(*) as total_users FROM users;

-- 6. Check sample of users table data
SELECT id, clerk_id, is_premium, role, created_at
FROM users 
LIMIT 5;

-- 7. Test the RLS policy manually (this should work)
-- First, check if you're authenticated
SELECT auth.uid() as current_user_id;

-- 8. Check if the policy is working
-- This should return your user if the policy is working
SELECT id, clerk_id, is_premium, role
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

-- 9. If the above fails, check for any constraint violations
-- Look for any triggers or functions that might be causing issues
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 10. Check for any custom functions that might be interfering
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user%';
