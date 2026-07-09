-- =============================================================================
-- CEO Dashboard & Admin Portal — Dexpert
-- Migration: Admin schema, roles, audit logs, alert configs, dashboard views
-- =============================================================================

-- 1. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT,
  metadata    JSONB DEFAULT '{}',
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. ALERT CONFIGURATIONS
CREATE TABLE IF NOT EXISTS alert_configs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  metric_key    TEXT NOT NULL,
  condition     TEXT NOT NULL CHECK (condition IN ('gt', 'lt', 'eq', 'gte', 'lte')),
  threshold     NUMERIC NOT NULL,
  enabled       BOOLEAN NOT NULL DEFAULT true,
  notify_email  TEXT[] DEFAULT '{}',
  notify_slack  TEXT,
  cooldown_min  INTEGER DEFAULT 60,
  last_triggered_at TIMESTAMPTZ,
  created_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE alert_configs ENABLE ROW LEVEL SECURITY;

-- 4. ALERT HISTORY
CREATE TABLE IF NOT EXISTS alert_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_config_id UUID NOT NULL REFERENCES alert_configs(id) ON DELETE CASCADE,
  metric_value    NUMERIC NOT NULL,
  threshold       NUMERIC NOT NULL,
  condition       TEXT NOT NULL,
  triggered_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'triggered' CHECK (status IN ('triggered', 'acknowledged', 'resolved'))
);
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;

-- 5. SYSTEM METRICS (for platform performance)
CREATE TABLE IF NOT EXISTS system_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name     TEXT NOT NULL,
  metric_value    NUMERIC NOT NULL,
  unit            TEXT,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_time
  ON system_metrics (metric_name, recorded_at DESC);
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- 6. DAILY SNAPSHOTS (pre-computed KPI snapshots)
CREATE TABLE IF NOT EXISTS daily_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  total_students  INTEGER DEFAULT 0,
  total_pymes     INTEGER DEFAULT 0,
  total_projects  INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  total_revenue   NUMERIC(12,2) DEFAULT 0,
  mrr             NUMERIC(12,2) DEFAULT 0,
  new_signups     INTEGER DEFAULT 0,
  transactions_count INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  retention_rate  NUMERIC(5,2) DEFAULT 0,
  avg_project_completion_days NUMERIC(6,1),
  platform_uptime NUMERIC(5,2) DEFAULT 100,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date)
);
ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SECURITY DEFINER FUNCTION to check admin role (breaks RLS recursion)
-- =============================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN');
$$;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- AUDIT LOGS: Admins can read all; service role can insert
DROP POLICY IF EXISTS "Admins can read all audit logs" ON audit_logs;
CREATE POLICY "Admins can read all audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());
DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ALERT CONFIGS: Admins full access
DROP POLICY IF EXISTS "Admins full access on alert_configs" ON alert_configs;
CREATE POLICY "Admins full access on alert_configs"
  ON alert_configs FOR ALL
  USING (is_admin());

-- ALERT HISTORY: Admins can read
DROP POLICY IF EXISTS "Admins can read alert_history" ON alert_history;
CREATE POLICY "Admins can read alert_history"
  ON alert_history FOR SELECT
  USING (is_admin());

-- SYSTEM METRICS: Admins can read; service role can insert
DROP POLICY IF EXISTS "Admins can read system_metrics" ON system_metrics;
CREATE POLICY "Admins can read system_metrics"
  ON system_metrics FOR SELECT
  USING (is_admin());
DROP POLICY IF EXISTS "Service role can insert system_metrics" ON system_metrics;
CREATE POLICY "Service role can insert system_metrics"
  ON system_metrics FOR INSERT
  WITH CHECK (true);

-- DAILY SNAPSHOTS: Admins can read
DROP POLICY IF EXISTS "Admins can read daily_snapshots" ON daily_snapshots;
CREATE POLICY "Admins can read daily_snapshots"
  ON daily_snapshots FOR SELECT
  USING (is_admin());

-- PROFILES: Allow admins to read all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

-- Allow admins to update any profile (for role management)
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- =============================================================================
-- FUNCTIONS FOR DASHBOARD METRICS
-- =============================================================================

-- Get revenue for a given period
CREATE OR REPLACE FUNCTION get_revenue(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS NUMERIC(12,2)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM invoices
  WHERE created_at >= start_date AND created_at < end_date
    AND status = 'paid';
$$;

-- Get new users in period by role
CREATE OR REPLACE FUNCTION get_new_users(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  user_role TEXT
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)
  FROM profiles
  WHERE role = user_role::role
    AND created_at >= start_date
    AND created_at < end_date;
$$;

-- Get transaction count and volume
CREATE OR REPLACE FUNCTION get_transaction_stats(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS TABLE(tx_count BIGINT, total_volume NUMERIC(12,2))
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COUNT(*)::BIGINT,
    COALESCE(SUM(amount), 0)::NUMERIC(12,2)
  FROM invoices
  WHERE created_at >= start_date AND created_at < end_date
    AND status = 'paid';
$$;

-- Get project stats
CREATE OR REPLACE FUNCTION get_project_stats()
RETURNS TABLE(
  total_projects BIGINT,
  active_projects BIGINT,
  completed_projects BIGINT,
  open_positions BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status IN ('open', 'in_progress'))::BIGINT,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'open')::BIGINT
  FROM projects;
$$;

-- Get user counts
CREATE OR REPLACE FUNCTION get_user_counts()
RETURNS TABLE(
  total_students BIGINT,
  total_pymes BIGINT,
  total_admins BIGINT,
  active_today BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COUNT(*) FILTER (WHERE role = 'STUDENT')::BIGINT,
    COUNT(*) FILTER (WHERE role = 'PYME')::BIGINT,
    COUNT(*) FILTER (WHERE role = 'ADMIN')::BIGINT,
    0::BIGINT
  FROM profiles;
$$;

-- Get MRR (Monthly Recurring Revenue)
CREATE OR REPLACE FUNCTION get_mrr()
RETURNS NUMERIC(12,2)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM invoices
  WHERE created_at >= date_trunc('month', CURRENT_DATE)
    AND status = 'paid';
$$;

-- =============================================================================
-- ENABLE REALTIME FOR ADMIN TABLES
-- =============================================================================
do $$
begin
  begin alter publication supabase_realtime add table daily_snapshots; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table system_metrics; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table alert_history; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table audit_logs; exception when duplicate_object then null; end;
end;
$$;
