-- SAAS CORE MIGRATION - 12.22.2025
-- ===============================

-- 1. Users table (Manual Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT DEFAULT 'free', -- 'free', 'premium', 'agency'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Update existing tables for Multi-tenancy
-- Note: We use UUID for user_id to match users.id

-- Groups
ALTER TABLE groups ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Schedules
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Analytics (Re-creating with correct relations if needed)
CREATE TABLE IF NOT EXISTS analytics_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  metric_type TEXT, 
  value INT DEFAULT 1,
  metadata JSONB, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Media
ALTER TABLE media ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 3. Subscriptions (Tracking history)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_id TEXT,
  status TEXT,
  plan TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Sample Admin User (Optional)
-- INSERT INTO users (email, password_hash, plan) VALUES ('admin@example.com', '...', 'agency');
