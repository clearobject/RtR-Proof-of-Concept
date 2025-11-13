-- Fix policy by temporarily working around RLS
-- This approach temporarily alters the table to create the policy

-- Step 1: Drop old policies
DROP POLICY IF EXISTS "Admins and managers can create invites" ON invite_tokens;
DROP POLICY IF EXISTS "Leaders can create invites" ON invite_tokens;

-- Step 2: Create policy using a simpler check that references the function
-- Since the function exists and works, we'll use it but ensure it's called correctly
CREATE POLICY "Leaders can create invites" ON invite_tokens
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth_user_has_role(ARRAY['admin', 'manager'])
  );

