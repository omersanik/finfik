-- SQL script to add debugging for user updates
-- This will help us track what's changing your role

-- Create a table to log all updates to your user record
CREATE TABLE IF NOT EXISTS user_update_log (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  old_role TEXT,
  new_role TEXT,
  old_is_premium BOOLEAN,
  new_is_premium BOOLEAN,
  updated_at TIMESTAMP DEFAULT NOW(),
  context TEXT
);

-- Create a trigger function to log changes
CREATE OR REPLACE FUNCTION log_user_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log for the specific problematic user
  IF NEW.clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu' THEN
    INSERT INTO user_update_log (
      user_id,
      old_role,
      new_role,
      old_is_premium,
      new_is_premium,
      context
    ) VALUES (
      NEW.clerk_id,
      OLD.role,
      NEW.role,
      OLD.is_premium,
      NEW.is_premium,
      'Database trigger logged change'
    );
    
    -- Log to console as well
    RAISE NOTICE 'USER UPDATE DETECTED: % role changed from % to %, is_premium from % to %', 
      NEW.clerk_id, OLD.role, NEW.role, OLD.is_premium, NEW.is_premium;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS track_user_updates ON users;
CREATE TRIGGER track_user_updates
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_updates();

-- Check current state
SELECT 'Current user state:' as info;
SELECT clerk_id, role, is_premium, updated_at 
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

-- Clear any existing logs for fresh start
DELETE FROM user_update_log WHERE user_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

SELECT 'Database logging is now active for user updates!' as status;
