# Vercel 500 Error Fix - Dashboard Route

## Problem
The `/dashboard` route was returning a 500 Internal Server Error in production on Vercel, with the error message:
```
Uncaught Error: An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details.
```

## Root Cause
The dashboard layout (`web/app/(dashboard)/layout.tsx`) was calling `createClient()` without first checking if Supabase environment variables were configured. When environment variables are missing or incorrect, `createClient()` throws an error that wasn't being caught properly, causing a 500 error.

## Fixes Applied

### 1. Dashboard Layout Error Handling
**File:** `web/app/(dashboard)/layout.tsx`

**Changes:**
- Added check for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` before calling `createClient()`
- Improved error handling to catch and log errors without crashing
- Added error checking for both auth and profile queries

### 2. Enhanced Server Client Error Handling
**File:** `web/lib/supabase/server.ts`

**Changes:**
- Added error codes to help identify specific error types
- Wrapped `cookies()` call in try-catch to handle context errors
- Improved error messages for debugging

## Next Steps for Vercel Deployment

### Critical: Verify Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Go to **Settings** > **Environment Variables**

2. **Verify these variables exist for ALL environments (Production, Preview, Development):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Important:** After adding/updating variables, you MUST redeploy:
   - Go to **Deployments** tab
   - Click **⋯** on the latest deployment
   - Select **Redeploy**

### Verify Supabase Configuration

1. **Check Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Ensure your project is **Active** (not paused)
   - Verify the project URL matches your `NEXT_PUBLIC_SUPABASE_URL`

2. **Get Your Credentials:**
   - Go to **Settings** > **API** in Supabase
   - Copy:
     - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ⚠️ **DO NOT** use the `service_role` key - use the `anon` key

### Testing After Deployment

1. **Check Build Logs:**
   - Go to **Deployments** > Latest deployment
   - Verify build completed successfully
   - Look for any warnings or errors

2. **Check Function Logs:**
   - Go to **Deployments** > Latest deployment > **Functions**
   - Click on a function to see runtime logs
   - Look for any errors when accessing `/dashboard`

3. **Test the Site:**
   - Visit your Vercel URL
   - Try to access `/dashboard`
   - Check browser console (F12) for errors
   - Verify login works

## Common Issues

### Issue: Still Getting 500 Errors
**Possible Causes:**
- Environment variables not set correctly in Vercel
- Variables not set for the correct environment (Production vs Preview)
- Didn't redeploy after adding variables
- Supabase project is paused or inaccessible
- Wrong Supabase URL or key

**Solution:**
1. Double-check environment variables in Vercel
2. Verify Supabase project is active
3. Redeploy the application
4. Check Vercel Function Logs for specific error messages

### Issue: Preload Warnings
The preload warnings about unused resources are **not critical** and won't break your site. They're browser optimization warnings and can be ignored.

## Verification Checklist

- [ ] Environment variables set in Vercel (all environments)
- [ ] Variables prefixed with `NEXT_PUBLIC_`
- [ ] Redeployed after adding/updating variables
- [ ] Supabase project is active
- [ ] Supabase URL and anon key are correct
- [ ] Build succeeds in Vercel
- [ ] No errors in Function Logs
- [ ] Dashboard loads successfully

## Files Changed

1. `web/app/(dashboard)/layout.tsx` - Added env var checks and improved error handling
2. `web/lib/supabase/server.ts` - Enhanced error handling with error codes
3. `web/VERCEL_TROUBLESHOOTING.md` - Comprehensive troubleshooting guide

## Need More Help?

If you're still experiencing issues after following these steps:

1. Check **Vercel Function Logs** for specific error messages
2. Compare your local `.env.local` with Vercel environment variables
3. Verify Supabase project is accessible and active
4. Check that database migrations have been run in Supabase

