-- Add alias metadata for assets and machines

ALTER TABLE assets
ADD COLUMN IF NOT EXISTS alias TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS assets_alias_unique_idx ON assets(alias) WHERE alias IS NOT NULL;

ALTER TABLE machines
ADD COLUMN IF NOT EXISTS asset_alias TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS machines_asset_alias_unique_idx ON machines(asset_alias) WHERE asset_alias IS NOT NULL;


