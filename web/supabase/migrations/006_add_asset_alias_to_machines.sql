-- Add asset alias column to machines for linking with factory layout data
ALTER TABLE machines
  ADD COLUMN IF NOT EXISTS asset_alias TEXT;

UPDATE machines
SET asset_alias = COALESCE(asset_alias, name)
WHERE asset_alias IS NULL;

ALTER TABLE machines
  ALTER COLUMN asset_alias SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_machines_facility_asset_alias
  ON machines (facility_id, asset_alias);

