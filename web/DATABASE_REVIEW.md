# Database Structure Review - Assets Consolidation

## Overview
This document reviews the database structure and application references after consolidating the `machines` table into the `assets` table.

## Database Schema

### Core Tables

#### `assets` (Primary Table)
- **Purpose**: Single source of truth for all machine/equipment data
- **Key Columns**:
  - `id` (UUID, PRIMARY KEY)
  - `alias` (TEXT) - Asset identifier (e.g., "Washer-01")
  - `name` (TEXT, NOT NULL)
  - `type` (TEXT) - Equipment type
  - `status` (TEXT) - Combined statuses: 'active', 'maintenance', 'retired', 'operational', 'warning', 'critical', 'offline'
  - `coordinates` (JSONB) - Factory layout coordinates
  - `facility_id` (UUID, REFERENCES facilities)
  - `zone` (TEXT)
  - `manufacturer`, `model`, `serial_number`
  - `in_service_date` (DATE)
  - `criticality` (TEXT)
- **Indexes**:
  - `idx_assets_facility` on `facility_id`
  - `idx_assets_status` on `status`
  - `idx_assets_alias` on `alias` (WHERE alias IS NOT NULL)
  - `idx_assets_facility_alias` on `(facility_id, alias)` (WHERE alias IS NOT NULL)

#### `alerts`
- **Foreign Key**: `asset_id` (UUID, NOT NULL, REFERENCES assets(id) ON DELETE CASCADE)
- **Removed**: `machine_id` column
- **Indexes**:
  - `idx_alerts_asset` on `asset_id`
  - `idx_alerts_acknowledged` on `acknowledged`

#### `sensor_data`
- **Foreign Key**: `asset_id` (UUID, NOT NULL, REFERENCES assets(id) ON DELETE CASCADE)
- **Removed**: `machine_id` column
- **Indexes**:
  - `idx_sensor_data_asset` on `asset_id`
  - `idx_sensor_data_timestamp_asset` on `(asset_id, timestamp DESC)`

#### `maintenance_tickets`
- **Foreign Key**: `asset_id` (UUID, NOT NULL, REFERENCES assets(id))
- **Removed**: `machine_id` column
- **Indexes**:
  - `idx_maintenance_tickets_asset` on `asset_id`
  - `idx_maintenance_tickets_status` on `status`

#### `downtime_events`
- **Foreign Key**: `asset_id` (UUID, NOT NULL, REFERENCES assets(id))
- **Removed**: `machine_id` column

#### `asset_costs`
- **Foreign Key**: `asset_id` (UUID, NOT NULL, REFERENCES assets(id))
- **Index**: `idx_asset_costs_asset` on `asset_id`

#### `pm_tasks`
- **Foreign Key**: `asset_id` (UUID, NOT NULL, REFERENCES assets(id))

### Deleted Tables
- `machines` - Merged into `assets` table

## Application Code References

### ✅ Updated to Use `assets` Table

1. **FactoryMap.tsx** (`web/components/dashboard/FactoryMap.tsx`)
   - Queries `assets` table
   - Maps assets to Machine interface for compatibility
   - Uses `asset_id` for alert severity mapping

2. **FactoryOverview.tsx** (`web/app/dashboard/FactoryOverview.tsx`)
   - Queries `assets` table
   - Uses `alias` column

3. **alerts-page.tsx** (`web/components/digital-twin/alerts-page.tsx`)
   - Queries `assets` table for machines out of service
   - Alert queries join with `assets` table
   - Uses `asset_id` for maintenance tickets
   - Routes updated to `/assets/[id]` instead of `/machines/[id]`

4. **factory-dashboard.tsx** (`web/components/digital-twin/factory-dashboard.tsx`)
   - Queries `assets` table

5. **maintenance/page.tsx** (`web/app/(dashboard)/maintenance/page.tsx`)
   - Queries `assets` table
   - Uses `asset_id` for ticket loading

6. **api/ai/chat/route.ts** (`web/app/api/ai/chat/route.ts`)
   - Queries `assets` table
   - Uses `asset_id` for alerts and tickets

7. **asset/[assetAlias]/page.tsx** (`web/app/asset/[assetAlias]/page.tsx`)
   - Queries `assets` table using `alias`
   - Uses `asset_id` for related queries

8. **assets/[id]/page.tsx** (`web/app/(dashboard)/assets/[id]/page.tsx`)
   - Queries `assets` table by `id` or `alias`
   - Uses `asset_id` for all related data

### ⚠️ Scripts Still Using `machines` (Legacy/Import Scripts)

These scripts are for data migration/import and may still reference `machines`:
- `web/scripts/import-machines-from-csv.mjs` - CSV import script
- `web/scripts/seed-alerts-from-assets.mjs` - Alert seeding script
- `web/scripts/verify-database.js` - Database verification script

