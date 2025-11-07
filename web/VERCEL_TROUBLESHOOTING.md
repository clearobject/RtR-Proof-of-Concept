# Vercel Deployment Troubleshooting

## 500 Error on Dashboard Route

If you're seeing a 500 Internal Server Error on `/dashboard` in production, follow these steps:

### 1. Verify Environment Variables in Vercel

**Critical:** Ensure these environment variables are set in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Verify these variables exist for **Production**, **Preview**, and **Development**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **After adding/updating variables, you MUST redeploy:**
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Select **Redeploy**

### 2. Check Vercel Build Logs

1. Go to **Deployments** tab in Vercel
2. Click on the failed deployment
3. Check the **Build Logs** for errors
4. Look for:
   - Missing environment variable errors
   - Supabase connection errors
   - TypeScript/build errors

### 3. Check Vercel Function Logs

1. Go to **Deployments** tab
2. Click on a deployment
3. Go to **Functions** tab
4. Check for runtime errors when accessing `/dashboard`

### 4. Verify Supabase Project Status

1. Go to [supabase.com](https://supabase.com)
2. Check that your project is **Active** (not paused)
3. Verify the project URL matches your `NEXT_PUBLIC_SUPABASE_URL`
4. Test the connection by visiting: `https://your-project-ref.supabase.co`

### 5. Common Issues and Solutions

#### Issue: Environment Variables Not Loading
**Symptoms:** 500 errors, "Missing Supabase environment variables" errors

**Solution:**
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Check that variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding variables

#### Issue: Supabase Connection Timeout
**Symptoms:** 500 errors, connection refused errors

**Solution:**
- Verify Supabase project is active
- Check Supabase project URL is correct
- Ensure network/firewall allows connections to Supabase

#### Issue: Authentication Errors
**Symptoms:** 500 errors on authenticated routes

**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct (not the service role key)
- Check that Supabase auth is enabled
- Verify database tables exist (run migrations)

### 6. Testing Locally Before Deploying

Before deploying to Vercel, test locally:

```bash
cd web
npm run build
npm start
```

Visit `http://localhost:3000` and verify:
- Login page loads
- Dashboard loads after login
- No console errors

### 7. Enable Debug Logging (Temporary)

To see more detailed errors, temporarily add to your code:

```typescript
// In server components, add:
console.error('Environment check:', {
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})
```

**Remove this after debugging!**

### 8. Preload Warnings (Non-Critical)

The preload warnings about unused resources are **not critical** and won't break your site. They're just browser optimizations. You can ignore them for now.

## Quick Checklist

- [ ] Environment variables set in Vercel (Production, Preview, Development)
- [ ] Variables prefixed with `NEXT_PUBLIC_`
- [ ] Redeployed after adding variables
- [ ] Supabase project is active
- [ ] Supabase URL and key are correct
- [ ] Database migrations have been run
- [ ] Local build succeeds (`npm run build`)
- [ ] Local server works (`npm start`)

## Still Having Issues?

1. Check Vercel Function Logs for specific error messages
2. Compare local `.env.local` with Vercel environment variables
3. Verify Supabase project is accessible
4. Check Next.js version compatibility (currently using 16.0.1)

