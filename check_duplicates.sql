-- Check for duplicate user records
SELECT 
    clerk_id,
    COUNT(*) as record_count,
    STRING_AGG(role, ', ') as all_roles,
    STRING_AGG(id::text, ', ') as all_ids
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu'
GROUP BY clerk_id;

-- Show all records for this user
SELECT 
    id,
    clerk_id,
    email,
    role,
    is_premium,
    created_at,
    updated_at
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu'
ORDER BY created_at;
