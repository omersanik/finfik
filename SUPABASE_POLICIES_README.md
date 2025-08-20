# Supabase Row Level Security (RLS) Policies

This repository contains comprehensive Row Level Security policies for your Supabase database tables. These policies ensure that users can only access data they're authorized to see.

## 📁 Files

- **`supabase_policies.sql`** - Base RLS policies for all tables
- **`premium_course_policies.sql`** - Premium course access restrictions
- **`SUPABASE_POLICIES_README.md`** - This documentation file

## 🚀 Quick Start

### 1. Apply Base Policies

Run the base policies first in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase_policies.sql
-- This will enable RLS and create basic access policies
```

### 2. Apply Premium Policies (Optional)

If you want premium course restrictions, run the premium policies:

```sql
-- Copy and paste the contents of premium_course_policies.sql
-- This adds premium course access controls
```

## 🔐 What These Policies Do

### Base Security (All Tables)
- **Users table**: Users can only access their own profile data
- **Courses table**: Public read access, admin-only write access
- **Content tables**: Public read access, admin-only write access
- **Progress tables**: Users can only access their own progress data
- **Enrollment tables**: Users can only access their own enrollments

### Premium Course Restrictions
- **Free courses**: Anyone can view and enroll
- **Premium courses**: Only premium users can enroll and access content
- **Content access**: Users must be enrolled to view course content
- **Progress tracking**: Only enrolled users can track progress

## 🏗️ Table Structure Assumptions

These policies assume your tables have the following structure:

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  subscription_id TEXT,
  subscription_plan TEXT
)
```

### Courses Table
```sql
courses (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  thumbnail_url TEXT,
  is_premium_course BOOLEAN DEFAULT false,
  coming_soon BOOLEAN DEFAULT false,
  course_level TEXT
)
```

### Course Structure Tables
```sql
course_path (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  name TEXT NOT NULL
)

course_path_sections (
  id UUID PRIMARY KEY,
  course_path_id UUID REFERENCES course_path(id),
  title TEXT NOT NULL,
  description TEXT,
  lessons INTEGER,
  order INTEGER,
  slug TEXT
)

content_block (
  id UUID PRIMARY KEY,
  section_id UUID REFERENCES course_path_sections(id),
  title TEXT,
  order_index INTEGER
)

content_item (
  id UUID PRIMARY KEY,
  block_id UUID REFERENCES content_block(id),
  type TEXT,
  content_text TEXT,
  image_url TEXT,
  quiz_data JSONB,
  -- ... other content fields
)
```

### User Progress Tables
```sql
course_enrollments (
  id UUID PRIMARY KEY,
  clerk_id TEXT REFERENCES users(clerk_id),
  course_id UUID REFERENCES courses(id),
  course_path_id UUID REFERENCES course_path(id),
  enrolled_at TIMESTAMP DEFAULT NOW()
)

course_path_section_progress (
  id UUID PRIMARY KEY,
  clerk_id TEXT REFERENCES users(clerk_id),
  course_path_section_id UUID REFERENCES course_path_sections(id),
  completed BOOLEAN DEFAULT false,
  unlocked BOOLEAN DEFAULT false,
  completed_at DATE,
  updated_at TIMESTAMP
)

user_streaks (
  id UUID PRIMARY KEY,
  clerk_id TEXT REFERENCES users(clerk_id),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completion_date DATE
)
```

## ⚠️ Important Notes

### 1. Role Column Required
You need a `role` column in your users table with values: 'user', 'moderator', or 'admin'. If you don't have this:

```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';

-- Set yourself as admin (replace with your clerk_id)
UPDATE users SET role = 'admin' WHERE clerk_id = 'your_clerk_id_here';
```

### 2. Clerk Integration
These policies assume you're using Clerk for authentication with Supabase. The policies use `auth.uid()::text` to match with your `clerk_id` field.

### 3. Premium User Column
You need an `is_premium` boolean column in your users table for premium course restrictions.

### 4. Role-Based Access Control
The policies implement a three-tier role system:
- **'user'**: Regular users with limited access
- **'moderator'**: Can create and edit content, but cannot delete
- **'admin'**: Full access including delete operations

## 🧪 Testing Your Policies

### Test with Different User Types

1. **Free User Account**
   - Should only see free courses
   - Cannot access premium content
   - Can enroll in free courses only

2. **Premium User Account**
   - Should see all courses
   - Can enroll in premium courses
   - Can access all content for enrolled courses

3. **Admin Account**
   - Should have access to everything
   - Can create/edit/delete all content

4. **Moderator Account**
   - Should have access to most content
   - Can create/edit content but cannot delete

### Test Scenarios

```sql
-- Test if user can see their own data
SELECT * FROM users WHERE clerk_id = 'test_user_id';

-- Test if user can see courses
SELECT * FROM courses;

-- Test if user can see content for enrolled courses
SELECT * FROM content_item ci
JOIN content_block cb ON cb.id = ci.block_id
JOIN course_path_sections cps ON cps.id = cb.section_id
JOIN course_path cp ON cp.id = cps.course_path_id
JOIN course_enrollments ce ON ce.course_path_id = cp.id
WHERE ce.clerk_id = 'test_user_id';
```

## 🔧 Customization

### Modify Role System
If you use a different role system, update the role checks in policies:

```sql
-- Instead of role IN ('admin', 'moderator'), you might use:
-- role = 'superuser' or role IN ('admin', 'editor') etc.
```

### Add More Granular Roles
You can create additional policies for different user roles:

```sql
-- Example: Moderator role
CREATE POLICY "Moderators can edit content" ON content_item
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role = 'moderator'
        )
    );
```

### Premium Course Logic
Modify premium restrictions based on your business logic:

```sql
-- Example: Different premium tiers
AND u.subscription_plan IN ('basic', 'pro', 'enterprise')
```

## 🚨 Troubleshooting

### Common Issues

1. **"Policy does not exist" errors**
   - Make sure you've run the CREATE POLICY statements
   - Check that table names match exactly

2. **"Permission denied" errors**
   - Verify RLS is enabled on the table
   - Check that policies allow the operation you're trying to perform

3. **Users can't see expected data**
   - Verify the policy logic matches your table relationships
   - Check that user authentication is working properly

### Debug Policies

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- List all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Test policy evaluation
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM users WHERE clerk_id = 'test_id';
```

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policy Examples](https://www.postgresql.org/docs/current/ddl-policy.html)
- [Supabase Auth Integration](https://supabase.com/docs/guides/auth)

## 🤝 Support

If you encounter issues or need help customizing these policies:

1. Check the troubleshooting section above
2. Verify your table structure matches the assumptions
3. Test policies step by step
4. Review Supabase logs for detailed error messages

---

**Remember**: Always test these policies in a development environment before applying to production!
