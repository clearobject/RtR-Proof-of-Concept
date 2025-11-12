-- Migration: 007_merge_machines_into_assets.sql
-- This migration merges the machines table into the assets table
-- and updates all foreign key references

-- Step 1: Add missing columns to assets table
DO $$
BEGIN
  -- Add asset_alias if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assets' AND column_name = 'alias'
  ) THEN
    ALTER TABLE assets ADD COLUMN alias TEXT;
  END IF;

  -- Add coordinates if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assets' AND column_name = 'coordinates'
  ) THEN
    ALTER TABLE assets ADD COLUMN coordinates JSONB;
  END IF;

  -- Update status constraint to include machine statuses
  -- First, drop the existing constraint if it exists
  ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;
  
  -- Normalize any existing data: convert 'operational' to 'Active' and capitalize all statuses
  -- This ensures consistency before adding the constraint
  UPDATE assets SET status = 'Active' WHERE LOWER(status) IN ('operational', 'active');
  UPDATE assets SET status = 'Maintenance' WHERE LOWER(status) = 'maintenance';
  UPDATE assets SET status = 'Retired' WHERE LOWER(status) = 'retired';
  UPDATE assets SET status = 'Warning' WHERE LOWER(status) = 'warning';
  UPDATE assets SET status = 'Critical' WHERE LOWER(status) = 'critical';
  UPDATE assets SET status = 'Offline' WHERE LOWER(status) = 'offline';
  
  -- Add new constraint that includes both asset and machine statuses (capitalized)
  -- Note: 'operational' is consolidated to 'Active' per migration 010
  ALTER TABLE assets ADD CONSTRAINT assets_status_check 
    CHECK (status IN ('Active', 'Maintenance', 'Retired', 'Warning', 'Critical', 'Offline'));
END $$;

-- Step 2: Migrate machine data to assets
-- For each machine, find or create corresponding asset by asset_alias
DO $$
DECLARE
  machine_record RECORD;
  asset_record RECORD;
  new_asset_id UUID;
  machines_table_exists BOOLEAN;
