-- Check for any database functions or triggers that might be causing the "role 'admin' does not exist" error
-- Since RLS is disabled and the error persists, the issue must be elsewhere

-- 1. Check for any functions that contain 'admin' or 'role' in their source code
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%admin%' OR prosrc LIKE '%role%'
ORDER BY proname;

-- 2. Check for any functions that contain '::role' cast
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%::role%'
ORDER BY proname;

-- 3. Check for any triggers that might be causing this
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name
FROM pg_trigger;

-- 4. Check for any functions that are called by triggers
SELECT 
  t.tgname as trigger_name,
  t.tgrelid::regclass as table_name,
  p.proname as function_name,
  p.prosrc as function_source
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE p.prosrc LIKE '%admin%' OR p.prosrc LIKE '%role%';

-- 5. Check for any views that might be causing this
SELECT 
  viewname,
  definition
FROM pg_views 
WHERE definition LIKE '%admin%' OR definition LIKE '%role%';

-- 6. Check for any functions that contain 'auth.jwt()' 
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%auth.jwt%'
ORDER BY proname;

-- 7. List ALL functions in the public schema to see what we have
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- 8. Check if there are any functions that might be called automatically
-- Look for functions that might be triggered by database operations
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%users%' AND (prosrc LIKE '%role%' OR prosrc LIKE '%admin%')
ORDER BY proname;
