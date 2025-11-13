-- Enable RLS on public tables that don't have it
-- This migration addresses security advisor warnings

-- Enable RLS on tables (only if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'asset_types') THEN
    ALTER TABLE asset_types ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pm_templates') THEN
    ALTER TABLE pm_templates ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pm_tasks') THEN
    ALTER TABLE pm_tasks ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'downtime_events') THEN
    ALTER TABLE downtime_events ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'asset_costs') THEN
    ALTER TABLE asset_costs ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'social_actions') THEN
    ALTER TABLE social_actions ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'thresholds') THEN
    ALTER TABLE thresholds ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cam_config') THEN
    ALTER TABLE cam_config ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create basic RLS policies for read access (authenticated users)
-- These tables are mostly reference/configuration data, so we allow read for authenticated users

DO $$
BEGIN
  -- asset_types: Read for authenticated users
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'asset_types') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'asset_types' 
      AND policyname = 'asset_types_read'
    ) THEN
      CREATE POLICY "asset_types_read" ON asset_types
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;
  END IF;

  -- pm_templates: Read for authenticated users
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pm_templates') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'pm_templates' 
      AND policyname = 'pm_templates_read'
    ) THEN
      CREATE POLICY "pm_templates_read" ON pm_templates
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;
  END IF;

  -- pm_tasks: Read for authenticated users, write for maintenance/manager/admin
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pm_tasks') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'pm_tasks' 
      AND policyname = 'pm_tasks_read'
    ) THEN
      CREATE POLICY "pm_tasks_read" ON pm_tasks
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'pm_tasks' 
      AND policyname = 'pm_tasks_write'
    ) THEN
      -- Only create write policy if user_profiles exists
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
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
      END IF;
    END IF;
  END IF;

  -- downtime_events: Read for authenticated users, write for maintenance/manager/admin
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'downtime_events') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'downtime_events' 
      AND policyname = 'downtime_events_read'
    ) THEN
      CREATE POLICY "downtime_events_read" ON downtime_events
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'downtime_events' 
      AND policyname = 'downtime_events_write'
    ) THEN
      -- Only create write policy if user_profiles exists
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
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
      END IF;
    END IF;
  END IF;

  -- asset_costs: Read for authenticated users, write for maintenance/manager/admin
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'asset_costs') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'asset_costs' 
      AND policyname = 'asset_costs_read'
    ) THEN
      CREATE POLICY "asset_costs_read" ON asset_costs
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'asset_costs' 
      AND policyname = 'asset_costs_write'
    ) THEN
      -- Only create write policy if user_profiles exists
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
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
      END IF;
    END IF;
  END IF;

  -- social_actions: Read for authenticated users, write for manager/admin
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'social_actions') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'social_actions' 
      AND policyname = 'social_actions_read'
    ) THEN
      CREATE POLICY "social_actions_read" ON social_actions
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'social_actions' 
      AND policyname = 'social_actions_write'
    ) THEN
      -- Only create write policy if user_profiles exists
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
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
      END IF;
    END IF;
  END IF;

  -- thresholds: Read for authenticated users, write for manager/admin
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'thresholds') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'thresholds' 
      AND policyname = 'thresholds_read'
    ) THEN
      CREATE POLICY "thresholds_read" ON thresholds
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'thresholds' 
      AND policyname = 'thresholds_write'
    ) THEN
      -- Only create write policy if user_profiles exists
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
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
      END IF;
    END IF;
  END IF;

  -- cam_config: Read for authenticated users, write for admin only
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cam_config') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'cam_config' 
      AND policyname = 'cam_config_read'
    ) THEN
      CREATE POLICY "cam_config_read" ON cam_config
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'cam_config' 
      AND policyname = 'cam_config_write'
    ) THEN
      -- Only create write policy if user_profiles exists
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
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
      END IF;
    END IF;
  END IF;

  -- Add RLS policy for audit_log (was missing)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_log') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'audit_log' 
      AND policyname = 'audit_log_read'
    ) THEN
      -- Only create read policy if user_profiles exists
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
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
      END IF;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'audit_log' 
      AND policyname = 'audit_log_write'
    ) THEN
      CREATE POLICY "audit_log_write" ON audit_log
        FOR INSERT
        TO authenticated
        WITH CHECK (true); -- System can write audit logs
    END IF;
  END IF;
END $$;

-- Fix function search_path security
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_invite_token' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION generate_invite_token SET search_path = public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION update_updated_at_column SET search_path = public;
  END IF;
END $$;

