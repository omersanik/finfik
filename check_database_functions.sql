-- Check for any database functions that might be causing the "role 'admin' does not exist" error
-- Run this in your Supabase SQL editor

-- List all functions in the public schema
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- Check if there are any functions with 'admin' or 'role' in their source code
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%admin%' OR prosrc LIKE '%role%'
ORDER BY proname;

-- Check if there are any triggers that might be causing this
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name
FROM pg_trigger;

-- Check if there are any views that might be causing this
SELECT 
  viewname,
  definition
FROM pg_views 
WHERE definition LIKE '%admin%' OR definition LIKE '%role%';
