-- Fix RLS policy for invite_tokens INSERT operations
-- This ensures admins and managers can create invite tokens when approving access requests

DO $$
BEGIN
  -- Only proceed if both invite_tokens and user_profiles tables exist
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invite_tokens') THEN
    -- Drop any conflicting or incorrect INSERT policies
    DROP POLICY IF EXISTS "Admins and managers can create invites" ON invite_tokens;
    DROP POLICY IF EXISTS "Leaders can create invites" ON invite_tokens;

    -- Create a definitive INSERT policy for invite_tokens
    -- This policy allows authenticated users with admin or manager role to insert invite tokens
    -- Only create if user_profiles exists (since the policy references it)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
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
            AND EXISTS (
              SELECT 1 FROM user_profiles
              WHERE user_profiles.id = auth.uid()
              AND user_profiles.role IN ('admin', 'manager')
            )
          );
      END IF;
    END IF;
  END IF;
END $$;

-- Ensure the policy is properly applied
-- This uses a direct EXISTS check instead of the helper function to avoid any potential issues
