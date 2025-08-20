-- Find any remaining policies that might still be causing the "role 'admin' does not exist" error
-- This will help us locate any policies we missed

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

-- Search for any policy that uses auth.jwt() ->> 'role'
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE qual LIKE '%auth.jwt%' AND qual LIKE '%role%'
ORDER BY tablename, policyname;

-- Search for any policy that uses ::role cast
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE qual LIKE '%::role%'
ORDER BY tablename, policyname;

-- Check if there are any functions or triggers that might be causing this
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%admin%' OR prosrc LIKE '%role%';

-- Check if there are any views that might be causing this
SELECT 
  viewname,
  definition
FROM pg_views 
WHERE definition LIKE '%admin%' OR definition LIKE '%role%';