BEGIN
  -- Check if machines table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'machines'
  ) INTO machines_table_exists;

  -- Only proceed if machines table exists
  IF NOT machines_table_exists THEN
    RAISE NOTICE 'Machines table does not exist, skipping migration step 2';
    RETURN;
  END IF;

  FOR machine_record IN 
    SELECT * FROM machines
  LOOP
    -- Try to find existing asset by alias (from machines.asset_alias)
    IF machine_record.asset_alias IS NOT NULL THEN
      SELECT * INTO asset_record 
      FROM assets 
      WHERE alias = machine_record.asset_alias 
        AND facility_id = machine_record.facility_id
      LIMIT 1;
    END IF;

    -- If no asset found, try to find by asset_id
    IF asset_record IS NULL AND machine_record.asset_id IS NOT NULL THEN
      SELECT * INTO asset_record 
      FROM assets 
      WHERE id = machine_record.asset_id;
    END IF;

    -- If still no asset found, create a new one
    IF asset_record IS NULL THEN
      INSERT INTO assets (
        name, type, manufacturer, model, serial_number, 
        facility_id, zone, status, coordinates, alias,
        in_service_date, created_at, updated_at
      ) VALUES (
        machine_record.name,
        machine_record.type,
        machine_record.manufacturer,
        machine_record.model,
        machine_record.serial_number,
        machine_record.facility_id,
        machine_record.zone,
        CASE 
          WHEN LOWER(machine_record.status) = 'operational' THEN 'Active'
          WHEN machine_record.status IN ('warning', 'critical', 'maintenance', 'offline', 'Warning', 'Critical', 'Maintenance', 'Offline', 'Active') 
          THEN INITCAP(machine_record.status)
          ELSE 'Active'
        END,
        machine_record.coordinates,
        machine_record.asset_alias,
        COALESCE((SELECT in_service_date FROM assets WHERE id = machine_record.asset_id), CURRENT_DATE),
        machine_record.created_at,
        machine_record.updated_at
      )
      RETURNING id INTO new_asset_id;
      
      -- Create mapping for later foreign key updates
      CREATE TABLE IF NOT EXISTS machine_to_asset_mapping (
        machine_id UUID PRIMARY KEY,
        asset_id UUID NOT NULL
      );
      
      INSERT INTO machine_to_asset_mapping (machine_id, asset_id) 
      VALUES (machine_record.id, new_asset_id)
      ON CONFLICT (machine_id) DO UPDATE SET asset_id = new_asset_id;
    ELSE
      -- Update existing asset with machine data
      UPDATE assets SET
        name = COALESCE(machine_record.name, assets.name),
        type = COALESCE(machine_record.type, assets.type),
        manufacturer = COALESCE(machine_record.manufacturer, assets.manufacturer),
        model = COALESCE(machine_record.model, assets.model),
        serial_number = COALESCE(machine_record.serial_number, assets.serial_number),
        zone = COALESCE(machine_record.zone, assets.zone),
        status = CASE 
          WHEN LOWER(machine_record.status) = 'operational' THEN 'Active'
          WHEN machine_record.status IN ('warning', 'critical', 'maintenance', 'offline', 'Warning', 'Critical', 'Maintenance', 'Offline') 
          THEN INITCAP(machine_record.status)
          ELSE COALESCE(INITCAP(assets.status), 'Active')
        END,
        coordinates = COALESCE(machine_record.coordinates, assets.coordinates),
        alias = COALESCE(machine_record.asset_alias, assets.alias),
        updated_at = GREATEST(machine_record.updated_at, assets.updated_at)
      WHERE id = asset_record.id;
      
      -- Create mapping
      CREATE TABLE IF NOT EXISTS machine_to_asset_mapping (
        machine_id UUID PRIMARY KEY,
        asset_id UUID NOT NULL
      );
      
      INSERT INTO machine_to_asset_mapping (machine_id, asset_id) 
      VALUES (machine_record.id, asset_record.id)
      ON CONFLICT (machine_id) DO UPDATE SET asset_id = asset_record.id;
    END IF;
  END LOOP;
END $$;

-- Step 3: Update foreign keys in related tables
-- Add asset_id columns if they don't exist
DO $$
BEGIN
  -- Add asset_id to alerts if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'alerts' AND column_name = 'asset_id'
  ) THEN
    ALTER TABLE alerts ADD COLUMN asset_id UUID REFERENCES assets(id) ON DELETE CASCADE;
  END IF;

  -- Add asset_id to sensor_data if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sensor_data' AND column_name = 'asset_id'
  ) THEN
    ALTER TABLE sensor_data ADD COLUMN asset_id UUID REFERENCES assets(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update alerts.asset_id from machine_to_asset_mapping (only if mapping table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'machine_to_asset_mapping'
  ) THEN
    UPDATE alerts a
    SET asset_id = m.asset_id
    FROM machine_to_asset_mapping m
    WHERE a.machine_id = m.machine_id
      AND a.asset_id IS NULL;

    UPDATE sensor_data s
    SET asset_id = m.asset_id
    FROM machine_to_asset_mapping m
    WHERE s.machine_id = m.machine_id
      AND s.asset_id IS NULL;

    UPDATE maintenance_tickets mt
    SET asset_id = m.asset_id
    FROM machine_to_asset_mapping m
    WHERE mt.machine_id = m.machine_id
      AND mt.asset_id IS NULL;
  END IF;
END $$;

-- Step 4: Make asset_id NOT NULL and drop machine_id columns
-- First, ensure all records have asset_id (only if mapping table and machine_id columns exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'machine_to_asset_mapping'
  ) THEN
    -- Update alerts if machine_id column exists
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'alerts' AND column_name = 'machine_id'
    ) THEN
      UPDATE alerts SET asset_id = (
        SELECT asset_id FROM machine_to_asset_mapping 
        WHERE machine_id = alerts.machine_id
      ) WHERE asset_id IS NULL AND machine_id IS NOT NULL;
    END IF;

    -- Update sensor_data if machine_id column exists
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'sensor_data' AND column_name = 'machine_id'
    ) THEN
      UPDATE sensor_data SET asset_id = (
        SELECT asset_id FROM machine_to_asset_mapping 
        WHERE machine_id = sensor_data.machine_id
      ) WHERE asset_id IS NULL AND machine_id IS NOT NULL;
    END IF;

    -- Update maintenance_tickets if machine_id column exists
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'maintenance_tickets' AND column_name = 'machine_id'
    ) THEN
      UPDATE maintenance_tickets SET asset_id = (
        SELECT asset_id FROM machine_to_asset_mapping 
        WHERE machine_id = maintenance_tickets.machine_id
      ) WHERE asset_id IS NULL AND machine_id IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Drop machine_id columns and constraints (only if columns exist)
