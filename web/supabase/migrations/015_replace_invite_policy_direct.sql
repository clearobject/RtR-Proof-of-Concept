-- Replace invite_tokens INSERT policy with direct EXISTS check
-- This MUST be run to fix the RLS issue

DO $$
BEGIN
  -- Only proceed if both tables exist
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invite_tokens') 
     AND EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    
    -- Drop the existing policy that uses auth_user_has_role
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
  END IF;
END $$;

