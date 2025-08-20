-- Re-enable RLS on course_path_section_progress table
ALTER TABLE course_path_section_progress ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admins can manage all progress" ON course_path_section_progress;

-- Create proper RLS policies that avoid UUID casting issues

-- 1. Users can view their own progress records
CREATE POLICY "Users can view own progress" ON course_path_section_progress
FOR SELECT USING (
  clerk_id = auth.jwt()->>'sub'
);

-- 2. Users can update their own progress records
CREATE POLICY "Users can update own progress" ON course_path_section_progress
FOR UPDATE USING (
  clerk_id = auth.jwt()->>'sub'
) WITH CHECK (
  clerk_id = auth.jwt()->>'sub'
);

-- 3. Users can insert their own progress records
CREATE POLICY "Users can insert own progress" ON course_path_section_progress
FOR INSERT WITH CHECK (
  clerk_id = auth.jwt()->>'sub'
);

-- 4. Admins and moderators can view all progress records
CREATE POLICY "Admins can view all progress" ON course_path_section_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.clerk_id = auth.jwt()->>'sub' 
    AND users.role IN ('admin', 'moderator')
  )
);

-- 5. Admins and moderators can manage all progress records
CREATE POLICY "Admins can manage all progress" ON course_path_section_progress
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.clerk_id = auth.jwt()->>'sub' 
    AND users.role IN ('admin', 'moderator')
  )
);

-- Verify the policies are created
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'course_path_section_progress'
ORDER BY policyname;
