-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (clerk_id = auth.jwt() ->> 'sub');

-- Policy for users to update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (clerk_id = auth.jwt() ->> 'sub');

-- Policy for users to insert their own data (when signing up)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT
    WITH CHECK (clerk_id = auth.jwt() ->> 'sub');

-- Policy for users to delete their own data
CREATE POLICY "Users can delete own profile" ON users
    FOR DELETE
    USING (clerk_id = auth.jwt() ->> 'sub');

-- Optional: Policy for admin users to read all user data
-- Uncomment if you have admin role functionality
-- CREATE POLICY "Admins can view all users" ON users
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM users 
--             WHERE clerk_id = auth.jwt() ->> 'sub' 
--             AND role = 'admin'
--         )
--     );

-- Optional: Policy for admin users to update all user data
-- Uncomment if you have admin role functionality
-- CREATE POLICY "Admins can update all users" ON users
--     FOR UPDATE
--     USING (
--         EXISTS (
--             SELECT 1 FROM users 
--             WHERE clerk_id = auth.jwt() ->> 'sub' 
--             AND role = 'admin'
--         )
--     );

-- Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';
