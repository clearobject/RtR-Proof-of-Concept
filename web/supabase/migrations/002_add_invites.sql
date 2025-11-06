-- User Invites System
-- Migration: 002_add_invites.sql

-- Invite tokens table
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
CREATE INDEX idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX idx_invite_tokens_created_by ON invite_tokens(created_by);
CREATE INDEX idx_invite_tokens_expires_at ON invite_tokens(expires_at);

-- Enable RLS
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invite_tokens
-- Admins and managers can create invites
CREATE POLICY "Admins and managers can create invites" ON invite_tokens
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admins and managers can view all invites
CREATE POLICY "Admins and managers can view invites" ON invite_tokens
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Allow anyone to view invite tokens by token value (for invite acceptance page)
CREATE POLICY "Anyone can view invite by token" ON invite_tokens
  FOR SELECT USING (true);

-- Allow updates for invite acceptance (unauthenticated users can mark invites as used)
-- This is needed for the invite acceptance flow
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

-- Update RLS policies for user_profiles to allow admins/managers to manage users
-- Admins can view all user profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admins can update user profiles
CREATE POLICY "Admins can update profiles" ON user_profiles
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admins can delete user profiles (cascade will handle auth.users deletion)
CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow users to insert their own profile (for invite acceptance)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger for updated_at
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

