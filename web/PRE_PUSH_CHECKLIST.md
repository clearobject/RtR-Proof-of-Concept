# Pre-Push Checklist

## ✅ Completed Fixes

### 1. TypeScript Linter Errors - FIXED
- ✅ Fixed all status/severity case sensitivity issues (49 errors → 0 errors)
- ✅ Updated API route to use `asset_id` instead of deprecated `machine_id`
- ✅ Fixed priority type definitions to use capitalized values
- ✅ Fixed downtime type comparisons

### 2. Database Security - FIXED
- ✅ Created migration `012_enable_rls_on_public_tables.sql` to:
  - Enable RLS on 8 public tables that were missing it
  - Add RLS policies for read/write access based on user roles
  - Fix function search_path security warnings
  - Add audit_log policies

### 3. Code Cleanup - IN PROGRESS
- ✅ Fixed all `machine_id` references to use `asset_id`
- ⚠️ Old machine detail page (`/machines/[id]`) - Consider redirecting to `/assets/[id]`

### 4. Migration Status
- ✅ Migrations 001-006: Applied
- ⚠️ Migrations 007-011: Need verification in Supabase
- ✅ Migration 012: Created (RLS policies)

## ⚠️ Action Items Before Push

### Required:
1. **Apply Migration 012** in Supabase:
   ```sql
   -- Run web/supabase/migrations/012_enable_rls_on_public_tables.sql
   ```

2. **Verify Migrations 007-011** are applied:
   - Check Supabase migration history
   - If missing, apply them in order

3. **Test Critical Flows**:
   - Alert creation and acknowledgment
   - Maintenance ticket creation and status updates
   - Asset detail page navigation
   - Factory layout interactions

### Optional (Can be done post-push):
1. Consider redirecting `/machines/[id]` to `/assets/[id]` for backward compatibility
2. Review and remove any unused utility functions
3. Add unit tests for critical functions

## Files Modified

### Critical Fixes:
- `web/app/api/ai/chat/route.ts` - Fixed machine_id → asset_id, status comparisons
- `web/components/digital-twin/alerts-page.tsx` - Fixed severity/priority comparisons, added asset type
- `web/app/(dashboard)/maintenance/page.tsx` - Fixed status comparisons
- `web/components/digital-twin/factory-dashboard.tsx` - Fixed status values
- `web/app/(dashboard)/assets/[id]/page.tsx` - Fixed downtime type comparison
- `web/lib/utils/cam.ts` - Fixed downtime type comparison

### New Files:
- `web/supabase/migrations/012_enable_rls_on_public_tables.sql` - RLS policies
- `web/CODE_REVIEW_FIXES.md` - Review documentation
- `web/PRE_PUSH_CHECKLIST.md` - This file

## Database Changes Summary

### Security Improvements:
- Enabled RLS on 8 tables (asset_types, pm_templates, pm_tasks, downtime_events, asset_costs, social_actions, thresholds, cam_config)
- Added role-based access policies
- Fixed function security warnings

### Schema Status:
- ✅ All tables use `asset_id` (no `machine_id` references)
- ✅ All status/severity values are capitalized
- ✅ All CHECK constraints match capitalized values

## Testing Checklist

- [ ] Run `npm run build` - should pass without errors
- [ ] Test alert creation and filtering
- [ ] Test maintenance ticket workflow
- [ ] Test factory layout interactions
- [ ] Test asset detail page
- [ ] Verify RLS policies don't break existing functionality

