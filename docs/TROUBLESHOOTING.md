# Troubleshooting 500 Error

## Most Common Cause: Missing Environment Variables

The 500 error is most likely caused by missing Supabase environment variables in Vercel.

### Solution: Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Redeploy** your application after adding the variables

### How to Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and open your project
2. Navigate to **Settings** > **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Verify Environment Variables Are Set

After adding the variables and redeploying, check:
- Vercel build logs should not show environment variable errors
- The application should load without 500 errors
- Login page should be accessible

### Other Potential Issues

If environment variables are set correctly but you still get errors:

1. **Check Vercel Build Logs** - Look for specific error messages
2. **Check Browser Console** - Open DevTools and check for client-side errors
3. **Check Network Tab** - See if API calls are failing
4. **Verify Supabase Project** - Ensure your Supabase project is active and accessible

### Testing Locally

To test if environment variables work:

1. Create `.env.local` in the `web` directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. Run `npm run dev` locally
3. If it works locally but not on Vercel, the issue is definitely missing env vars in Vercel

