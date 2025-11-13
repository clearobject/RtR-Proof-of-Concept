-- FINAL FIX: Replace invite_tokens INSERT policy
-- This will work regardless of table existence checks

-- Step 1: Drop the old policy (safe even if it doesn't exist)
DROP POLICY IF EXISTS "Admins and managers can create invites" ON public.invite_tokens;
DROP POLICY IF EXISTS "Leaders can create invites" ON public.invite_tokens;

-- Step 2: Create the new policy with direct EXISTS check
-- This avoids the auth_user_has_role function which fails in RLS contexts
-- Using explicit schema qualification to avoid search_path issues
CREATE POLICY "Leaders can create invites" ON public.invite_tokens
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE public.user_profiles.id = auth.uid()
      AND public.user_profiles.role IN ('admin', 'manager')
    )
  );

