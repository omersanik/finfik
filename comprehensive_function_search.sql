-- Comprehensive search for any database functions that might be causing the "role 'admin' does not exist" error
-- Run this in your Supabase SQL editor

-- 1. Check for any functions with 'admin' or 'role' in their names
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname LIKE '%admin%' OR proname LIKE '%role%'
ORDER BY proname;

-- 2. Check for any functions that contain 'admin' or 'role' in their source code
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%admin%' OR prosrc LIKE '%role%'
ORDER BY proname;

-- 3. Check for any functions that contain '::role' cast
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%::role%'
ORDER BY proname;

-- 4. Check for any functions that contain 'auth.jwt()' 
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%auth.jwt%'
ORDER BY proname;

-- 5. List ALL functions in the public schema to see what we have
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- 6. Check for any triggers that might be causing this
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name
FROM pg_trigger;

-- 7. Check for any views that might be causing this
SELECT 
  viewname,
  definition
FROM pg_views 
WHERE definition LIKE '%admin%' OR definition LIKE '%role%';
