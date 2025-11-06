# Quick Start Guide

## Prerequisites
- Node.js 18+
- Supabase CLI installed
- Supabase account

## Setup Steps

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Link to Supabase Project
```bash
supabase link --project-ref your-project-ref
```
Get your project ref from: Supabase Dashboard > Settings > General > Reference ID

### 3. Push Database Schema
```bash
npm run db:push
```

### 4. Seed Test Data
```bash
npm run db:seed
```

### 5. Configure Environment
Create `web/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Create Test User
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" > "Create new user"
3. Enter email and password
4. Run this SQL in SQL Editor:
```sql
INSERT INTO user_profiles (id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'your-email@example.com',
  'admin'
);
```

### 7. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000 and log in!

## Available Commands

- `npm run dev` - Start Next.js dev server
- `npm run db:push` - Push migrations to Supabase
- `npm run db:seed` - Seed database with test data
- `npm run db:reset` - Reset database (⚠️ deletes all data)
- `npm run supabase:start` - Start local Supabase (optional)
- `npm run supabase:status` - Check Supabase status

## Documentation

- Full setup: `web/SETUP.md`
- Supabase CLI: `web/SUPABASE_SETUP.md`
- Development plan: `docs/development-plan.md`


