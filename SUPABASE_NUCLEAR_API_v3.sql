-- 🚀 SUPABASE NUCLEAR API v3.0 - MASTER OPTIMIZED SCHEMA
-- Ejecutar este script en el SQL Editor de Supabase (https://supabase.com/dashboard/project/twjamqzehtterpgiqhus/sql/new)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT DEFAULT 'free', -- 'free', 'professional', 'business', 'enterprise'
  role TEXT DEFAULT 'user', -- 'user', 'admin'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  referral_code TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. GROUPS TABLE
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. SCHEDULES TABLE (Automated Postings)
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'posted', 'failed'
  use_ai BOOLEAN DEFAULT FALSE,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. ANALYTICS TABLE (10x Performance)
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  metric_type TEXT, -- 'post_published', 'comment_received', 'conversion', 'view'
  value INT DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. COMMENTS TABLE (AI Responder Integration)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  fb_comment_id TEXT,
  author_name TEXT,
  comment_text TEXT,
  sentiment TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. LEADS TABLE (CRM Layer)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  comment_text TEXT,
  intent TEXT, -- 'hot', 'warm', 'cold'
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. REFERRALS TABLE (Monetization Engine)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  commission_amount INT DEFAULT 0, -- In cents
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. BROADCASTS TABLE (Scale 10x)
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  platform TEXT DEFAULT 'whatsapp',
  recipients_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 🛡️ SECURITY: RLS POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies (User can only see their own data)
CREATE POLICY "Users can only see their own row" ON users FOR ALL USING (id = auth.uid());
CREATE POLICY "Groups user isolation" ON groups FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Schedules user isolation" ON schedules FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Analytics user isolation" ON analytics FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Leads user isolation" ON leads FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Referrals referrer isolation" ON referrals FOR ALL USING (referrer_id = auth.uid());
CREATE POLICY "Broadcasts user isolation" ON broadcasts FOR ALL USING (user_id = auth.uid());

-- ⚡ 10X PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_status_time ON schedules(status, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_schedule_id ON comments(schedule_id);
CREATE INDEX IF NOT EXISTS idx_leads_schedule_id ON leads(schedule_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);

-- 📸 STORAGE SETUP INSTRUCTIONS (Bucket should be public)
-- Name: auto-poster-media
