-- 🚀 OPTIMIZACIÓN 10X - DB INDEXES
-- Ejecutar en Supabase SQL Editor

-- 1. Index para grupos (acelera carga del panel lateral)
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups(user_id);

-- 2. Index para estados de posteo (acelera el worker de posteos)
CREATE INDEX IF NOT EXISTS idx_schedules_status_time ON schedules(status, scheduled_time);

-- 3. Index para analíticas (acelera carga de gráficas)
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON analytics(user_id, created_at DESC);

-- 4. Index para comentarios (acelera CRM)
CREATE INDEX IF NOT EXISTS idx_comments_schedule_id ON comments(schedule_id);

-- 5. Index para leads (acelera CRM de ventas)
CREATE INDEX IF NOT EXISTS idx_leads_schedule_id ON leads(schedule_id);

-- 6. Index para referidos
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
