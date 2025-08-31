-- =====================================================
-- FIX ADMIN ROLE PERMANENTLY
-- =====================================================
-- This script ensures your admin role stays protected

-- 1. Fix your role to admin right now
UPDATE users 
SET role = 'admin' 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

-- 2. Create a function to protect admin users from being changed to beta
CREATE OR REPLACE FUNCTION protect_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Protect specific admin user from role changes
  IF NEW.clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu' THEN
    -- If someone tries to change the role from 'admin', prevent it
    IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
      RAISE NOTICE 'BLOCKED: Attempt to change admin role from % to % for user %', OLD.role, NEW.role, NEW.clerk_id;
      -- Keep the admin role
      NEW.role = 'admin';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger to protect admin role
DROP TRIGGER IF EXISTS protect_admin_role ON users;
CREATE TRIGGER protect_admin_role
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION protect_admin_role();

-- 4. Verify the fix
SELECT 
  clerk_id, 
  email, 
  role, 
  is_premium,
  'Role should be admin' as note
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

-- Success message
SELECT 'Admin role protection enabled! Your role will stay as admin.' as status;
