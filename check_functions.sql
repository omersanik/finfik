-- Check for helper functions that might be causing the role 'admin' does not exist error
SELECT proname as function_name, prosrc as function_source FROM pg_proc WHERE prosrc LIKE '%admin%' OR prosrc LIKE '%role%';
