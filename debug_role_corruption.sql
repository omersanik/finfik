-- =====================================================
-- CHECK DATABASE SCHEMA FOR ROLE DEFAULT VALUES
-- =====================================================

-- Check the users table schema and constraints
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for any check constraints on the role column
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%role%' OR check_clause LIKE '%role%';

-- Check for any triggers on the users table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- Check for any functions that might modify role
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (routine_definition LIKE '%role%' OR routine_definition LIKE '%beta%');

-- Check current user data
SELECT 
    clerk_id,
    email,
    role,
    is_premium,
    created_at,
    updated_at
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';
