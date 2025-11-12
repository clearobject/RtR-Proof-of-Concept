-- Seed data for Rent the Runway Operations Prototype
-- This file seeds the database with test data for development and demonstration

-- Reset high-churn tables so demo data remains deterministic across runs
TRUNCATE TABLE sensor_data RESTART IDENTITY CASCADE;
TRUNCATE TABLE alerts RESTART IDENTITY CASCADE;
TRUNCATE TABLE maintenance_tickets RESTART IDENTITY CASCADE;
TRUNCATE TABLE downtime_events RESTART IDENTITY CASCADE;
TRUNCATE TABLE asset_costs RESTART IDENTITY CASCADE;
TRUNCATE TABLE pm_tasks RESTART IDENTITY CASCADE;
TRUNCATE TABLE pm_templates RESTART IDENTITY CASCADE;

-- Insert Facilities
INSERT INTO facilities (id, name, code, address) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'New Jersey Facility', 'EWR', 'Newark, NJ'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Dallas Fort Worth Facility', 'DFW', 'Dallas, TX')
ON CONFLICT (id) DO NOTHING;

-- Insert Asset Types
INSERT INTO asset_types (id, name, category) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', 'Washing Machine', 'equipment'),
  ('660e8400-e29b-41d4-a716-446655440001', 'Dryer', 'equipment'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Dry Cleaner', 'equipment'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Conveyor', 'infrastructure'),
  ('660e8400-e29b-41d4-a716-446655440004', 'Soap Pump', 'equipment'),
  ('660e8400-e29b-41d4-a716-446655440005', 'Steam Tunnel', 'equipment'),
  ('660e8400-e29b-41d4-a716-446655440006', 'Press', 'equipment'),
  ('660e8400-e29b-41d4-a716-446655440007', 'Automated Sorter', 'infrastructure'),
  ('660e8400-e29b-41d4-a716-446655440008', 'Quality Scanner', 'equipment'),
  ('660e8400-e29b-41d4-a716-446655440009', 'Packing Line', 'infrastructure')
ON CONFLICT (id) DO NOTHING;

