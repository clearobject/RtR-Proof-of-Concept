# Site Fixes Applied - Route Conflict Resolution

## Issue Identified
The site was failing to start due to a **Next.js route conflict error**:
```
Error: You cannot use different slug names for the same dynamic path ('id' !== 'assetAlias').
```

## Root Cause
Two conflicting dynamic routes were using the same path pattern with different parameter names:
- `/machines/[id]` - Dashboard route for machine details by ID
- `/machines/[assetAlias]` - Public route for machine details by asset alias

Next.js does not allow different parameter names for the same dynamic path segment.

## Fixes Applied

### 1. Route Restructuring
- **Moved** `/machines/[assetAlias]` → `/asset/[assetAlias]`
- This separates the two routes and eliminates the conflict
- Updated reference in `web/app/dashboard/FactoryOverview.tsx` to use the new `/asset/` path

### 2. Error Handling Enhancement
- Added Supabase configuration checks to `/asset/[assetAlias]/page.tsx`
- Prevents crashes when Supabase environment variables are missing
- Displays user-friendly error message instead of crashing

### 3. Build Verification
- ✅ Build completes successfully
- ✅ All routes compile correctly
- ✅ No linter errors
- ✅ Route structure is valid:
  - `/machines/[id]` - Dashboard machine detail (by ID)
  - `/asset/[assetAlias]` - Asset detail (by asset alias)
  - All other routes unchanged

## Current Route Structure
```
/                          - Home/Login redirect
/login                     - Login page
/dashboard                 - Digital Twin overview
/machines/[id]             - Machine detail (dashboard, by ID)
/asset/[assetAlias]        - Asset detail (by asset alias)
/assets                    - Assets list
/assets/[id]               - Asset detail (by ID)
/maintenance               - Maintenance tickets
/alerts                    - Alerts dashboard
/capex                     - Capex planning
/sentiment                 - Social Pulse
/users                     - User management
/invite/[token]            - Invite acceptance
/api/*                     - API routes
```

## Testing
1. ✅ Build succeeds: `npm run build`
2. ✅ Dev server starts: `npm run dev`
3. ✅ Server listens on port 3000
4. ✅ No route conflicts detected
5. ✅ No linter errors

## Next Steps
1. **Test the site locally**: Visit `http://localhost:3000` and verify:
   - Login page loads
   - Navigation works
   - Machine detail pages load (both `/machines/[id]` and `/asset/[assetAlias]`)
   - No console errors

2. **Deploy to Vercel**: After confirming local functionality:
   - Ensure environment variables are set in Vercel
   - Redeploy the application
   - Verify production build succeeds

## Notes
- The `/asset/[assetAlias]` route is protected by middleware (requires authentication)
- Both routes serve different purposes:
  - `/machines/[id]` - Internal dashboard navigation using machine IDs
  - `/asset/[assetAlias]` - External access via QR codes using asset aliases
- All error handling is in place for missing Supabase configuration

