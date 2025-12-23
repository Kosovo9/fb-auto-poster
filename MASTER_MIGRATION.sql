-- MASTER NUCLEAR MIGRATION v2.0
-- EXECUTE THIS IN SUPABASE SQL EDITOR

-- 1. Users Table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT DEFAULT 'free', -- 'free', 'professional', 'business', 'enterprise'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  referral_code TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Groups Table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending', 
  use_ai BOOLEAN DEFAULT FALSE,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  fb_comment_id TEXT,
  author_name TEXT,
  comment_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  comment_text TEXT,
  intent TEXT, 
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  commission_amount INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  metric_type TEXT, 
  value INT DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Broadcasts Table
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  platform TEXT DEFAULT 'whatsapp',
  recipients_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS & Indexes
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_user ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_schedules_user ON schedules(user_id);
