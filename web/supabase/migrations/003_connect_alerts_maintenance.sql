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
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'maintenance_tickets' 
    AND policyname = 'Maintenance can manage tickets'
  ) THEN
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
  END IF;
END $$;

-- Allow maintenance leaders to see the technician directory
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Leadership can view profiles'
  ) THEN
    CREATE POLICY "Leadership can view profiles" ON user_profiles
      FOR SELECT
      USING (
        auth.role() = 'authenticated'
        AND auth_user_has_role(ARRAY['maintenance', 'manager', 'admin'])
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Leadership can update profiles'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Admins can delete profiles'
  ) THEN
    CREATE POLICY "Admins can delete profiles" ON user_profiles
      FOR DELETE
      USING (
        auth.role() = 'authenticated'
        AND auth_user_has_role(ARRAY['admin'])
      );
  END IF;
END $$;

-- Refresh invite token policies to use the helper function
DROP POLICY IF EXISTS "Admins and managers can create invites" ON invite_tokens;
DROP POLICY IF EXISTS "Admins and managers can view invites" ON invite_tokens;
DROP POLICY IF EXISTS "Allow invite token updates" ON invite_tokens;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'invite_tokens' 
    AND policyname = 'Leaders can create invites'
  ) THEN
    CREATE POLICY "Leaders can create invites" ON invite_tokens
      FOR INSERT
      WITH CHECK (
        auth.role() = 'authenticated'
        AND auth_user_has_role(ARRAY['manager', 'admin'])
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'invite_tokens' 
    AND policyname = 'Leaders can view invites'
  ) THEN
    CREATE POLICY "Leaders can view invites" ON invite_tokens
      FOR SELECT
      USING (
        auth.role() = 'authenticated'
        AND auth_user_has_role(ARRAY['manager', 'admin'])
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'invite_tokens' 
    AND policyname = 'Manage invite lifecycle'
  ) THEN
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
  END IF;
END $$;


