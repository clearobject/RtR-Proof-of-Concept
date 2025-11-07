-- Seed data for Rent the Runway Operations Prototype
-- This file seeds the database with test data for development and demonstration

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
  ('660e8400-e29b-41d4-a716-446655440004', 'Soap Pump', 'equipment')
ON CONFLICT (id) DO NOTHING;

-- Insert Assets (Capital Asset Management)
INSERT INTO assets (id, name, type_id, type, manufacturer, model, serial_number, facility_id, zone, in_service_date, expected_life_years, criticality, status) VALUES
  ('770e8400-e29b-41d4-a716-446655440000', 'Washer Unit 01', '660e8400-e29b-41d4-a716-446655440000', 'Washing Machine', 'Continental', 'EH055I2102111500', 'W001', '550e8400-e29b-41d4-a716-446655440000', 'Wet Cleaning', '2020-01-15', 10, 'high', 'active'),
  ('770e8400-e29b-41d4-a716-446655440001', 'Washer Unit 02', '660e8400-e29b-41d4-a716-446655440000', 'Washing Machine', 'Continental', 'EH055I2102111500', 'W002', '550e8400-e29b-41d4-a716-446655440000', 'Wet Cleaning', '2020-01-15', 10, 'high', 'active'),
  ('770e8400-e29b-41d4-a716-446655440002', 'Dryer Unit 01', '660e8400-e29b-41d4-a716-446655440001', 'Dryer', 'Miele', 'PT 8807D', 'D001', '550e8400-e29b-41d4-a716-446655440000', 'Wet Cleaning', '2019-06-01', 8, 'high', 'active'),
  ('770e8400-e29b-41d4-a716-446655440003', 'Dryer Unit 02', '660e8400-e29b-41d4-a716-446655440001', 'Dryer', 'Miele', 'PDR944SI', 'D002', '550e8400-e29b-41d4-a716-446655440000', 'Wet Cleaning', '2019-06-01', 8, 'high', 'active'),
  ('770e8400-e29b-41d4-a716-446655440004', 'Dry Cleaner Unit 01', '660e8400-e29b-41d4-a716-446655440002', 'Dry Cleaner', 'Columbia', 'TL HCS 800 N2', 'DC001', '550e8400-e29b-41d4-a716-446655440000', 'Dry Clean & Spotting', '2018-03-10', 12, 'critical', 'active'),
  ('770e8400-e29b-41d4-a716-446655440005', 'Dry Cleaner Unit 02', '660e8400-e29b-41d4-a716-446655440002', 'Dry Cleaner', 'Union', 'HL880', 'DC002', '550e8400-e29b-41d4-a716-446655440000', 'Dry Clean & Spotting', '2018-03-10', 12, 'critical', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert Machines (Digital Twin)
INSERT INTO machines (id, name, type, zone, facility_id, asset_id, status, coordinates, manufacturer, model, serial_number) VALUES
  ('880e8400-e29b-41d4-a716-446655440000', 'Washer-01', 'washer', 'Wet Cleaning', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'operational', '{"x": 100, "y": 200}', 'Continental', 'EH055I2102111500', 'W001'),
  ('880e8400-e29b-41d4-a716-446655440001', 'Washer-02', 'washer', 'Wet Cleaning', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', 'warning', '{"x": 200, "y": 200}', 'Continental', 'EH055I2102111500', 'W002'),
  ('880e8400-e29b-41d4-a716-446655440002', 'Dryer-01', 'dryer', 'Wet Cleaning', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 'operational', '{"x": 100, "y": 300}', 'Miele', 'PT 8807D', 'D001'),
  ('880e8400-e29b-41d4-a716-446655440003', 'Dryer-02', 'dryer', 'Wet Cleaning', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', 'operational', '{"x": 200, "y": 300}', 'Miele', 'PDR944SI', 'D002'),
  ('880e8400-e29b-41d4-a716-446655440004', 'Dry-Cleaner-01', 'dry_cleaner', 'Dry Clean & Spotting', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440004', 'critical', '{"x": 300, "y": 200}', 'Columbia', 'TL HCS 800 N2', 'DC001'),
  ('880e8400-e29b-41d4-a716-446655440005', 'Dry-Cleaner-02', 'dry_cleaner', 'Dry Clean & Spotting', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440005', 'operational', '{"x": 400, "y": 200}', 'Union', 'HL880', 'DC002')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Sensor Data (last 24 hours)
INSERT INTO sensor_data (machine_id, timestamp, temperature, vibration, power, humidity) VALUES
  -- Washer-01 data (operational)
  ('880e8400-e29b-41d4-a716-446655440000', NOW() - INTERVAL '1 hour', 45.2, 2.1, 3.5, NULL),
  ('880e8400-e29b-41d4-a716-446655440000', NOW() - INTERVAL '2 hours', 44.8, 2.0, 3.4, NULL),
  ('880e8400-e29b-41d4-a716-446655440000', NOW() - INTERVAL '3 hours', 45.5, 2.2, 3.6, NULL),
  
  -- Washer-02 data (warning - high vibration)
  ('880e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '30 minutes', 46.1, 4.8, 3.7, NULL),
  ('880e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 hour', 45.9, 4.5, 3.6, NULL),
  ('880e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 hours', 45.3, 4.2, 3.5, NULL),
  
  -- Dryer-01 data (operational)
  ('880e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '45 minutes', 65.0, 1.5, 4.2, 15.0),
  ('880e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '1.5 hours', 64.5, 1.4, 4.1, 14.8),
  ('880e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '2.5 hours', 65.2, 1.6, 4.3, 15.2),
  
  -- Dry-Cleaner-01 data (critical - high temperature)
  ('880e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '15 minutes', 85.5, 3.2, 5.1, NULL),
  ('880e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '45 minutes', 84.8, 3.0, 5.0, NULL),
  ('880e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '1.25 hours', 83.5, 2.9, 4.9, NULL);

-- Insert Alerts
INSERT INTO alerts (machine_id, severity, message, acknowledged) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', 'medium', 'High vibration detected: 4.8 (normal: <3.0)', false),
  ('880e8400-e29b-41d4-a716-446655440004', 'critical', 'Temperature exceeds threshold: 85.5°C (max: 80°C)', false),
  ('880e8400-e29b-41d4-a716-446655440001', 'low', 'Maintenance due: Vibration sensor calibration', false);

-- Insert Sample Maintenance Tickets (only if users exist)
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    INSERT INTO maintenance_tickets (id, machine_id, asset_id, title, description, status, priority, created_by, created_at) VALUES
      ('990e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'High Vibration on Washer-02', 'Vibration readings consistently above normal threshold. Requires inspection.', 'open', 'high', first_user_id, NOW() - INTERVAL '2 hours'),
      ('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'Critical Temperature Alert - Dry Cleaner-01', 'Temperature exceeded safety threshold. Immediate attention required.', 'open', 'urgent', first_user_id, NOW() - INTERVAL '30 minutes'),
      ('990e8400-e29b-41d4-a716-446655440002', NULL, '770e8400-e29b-41d4-a716-446655440002', 'Scheduled PM - Dryer-01', 'Quarterly preventive maintenance due.', 'open', 'medium', first_user_id, NOW() - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

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

