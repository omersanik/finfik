-- =====================================================
-- CREATE BETA FEEDBACK TABLE
-- =====================================================
-- This table stores feedback from beta users

-- Create the beta_feedback table
CREATE TABLE IF NOT EXISTS beta_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'ui', 'content', 'performance', 'other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    contact_email TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'in_progress', 'resolved', 'declined')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beta_feedback_clerk_id ON beta_feedback(clerk_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_category ON beta_feedback(category);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_priority ON beta_feedback(priority);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_status ON beta_feedback(status);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_created_at ON beta_feedback(created_at);

-- Enable Row Level Security
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for beta_feedback table
-- Users can only view their own feedback
CREATE POLICY "Users can view own beta feedback" ON beta_feedback
    FOR SELECT USING (clerk_id = auth.uid()::text);

-- Users can only insert their own feedback
CREATE POLICY "Users can insert own beta feedback" ON beta_feedback
    FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);

-- Users can only update their own feedback (if needed)
CREATE POLICY "Users can update own beta feedback" ON beta_feedback
    FOR UPDATE USING (clerk_id = auth.uid()::text);

-- Admins can view all feedback
CREATE POLICY "Admins can view all beta feedback" ON beta_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Admins can update all feedback
CREATE POLICY "Admins can update all beta feedback" ON beta_feedback
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_beta_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_beta_feedback_updated_at
    BEFORE UPDATE ON beta_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_beta_feedback_updated_at();

-- =====================================================
-- VERIFY THE TABLE CREATION
-- =====================================================

-- Check if the table was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'beta_feedback'
ORDER BY ordinal_position;

-- Check if the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'beta_feedback'
ORDER BY policyname;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'Beta feedback table created successfully!' as status;
