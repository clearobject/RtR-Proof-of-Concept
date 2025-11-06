-- Rent the Runway Operations Prototype - Database Schema
-- Migration: 001_init_schema.sql
-- This migration is idempotent and can be safely re-run

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Facilities table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'facilities') THEN
    CREATE TABLE facilities (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE, -- EWR, DFW, etc.
      address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Users table (extends Supabase auth.users)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    CREATE TABLE user_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('operator', 'maintenance', 'manager', 'admin')),
      facility_id UUID REFERENCES facilities(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Asset types lookup table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'asset_types') THEN
    CREATE TABLE asset_types (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL UNIQUE,
      category TEXT, -- equipment, infrastructure, etc.
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Assets table (Capital Asset Management)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assets') THEN
    CREATE TABLE assets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      type_id UUID REFERENCES asset_types(id),
      type TEXT, -- Fallback if type_id not set
      manufacturer TEXT,
      model TEXT,
      serial_number TEXT,
      facility_id UUID NOT NULL REFERENCES facilities(id),
      zone TEXT,
      in_service_date DATE NOT NULL,
      expected_life_years INTEGER,
      criticality TEXT NOT NULL DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Machines table (for Digital Twin)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'machines') THEN
    CREATE TABLE machines (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- washer, dryer, dry_cleaner, etc.
      zone TEXT NOT NULL, -- Inbound, Tagging, Wet Cleaning, etc.
      facility_id UUID NOT NULL REFERENCES facilities(id),
      asset_id UUID REFERENCES assets(id), -- Link to asset if applicable
      status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'warning', 'critical', 'maintenance', 'offline')),
      coordinates JSONB, -- {x: number, y: number} for factory layout
      manufacturer TEXT,
      model TEXT,
      serial_number TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Sensor data table (IoT readings)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sensor_data') THEN
    CREATE TABLE sensor_data (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      temperature NUMERIC,
      vibration NUMERIC,
      power NUMERIC,
      humidity NUMERIC,
      flow_rate NUMERIC,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Alerts table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'alerts') THEN
    CREATE TABLE alerts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
      severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
      message TEXT NOT NULL,
      acknowledged BOOLEAN DEFAULT FALSE,
      acknowledged_by UUID REFERENCES auth.users(id),
      acknowledged_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Maintenance tickets table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'maintenance_tickets') THEN
    CREATE TABLE maintenance_tickets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      machine_id UUID REFERENCES machines(id),
      asset_id UUID REFERENCES assets(id),
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      assigned_to UUID REFERENCES auth.users(id),
      created_by UUID NOT NULL REFERENCES auth.users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    );
  END IF;
END $$;

-- Preventive maintenance templates
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pm_templates') THEN
    CREATE TABLE pm_templates (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      asset_type_id UUID REFERENCES asset_types(id),
      frequency_days INTEGER,
      frequency_cycles INTEGER,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Preventive maintenance tasks
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pm_tasks') THEN
    CREATE TABLE pm_tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      template_id UUID REFERENCES pm_templates(id),
      asset_id UUID NOT NULL REFERENCES assets(id),
      scheduled_date DATE NOT NULL,
      completed_date DATE,
      completed_by UUID REFERENCES auth.users(id),
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'overdue', 'cancelled')),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Downtime events
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'downtime_events') THEN
    CREATE TABLE downtime_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      asset_id UUID NOT NULL REFERENCES assets(id),
      machine_id UUID REFERENCES machines(id),
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ,
      duration_minutes INTEGER,
      type TEXT NOT NULL CHECK (type IN ('planned', 'unplanned')),
      cause TEXT,
      impact TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Asset costs
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'asset_costs') THEN
    CREATE TABLE asset_costs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      asset_id UUID NOT NULL REFERENCES assets(id),
      maintenance_ticket_id UUID REFERENCES maintenance_tickets(id),
      type TEXT NOT NULL CHECK (type IN ('parts', 'labor', 'energy', 'other')),
      amount NUMERIC NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Social posts (Social Pulse)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'social_posts') THEN
    CREATE TABLE social_posts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'reddit', 'facebook', 'twitter', 'trustpilot')),
      content TEXT NOT NULL,
      author TEXT,
      sentiment_score INTEGER NOT NULL CHECK (sentiment_score >= 1 AND sentiment_score <= 10),
      category TEXT, -- fit, quality, delivery, customer_service, billing, availability, etc.
      occasion TEXT, -- wedding, gala, interview, etc.
      engagement_count INTEGER DEFAULT 0,
      posted_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Social actions (responses/engagement)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'social_actions') THEN
    CREATE TABLE social_actions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
      action_type TEXT NOT NULL CHECK (action_type IN ('responded', 'refunded', 'replaced', 'escalated', 'resolved')),
      performed_by UUID REFERENCES auth.users(id),
      notes TEXT,
      post_resolution_score INTEGER CHECK (post_resolution_score >= 1 AND post_resolution_score <= 10),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Alert thresholds configuration
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'thresholds') THEN
    CREATE TABLE thresholds (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      machine_type TEXT NOT NULL,
      metric TEXT NOT NULL, -- temperature, vibration, power, humidity
      warning_min NUMERIC,
      warning_max NUMERIC,
      critical_min NUMERIC,
      critical_max NUMERIC,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(machine_type, metric)
    );
  END IF;
