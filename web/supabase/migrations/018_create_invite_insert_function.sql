-- Create a SECURITY DEFINER function to insert invite tokens
-- This bypasses RLS and allows admins/managers to create invites

CREATE OR REPLACE FUNCTION create_invite_token(
  p_token TEXT,
  p_created_by UUID,
  p_email TEXT,
  p_role TEXT,
  p_facility_id UUID,
  p_expires_at TIMESTAMPTZ,
  p_max_uses INTEGER DEFAULT 1
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role TEXT;
  v_invite_id UUID;
BEGIN
  -- Check if the calling user is admin or manager
  SELECT role INTO v_user_role
  FROM user_profiles
  WHERE id = auth.uid();
  
  IF v_user_role IS NULL OR v_user_role NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Only admins and managers can create invite tokens';
  END IF;
  
  -- Insert the invite token
  INSERT INTO invite_tokens (
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
  ) RETURNING id INTO v_invite_id;
  
  RETURN v_invite_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_invite_token TO authenticated;

