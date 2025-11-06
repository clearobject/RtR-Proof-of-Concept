# Supabase CLI Setup Guide

## Initial Setup

### 1. Link to Your Remote Supabase Project

After creating a project on [supabase.com](https://supabase.com):

```bash
cd web
supabase link --project-ref your-project-ref
```

To find your project ref:
- Go to your Supabase project dashboard
- Settings > General
- Copy the "Reference ID"

### 2. Push Database Schema

Push the migration to your remote database:

```bash
npm run db:push
```

Or manually:
```bash
supabase db push
```

### 3. Seed Test Data

Seed the database with test data:

```bash
npm run db:seed
```

Or manually:
```bash
supabase db seed
```

## Local Development

### Start Local Supabase (Optional)

For local development with Supabase:

```bash
npm run supabase:start
```

This starts:
- PostgreSQL database (port 54322)
- Supabase Studio (port 54323)
- API server (port 54321)
- Auth server
- Storage server

### Stop Local Supabase

```bash
npm run supabase:stop
```

### Check Status

```bash
npm run supabase:status
```

## Common Commands

### Database Operations

```bash
# Push migrations to remote
npm run db:push

# Pull schema changes from remote
npm run db:pull

# Reset database (drops all data, runs migrations, seeds)
npm run db:reset

# Create a new migration
supabase migration new migration_name

# Generate migration from schema changes
npm run db:diff

# Seed database with test data
npm run db:seed
```

### Working with Migrations

1. **Create a new migration:**
   ```bash
   supabase migration new add_new_feature
   ```

2. **Edit the migration file** in `supabase/migrations/`

3. **Push to remote:**
   ```bash
   npm run db:push
   ```

### Database Reset (Development)

⚠️ **Warning:** This will delete all data!

```bash
npm run db:reset
```

This will:
1. Drop all tables
2. Run all migrations
3. Seed with test data

## Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For local development (if using `supabase start`):

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

Get local keys from: `npm run supabase:status`

## Troubleshooting

### Migration Conflicts

If you have conflicts between local and remote:

```bash
# Pull remote changes first
npm run db:pull

# Then push your local changes
npm run db:push
```

### Reset Everything

If you need to start fresh:

```bash
# Reset local database
npm run db:reset

# Or reset remote (be careful!)
supabase db reset --linked
```

### Check Migration Status

```bash
supabase migration list
```

## Next Steps

1. ✅ Link to your Supabase project
2. ✅ Push migrations (`npm run db:push`)
3. ✅ Seed test data (`npm run db:seed`)
4. ✅ Verify data in Supabase Studio
5. ✅ Start developing Phase 2 features!


