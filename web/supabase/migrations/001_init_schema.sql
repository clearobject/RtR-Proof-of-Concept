-- Rent the Runway Operations Prototype - Database Schema
-- Migration: 001_init_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Facilities table
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- EWR, DFW, etc.
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('operator', 'maintenance', 'manager', 'admin')),
  facility_id UUID REFERENCES facilities(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset types lookup table
CREATE TABLE asset_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT, -- equipment, infrastructure, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table (Capital Asset Management)
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

-- Machines table (for Digital Twin)
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

-- Sensor data table (IoT readings)
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

-- Alerts table
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

-- Maintenance tickets table
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

-- Preventive maintenance templates
CREATE TABLE pm_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  asset_type_id UUID REFERENCES asset_types(id),
  frequency_days INTEGER,
  frequency_cycles INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preventive maintenance tasks
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

-- Downtime events
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

-- Asset costs
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

-- Social posts (Social Pulse)
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

-- Social actions (responses/engagement)
CREATE TABLE social_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('responded', 'refunded', 'replaced', 'escalated', 'resolved')),
  performed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  post_resolution_score INTEGER CHECK (post_resolution_score >= 1 AND post_resolution_score <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert thresholds configuration
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

-- CAM configuration (for replacement priority scoring)
CREATE TABLE cam_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- create, update, delete, acknowledge, etc.
  entity_type TEXT NOT NULL, -- machine, asset, ticket, etc.
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_machines_facility ON machines(facility_id);
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_machines_zone ON machines(zone);
CREATE INDEX idx_sensor_data_machine ON sensor_data(machine_id);
CREATE INDEX idx_sensor_data_timestamp ON sensor_data(timestamp DESC);
CREATE INDEX idx_alerts_machine ON alerts(machine_id);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX idx_maintenance_tickets_status ON maintenance_tickets(status);
CREATE INDEX idx_maintenance_tickets_asset ON maintenance_tickets(asset_id);
CREATE INDEX idx_maintenance_tickets_machine ON maintenance_tickets(machine_id);
CREATE INDEX idx_assets_facility ON assets(facility_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_sentiment ON social_posts(sentiment_score);
CREATE INDEX idx_social_posts_posted_at ON social_posts(posted_at DESC);
CREATE INDEX idx_downtime_events_asset ON downtime_events(asset_id);
CREATE INDEX idx_asset_costs_asset ON asset_costs(asset_id);

-- Row Level Security (RLS) Policies
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be refined based on role requirements)
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- All authenticated users can view facilities
CREATE POLICY "Authenticated users can view facilities" ON facilities
  FOR SELECT USING (auth.role() = 'authenticated');

-- All authenticated users can view machines
CREATE POLICY "Authenticated users can view machines" ON machines
  FOR SELECT USING (auth.role() = 'authenticated');

-- All authenticated users can view assets
CREATE POLICY "Authenticated users can view assets" ON assets
  FOR SELECT USING (auth.role() = 'authenticated');

-- All authenticated users can view sensor data
CREATE POLICY "Authenticated users can view sensor data" ON sensor_data
  FOR SELECT USING (auth.role() = 'authenticated');

-- All authenticated users can view alerts
CREATE POLICY "Authenticated users can view alerts" ON alerts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Maintenance and above can create/update tickets
CREATE POLICY "Maintenance can manage tickets" ON maintenance_tickets
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('maintenance', 'manager', 'admin')
    )
  );

-- All authenticated users can view social posts
CREATE POLICY "Authenticated users can view social posts" ON social_posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_tickets_updated_at BEFORE UPDATE ON maintenance_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thresholds_updated_at BEFORE UPDATE ON thresholds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cam_config_updated_at BEFORE UPDATE ON cam_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


