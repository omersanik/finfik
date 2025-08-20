-- Find any helper functions that might be causing the "role 'admin' does not exist" error
-- Run this in your Supabase SQL editor

-- Check for any functions with 'admin' or 'role' in their names
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname LIKE '%admin%' OR proname LIKE '%role%'
ORDER BY proname;

-- Check for any functions that contain 'admin' or 'role' in their source code
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%admin%' OR prosrc LIKE '%role%'
ORDER BY proname;

-- Check for any functions that contain '::role' cast
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%::role%'
ORDER BY proname;

-- List all functions in the public schema to see what we have
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;
