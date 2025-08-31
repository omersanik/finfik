-- Debug user records to see duplicates
SELECT 
  id,
  clerk_id,
  role,
  is_premium,
  subscription_plan,
  created_at,
  updated_at
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu'
ORDER BY updated_at DESC;
