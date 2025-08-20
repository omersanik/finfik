-- =====================================================
-- RLS RE-ENABLE (CLERK-COMPATIBLE, NO UUID CASTING)
-- =====================================================
-- Uses auth.jwt()->>'sub' (text) to match your text clerk_id
-- Keeps public reads for content tables; per-user tables restricted to owner/admins
-- Run this whole script in Supabase SQL editor

-- 0) Ensure RLS toggles are in a clean state
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_block DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_section_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks DISABLE ROW LEVEL SECURITY;

-- 1) Drop known/legacy/conflicting policies (safe if missing)
-- users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- courses
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Only admins can create courses" ON courses;
DROP POLICY IF EXISTS "Only admins can update courses" ON courses;
DROP POLICY IF EXISTS "Only admins can delete courses" ON courses;
DROP POLICY IF EXISTS "courses_select_policy" ON courses;
DROP POLICY IF EXISTS "courses_insert_policy" ON courses;
DROP POLICY IF EXISTS "courses_update_policy" ON courses;
DROP POLICY IF EXISTS "courses_delete_policy" ON courses;

-- course_path
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON course_path;
DROP POLICY IF EXISTS "Enable read access for all users" ON course_path;
DROP POLICY IF EXISTS "course_path_select_policy" ON course_path;
DROP POLICY IF EXISTS "course_path_insert_policy" ON course_path;
DROP POLICY IF EXISTS "course_path_update_policy" ON course_path;
DROP POLICY IF EXISTS "course_path_delete_policy" ON course_path;
DROP POLICY IF EXISTS "Only admins can create course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can update course paths" ON course_path;
DROP POLICY IF EXISTS "Only admins can delete course paths" ON course_path;

-- course_path_sections
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON course_path_sections;
DROP POLICY IF EXISTS "Enable read access for all users" ON course_path_sections;
DROP POLICY IF EXISTS "Users can view sections for enrolled or free courses" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_select_policy" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_insert_policy" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_update_policy" ON course_path_sections;
DROP POLICY IF EXISTS "course_path_sections_delete_policy" ON course_path_sections;

-- content_block
DROP POLICY IF EXISTS "Anyone can view content blocks" ON content_block;
DROP POLICY IF EXISTS "Only admins can create content blocks" ON content_block;
DROP POLICY IF EXISTS "Only admins can update content blocks" ON content_block;
DROP POLICY IF EXISTS "Only admins can delete content blocks" ON content_block;
DROP POLICY IF EXISTS "content_block_select_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_insert_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_update_policy" ON content_block;
DROP POLICY IF EXISTS "content_block_delete_policy" ON content_block;

-- content_item
DROP POLICY IF EXISTS "Anyone can view content items" ON content_item;
DROP POLICY IF EXISTS "Only admins can create content items" ON content_item;
DROP POLICY IF EXISTS "Only admins can update content items" ON content_item;
DROP POLICY IF EXISTS "Only admins can delete content items" ON content_item;
DROP POLICY IF EXISTS "content_item_select_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_insert_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_update_policy" ON content_item;
DROP POLICY IF EXISTS "content_item_delete_policy" ON content_item;

-- course_enrollments
DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_select_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_insert_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_update_policy" ON course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_delete_policy" ON course_enrollments;

-- course_path_section_progress
DROP POLICY IF EXISTS "Users can view own progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_select_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_insert_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_update_policy" ON course_path_section_progress;
DROP POLICY IF EXISTS "course_path_section_progress_delete_policy" ON course_path_section_progress;

-- user_streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Admins can view all streaks" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_select_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_insert_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_update_policy" ON user_streaks;
DROP POLICY IF EXISTS "user_streaks_delete_policy" ON user_streaks;

-- 2) Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_path ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_block ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_path_section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- 3) Create Clerk-compatible policies using auth.jwt()->>'sub' (TEXT)
-- Helper predicates inline to avoid UUID casts

-- USERS: self-only
CREATE POLICY users_select_self ON users
	FOR SELECT USING (clerk_id = (auth.jwt()->>'sub'));
CREATE POLICY users_insert_self ON users
	FOR INSERT WITH CHECK (clerk_id = (auth.jwt()->>'sub'));
CREATE POLICY users_update_self ON users
	FOR UPDATE USING (clerk_id = (auth.jwt()->>'sub'));
CREATE POLICY users_delete_self ON users
	FOR DELETE USING (clerk_id = (auth.jwt()->>'sub'));

-- COURSES: public read; admin/mod write (role stored on users table)
CREATE POLICY courses_read_public ON courses
	FOR SELECT USING (true);
