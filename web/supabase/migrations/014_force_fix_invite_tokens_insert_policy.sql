-- Force fix RLS policy for invite_tokens INSERT operations
-- This replaces the policy that uses auth_user_has_role with a direct EXISTS check
-- which is more reliable in RLS contexts

DO $$
BEGIN
  -- Only proceed if both tables exist
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invite_tokens') 
     AND EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    
    -- Drop the existing policy regardless of which version it is
    -- This ensures we replace it even if it already exists
    DROP POLICY IF EXISTS "Admins and managers can create invites" ON invite_tokens;
    DROP POLICY IF EXISTS "Leaders can create invites" ON invite_tokens;
    
    -- Create the policy with direct EXISTS check (more reliable than auth_user_has_role)
    -- This avoids potential issues with SECURITY DEFINER functions in RLS contexts
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
      
    -- Verify the policy was created
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'invite_tokens' 
      AND policyname = 'Leaders can create invites'
    ) THEN
      RAISE EXCEPTION 'Failed to create Leaders can create invites policy';
    END IF;
  END IF;
END $$;

