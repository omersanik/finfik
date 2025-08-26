-- =====================================================
-- TEMPORARY RLS DISABLE FOR TESTING
-- =====================================================
-- This script temporarily disables RLS on the users table to test if RLS is blocking frontend access

-- Disable RLS on users table temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- This will allow all API routes to access user data without RLS restrictions
-- Run this in Supabase SQL editor to test if RLS is the issue

-- To re-enable later, run:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
