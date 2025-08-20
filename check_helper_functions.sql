-- Check if there are any helper functions that might be causing the "role 'admin' does not exist" error
-- These functions might be referenced in policies or triggers

-- List all functions in the public schema
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- Check if there are any functions with 'admin' or 'role' in their names
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname LIKE '%admin%' OR proname LIKE '%role%'
ORDER BY proname;

-- Check if there are any triggers that might be causing this
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgname LIKE '%admin%' OR tgname LIKE '%role%';

-- Check if there are any RLS policies that reference functions
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE qual LIKE '%(' OR qual LIKE '%)'
ORDER BY tablename, policyname;
