-- Fix the specific user's role back to premium
-- This should be run manually in the database admin panel, not exposed as an API

UPDATE users 
SET role = 'premium' 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu' 
  AND is_premium = true;

-- Verify the fix
SELECT clerk_id, email, role, is_premium, subscription_plan 
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';