END $$;

-- CAM configuration (for replacement priority scoring)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cam_config') THEN
    CREATE TABLE cam_config (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      key TEXT NOT NULL UNIQUE,
      value JSONB NOT NULL,
      description TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Audit log
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_log') THEN
    CREATE TABLE audit_log (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id),
      action TEXT NOT NULL, -- create, update, delete, acknowledge, etc.
      entity_type TEXT NOT NULL, -- machine, asset, ticket, etc.
      entity_id UUID,
      changes JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Indexes for performance (only create if they don't exist)
CREATE INDEX IF NOT EXISTS idx_machines_facility ON machines(facility_id);
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);
CREATE INDEX IF NOT EXISTS idx_machines_zone ON machines(zone);
CREATE INDEX IF NOT EXISTS idx_sensor_data_machine ON sensor_data(machine_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_machine ON alerts(machine_id);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_status ON maintenance_tickets(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_asset ON maintenance_tickets(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_machine ON maintenance_tickets(machine_id);
CREATE INDEX IF NOT EXISTS idx_assets_facility ON assets(facility_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_sentiment ON social_posts(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_social_posts_posted_at ON social_posts(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_downtime_events_asset ON downtime_events(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_costs_asset ON asset_costs(asset_id);

-- Row Level Security (RLS) Policies
DO $$ 
BEGIN
  -- Enable RLS if not already enabled
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'facilities') THEN
    ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assets') THEN
    ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'machines') THEN
    ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sensor_data') THEN
    ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'alerts') THEN
    ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'maintenance_tickets') THEN
    ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'social_posts') THEN
    ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_log') THEN
    ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Basic RLS policies (create only if they don't exist)
DO $$ 
BEGIN
  -- Users can read their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON user_profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  -- All authenticated users can view facilities
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'facilities' 
    AND policyname = 'Authenticated users can view facilities'
  ) THEN
    CREATE POLICY "Authenticated users can view facilities" ON facilities
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- All authenticated users can view machines
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'machines' 
    AND policyname = 'Authenticated users can view machines'
  ) THEN
    CREATE POLICY "Authenticated users can view machines" ON machines
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- All authenticated users can view assets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'assets' 
    AND policyname = 'Authenticated users can view assets'
  ) THEN
    CREATE POLICY "Authenticated users can view assets" ON assets
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- All authenticated users can view sensor data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sensor_data' 
    AND policyname = 'Authenticated users can view sensor data'
  ) THEN
    CREATE POLICY "Authenticated users can view sensor data" ON sensor_data
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- All authenticated users can view alerts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'alerts' 
    AND policyname = 'Authenticated users can view alerts'
  ) THEN
    CREATE POLICY "Authenticated users can view alerts" ON alerts
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- Maintenance and above can create/update tickets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'maintenance_tickets' 
    AND policyname = 'Maintenance can manage tickets'
  ) THEN
    CREATE POLICY "Maintenance can manage tickets" ON maintenance_tickets
      FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('maintenance', 'manager', 'admin')
        )
      );
  END IF;

  -- All authenticated users can view social posts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'social_posts' 
    AND policyname = 'Authenticated users can view social posts'
  ) THEN
    CREATE POLICY "Authenticated users can view social posts" ON social_posts
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at (drop and recreate to ensure they're correct)
DROP TRIGGER IF EXISTS update_facilities_updated_at ON facilities;
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_machines_updated_at ON machines;
CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_tickets_updated_at ON maintenance_tickets;
CREATE TRIGGER update_maintenance_tickets_updated_at BEFORE UPDATE ON maintenance_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_thresholds_updated_at ON thresholds;
CREATE TRIGGER update_thresholds_updated_at BEFORE UPDATE ON thresholds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cam_config_updated_at ON cam_config;
CREATE TRIGGER update_cam_config_updated_at BEFORE UPDATE ON cam_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
