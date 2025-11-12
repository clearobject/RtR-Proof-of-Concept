-- Enable RLS on public tables that don't have it
-- This migration addresses security advisor warnings

-- Enable RLS on asset_types
ALTER TABLE asset_types ENABLE ROW LEVEL SECURITY;

-- Enable RLS on pm_templates
ALTER TABLE pm_templates ENABLE ROW LEVEL SECURITY;

-- Enable RLS on pm_tasks
ALTER TABLE pm_tasks ENABLE ROW LEVEL SECURITY;

-- Enable RLS on downtime_events
ALTER TABLE downtime_events ENABLE ROW LEVEL SECURITY;

-- Enable RLS on asset_costs
ALTER TABLE asset_costs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on social_actions
ALTER TABLE social_actions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on thresholds
ALTER TABLE thresholds ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cam_config
ALTER TABLE cam_config ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for read access (authenticated users)
-- These tables are mostly reference/configuration data, so we allow read for authenticated users

-- asset_types: Read for authenticated users
CREATE POLICY "asset_types_read" ON asset_types
  FOR SELECT
  TO authenticated
  USING (true);

-- pm_templates: Read for authenticated users
CREATE POLICY "pm_templates_read" ON pm_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- pm_tasks: Read for authenticated users, write for maintenance/manager/admin
CREATE POLICY "pm_tasks_read" ON pm_tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "pm_tasks_write" ON pm_tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('maintenance', 'manager', 'admin')
    )
  );

-- downtime_events: Read for authenticated users, write for maintenance/manager/admin
CREATE POLICY "downtime_events_read" ON downtime_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "downtime_events_write" ON downtime_events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('maintenance', 'manager', 'admin')
    )
  );

-- asset_costs: Read for authenticated users, write for maintenance/manager/admin
CREATE POLICY "asset_costs_read" ON asset_costs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "asset_costs_write" ON asset_costs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('maintenance', 'manager', 'admin')
    )
  );

-- social_actions: Read for authenticated users, write for manager/admin
CREATE POLICY "social_actions_read" ON social_actions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "social_actions_write" ON social_actions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('manager', 'admin')
    )
  );

-- thresholds: Read for authenticated users, write for manager/admin
CREATE POLICY "thresholds_read" ON thresholds
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "thresholds_write" ON thresholds
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('manager', 'admin')
    )
  );

-- cam_config: Read for authenticated users, write for admin only
CREATE POLICY "cam_config_read" ON cam_config
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cam_config_write" ON cam_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Add RLS policy for audit_log (was missing)
CREATE POLICY "audit_log_read" ON audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "audit_log_write" ON audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- System can write audit logs

-- Fix function search_path security
ALTER FUNCTION generate_invite_token SET search_path = public;
ALTER FUNCTION update_updated_at_column SET search_path = public;

