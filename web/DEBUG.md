# Debugging Guide - Site Not Loading

## Quick Tests

### 1. Test if Next.js is working at all
Visit: `http://localhost:3000/test`

If this page loads, Next.js is working. If not, there's a fundamental issue.

### 2. Check Dev Server Output
When you run `npm run dev`, you should see:
```
▲ Next.js 16.0.1
- Local:        http://localhost:3000
```

**What to look for:**
- ✅ Server starts without errors
- ✅ Shows "Ready" message
- ❌ Any red error messages
- ❌ Port already in use errors

### 3. Check Browser Console
Open DevTools (F12) and check:
- **Console tab**: Any red errors?
- **Network tab**: Are requests failing?
- **What URL are you visiting?** (should be http://localhost:3000)

### 4. Common Issues

#### Issue: Blank White Page
**Possible causes:**
- JavaScript error preventing React from rendering
- CSS not loading
- Middleware redirect loop

**Fix:**
1. Check browser console for errors
2. Try visiting `/test` page
3. Check if `/login` works directly

#### Issue: "Cannot GET /" or 404
**Possible causes:**
- Dev server not running
- Wrong port
- Route not found

**Fix:**
1. Make sure `npm run dev` is running
2. Check the port in terminal output
3. Try visiting `/login` directly

#### Issue: Infinite Redirect Loop
**Possible causes:**
- Middleware redirecting back and forth
- Auth check failing repeatedly

**Fix:**
1. Check middleware logic
2. Clear browser cookies
3. Try incognito/private window

#### Issue: Connection Refused
**Possible causes:**
- Dev server not running
- Port blocked by firewall
- Another process using port 3000

**Fix:**
1. Make sure `npm run dev` is running
2. Try a different port: `PORT=3001 npm run dev`
3. Check if port 3000 is in use

## Environment Variables Check

Run this to verify env vars are loaded:
```bash
cd web
node verify-env.js
```

Should show:
```
✅ File format looks correct!
NEXT_PUBLIC_SUPABASE_URL: ✓ Found
NEXT_PUBLIC_SUPABASE_ANON_KEY: ✓ Found
```

## What to Share for Help

If still having issues, share:
1. **Terminal output** from `npm run dev`
2. **Browser console errors** (F12 → Console tab)
3. **Network tab** showing failed requests
4. **What you see** when visiting http://localhost:3000
5. **What you see** when visiting http://localhost:3000/test

