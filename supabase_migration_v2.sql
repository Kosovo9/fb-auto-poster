-- Add new columns to schedules table for AI and Media
ALTER TABLE schedules
ADD COLUMN use_ai BOOLEAN DEFAULT FALSE,
ADD COLUMN media_url TEXT DEFAULT NULL;

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id),
    post_count INTEGER DEFAULT 0,
    success_rate FLOAT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
