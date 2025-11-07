-- Connect alerts and maintenance workflows and harden role checks

-- Helper to evaluate application roles without triggering RLS recursion
CREATE OR REPLACE FUNCTION auth_user_has_role(required_roles text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role text;
BEGIN
  SELECT role INTO current_role
  FROM user_profiles
  WHERE id = auth.uid();

  IF current_role IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN current_role = ANY(required_roles);
END;
$$;

REVOKE ALL ON FUNCTION auth_user_has_role(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION auth_user_has_role(text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION auth_user_has_role(text[]) TO service_role;

-- Ensure maintenance tickets capture originating alerts
ALTER TABLE maintenance_tickets
ADD COLUMN IF NOT EXISTS alert_id UUID REFERENCES alerts(id);

-- Refresh maintenance ticket policy to rely on the helper function
DROP POLICY IF EXISTS "Maintenance can manage tickets" ON maintenance_tickets;
CREATE POLICY "Maintenance can manage tickets" ON maintenance_tickets
  FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND auth_user_has_role(ARRAY['maintenance', 'manager', 'admin'])
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth_user_has_role(ARRAY['maintenance', 'manager', 'admin'])
  );

-- Allow maintenance leaders to see the technician directory
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

CREATE POLICY "Leadership can view profiles" ON user_profiles
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND auth_user_has_role(ARRAY['maintenance', 'manager', 'admin'])
  );

CREATE POLICY "Leadership can update profiles" ON user_profiles
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND auth_user_has_role(ARRAY['manager', 'admin'])
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth_user_has_role(ARRAY['manager', 'admin'])
  );

CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND auth_user_has_role(ARRAY['admin'])
  );

-- Refresh invite token policies to use the helper function
DROP POLICY IF EXISTS "Admins and managers can create invites" ON invite_tokens;
DROP POLICY IF EXISTS "Admins and managers can view invites" ON invite_tokens;
DROP POLICY IF EXISTS "Allow invite token updates" ON invite_tokens;

CREATE POLICY "Leaders can create invites" ON invite_tokens
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth_user_has_role(ARRAY['manager', 'admin'])
  );

CREATE POLICY "Leaders can view invites" ON invite_tokens
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND auth_user_has_role(ARRAY['manager', 'admin'])
  );

CREATE POLICY "Manage invite lifecycle" ON invite_tokens
  FOR UPDATE
  USING (
    (
      auth.role() = 'authenticated'
      AND auth_user_has_role(ARRAY['manager', 'admin'])
    )
    OR
    (
      expires_at > NOW()
      AND current_uses < max_uses
    )
  );


