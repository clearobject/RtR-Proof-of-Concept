# Rent the Runway Operations Prototype - Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)

## Initial Setup

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key

### 3. Configure Environment Variables

Create a `.env.local` file in the `web` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy the contents of `supabase/migrations/001_init_schema.sql`
4. Paste and run the migration in the SQL Editor

Alternatively, if you have Supabase CLI installed:

```bash
supabase db push
```

### 5. Create Test User

1. Go to Authentication > Users in Supabase dashboard
2. Click "Add user" > "Create new user"
3. Enter email and password
4. After creating the user, go to SQL Editor and run:

```sql
-- Update the user profile with a role
INSERT INTO user_profiles (id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'your-email@example.com',
  'admin'
);
```

Replace `'your-email@example.com'` with the email you used to create the user.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── login/             # Authentication
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Shared UI components
│   ├── auth/             # Authentication components
│   ├── digital-twin/     # Digital Twin module components
│   ├── cam/              # CAM module components
│   └── social-pulse/     # Social Pulse module components
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase client configurations
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
└── supabase/
    └── migrations/        # Database migrations
```

## Development Phases

### ✅ Phase 1: Foundation (Completed)
- Supabase setup and database schema
- Authentication system
- Basic UI components and layout
- Navigation structure

### 🔄 Phase 2: Digital Twin (Next)
- Factory floor visualization
- Machine health monitoring
- Alert system
- Maintenance ticket management

### 📋 Phase 3: Capital Asset Management
- Asset registry
- Lifecycle tracking
- Replacement priority
- Capex planning

### 📋 Phase 4: Social Pulse
- Social feed
- Sentiment analysis
- Brand health dashboard

## Available Routes

- `/login` - Authentication page
- `/dashboard` - Digital Twin overview
- `/maintenance` - Maintenance tickets
- `/assets` - Asset registry
- `/capex` - Capex planning
- `/sentiment` - Social Pulse dashboard

## Troubleshooting

### Authentication Issues
- Ensure environment variables are set correctly
- Check that RLS policies are enabled in Supabase
- Verify user exists in `auth.users` and `user_profiles` tables

### Database Connection
- Verify Supabase URL and keys are correct
- Check that migrations have been run
- Ensure RLS policies allow your user to access data

### Build Errors
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next` (or `rmdir /s .next` on Windows)
- Check Node.js version (18+ required)

## Next Steps

1. Set up Supabase project and run migrations
2. Create test user and assign role
3. Start implementing Phase 2: Digital Twin module
4. Add mock data for testing

For detailed development plan, see `docs/development-plan.md`


