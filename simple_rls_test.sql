-- Simple RLS setup for testing Clerk + Supabase integration

-- Step 1: Create helper functions in public schema
CREATE OR REPLACE FUNCTION public.clerk_user_id() 
RETURNS text 
LANGUAGE sql 
STABLE
AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'sub';
$$;

CREATE OR REPLACE FUNCTION public.clerk_user_role() 
RETURNS text 
LANGUAGE sql 
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'user'
  );
$$;

-- Step 2: Enable RLS on users table and create basic policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Beta users can access their data" ON users;

-- Create a simple policy for users to access their own data
CREATE POLICY "Users can access own data" ON users
  FOR ALL 
  USING (clerk_id = public.clerk_user_id());

-- Step 3: Test with courses table (read-only for authenticated users)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view courses" ON courses;
CREATE POLICY "Authenticated users can view courses" ON courses
  FOR SELECT 
  USING (public.clerk_user_id() IS NOT NULL);