DO $$
BEGIN
  -- Check and drop machine_id from alerts
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'alerts' AND column_name = 'machine_id'
  ) THEN
    ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_machine_id_fkey;
    ALTER TABLE alerts DROP COLUMN machine_id;
  END IF;

  -- Check and drop machine_id from sensor_data
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sensor_data' AND column_name = 'machine_id'
  ) THEN
    ALTER TABLE sensor_data DROP CONSTRAINT IF EXISTS sensor_data_machine_id_fkey;
    ALTER TABLE sensor_data DROP COLUMN machine_id;
  END IF;

  -- Check and drop machine_id from maintenance_tickets
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'maintenance_tickets' AND column_name = 'machine_id'
  ) THEN
    ALTER TABLE maintenance_tickets DROP CONSTRAINT IF EXISTS maintenance_tickets_machine_id_fkey;
    ALTER TABLE maintenance_tickets DROP COLUMN machine_id;
  END IF;
END $$;

-- Make asset_id NOT NULL where appropriate (only if columns exist and have no NULL values)
DO $$
BEGIN
  -- Check if alerts.asset_id exists and has no NULLs before making it NOT NULL
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'alerts' AND column_name = 'asset_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM alerts WHERE asset_id IS NULL
  ) THEN
    ALTER TABLE alerts ALTER COLUMN asset_id SET NOT NULL;
  END IF;

  -- Check if sensor_data.asset_id exists and has no NULLs before making it NOT NULL
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sensor_data' AND column_name = 'asset_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM sensor_data WHERE asset_id IS NULL
  ) THEN
    ALTER TABLE sensor_data ALTER COLUMN asset_id SET NOT NULL;
  END IF;
END $$;

-- Step 5: Handle downtime_events.machine_id and drop machines table
DO $$
BEGIN
  -- Update downtime_events.machine_id to asset_id if machine_id exists
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'downtime_events' AND column_name = 'machine_id'
  ) AND EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'machine_to_asset_mapping'
  ) THEN
    UPDATE downtime_events de
    SET asset_id = m.asset_id
    FROM machine_to_asset_mapping m
    WHERE de.machine_id = m.machine_id
      AND de.asset_id IS NULL;
    
    -- Drop machine_id column from downtime_events
    ALTER TABLE downtime_events DROP CONSTRAINT IF EXISTS downtime_events_machine_id_fkey;
    ALTER TABLE downtime_events DROP COLUMN IF EXISTS machine_id;
  END IF;
END $$;

-- Drop the machines table
DROP TABLE IF EXISTS machine_to_asset_mapping;
DROP TABLE IF EXISTS machines CASCADE;

-- Step 6: Create indexes on asset_id columns
CREATE INDEX IF NOT EXISTS idx_alerts_asset ON alerts(asset_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_asset ON sensor_data(asset_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp_asset ON sensor_data(asset_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_assets_alias ON assets(alias) WHERE alias IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assets_facility_alias ON assets(facility_id, alias) WHERE alias IS NOT NULL;

