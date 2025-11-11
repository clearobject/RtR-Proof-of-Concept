-- User Invites System
-- Migration: 002_add_invites.sql
-- This migration is idempotent and can be safely re-run

-- Invite tokens table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invite_tokens') THEN
    CREATE TABLE invite_tokens (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      token TEXT NOT NULL UNIQUE,
      created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT, -- Optional: pre-fill email for invite
      role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('operator', 'maintenance', 'manager', 'admin')),
      facility_id UUID REFERENCES facilities(id),
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      used_by UUID REFERENCES auth.users(id),
      max_uses INTEGER DEFAULT 1, -- How many times this token can be used
      current_uses INTEGER DEFAULT 0, -- How many times it's been used
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_invite_tokens_created_by ON invite_tokens(created_by);
    CREATE INDEX IF NOT EXISTS idx_invite_tokens_expires_at ON invite_tokens(expires_at);

    -- Enable RLS
    ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- RLS Policies for invite_tokens
DO $$
BEGIN
  -- Admins and managers can create invites
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'invite_tokens' 
    AND policyname = 'Admins and managers can create invites'
  ) THEN
    CREATE POLICY "Admins and managers can create invites" ON invite_tokens
      FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      );
  END IF;

  -- Admins and managers can view all invites
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'invite_tokens' 
    AND policyname = 'Admins and managers can view invites'
  ) THEN
    CREATE POLICY "Admins and managers can view invites" ON invite_tokens
      FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      );
  END IF;

  -- Allow anyone to view invite tokens by token value (for invite acceptance page)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'invite_tokens' 
    AND policyname = 'Anyone can view invite by token'
  ) THEN
    CREATE POLICY "Anyone can view invite by token" ON invite_tokens
      FOR SELECT USING (true);
  END IF;

  -- Allow updates for invite acceptance (unauthenticated users can mark invites as used)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'invite_tokens' 
    AND policyname = 'Allow invite token updates'
  ) THEN
    CREATE POLICY "Allow invite token updates" ON invite_tokens
      FOR UPDATE USING (
        -- Allow if authenticated and admin/manager
        (auth.role() = 'authenticated' AND
         EXISTS (
           SELECT 1 FROM user_profiles
           WHERE id = auth.uid() AND role IN ('admin', 'manager')
         ))
        OR
        -- Allow if token is valid (not expired, not maxed out)
        (expires_at > NOW() AND current_uses < max_uses)
      );
  END IF;

  -- Update RLS policies for user_profiles to allow admins/managers to manage users
  -- Admins can view all user profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles" ON user_profiles
      FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      );
  END IF;

  -- Admins can update user profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Admins can update profiles'
  ) THEN
    CREATE POLICY "Admins can update profiles" ON user_profiles
      FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      );
  END IF;

  -- Admins can delete user profiles (cascade will handle auth.users deletion)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Admins can delete profiles'
  ) THEN
    CREATE POLICY "Admins can delete profiles" ON user_profiles
      FOR DELETE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;

  -- Allow users to insert their own profile (for invite acceptance)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON user_profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_invite_tokens_updated_at ON invite_tokens;
CREATE TRIGGER update_invite_tokens_updated_at BEFORE UPDATE ON invite_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate secure invite tokens
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a secure random token
  token := encode(gen_random_bytes(32), 'base64url');
  -- Remove any special characters that might cause issues in URLs
  token := replace(replace(token, '+', ''), '/', '');
  token := replace(token, '=', '');
  RETURN token;
END;
$$ LANGUAGE plpgsql;

