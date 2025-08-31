-- Create a simple trigger to prevent role changes for your user
CREATE OR REPLACE FUNCTION prevent_role_change_for_problem_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only protect the specific problematic user
  IF NEW.clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu' THEN
    -- If someone tries to change the role from 'premium', prevent it
    IF OLD.role = 'premium' AND NEW.role != 'premium' THEN
      RAISE NOTICE 'BLOCKED: Attempt to change role from % to % for user %', OLD.role, NEW.role, NEW.clerk_id;
      -- Keep the old role value
      NEW.role = OLD.role;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS protect_user_role ON users;
CREATE TRIGGER protect_user_role
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_change_for_problem_user();

-- Also fix your role right now
UPDATE users 
SET role = 'premium' 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

SELECT 'User role protection enabled!' as status;
