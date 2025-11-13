-- FINAL FIX: Replace invite_tokens INSERT policy with explicit search_path
-- This ensures the policy can find user_profiles table

-- Set search_path to ensure we can find the tables
SET LOCAL search_path = public;

-- Drop the old policy
DROP POLICY IF EXISTS "Admins and managers can create invites" ON invite_tokens;
DROP POLICY IF EXISTS "Leaders can create invites" ON invite_tokens;

-- Create the new policy with direct EXISTS check
CREATE POLICY "Leaders can create invites" ON invite_tokens
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  );

