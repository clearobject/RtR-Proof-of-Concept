-- Migration: 010_consolidate_statuses_and_capitalize.sql
-- Consolidate 'operational' to 'active' and capitalize all status/criticality values

DO $$
BEGIN
  -- Step 1: Drop all CHECK constraints BEFORE updating values
  -- Assets status constraint
  ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;
  
  -- Assets criticality constraint
  ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_criticality_check;
  
  -- Alerts severity constraint
  ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_severity_check;
  
  -- Maintenance tickets status constraint
  ALTER TABLE maintenance_tickets DROP CONSTRAINT IF EXISTS maintenance_tickets_status_check;
  
  -- Maintenance tickets priority constraint
  ALTER TABLE maintenance_tickets DROP CONSTRAINT IF EXISTS maintenance_tickets_priority_check;
  
  -- PM tasks status constraint
  ALTER TABLE pm_tasks DROP CONSTRAINT IF EXISTS pm_tasks_status_check;
  
  -- Downtime events type constraint
  ALTER TABLE downtime_events DROP CONSTRAINT IF EXISTS downtime_events_type_check;

  -- Step 2: Update all 'operational' statuses to 'active' (lowercase first)
  UPDATE assets 
  SET status = 'active' 
  WHERE LOWER(status) = 'operational';

  -- Step 3: Capitalize all status values
  UPDATE assets 
  SET status = INITCAP(status)
  WHERE status != INITCAP(status);

  -- Step 4: Capitalize all criticality values
  UPDATE assets 
  SET criticality = INITCAP(criticality)
  WHERE criticality != INITCAP(criticality);

  -- Step 5: Update alerts severity
  UPDATE alerts 
  SET severity = INITCAP(severity)
  WHERE severity != INITCAP(severity);

  -- Step 6: Update maintenance tickets priority
  UPDATE maintenance_tickets 
  SET priority = INITCAP(priority)
  WHERE priority != INITCAP(priority);

  -- Step 7: Update maintenance tickets status (keep underscores, just capitalize first letter)
  UPDATE maintenance_tickets 
  SET status = CASE 
    WHEN LOWER(status) = 'open' THEN 'Open'
    WHEN LOWER(status) = 'in_progress' THEN 'In_progress'
    WHEN LOWER(status) = 'resolved' THEN 'Resolved'
    WHEN LOWER(status) = 'closed' THEN 'Closed'
    ELSE INITCAP(status)
  END
  WHERE LOWER(status) IN ('open', 'in_progress', 'resolved', 'closed');

  -- Step 8: Update PM tasks status
  UPDATE pm_tasks 
  SET status = INITCAP(status)
  WHERE status != INITCAP(status);

  -- Step 9: Update downtime events type
  UPDATE downtime_events 
  SET type = INITCAP(type)
  WHERE type != INITCAP(type);

  -- Step 10: Recreate CHECK constraints with capitalized values
  -- Assets status constraint
  ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;
  ALTER TABLE assets ADD CONSTRAINT assets_status_check 
    CHECK (status IN ('Active', 'Maintenance', 'Retired', 'Warning', 'Critical', 'Offline'));

  -- Assets criticality constraint
  ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_criticality_check;
  ALTER TABLE assets ADD CONSTRAINT assets_criticality_check 
    CHECK (criticality IN ('Low', 'Medium', 'High', 'Critical'));

  -- Alerts severity constraint
  ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_severity_check;
  ALTER TABLE alerts ADD CONSTRAINT alerts_severity_check 
    CHECK (severity IN ('Low', 'Medium', 'High', 'Critical'));

  -- Maintenance tickets status constraint
  ALTER TABLE maintenance_tickets DROP CONSTRAINT IF EXISTS maintenance_tickets_status_check;
  ALTER TABLE maintenance_tickets ADD CONSTRAINT maintenance_tickets_status_check 
    CHECK (status IN ('Open', 'In_progress', 'Resolved', 'Closed'));

  -- Maintenance tickets priority constraint
  ALTER TABLE maintenance_tickets DROP CONSTRAINT IF EXISTS maintenance_tickets_priority_check;
  ALTER TABLE maintenance_tickets ADD CONSTRAINT maintenance_tickets_priority_check 
    CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent'));

  -- PM tasks status constraint
  ALTER TABLE pm_tasks DROP CONSTRAINT IF EXISTS pm_tasks_status_check;
  ALTER TABLE pm_tasks ADD CONSTRAINT pm_tasks_status_check 
    CHECK (status IN ('Scheduled', 'Completed', 'Overdue', 'Cancelled'));

  -- Downtime events type constraint
  ALTER TABLE downtime_events DROP CONSTRAINT IF EXISTS downtime_events_type_check;
  ALTER TABLE downtime_events ADD CONSTRAINT downtime_events_type_check 
    CHECK (type IN ('Planned', 'Unplanned'));

  -- Step 11: Update default values
  ALTER TABLE assets ALTER COLUMN status SET DEFAULT 'Active';
  ALTER TABLE assets ALTER COLUMN criticality SET DEFAULT 'Medium';

END $$;

