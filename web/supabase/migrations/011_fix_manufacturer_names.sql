-- Migration: 011_fix_manufacturer_names.sql
-- Fix manufacturer name spelling errors

DO $$
BEGIN
  -- Fix "CONTENINTAL" -> "CONTINENTAL"
  UPDATE assets 
  SET manufacturer = 'CONTINENTAL'
  WHERE UPPER(manufacturer) = 'CONTENINTAL';

  -- Fix "ILSA" -> "COLUMBIA" (for Columbia machines)
  UPDATE assets 
  SET manufacturer = 'COLUMBIA'
  WHERE UPPER(manufacturer) = 'ILSA'
    AND (UPPER(type) LIKE '%DRY%' OR UPPER(type) LIKE '%CLEAN%');

END $$;

