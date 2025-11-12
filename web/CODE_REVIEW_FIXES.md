# Code Review & Database Review - Pre-Push Checklist

## Critical Issues Found

### 1. TypeScript Linter Errors (49 errors across 6 files)

#### Status/Severity Case Sensitivity Issues
- **Files affected**: 
  - `web/components/digital-twin/alerts-page.tsx` (13 errors)
  - `web/app/(dashboard)/maintenance/page.tsx` (12 errors)
  - `web/app/api/ai/chat/route.ts` (15 errors)
  - `web/components/digital-twin/factory-dashboard.tsx` (7 errors)
  - `web/app/(dashboard)/assets/[id]/page.tsx` (1 error)
  - `web/lib/utils/cam.ts` (2 errors)

- **Issue**: Code is comparing capitalized enum values (`'Critical'`, `'Open'`) with lowercase strings (`'critical'`, `'open'`)
- **Fix**: Update all string comparisons to use capitalized values matching the TypeScript types

#### Missing Properties
- **File**: `web/app/api/ai/chat/route.ts`
  - References `machine_id` in `sensor_data` (should be `asset_id`)
  - References `machine_id` in `downtime_events` (column exists but deprecated)
  - References `machine_id` in `Alert`, `MaintenanceTicket`, `DowntimeEvent` types (should use `asset_id`)

### 2. Database Security Issues

#### Missing RLS Policies
- **Tables without RLS**:
  - `asset_types` (ERROR)
  - `pm_templates` (ERROR)
  - `pm_tasks` (ERROR)
  - `downtime_events` (ERROR)
  - `asset_costs` (ERROR)
  - `social_actions` (ERROR)
  - `thresholds` (ERROR)
  - `cam_config` (ERROR)

- **Tables with RLS but no policies**:
  - `audit_log` (INFO)

#### Function Security
- `generate_invite_token` - Missing search_path setting (WARN)
- `update_updated_at_column` - Missing search_path setting (WARN)

### 3. Migration Status

#### Applied Migrations
- ✅ 001_init_schema
- ✅ 002_add_invites
- ✅ 003_connect_alerts_maintenance
- ✅ 004_add_machine_asset_alias
- ✅ 005_admin_access_management
- ✅ 006_add_asset_alias_to_machines

#### Pending Migrations (Need Verification)
- ⚠️ 007_merge_machines_into_assets
- ⚠️ 008_add_asset_financial_fields
- ⚠️ 009_fix_maintenance_tickets_rls
- ⚠️ 010_consolidate_statuses_and_capitalize
- ⚠️ 011_fix_manufacturer_names

### 4. Deprecated Code/References

#### Old Machine References
- `web/app/api/ai/chat/route.ts` - Still queries `machine_id` columns
- `web/components/digital-twin/factory-dashboard.tsx` - Uses old status values
- `web/app/(dashboard)/machines/[id]/page.tsx` - Old machine detail page (should redirect to assets)

## Fixes Required

### Priority 1: Critical TypeScript Errors
1. Fix all status/severity string comparisons
2. Fix API route `machine_id` references
3. Update factory-dashboard status values

### Priority 2: Database Security
1. Enable RLS on all public tables
2. Add RLS policies for `audit_log`
3. Fix function search_path settings

### Priority 3: Migration Verification
1. Verify migrations 007-011 are applied
2. Create migration to enable RLS on missing tables
3. Create migration to fix function security

### Priority 4: Code Cleanup
1. Remove/redirect old machine detail page
2. Clean up deprecated `machine_id` references
3. Remove unused files

