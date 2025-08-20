-- Find ALL policies that might be using role "admin" anywhere in the database
-- This will help us locate the remaining problematic policies

-- Search for any policy that mentions 'admin' in the qual column
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE qual LIKE '%admin%' OR qual LIKE '%role%'
ORDER BY tablename, policyname;

-- Also check for any policies that use auth.jwt() ->> 'role'
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE qual LIKE '%auth.jwt%' AND qual LIKE '%role%'
ORDER BY tablename, policyname;

-- Check all tables to see which ones have RLS enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- List ALL policies in the database to see what we're dealing with
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
ORDER BY tablename, policyname;