-- Insert Assets (Capital Asset Management)
INSERT INTO assets (id, name, type_id, type, manufacturer, model, serial_number, facility_id, zone, in_service_date, expected_life_years, criticality, status) VALUES
  ('770e8400-e29b-41d4-a716-446655440000', 'Washer Unit 01', '660e8400-e29b-41d4-a716-446655440000', 'Washing Machine', 'Continental', 'EH055I2102111500', 'W001', '550e8400-e29b-41d4-a716-446655440000', 'Wet Cleaning', '2020-01-15', 10, 'high', 'active'),
  ('770e8400-e29b-41d4-a716-446655440001', 'Washer Unit 02', '660e8400-e29b-41d4-a716-446655440000', 'Washing Machine', 'Continental', 'EH055I2102111500', 'W002', '550e8400-e29b-41d4-a716-446655440000', 'Wet Cleaning', '2020-01-15', 10, 'high', 'active'),
  ('770e8400-e29b-41d4-a716-446655440002', 'Dryer Unit 01', '660e8400-e29b-41d4-a716-446655440001', 'Dryer', 'Miele', 'PT 8807D', 'D001', '550e8400-e29b-41d4-a716-446655440000', 'Wet Cleaning', '2019-06-01', 8, 'high', 'active'),
  ('770e8400-e29b-41d4-a716-446655440003', 'Dryer Unit 02', '660e8400-e29b-41d4-a716-446655440001', 'Dryer', 'Miele', 'PDR944SI', 'D002', '550e8400-e29b-41d4-a716-446655440000', 'Wet Cleaning', '2019-06-01', 8, 'high', 'active'),
  ('770e8400-e29b-41d4-a716-446655440004', 'Dry Cleaner Unit 01', '660e8400-e29b-41d4-a716-446655440002', 'Dry Cleaner', 'Columbia', 'TL HCS 800 N2', 'DC001', '550e8400-e29b-41d4-a716-446655440000', 'Dry Clean & Spotting', '2018-03-10', 12, 'critical', 'active'),
  ('770e8400-e29b-41d4-a716-446655440005', 'Dry Cleaner Unit 02', '660e8400-e29b-41d4-a716-446655440002', 'Dry Cleaner', 'Union', 'HL880', 'DC002', '550e8400-e29b-41d4-a716-446655440000', 'Dry Clean & Spotting', '2018-03-10', 12, 'critical', 'active'),
  ('770e8400-e29b-41d4-a716-446655440006', 'Steam Tunnel 01', '660e8400-e29b-41d4-a716-446655440005', 'Steam Tunnel', 'Unipress', 'ST-220', 'ST001', '550e8400-e29b-41d4-a716-446655440000', 'Finishing', '2017-09-01', 15, 'critical', 'active'),
  ('770e8400-e29b-41d4-a716-446655440007', 'Garment Press 01', '660e8400-e29b-41d4-a716-446655440006', 'Press', 'Hoffman', 'HP-600', 'P001', '550e8400-e29b-41d4-a716-446655440000', 'Finishing', '2018-11-12', 12, 'high', 'maintenance'),
  ('770e8400-e29b-41d4-a716-446655440008', 'Automated Sorter 01', '660e8400-e29b-41d4-a716-446655440007', 'Automated Sorter', 'Dematic', 'FlexSort 300', 'AS001', '550e8400-e29b-41d4-a716-446655440000', 'Sortation', '2021-05-20', 15, 'critical', 'active'),
  ('770e8400-e29b-41d4-a716-446655440009', 'Quality Scanner 01', '660e8400-e29b-41d4-a716-446655440008', 'Quality Scanner', 'Zebra', 'QS-900', 'QS001', '550e8400-e29b-41d4-a716-446655440000', 'QA & Packing', '2022-02-10', 8, 'medium', 'active'),
  ('770e8400-e29b-41d4-a716-446655440010', 'Packing Line 01', '660e8400-e29b-41d4-a716-446655440009', 'Packing Line', 'ProShip', 'PackPro X', 'PL001', '550e8400-e29b-41d4-a716-446655440000', 'QA & Packing', '2021-08-18', 10, 'high', 'active'),
  ('770e8400-e29b-41d4-a716-446655440011', 'Steam Tunnel 02', '660e8400-e29b-41d4-a716-446655440005', 'Steam Tunnel', 'Unipress', 'ST-220', 'ST002', '550e8400-e29b-41d4-a716-446655440000', 'Finishing', '2019-04-03', 15, 'high', 'active'),
  ('770e8400-e29b-41d4-a716-446655440012', 'Garment Press 02', '660e8400-e29b-41d4-a716-446655440006', 'Press', 'Hoffman', 'HP-600', 'P002', '550e8400-e29b-41d4-a716-446655440000', 'Finishing', '2019-04-03', 12, 'medium', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert Machines (Digital Twin)
INSERT INTO machines (id, name, type, zone, facility_id, asset_id, asset_alias, status, coordinates, manufacturer, model, serial_number) VALUES
  ('880e8400-e29b-41d4-a716-446655440000', 'Washer-01', 'washer', 'Wet Cleaning', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Washer-01', 'operational', '{"x": 100, "y": 200}', 'Continental', 'EH055I2102111500', 'W001'),
  ('880e8400-e29b-41d4-a716-446655440001', 'Washer-02', 'washer', 'Wet Cleaning', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', 'Washer-02', 'warning', '{"x": 200, "y": 200}', 'Continental', 'EH055I2102111500', 'W002'),
  ('880e8400-e29b-41d4-a716-446655440002', 'Dryer-01', 'dryer', 'Wet Cleaning', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 'Dryer-01', 'operational', '{"x": 100, "y": 300}', 'Miele', 'PT 8807D', 'D001'),
  ('880e8400-e29b-41d4-a716-446655440003', 'Dryer-02', 'dryer', 'Wet Cleaning', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', 'Dryer-02', 'operational', '{"x": 200, "y": 300}', 'Miele', 'PDR944SI', 'D002'),
  ('880e8400-e29b-41d4-a716-446655440004', 'Dry-Cleaner-01', 'dry_cleaner', 'Dry Clean & Spotting', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440004', 'Dry-Cleaner-01', 'critical', '{"x": 300, "y": 200}', 'Columbia', 'TL HCS 800 N2', 'DC001'),
  ('880e8400-e29b-41d4-a716-446655440005', 'Dry-Cleaner-02', 'dry_cleaner', 'Dry Clean & Spotting', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440005', 'Dry-Cleaner-02', 'operational', '{"x": 400, "y": 200}', 'Union', 'HL880', 'DC002'),
  ('880e8400-e29b-41d4-a716-446655440006', 'Steam-Tunnel-01', 'steam_tunnel', 'Finishing', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440006', 'Steam-Tunnel-01', 'warning', '{"x": 500, "y": 220}', 'Unipress', 'ST-220', 'ST001'),
  ('880e8400-e29b-41d4-a716-446655440007', 'Press-01', 'press', 'Finishing', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440007', 'Press-01', 'maintenance', '{"x": 550, "y": 260}', 'Hoffman', 'HP-600', 'P001'),
  ('880e8400-e29b-41d4-a716-446655440008', 'Sorter-01', 'sorter', 'Sortation', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440008', 'Sorter-01', 'operational', '{"x": 620, "y": 180}', 'Dematic', 'FlexSort 300', 'AS001'),
  ('880e8400-e29b-41d4-a716-446655440009', 'QA-Scanner-01', 'quality_scanner', 'QA & Packing', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440009', 'QA-Scanner-01', 'operational', '{"x": 700, "y": 200}', 'Zebra', 'QS-900', 'QS001'),
  ('880e8400-e29b-41d4-a716-446655440010', 'Pack-Line-01', 'packing_line', 'QA & Packing', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440010', 'Pack-Line-01', 'operational', '{"x": 760, "y": 220}', 'ProShip', 'PackPro X', 'PL001'),
  ('880e8400-e29b-41d4-a716-446655440011', 'Steam-Tunnel-02', 'steam_tunnel', 'Finishing', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440011', 'Steam-Tunnel-02', 'operational', '{"x": 520, "y": 260}', 'Unipress', 'ST-220', 'ST002'),
  ('880e8400-e29b-41d4-a716-446655440012', 'Press-02', 'press', 'Finishing', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440012', 'Press-02', 'operational', '{"x": 560, "y": 300}', 'Hoffman', 'HP-600', 'P002')
ON CONFLICT (id) DO NOTHING;

-- Insert rich time-series sensor data (14 days of hourly readings per machine)
WITH machine_list AS (
  SELECT id, type
  FROM machines
),
hours AS (
  SELECT generate_series(NOW() - INTERVAL '14 days', NOW(), INTERVAL '1 hour') AS ts
),
metrics AS (
  SELECT
    m.id AS machine_id,
    h.ts,
    ROUND(
      CASE
        WHEN m.type = 'washer' THEN 42 + RANDOM() * 6
        WHEN m.type = 'dryer' THEN 63 + RANDOM() * 8
        WHEN m.type = 'dry_cleaner' THEN 78 + RANDOM() * 10
        WHEN m.type = 'steam_tunnel' THEN 110 + RANDOM() * 12
        WHEN m.type = 'press' THEN 180 + RANDOM() * 20
        WHEN m.type = 'sorter' THEN 35 + RANDOM() * 5
        WHEN m.type = 'quality_scanner' THEN 32 + RANDOM() * 3
        WHEN m.type = 'packing_line' THEN 30 + RANDOM() * 4
        ELSE 40 + RANDOM() * 5
      END,
      1
    ) AS temperature,
    ROUND(
      CASE
        WHEN m.type IN ('washer', 'dryer') THEN 1.5 + RANDOM() * 2.5
        WHEN m.type = 'dry_cleaner' THEN 2.2 + RANDOM() * 1.3
        WHEN m.type = 'steam_tunnel' THEN 1.8 + RANDOM() * 1.2
        WHEN m.type = 'press' THEN 1.0 + RANDOM() * 1.5
        ELSE 0.8 + RANDOM()
      END,
      2
    ) AS vibration,
    ROUND(
      CASE
        WHEN m.type = 'washer' THEN 3.1 + RANDOM() * 0.6
        WHEN m.type = 'dryer' THEN 4.0 + RANDOM() * 0.8
        WHEN m.type = 'dry_cleaner' THEN 5.0 + RANDOM() * 1.0
        WHEN m.type = 'steam_tunnel' THEN 8.0 + RANDOM() * 1.5
        WHEN m.type = 'press' THEN 2.5 + RANDOM() * 0.8
        WHEN m.type = 'packing_line' THEN 6.5 + RANDOM() * 1.0
        ELSE 2.0 + RANDOM()
      END,
      2
    ) AS power,
    ROUND(
      CASE
        WHEN m.type IN ('dryer', 'steam_tunnel') THEN 12 + RANDOM() * 6
        WHEN m.type = 'washer' THEN 35 + RANDOM() * 15
        ELSE NULL
      END,
      1
    ) AS humidity,
    ROUND(
      CASE
        WHEN m.type = 'steam_tunnel' THEN 180 + RANDOM() * 40
        WHEN m.type = 'packing_line' THEN 90 + RANDOM() * 25
        WHEN m.type = 'washer' THEN 120 + RANDOM() * 30
        ELSE NULL
      END,
      1
    ) AS flow_rate
  FROM machine_list m
  CROSS JOIN hours h
)
INSERT INTO sensor_data (machine_id, timestamp, temperature, vibration, power, humidity, flow_rate)
SELECT machine_id, ts, temperature, vibration, power, humidity, flow_rate
FROM metrics;

-- Insert layered alert scenarios
INSERT INTO alerts (machine_id, severity, message, acknowledged, created_at) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', 'medium', 'High vibration detected: 4.9 mm/s (normal: <3.0)', false, NOW() - INTERVAL '45 minutes'),
  ('880e8400-e29b-41d4-a716-446655440004', 'critical', 'Temperature exceeds threshold: 91.4°C (max: 80°C)', false, NOW() - INTERVAL '2 hours'),
  ('880e8400-e29b-41d4-a716-446655440006', 'medium', 'Steam pressure fluctuation detected on Steam-Tunnel-01', true, NOW() - INTERVAL '4 hours'),
  ('880e8400-e29b-41d4-a716-446655440007', 'high', 'Press-01 offline due to actuator fault', false, NOW() - INTERVAL '25 minutes'),
  ('880e8400-e29b-41d4-a716-446655440008', 'low', 'Sorter-01 batch backlog exceeds 120 bins', false, NOW() - INTERVAL '90 minutes'),
  ('880e8400-e29b-41d4-a716-446655440009', 'medium', 'QA-Scanner-01 misread rate trending above 2.5%', true, NOW() - INTERVAL '12 hours'),
  ('880e8400-e29b-41d4-a716-446655440010', 'low', 'Pack-Line-01 consumable replenishment due in 2 hours', false, NOW() - INTERVAL '30 minutes'),
  ('880e8400-e29b-41d4-a716-446655440011', 'medium', 'Steam-Tunnel-02 condensate temperature rising', false, NOW() - INTERVAL '3 hours');

-- Insert Sample Maintenance Tickets (only if users exist)
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    INSERT INTO maintenance_tickets (id, machine_id, asset_id, alert_id, title, description, status, priority, created_by, created_at, updated_at, resolved_at) VALUES
      ('990e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', (SELECT id FROM alerts WHERE machine_id = '880e8400-e29b-41d4-a716-446655440001' ORDER BY created_at DESC LIMIT 1), 'High Vibration on Washer-02', 'Vibration readings consistently above normal threshold. Requires bearing inspection.', 'in_progress', 'high', first_user_id, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '20 minutes', NULL),
      ('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', (SELECT id FROM alerts WHERE machine_id = '880e8400-e29b-41d4-a716-446655440004' ORDER BY created_at DESC LIMIT 1), 'Critical Temperature Alert - Dry Cleaner-01', 'Temperature exceeded safety limit during solvent cycle. Inspect heat exchanger and coolant loop.', 'open', 'urgent', first_user_id, NOW() - INTERVAL '90 minutes', NOW() - INTERVAL '90 minutes', NULL),
      ('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', NULL, 'Scheduled PM - Dryer-01', 'Quarterly preventive maintenance checklist due, including lint screen inspection and burner calibration.', 'open', 'medium', first_user_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NULL),
      ('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440006', (SELECT id FROM alerts WHERE machine_id = '880e8400-e29b-41d4-a716-446655440006' ORDER BY created_at DESC LIMIT 1), 'Steam Pressure Variance - Tunnel 01', 'Steam tunnel pressure oscillating outside acceptable range. Inspect modulating valve.', 'resolved', 'medium', first_user_id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '18 hours'),
      ('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440008', NULL, 'Sorter Throughput Lag', 'Automated sorter throughput below 900 units/hour. Investigate diverter jams and software throttling.', 'open', 'high', first_user_id, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '1 hour', NULL),
      ('990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440010', NULL, 'Packing Line Film Tear Rate', 'Poly mailer tear rate above 1.5%. Replace worn dancer rollers.', 'closed', 'medium', first_user_id, NOW() - INTERVAL '12 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
      ('990e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440009', NULL, 'Scanner Misread Spike', 'Quality scanner misreads spiking during evening shift. Evaluate lighting calibration.', 'resolved', 'medium', first_user_id, NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '20 hours'),
      ('990e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440007', (SELECT id FROM alerts WHERE machine_id = '880e8400-e29b-41d4-a716-446655440007' ORDER BY created_at DESC LIMIT 1), 'Press-01 Actuator Fault', 'Hydraulic actuator travel sensor fault. Requires replacement.', 'open', 'urgent', first_user_id, NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '25 minutes', NULL)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Preventive maintenance templates
INSERT INTO pm_templates (id, name, asset_type_id, frequency_days, frequency_cycles, description) VALUES
  ('bb0e8400-e29b-41d4-a716-446655440000', 'Washer Quarterly PM', '660e8400-e29b-41d4-a716-446655440000', 90, 1800, 'Inspect seals, balance drum, test vibration sensors, verify detergent dosing.'),
  ('bb0e8400-e29b-41d4-a716-446655440001', 'Dryer Burner Tune-Up', '660e8400-e29b-41d4-a716-446655440001', 120, NULL, 'Clean burner assembly, verify exhaust flow, lubricate bearings.'),
  ('bb0e8400-e29b-41d4-a716-446655440002', 'Steam Tunnel Calibration', '660e8400-e29b-41d4-a716-446655440005', 60, NULL, 'Calibrate temp probes, inspect nozzles, flush condensate lines.'),
  ('bb0e8400-e29b-41d4-a716-446655440003', 'Sorter Safety Check', '660e8400-e29b-41d4-a716-446655440007', 30, 50000, 'Verify sensors, check belt tension, test emergency stops.'),
  ('bb0e8400-e29b-41d4-a716-446655440004', 'Packing Line Rollers', '660e8400-e29b-41d4-a716-446655440009', 45, NULL, 'Inspect rollers, replace consumables, validate label alignment.')
ON CONFLICT (id) DO NOTHING;

-- Generate preventive maintenance tasks across assets
INSERT INTO pm_tasks (id, template_id, asset_id, scheduled_date, completed_date, completed_by, status, notes, created_at)
SELECT
  uuid_generate_v4(),
  template_id,
  asset_id,
  scheduled_date,
  completed_date,
  completed_by,
  status,
  notes,
  created_at
FROM (
  SELECT
    'bb0e8400-e29b-41d4-a716-446655440000'::uuid AS template_id,
    a.id AS asset_id,
    (CURRENT_DATE - s.day_offset) AS scheduled_date,
    CASE
      WHEN s.state = 'completed' THEN (CURRENT_DATE - s.day_offset + INTERVAL '1 day')::date
      ELSE NULL
    END AS completed_date,
    NULL::uuid AS completed_by,
    s.state AS status,
    CASE
      WHEN s.state = 'completed' THEN 'Checklist completed without exceptions.'
      WHEN s.state = 'overdue' THEN 'Awaiting technician assignment.'
      ELSE 'Queued for upcoming cycle.'
    END AS notes,
    NOW() - (s.day_offset * INTERVAL '1 day') AS created_at
  FROM assets a
  CROSS JOIN LATERAL (
    VALUES
      (30, 'completed'),
      (15, 'completed'),
      (5, 'scheduled'),
      (0, 'scheduled'),
      (10, 'overdue')
  ) AS s(day_offset, state)
  WHERE a.type_id = '660e8400-e29b-41d4-a716-446655440000'

  UNION ALL

  SELECT
    'bb0e8400-e29b-41d4-a716-446655440002'::uuid,
    a.id,
    (CURRENT_DATE - s.day_offset),
    CASE WHEN s.state = 'completed' THEN (CURRENT_DATE - s.day_offset + INTERVAL '2 days')::date ELSE NULL END,
    NULL,
    s.state,
    CASE
      WHEN s.state = 'completed' THEN 'Steam tunnel recalibrated and documentation uploaded.'
      WHEN s.state = 'overdue' THEN 'Waiting for steam window availability.'
      ELSE 'Scheduled around garment flow.'
    END,
    NOW() - (s.day_offset * INTERVAL '1 day')
  FROM assets a
  CROSS JOIN LATERAL (
    VALUES (45, 'completed'), (20, 'completed'), (7, 'scheduled'), (2, 'scheduled'), (18, 'overdue')
  ) AS s(day_offset, state)
  WHERE a.type_id = '660e8400-e29b-41d4-a716-446655440005'

  UNION ALL

  SELECT
    'bb0e8400-e29b-41d4-a716-446655440003'::uuid,
    a.id,
    (CURRENT_DATE - s.day_offset),
    CASE WHEN s.state = 'completed' THEN (CURRENT_DATE - s.day_offset)::date ELSE NULL END,
    NULL,
    s.state,
    CASE
      WHEN s.state = 'completed' THEN 'Sorter calibration capture logged.'
      WHEN s.state = 'overdue' THEN 'Requires software support to attend.'
      ELSE 'Will run during overnight window.'
    END,
    NOW() - (s.day_offset * INTERVAL '1 day')
  FROM assets a
  CROSS JOIN LATERAL (
    VALUES (21, 'completed'), (14, 'completed'), (3, 'scheduled'), (0, 'scheduled'), (9, 'overdue')
  ) AS s(day_offset, state)
  WHERE a.type_id = '660e8400-e29b-41d4-a716-446655440007'

  UNION ALL

  SELECT
    'bb0e8400-e29b-41d4-a716-446655440004'::uuid,
    a.id,
    (CURRENT_DATE - s.day_offset),
    CASE WHEN s.state = 'completed' THEN (CURRENT_DATE - s.day_offset + INTERVAL '1 day')::date ELSE NULL END,
    NULL,
    s.state,
    CASE
      WHEN s.state = 'completed' THEN 'Consumables refreshed and QA signed off.'
      WHEN s.state = 'overdue' THEN 'Hold pending packaging redesign decision.'
      ELSE 'Coordinated with customer experience team.'
    END,
    NOW() - (s.day_offset * INTERVAL '1 day')
  FROM assets a
  CROSS JOIN LATERAL (
    VALUES (40, 'completed'), (25, 'completed'), (5, 'scheduled'), (1, 'scheduled'), (12, 'overdue')
  ) AS s(day_offset, state)
  WHERE a.type_id = '660e8400-e29b-41d4-a716-446655440009'
) AS generated_tasks;

-- Downtime history
INSERT INTO downtime_events (id, asset_id, machine_id, start_time, end_time, duration_minutes, type, cause, impact) VALUES
  ('cc0e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '7 days 2 hours', NOW() - INTERVAL '7 days 1 hour 15 minutes', 45, 'unplanned', 'Bearing wear triggered vibration trip.', 'Throughput loss of 240 garments.'),
  ('cc0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440006', NOW() - INTERVAL '5 days 4 hours', NOW() - INTERVAL '5 days 3 hours 20 minutes', 40, 'unplanned', 'Steam supply interruption.', 'Delayed outbound orders by 480 units.'),
  ('cc0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440010', NOW() - INTERVAL '3 days 6 hours', NOW() - INTERVAL '3 days 5 hours 10 minutes', 50, 'unplanned', 'Film feed jam at packaging station.', 'Customer shipments delayed by 90 minutes.'),
  ('cc0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440008', NOW() - INTERVAL '9 days 1 hour', NOW() - INTERVAL '9 days', 60, 'planned', 'Firmware upgrade to routing logic.', 'Sorter throughput increased 12% post-upgrade.'),
  ('cc0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '13 days 3 hours', NOW() - INTERVAL '13 days 2 hours 30 minutes', 30, 'unplanned', 'Cooling loop contamination.', 'Caused 3 urgent dry cleaning reworks.'),
  ('cc0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440007', NOW() - INTERVAL '1 days 5 hours', NULL, NULL, 'unplanned', 'Actuator travel sensor failure.', 'Finishing backlog accumulating ~160 garments/hour.'),
  ('cc0e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '30 days 4 hours', NOW() - INTERVAL '30 days 2 hours', 120, 'planned', 'Quarterly thermal calibration.', 'Executed during night shift to avoid disruption.')
ON CONFLICT (id) DO NOTHING;

-- Asset cost history (materials, labor, energy)
INSERT INTO asset_costs (id, asset_id, maintenance_ticket_id, type, amount, description, date) VALUES
  ('dd0e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440000', 'parts', 860.00, 'Replacement bearing kit and vibration isolation mounts.', CURRENT_DATE - INTERVAL '7 days'),
  ('dd0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440000', 'labor', 420.00, 'Technician labor - 5.6 hours @ $75/hr.', CURRENT_DATE - INTERVAL '7 days'),
  ('dd0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440001', 'parts', 1240.00, 'New coolant pump and temperature probe.', CURRENT_DATE - INTERVAL '2 days'),
  ('dd0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440001', 'labor', 675.00, 'Emergency call-in + overtime (9 hours).', CURRENT_DATE - INTERVAL '2 days'),
  ('dd0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440003', 'parts', 310.00, 'Steam modulating valve rebuild kit.', CURRENT_DATE - INTERVAL '3 days'),
  ('dd0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440003', 'labor', 225.00, 'Technician follow-up inspection.', CURRENT_DATE - INTERVAL '1 day'),
  ('dd0e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440005', 'parts', 190.00, 'Replacement poly mailer film spools.', CURRENT_DATE - INTERVAL '10 days'),
  ('dd0e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440005', 'labor', 150.00, 'Packaging tech crew training refresh.', CURRENT_DATE - INTERVAL '10 days'),
  ('dd0e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440004', 'energy', 420.00, 'Incremental energy cost due to sorter backlog overtime.', CURRENT_DATE - INTERVAL '3 days'),
  ('dd0e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440007', 'parts', 960.00, 'Hydraulic actuator assembly.', CURRENT_DATE - INTERVAL '1 day'),
  ('dd0e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440007', 'labor', 525.00, 'Field service specialist (7 hours).', CURRENT_DATE - INTERVAL '1 day'),
  ('dd0e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440012', NULL, 'energy', 275.00, 'Peak energy surcharge due to evening shift throughput.', CURRENT_DATE - INTERVAL '4 days'),
  ('dd0e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', 'parts', 480.00, 'Burner calibration kit and belts.', CURRENT_DATE - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Social Posts (Social Pulse)
INSERT INTO social_posts (id, platform, content, author, sentiment_score, category, occasion, engagement_count, posted_at) VALUES
  -- Recent positive posts
  ('aa0e8400-e29b-41d4-a716-446655440000', 'instagram', 'Love my @renttherunway dress for tonight! Perfect fit and arrived on time! 💕', 'fashionista123', 9, NULL, 'gala', 245, NOW() - INTERVAL '2 hours'),
  ('aa0e8400-e29b-41d4-a716-446655440002', 'reddit', 'RTR saved my wedding! The dress was perfect and arrived exactly when promised. Highly recommend!', 'bride2024', 10, NULL, 'wedding', 89, NOW() - INTERVAL '1 day'),
  ('aa0e8400-e29b-41d4-a716-446655440004', 'tiktok', 'RTR haul! Everything fits perfectly and looks brand new. Obsessed! #RentTheRunway', 'tiktoker321', 9, NULL, NULL, 1567, NOW() - INTERVAL '6 hours'),
  
  -- Recent negative posts
  ('aa0e8400-e29b-41d4-a716-446655440001', 'twitter', 'Disappointed with @renttherunway - dress arrived with a stain and customer service was slow to respond', 'user456', 3, 'quality', NULL, 12, NOW() - INTERVAL '5 hours'),
  ('aa0e8400-e29b-41d4-a716-446655440003', 'instagram', 'My @renttherunway order was delayed by 2 days. Had to scramble for my event 😞', 'stylist789', 4, 'delivery', 'interview', 34, NOW() - INTERVAL '3 hours'),
  ('aa0e8400-e29b-41d4-a716-446655440005', 'facebook', 'Not happy with my recent RTR experience. Dress smelled like chemicals and had visible wear marks.', 'reviewer999', 2, 'quality', NULL, 8, NOW() - INTERVAL '4 hours'),
  
  -- More diverse posts (last 7 days)
  ('aa0e8400-e29b-41d4-a716-446655440010', 'instagram', 'Just got my @renttherunway package! The dress fits like a dream and looks brand new. Customer service was super helpful too!', 'stylequeen88', 9, NULL, 'party', 432, NOW() - INTERVAL '8 hours'),
  ('aa0e8400-e29b-41d4-a716-446655440011', 'twitter', 'RTR came through for my job interview! Professional look, great quality, and fast shipping. Will definitely use again.', 'careerpro2024', 8, NULL, 'interview', 67, NOW() - INTERVAL '12 hours'),
  ('aa0e8400-e29b-41d4-a716-446655440012', 'reddit', 'Has anyone else had issues with RTR billing? I was charged twice for the same order and it took 3 days to get a refund.', 'confuseduser', 4, 'billing', NULL, 234, NOW() - INTERVAL '1 day'),
  ('aa0e8400-e29b-41d4-a716-446655440013', 'tiktok', 'RTR unboxing gone wrong 😂 The dress I ordered was completely different from what I selected. Still cute though!', 'tiktokfashion', 7, 'quality', NULL, 892, NOW() - INTERVAL '18 hours'),
  ('aa0e8400-e29b-41d4-a716-446655440014', 'facebook', 'My daughter''s prom dress from RTR was absolutely stunning! She felt like a princess. Thank you for making her night special!', 'proudmom', 10, NULL, 'prom', 156, NOW() - INTERVAL '2 days'),
  ('aa0e8400-e29b-41d4-a716-446655440015', 'instagram', 'Ugh, my RTR dress arrived damaged. There''s a tear in the fabric. Waiting to hear back from customer service...', 'disappointed123', 3, 'quality', 'wedding', 45, NOW() - INTERVAL '1 day'),
  ('aa0e8400-e29b-41d4-a716-446655440016', 'twitter', 'Shoutout to @renttherunway for the amazing selection! Found the perfect dress for my company gala. Fit was spot on!', 'executivepro', 9, NULL, 'gala', 123, NOW() - INTERVAL '3 days'),
  ('aa0e8400-e29b-41d4-a716-446655440017', 'reddit', 'RTR availability is terrible lately. Everything I want is booked months in advance. What''s going on?', 'frustrateduser', 5, 'availability', NULL, 567, NOW() - INTERVAL '2 days'),
  ('aa0e8400-e29b-41d4-a716-446655440018', 'tiktok', 'RTR try-on haul! Some hits, some misses, but overall love the concept. The fit guide helped a lot!', 'fashionlover', 8, 'fit', NULL, 2341, NOW() - INTERVAL '4 days'),
  ('aa0e8400-e29b-41d4-a716-446655440019', 'facebook', 'Customer service at RTR is amazing! They helped me find the perfect dress when I was in a pinch. Highly recommend!', 'satisfiedcustomer', 9, 'customer_service', NULL, 89, NOW() - INTERVAL '5 days'),
  
  -- Posts from last 2 weeks
  ('aa0e8400-e29b-41d4-a716-446655440020', 'instagram', 'My RTR dress was too small even though I followed the size guide. Had to return it and missed my event. So disappointed.', 'sizeproblem', 3, 'fit', 'party', 78, NOW() - INTERVAL '6 days'),
  ('aa0e8400-e29b-41d4-a716-446655440021', 'twitter', 'RTR delivery was late AGAIN. This is the third time. Starting to lose faith in the service.', 'lateorder', 4, 'delivery', NULL, 34, NOW() - INTERVAL '7 days'),
  ('aa0e8400-e29b-41d4-a716-446655440022', 'reddit', 'Just tried RTR for the first time and I''m hooked! The quality is great and the selection is incredible.', 'newuser', 9, NULL, NULL, 145, NOW() - INTERVAL '8 days'),
  ('aa0e8400-e29b-41d4-a716-446655440023', 'tiktok', 'RTR dress smelled like it was just dry cleaned. Is this normal? The smell is really strong.', 'smellconcern', 6, 'quality', NULL, 456, NOW() - INTERVAL '9 days'),
  ('aa0e8400-e29b-41d4-a716-446655440024', 'facebook', 'Best experience with RTR! The dress was perfect, arrived on time, and customer service was responsive.', 'happycustomer', 10, NULL, 'wedding', 234, NOW() - INTERVAL '10 days'),
  ('aa0e8400-e29b-41d4-a716-446655440025', 'instagram', 'RTR dress had a stain on it when it arrived. They sent a replacement quickly but still inconvenient.', 'stainissue', 6, 'quality', NULL, 67, NOW() - INTERVAL '11 days'),
  ('aa0e8400-e29b-41d4-a716-446655440026', 'twitter', 'Love the sustainability aspect of RTR! Renting instead of buying is the future of fashion.', 'ecofashion', 9, NULL, NULL, 789, NOW() - INTERVAL '12 days'),
  ('aa0e8400-e29b-41d4-a716-446655440027', 'reddit', 'RTR billing error - charged me for damage I didn''t cause. Still fighting with customer service after 2 weeks.', 'billingfight', 2, 'billing', NULL, 123, NOW() - INTERVAL '13 days'),
  ('aa0e8400-e29b-41d4-a716-446655440028', 'tiktok', 'RTR unboxing! Everything is so well packaged and the dress looks amazing. Can''t wait to wear it!', 'unboxing', 9, NULL, NULL, 3456, NOW() - INTERVAL '14 days'),
  ('aa0e8400-e29b-41d4-a716-446655440029', 'facebook', 'My RTR order was cancelled last minute. Had to find something else for my event. Very frustrating experience.', 'cancelledorder', 3, 'availability', 'gala', 56, NOW() - INTERVAL '15 days'),
  
  -- Trustpilot reviews
  ('aa0e8400-e29b-41d4-a716-446655440030', 'trustpilot', 'Excellent service! The dress was beautiful and arrived exactly when promised. Will definitely use RTR again.', 'trustpilot_user1', 9, NULL, NULL, 12, NOW() - INTERVAL '3 days'),
  ('aa0e8400-e29b-41d4-a716-446655440031', 'trustpilot', 'Poor quality control. Received a dress with visible damage. Customer service was slow to respond.', 'trustpilot_user2', 4, 'quality', NULL, 8, NOW() - INTERVAL '5 days'),
  ('aa0e8400-e29b-41d4-a716-446655440032', 'trustpilot', 'Great concept but execution needs work. Delivery delays and sizing issues are common.', 'trustpilot_user3', 6, 'delivery', NULL, 15, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Alert Thresholds
INSERT INTO thresholds (machine_type, metric, warning_min, warning_max, critical_min, critical_max) VALUES
  ('washer', 'temperature', 40, 50, 35, 55),
  ('washer', 'vibration', NULL, 3.0, NULL, 4.0),
  ('washer', 'power', 2.0, 4.0, 1.5, 5.0),
  ('dryer', 'temperature', 60, 70, 55, 75),
  ('dryer', 'humidity', 10, 20, 5, 25),
  ('dryer', 'vibration', NULL, 2.0, NULL, 3.0),
  ('dry_cleaner', 'temperature', 70, 80, 65, 85),
  ('dry_cleaner', 'vibration', NULL, 2.5, NULL, 3.5)
ON CONFLICT (machine_type, metric) DO NOTHING;

-- Insert CAM Configuration
INSERT INTO cam_config (key, value, description) VALUES
  ('replacement_priority_weights', '{"age": 0.3, "downtime": 0.25, "maintenance_cost": 0.25, "criticality": 0.2}', 'Weights for replacement priority calculation'),
  ('tco_factors', '{"energy_cost_per_kwh": 0.12, "labor_rate": 75}', 'Factors for TCO calculations')
ON CONFLICT (key) DO NOTHING;

-- Seed demo join link and access request (only if users exist)
DO $$
DECLARE
  admin_user_id UUID;
  join_id UUID;
BEGIN
  SELECT id INTO admin_user_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;

  IF admin_user_id IS NOT NULL THEN
    INSERT INTO join_links (token, name, description, created_by, expires_at, max_requests)
    VALUES (
      'seed-demo-join-link',
      'Demo Join Link',
      'Example access request link for demos and testing',
      admin_user_id,
      NOW() + INTERVAL '30 days',
      50
    )
    ON CONFLICT (token) DO NOTHING;

    SELECT id INTO join_id
    FROM join_links
    WHERE token = 'seed-demo-join-link'
    LIMIT 1;

    IF join_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM access_requests
        WHERE join_token = 'seed-demo-join-link'
          AND email = 'pending.user@example.com'
      ) THEN
        INSERT INTO access_requests (join_link_id, join_token, email, full_name, notes, status)
        VALUES (
          join_id,
          'seed-demo-join-link',
          'pending.user@example.com',
          'Pending Reviewer',
          'Interested in accessing the Rent the Runway operations dashboard.',
          'pending'
        );
      END IF;
    END IF;
  END IF;
END $$;

