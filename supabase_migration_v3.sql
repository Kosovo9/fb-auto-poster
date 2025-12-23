-- Create Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID DEFAULT NULL, -- Nullable for now if auth not strict
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  metric_type TEXT, -- 'post_published', 'comment_received', 'conversion'
  value INT DEFAULT 0,
  metadata JSONB, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_schedule ON analytics(schedule_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metric ON analytics(metric_type);

-- Create Media Table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID DEFAULT NULL,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- 'image' or 'video'
  size_bytes INT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for Media
CREATE INDEX IF NOT EXISTS idx_media_schedule ON media(schedule_id);

-- Update Schedules Table
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS use_ai BOOLEAN DEFAULT FALSE;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS media_url TEXT DEFAULT NULL;

-- Create Storage Bucket (must be done via dashboard usually, but we include for documentation)
-- INSERT INTO storage.buckets (id, name) VALUES ('auto-poster-media', 'auto-poster-media');
