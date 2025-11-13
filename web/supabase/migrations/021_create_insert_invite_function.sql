-- Create a SECURITY DEFINER function to insert invite tokens
-- This bypasses RLS and allows admins/managers to create invites

CREATE OR REPLACE FUNCTION insert_invite_token(
  p_token TEXT,
  p_created_by UUID,
  p_expires_at TIMESTAMPTZ,
  p_email TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'operator',
  p_facility_id UUID DEFAULT NULL,
  p_max_uses INTEGER DEFAULT 1
)
RETURNS TABLE (
  id UUID,
  token TEXT,
  created_by UUID,
  email TEXT,
  role TEXT,
  facility_id UUID,
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  used_by UUID,
  max_uses INTEGER,
  current_uses INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role TEXT;
  v_result RECORD;
BEGIN
  -- Check if the calling user is admin or manager
  -- This query bypasses RLS because we're SECURITY DEFINER
  SELECT role INTO v_user_role
  FROM public.user_profiles
  WHERE id = auth.uid();
  
  IF v_user_role IS NULL OR v_user_role NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Only admins and managers can create invite tokens';
  END IF;
  
  -- Insert the invite token (bypasses RLS because we're SECURITY DEFINER)
  INSERT INTO public.invite_tokens (
    token,
    created_by,
    email,
    role,
    facility_id,
    expires_at,
    max_uses,
    current_uses
  ) VALUES (
    p_token,
    p_created_by,
    p_email,
    p_role,
    p_facility_id,
    p_expires_at,
    p_max_uses,
    0
  ) RETURNING * INTO v_result;
  
  RETURN QUERY SELECT * FROM public.invite_tokens WHERE id = v_result.id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_invite_token TO authenticated;

