-- FINAL FIX: Simple policy that should work
-- Drop old policies first
DROP POLICY IF EXISTS "Admins and managers can create invites" ON invite_tokens;
DROP POLICY IF EXISTS "Leaders can create invites" ON invite_tokens;

-- Create a simple policy using the function (which is SECURITY DEFINER and should work)
-- The function auth_user_has_role is SECURITY DEFINER, so it bypasses RLS on user_profiles
CREATE POLICY "Leaders can create invites" ON invite_tokens
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth_user_has_role(ARRAY['admin', 'manager'])
  );

