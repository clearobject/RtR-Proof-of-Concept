# How to Check Vercel Function Logs for 500 Errors

## Critical: You Need to See the Actual Error

The browser console shows a generic error message. The **actual error** is in Vercel Function Logs.

## Step-by-Step Instructions

### 1. Access Vercel Function Logs

1. Go to **Vercel Dashboard** → Your Project (`rt-r-proof-of-Concept`)
2. Click on the **Deployments** tab
3. Click on the **latest deployment** (the one with the 500 error)
4. Look for a **Functions** tab or **Runtime Logs** section
5. You should see a list of functions/routes

### 2. Find the Dashboard Function

Look for functions related to:
- `/dashboard`
- `(dashboard)` route group
- Or any function that was called when you accessed `/dashboard`

### 3. View the Logs

1. Click on the function
2. You'll see **Runtime Logs** or **Function Logs**
3. Look for error messages - they will show:
   - The actual error message (not generic)
   - Stack traces
   - Database errors
   - Connection errors
   - Any console.error messages I added

### 4. What to Look For

The logs will show errors like:

**Database Errors:**
```
relation "user_profiles" does not exist
```
**Solution:** Run database migrations in Supabase

**Connection Errors:**
```
Failed to fetch
Connection refused
```
**Solution:** Check Supabase project is active, URL is correct

**Auth Errors:**
```
Invalid API key
Unauthorized
```
**Solution:** Verify anon key is correct

**Cookie Errors:**
```
cookies() can only be called in Server Components
```
**Solution:** This is a code issue I can fix

### 5. Alternative: Check Build Logs

If you can't find Function Logs:

1. Go to **Deployments** → Latest deployment
2. Click on **Build Logs** or **View Build Logs**
3. Look for any errors during the build process

### 6. Share the Error

Once you find the actual error message, share it with me. It will look something like:

```
Error: relation "user_profiles" does not exist
    at PostgresError...
```

Or:

```
Error: cookies() can only be called in Server Components
```

## Quick Test: Check if Database Tables Exist

While checking logs, also verify your database:

1. Go to **Supabase Dashboard** → Your Project
2. Click on **Table Editor**
3. Check if these tables exist:
   - `user_profiles` ← **Most likely missing!**
   - `machines`
   - `alerts`
   - `maintenance_tickets`

If `user_profiles` is missing, that's likely the issue!

## If Tables Are Missing

Run the migrations:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the contents of `web/supabase/migrations/001_init_schema.sql`
3. Paste and run it
4. Copy the contents of `web/supabase/migrations/002_add_invites.sql`
5. Paste and run it
6. Redeploy on Vercel

## Most Common Issue

Based on the error pattern, the most likely issue is:

**The `user_profiles` table doesn't exist in your Supabase database.**

The dashboard layout tries to query this table, and if it doesn't exist, it causes a 500 error.

**Fix:** Run the database migrations in Supabase SQL Editor.

