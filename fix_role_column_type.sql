-- Fix the role column type issue that's causing the "role 'admin' does not exist" error
-- The problem is that the 'role' column has a custom type called 'role', which conflicts with PostgreSQL's role system

-- Option 1: Change the column type from 'role' to 'text' (RECOMMENDED)
-- This will fix the issue permanently

-- First, let's see what the current column type is
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Now let's change the column type from 'role' to 'text'
ALTER TABLE users ALTER COLUMN role TYPE text;

-- Verify the change
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Option 2: If you want to keep the custom type, you can escape the column name
-- But this requires changing all your queries to use quoted identifiers
-- Example: SELECT "role" FROM users WHERE "role" = 'admin';

-- Option 3: Drop the custom type if it's not needed elsewhere
-- DROP TYPE IF EXISTS role CASCADE;

-- Test if the issue is fixed
SELECT role FROM users LIMIT 1;
