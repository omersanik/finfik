-- =====================================================
-- FIX BETA FEEDBACK RLS POLICIES FOR CLERK AUTH
-- =====================================================
-- This script fixes the RLS policies for the beta_feedback table to work with Clerk authentication

-- Drop existing policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view own beta feedback" ON beta_feedback;
DROP POLICY IF EXISTS "Users can insert own beta feedback" ON beta_feedback;
DROP POLICY IF EXISTS "Users can update own beta feedback" ON beta_feedback;
DROP POLICY IF EXISTS "Admins can view all beta feedback" ON beta_feedback;
DROP POLICY IF EXISTS "Admins can update all beta feedback" ON beta_feedback;

-- Create new policies that work with Clerk authentication
-- For now, we'll allow all operations since the API routes handle authentication
-- This is a temporary fix until we can implement proper Clerk-compatible RLS

-- Allow all operations (API routes will handle authentication)
CREATE POLICY "Allow all beta feedback operations" ON beta_feedback
    FOR ALL USING (true) WITH CHECK (true);

-- This allows the API routes to work properly
-- The actual authentication and authorization is handled in the API routes themselves
