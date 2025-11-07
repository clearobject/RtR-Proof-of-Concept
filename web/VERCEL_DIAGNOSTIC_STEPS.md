# Vercel 500 Error Diagnostic Steps

Since your environment variables are correctly set in Vercel, let's diagnose the actual error.

## Step 1: Check Vercel Function Logs

The most important step is to see the **actual error message**:

1. Go to **Vercel Dashboard** → Your Project
2. Click on **Deployments** tab
3. Click on the **latest deployment** (the one showing the 500 error)
4. Click on the **Functions** tab
5. Look for functions related to `/dashboard` or the route group
6. Click on a function to see **Runtime Logs**
7. Look for error messages - these will show the actual error, not the generic "Server Components render error"

**What to look for:**
- Database connection errors
- Supabase authentication errors
- Missing table errors
- Cookie/session errors
- Any stack traces

## Step 2: Verify Supabase Project Status

1. Go to [supabase.com](https://supabase.com)
2. Open your project (the one matching `wzcfzoworkgqobxzyhzo`)
3. Check:
   - Is the project **Active**? (Not paused)
   - Can you access the **Table Editor**?
   - Are the required tables present? (`machines`, `user_profiles`, etc.)

## Step 3: Test Supabase Connection

1. In Supabase Dashboard, go to **Settings** → **API**
2. Verify:
   - **Project URL** matches: `https://wzcfzoworkgqobxzyhzo.supabase.co`
   - **anon/public key** matches what's in Vercel
3. Test the connection:
   - Try accessing: `https://wzcfzoworkgqobxzyhzo.supabase.co/rest/v1/` in your browser
   - You should see a JSON response (even if it's an error, it means the connection works)

## Step 4: Check Database Tables

The dashboard layout queries the `user_profiles` table. Verify it exists:

1. In Supabase Dashboard, go to **Table Editor**
2. Check if these tables exist:
   - `user_profiles`
   - `machines`
   - `alerts`
   - `maintenance_tickets`
   - `sensor_data`

If tables are missing, you need to run the migrations:
- Go to **SQL Editor** in Supabase
- Run the migration files from `web/supabase/migrations/`

## Step 5: Verify Environment Variable Values

Double-check the actual values in Vercel:

1. In Vercel, go to **Settings** → **Environment Variables**
2. Click on `NEXT_PUBLIC_SUPABASE_URL` → Click the **eye icon** to reveal
3. Verify it matches: `https://wzcfzoworkgqobxzyhzo.supabase.co` (or your actual project URL)
4. Click on `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Click the **eye icon** to reveal
5. Verify it starts with `eyJ...` (JWT format)
6. Compare with Supabase Dashboard → Settings → API → **anon/public key**

## Step 6: Check Recent Changes

Since the variables were updated "just now" and "56s ago", verify:

1. Did you redeploy after updating the variables?
2. If not, **redeploy now**:
   - Go to **Deployments** tab
   - Click **⋯** on latest deployment
   - Select **Redeploy**

## Step 7: Test Locally First

Before debugging Vercel, test locally:

1. In `web/.env.local`, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://wzcfzoworkgqobxzyhzo.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-vercel
   ```

2. Run:
   ```bash
   cd web
   npm run build
   npm start
   ```

3. Visit `http://localhost:3000/dashboard`
4. Check if it works locally
5. If it works locally but not on Vercel, it's a deployment/environment issue
6. If it fails locally too, check the terminal for the actual error

## Common Issues Based on Error Type

### If Function Logs Show "Missing environment variables":
- Variables not set for the correct environment (Production vs Preview)
- Variables not prefixed with `NEXT_PUBLIC_`
- Need to redeploy after adding variables

### If Function Logs Show "Table does not exist":
- Database migrations haven't been run
- Run migrations in Supabase SQL Editor

### If Function Logs Show "Connection refused" or "Network error":
- Supabase project might be paused
- Check Supabase project status
- Verify project URL is correct

### If Function Logs Show "Unauthorized" or "Invalid API key":
- Wrong anon key (might be using service_role key instead)
- Key doesn't match Supabase dashboard
- Regenerate key in Supabase if needed

### If Function Logs Show "cookies() unavailable":
- This is a Next.js context issue
- The error boundary I added should catch this
- May need to adjust how cookies are accessed

## Next Steps After Diagnosis

Once you have the actual error from Function Logs:

1. **Share the error message** - This will help identify the exact issue
2. **Check if it's a database issue** - Missing tables, wrong schema, etc.
3. **Check if it's a connection issue** - Supabase project paused, wrong URL, etc.
4. **Check if it's an authentication issue** - Wrong key, expired session, etc.

## Quick Fixes to Try

1. **Redeploy** (most common fix):
   - Deployments → Latest → ⋯ → Redeploy

2. **Verify variables are set for Production**:
   - Settings → Environment Variables
   - Ensure variables are set for "Production" environment

3. **Check Supabase project is active**:
   - Supabase Dashboard → Project Settings
   - Ensure project is not paused

4. **Run database migrations**:
   - Supabase → SQL Editor
   - Run `001_init_schema.sql` and `002_add_invites.sql`

