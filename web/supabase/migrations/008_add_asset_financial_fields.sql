-- Migration: 008_add_asset_financial_fields.sql
-- Add financial fields to assets table for TCO and Capex calculations

DO $$
BEGIN
  -- Add acquisition_cost if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assets' AND column_name = 'acquisition_cost'
  ) THEN
    ALTER TABLE assets ADD COLUMN acquisition_cost NUMERIC;
  END IF;

  -- Add salvage_value if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assets' AND column_name = 'salvage_value'
  ) THEN
    ALTER TABLE assets ADD COLUMN salvage_value NUMERIC;
  END IF;

  -- Add mttr_hours if it doesn't exist (can be calculated but storing for quick access)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assets' AND column_name = 'mttr_hours'
  ) THEN
    ALTER TABLE assets ADD COLUMN mttr_hours NUMERIC;
  END IF;
END $$;