**Note**: These scripts should be updated or deprecated after migration is complete.

### ⚠️ Legacy Route (May Need Deprecation)

- `web/app/(dashboard)/machines/[id]/page.tsx` - Legacy machine detail page
  - **Recommendation**: Redirect to `/assets/[id]` or remove after migration

## TypeScript Types

### Updated Types (`web/lib/types/index.ts`)

1. **SensorData**
   - ✅ Changed `machine_id` → `asset_id`

2. **Alert**
   - ✅ Changed `machine_id` → `asset_id`

3. **MaintenanceTicket**
   - ✅ Removed `machine_id` (optional)
   - ✅ Made `asset_id` required (NOT NULL)

4. **Asset**
   - ✅ Added `coordinates` field
   - ✅ Extended `status` to include machine statuses

5. **DowntimeEvent**
   - ✅ Removed `machine_id` field

## Migration Status

### Migration File: `007_merge_machines_into_assets.sql`

**Steps Completed**:
1. ✅ Add `alias` and `coordinates` columns to `assets`
2. ✅ Update `assets.status` constraint to include machine statuses
3. ✅ Migrate machine data to assets (if machines table exists)
4. ✅ Add `asset_id` columns to `alerts` and `sensor_data`
5. ✅ Update foreign keys using mapping table
6. ✅ Drop `machine_id` columns from `alerts`, `sensor_data`, `maintenance_tickets`
7. ✅ Make `asset_id` NOT NULL where appropriate
8. ✅ Handle `downtime_events.machine_id`
9. ✅ Drop `machines` table
10. ✅ Create indexes on `asset_id` columns

**Idempotent**: ✅ Yes - Migration checks for table/column existence before operations

## Foreign Key Relationships

### Current Structure

```
assets (id)
  ├── alerts (asset_id) → assets(id) [CASCADE DELETE]
  ├── sensor_data (asset_id) → assets(id) [CASCADE DELETE]
  ├── maintenance_tickets (asset_id) → assets(id)
  ├── downtime_events (asset_id) → assets(id)
  ├── asset_costs (asset_id) → assets(id)
  └── pm_tasks (asset_id) → assets(id)
```

### Cascade Behavior
- **alerts**: CASCADE DELETE (alerts deleted when asset deleted)
- **sensor_data**: CASCADE DELETE (sensor data deleted when asset deleted)
- **maintenance_tickets**: No cascade (tickets preserved)
- **downtime_events**: No cascade (events preserved)
- **asset_costs**: No cascade (costs preserved)
- **pm_tasks**: No cascade (tasks preserved)

## Row Level Security (RLS)

### Current Policies

1. **assets**: Authenticated users can view
2. **alerts**: Authenticated users can view
3. **sensor_data**: Authenticated users can view
4. **maintenance_tickets**: Maintenance role can manage

**Note**: RLS policies for `machines` table will be automatically removed when table is dropped.

## Indexes

### Performance Indexes

- `idx_alerts_asset` - Fast alert lookups by asset
- `idx_sensor_data_asset` - Fast sensor data lookups by asset
- `idx_sensor_data_timestamp_asset` - Fast time-series queries
- `idx_assets_alias` - Fast asset lookups by alias
- `idx_assets_facility_alias` - Fast facility + alias lookups

## Recommendations

### Immediate Actions

1. ✅ **Complete**: Update all app code to use `assets` table
2. ✅ **Complete**: Update TypeScript types
3. ✅ **Complete**: Update migration to handle `downtime_events.machine_id`
4. ⚠️ **Pending**: Update or deprecate legacy scripts
5. ⚠️ **Pending**: Add redirect from `/machines/[id]` to `/assets/[id]` or remove route

### Future Considerations

1. **Data Validation**: Ensure all `asset_id` values are valid UUIDs referencing existing assets
2. **Query Performance**: Monitor query performance after migration, especially for:
   - Factory layout rendering
   - Alert aggregation
   - Sensor data time-series queries
3. **Backup**: Ensure database backup before running migration in production
4. **Testing**: Test all application features after migration:
   - Factory layout display
   - Alert creation/acknowledgment
   - Maintenance ticket creation
   - Asset detail pages
   - Sensor data visualization

## Verification Checklist

- [x] All foreign keys reference `assets` table
- [x] All `machine_id` columns removed from related tables
- [x] All app queries use `assets` table
- [x] TypeScript types updated
- [x] Migration is idempotent
- [x] Indexes created on `asset_id` columns
- [ ] Legacy scripts updated/deprecated
- [ ] Legacy routes redirected/removed
- [ ] RLS policies verified
- [ ] Application tested end-to-end

## Notes

- The `Machine` interface is still used in the app for compatibility, but it maps to `assets` data
- Some components may still reference `alert.machine` for backward compatibility during transition
- The `alias` column in `assets` serves as the primary identifier for factory layout matching