CREATE POLICY courses_insert_admin ON courses
	FOR INSERT WITH CHECK (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY courses_update_admin ON courses
	FOR UPDATE USING (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY courses_delete_admin ON courses
	FOR DELETE USING (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role = 'admin'
		)
	);

-- COURSE_PATH: public read; admin/mod write
CREATE POLICY course_path_read_public ON course_path
	FOR SELECT USING (true);
CREATE POLICY course_path_insert_admin ON course_path
	FOR INSERT WITH CHECK (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY course_path_update_admin ON course_path
	FOR UPDATE USING (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY course_path_delete_admin ON course_path
	FOR DELETE USING (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role = 'admin'
		)
	);

-- COURSE_PATH_SECTIONS: public read; admin/mod write
CREATE POLICY course_path_sections_read_public ON course_path_sections
	FOR SELECT USING (true);
CREATE POLICY course_path_sections_insert_admin ON course_path_sections
	FOR INSERT WITH CHECK (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY course_path_sections_update_admin ON course_path_sections
	FOR UPDATE USING (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY course_path_sections_delete_admin ON course_path_sections
	FOR DELETE USING (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role = 'admin'
		)
	);

-- CONTENT_BLOCK: public read; admin/mod write
CREATE POLICY content_block_read_public ON content_block
	FOR SELECT USING (true);
CREATE POLICY content_block_insert_admin ON content_block
	FOR INSERT WITH CHECK (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY content_block_update_admin ON content_block
	FOR UPDATE USING (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY content_block_delete_admin ON content_block
	FOR DELETE USING (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role = 'admin'
		)
	);

-- CONTENT_ITEM: public read; admin/mod write
CREATE POLICY content_item_read_public ON content_item
	FOR SELECT USING (true);
CREATE POLICY content_item_insert_admin ON content_item
	FOR INSERT WITH CHECK (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY content_item_update_admin ON content_item
	FOR UPDATE USING (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY content_item_delete_admin ON content_item
	FOR DELETE USING (
		EXISTS (
			SELECT 1 FROM users u
			WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role = 'admin'
		)
	);

-- COURSE_ENROLLMENTS: owner or admin
CREATE POLICY course_enrollments_select_self_or_admin ON course_enrollments
	FOR SELECT USING (
		clerk_id = (auth.jwt()->>'sub') OR EXISTS (
			SELECT 1 FROM users u WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY course_enrollments_insert_self ON course_enrollments
	FOR INSERT WITH CHECK (clerk_id = (auth.jwt()->>'sub'));
CREATE POLICY course_enrollments_update_self ON course_enrollments
	FOR UPDATE USING (clerk_id = (auth.jwt()->>'sub'));
CREATE POLICY course_enrollments_delete_self ON course_enrollments
	FOR DELETE USING (clerk_id = (auth.jwt()->>'sub'));

-- COURSE_PATH_SECTION_PROGRESS: owner or admin
CREATE POLICY course_path_section_progress_select_self_or_admin ON course_path_section_progress
	FOR SELECT USING (
		clerk_id = (auth.jwt()->>'sub') OR EXISTS (
			SELECT 1 FROM users u WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY course_path_section_progress_insert_self ON course_path_section_progress
	FOR INSERT WITH CHECK (clerk_id = (auth.jwt()->>'sub'));
CREATE POLICY course_path_section_progress_update_self ON course_path_section_progress
	FOR UPDATE USING (clerk_id = (auth.jwt()->>'sub'));
CREATE POLICY course_path_section_progress_delete_self ON course_path_section_progress
	FOR DELETE USING (clerk_id = (auth.jwt()->>'sub'));

-- USER_STREAKS: owner or admin
CREATE POLICY user_streaks_select_self_or_admin ON user_streaks
	FOR SELECT USING (
		clerk_id = (auth.jwt()->>'sub') OR EXISTS (
			SELECT 1 FROM users u WHERE u.clerk_id = (auth.jwt()->>'sub') AND u.role IN ('admin','moderator')
		)
	);
CREATE POLICY user_streaks_insert_self ON user_streaks
	FOR INSERT WITH CHECK (clerk_id = (auth.jwt()->>'sub'));
CREATE POLICY user_streaks_update_self ON user_streaks
	FOR UPDATE USING (clerk_id = (auth.jwt()->>'sub'));
CREATE POLICY user_streaks_delete_self ON user_streaks
	FOR DELETE USING (clerk_id = (auth.jwt()->>'sub'));

-- 4) Smoke tests (optional)
-- SELECT id, clerk_id FROM users WHERE clerk_id = (auth.jwt()->>'sub');
-- SELECT id, title FROM courses LIMIT 5;
-- SELECT id, name FROM course_path LIMIT 5;
-- SELECT id, title FROM course_path_sections LIMIT 5;
