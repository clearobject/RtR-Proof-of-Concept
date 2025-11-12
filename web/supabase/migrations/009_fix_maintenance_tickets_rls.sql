-- Migration: 009_fix_maintenance_tickets_rls.sql
-- Fix RLS policies to allow all authenticated users to create tickets

DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Maintenance can manage tickets" ON maintenance_tickets;
  
  -- Create new policies:
  -- 1. All authenticated users can view tickets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'maintenance_tickets' 
    AND policyname = 'Authenticated users can view tickets'
  ) THEN
    CREATE POLICY "Authenticated users can view tickets" ON maintenance_tickets
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  
  -- 2. All authenticated users can create tickets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'maintenance_tickets' 
    AND policyname = 'Authenticated users can create tickets'
  ) THEN
    CREATE POLICY "Authenticated users can create tickets" ON maintenance_tickets
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  
  -- 3. Maintenance and above can update/delete tickets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'maintenance_tickets' 
    AND policyname = 'Maintenance can update tickets'
  ) THEN
    CREATE POLICY "Maintenance can update tickets" ON maintenance_tickets
      FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('maintenance', 'manager', 'admin')
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'maintenance_tickets' 
    AND policyname = 'Maintenance can delete tickets'
  ) THEN
    CREATE POLICY "Maintenance can delete tickets" ON maintenance_tickets
      FOR DELETE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('maintenance', 'manager', 'admin')
        )
      );
  END IF;
END $$;

