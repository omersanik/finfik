-- Step 1: Create a function to get the current user's Clerk ID from JWT
CREATE OR REPLACE FUNCTION public.clerk_user_id() 
RETURNS text 
LANGUAGE sql 
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'email')
  );
$$;

-- Step 2: Create a function to get the current user's role from JWT
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

-- Step 3: Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policy for users table
DROP POLICY IF EXISTS "Users can view own record" ON users;
CREATE POLICY "Users can view own record" ON users
  FOR SELECT 
  USING (clerk_id = public.clerk_user_id());

-- Step 5: Create policy for beta users to access their own data
DROP POLICY IF EXISTS "Beta users can access their data" ON users;
CREATE POLICY "Beta users can access their data" ON users
  FOR ALL 
  USING (
    clerk_id = public.clerk_user_id() 
    AND (role = 'beta' OR role = 'admin')
  );

-- Step 6: Enable RLS on other important tables and create policies

-- Course enrollments
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
CREATE POLICY "Users can view own enrollments" ON course_enrollments
  FOR SELECT 
  USING (clerk_id = public.clerk_user_id());

DROP POLICY IF EXISTS "Users can insert own enrollments" ON course_enrollments;
CREATE POLICY "Users can insert own enrollments" ON course_enrollments
  FOR INSERT 
  WITH CHECK (clerk_id = public.clerk_user_id());

DROP POLICY IF EXISTS "Users can update own enrollments" ON course_enrollments;
CREATE POLICY "Users can update own enrollments" ON course_enrollments
  FOR UPDATE 
  USING (clerk_id = public.clerk_user_id());

-- Course path section progress
ALTER TABLE course_path_section_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON course_path_section_progress;
CREATE POLICY "Users can view own progress" ON course_path_section_progress
  FOR SELECT 
  USING (clerk_id = public.clerk_user_id());

DROP POLICY IF EXISTS "Users can insert own progress" ON course_path_section_progress;
CREATE POLICY "Users can insert own progress" ON course_path_section_progress
  FOR INSERT 
  WITH CHECK (clerk_id = public.clerk_user_id());

DROP POLICY IF EXISTS "Users can update own progress" ON course_path_section_progress;
CREATE POLICY "Users can update own progress" ON course_path_section_progress
  FOR UPDATE 
  USING (clerk_id = public.clerk_user_id());

-- Courses table (read-only for all authenticated users)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view courses" ON courses;
CREATE POLICY "Authenticated users can view courses" ON courses
  FOR SELECT 
  USING (public.clerk_user_id() IS NOT NULL);

-- Course paths (read-only for all authenticated users)
ALTER TABLE course_path ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view course paths" ON course_path;
CREATE POLICY "Authenticated users can view course paths" ON course_path
  FOR SELECT 
  USING (public.clerk_user_id() IS NOT NULL);

-- Course path sections (read-only for all authenticated users)
ALTER TABLE course_path_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view course path sections" ON course_path_sections;
CREATE POLICY "Authenticated users can view course path sections" ON course_path_sections
  FOR SELECT 
  USING (public.clerk_user_id() IS NOT NULL);

-- Content blocks (read-only for all authenticated users)
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view content blocks" ON content_blocks;
CREATE POLICY "Authenticated users can view content blocks" ON content_blocks
  FOR SELECT 
  USING (public.clerk_user_id() IS NOT NULL);

-- Content items (read-only for all authenticated users)
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view content items" ON content_items;
CREATE POLICY "Authenticated users can view content items" ON content_items
  FOR SELECT 
  USING (public.clerk_user_id() IS NOT NULL);

-- Beta feedback table
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Beta users can insert feedback" ON beta_feedback;
CREATE POLICY "Beta users can insert feedback" ON beta_feedback
  FOR INSERT 
  WITH CHECK (
    public.clerk_user_role() = 'beta' 
    OR public.clerk_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Beta users can view own feedback" ON beta_feedback;
CREATE POLICY "Beta users can view own feedback" ON beta_feedback
  FOR SELECT 
  USING (
    clerk_id = public.clerk_user_id() 
    AND (public.clerk_user_role() = 'beta' OR public.clerk_user_role() = 'admin')
  );
