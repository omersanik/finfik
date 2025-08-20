-- =====================================================
-- DEBUG API ROUTE STEP BY STEP
-- =====================================================
-- This will help us identify exactly where the API route is failing

-- =====================================================
-- STEP 1: CHECK IF USER EXISTS AND IS ACCESSIBLE
-- =====================================================

-- Test if we can access the users table
SELECT 'Testing users table access' as test, COUNT(*) as count FROM users;

-- Test if we can find your specific user
SELECT 'Testing specific user access' as test, COUNT(*) as count 
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

-- Show your user record
SELECT id, clerk_id, is_premium, role 
FROM users 
WHERE clerk_id = 'user_2yC4fnyxPa4OG6ngfULhN1QchOu';

-- =====================================================
-- STEP 2: CHECK IF COURSE EXISTS AND IS ACCESSIBLE
-- =====================================================

-- Test if we can access the courses table
SELECT 'Testing courses table access' as test, COUNT(*) as count FROM courses;

-- Test if we can find the specific course
SELECT 'Testing specific course access' as test, COUNT(*) as count 
FROM courses 
WHERE slug = 'introduction-to-valutation';

-- Show the course record
SELECT id, title, slug, is_premium_course 
FROM courses 
WHERE slug = 'introduction-to-valutation';

-- =====================================================
-- STEP 3: CHECK IF COURSE_PATH EXISTS AND IS ACCESSIBLE
-- =====================================================

-- Test if we can access the course_path table
SELECT 'Testing course_path table access' as test, COUNT(*) as count FROM course_path;

-- Test if we can find the specific course path
SELECT 'Testing specific course_path access' as test, COUNT(*) as count 
FROM course_path 
WHERE course_id = 'fe0af818-8549-4997-9e9e-ee34602abbcd';

-- Show the course_path record
SELECT id, name, course_id 
FROM course_path 
WHERE course_id = 'fe0af818-8549-4997-9e9e-ee34602abbcd';

-- =====================================================
-- STEP 4: CHECK IF COURSE_PATH_SECTIONS EXISTS AND IS ACCESSIBLE
-- =====================================================

-- Test if we can access the course_path_sections table
SELECT 'Testing course_path_sections table access' as test, COUNT(*) as count FROM course_path_sections;

-- Test if we can find sections for the specific course path
SELECT 'Testing specific sections access' as test, COUNT(*) as count 
FROM course_path_sections 
WHERE course_path_id = '15ea0ae7-4909-4019-99dd-28b48ca70862';

-- Show the sections
SELECT id, title, course_path_id, "order" 
FROM course_path_sections 
WHERE course_path_id = '15ea0ae7-4909-4019-99dd-28b48ca70862'
ORDER BY "order";

-- =====================================================
-- STEP 5: TEST THE EXACT QUERY FROM THE API ROUTE
-- =====================================================

-- This is the exact query from your API route
SELECT 'Testing API route query' as test, COUNT(*) as count
FROM course_path
WHERE course_id = 'fe0af818-8549-4997-9e9e-ee34602abbcd';

-- Test the full join query that the API route uses
SELECT 'Testing full API query' as test, COUNT(*) as count
FROM course_path cp
JOIN courses c ON c.id = cp.course_id
WHERE c.slug = 'introduction-to-valutation';
