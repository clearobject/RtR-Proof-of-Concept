-- Admin access management: join links and access requests
-- Migration: 005_admin_access_management.sql
-- This migration is idempotent and can be re-run safely

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'join_links'
  ) THEN
    CREATE TABLE public.join_links (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      token TEXT NOT NULL UNIQUE,
      name TEXT,
      description TEXT,
      created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ,
      max_requests INTEGER CHECK (max_requests IS NULL OR max_requests >= 0),
      current_requests INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_join_links_token ON public.join_links(token);
    CREATE INDEX IF NOT EXISTS idx_join_links_created_by ON public.join_links(created_by);
    CREATE INDEX IF NOT EXISTS idx_join_links_status ON public.join_links(status);

    ALTER TABLE public.join_links ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'access_requests'
  ) THEN
    CREATE TABLE public.access_requests (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      join_link_id UUID REFERENCES public.join_links(id) ON DELETE SET NULL,
      join_token TEXT NOT NULL,
      email TEXT NOT NULL,
      full_name TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
      resolution_notes TEXT,
      resolved_at TIMESTAMPTZ,
      resolved_by UUID REFERENCES auth.users(id),
      invite_token_id UUID REFERENCES public.invite_tokens(id) ON DELETE SET NULL,
      invite_token TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_access_requests_status ON public.access_requests(status);
    CREATE INDEX IF NOT EXISTS idx_access_requests_join_token ON public.access_requests(join_token);
    CREATE INDEX IF NOT EXISTS idx_access_requests_email ON public.access_requests(email);

    ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- RLS policies for join_links
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'join_links'
      AND policyname = 'Admins can view join links'
  ) THEN
    CREATE POLICY "Admins can view join links" ON public.join_links
      FOR SELECT
      USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'join_links'
      AND policyname = 'Admins can create join links'
  ) THEN
    CREATE POLICY "Admins can create join links" ON public.join_links
      FOR INSERT
      WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'join_links'
      AND policyname = 'Admins can update join links'
  ) THEN
    CREATE POLICY "Admins can update join links" ON public.join_links
      FOR UPDATE
      USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      )
      WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'join_links'
      AND policyname = 'Admins can delete join links'
  ) THEN
    CREATE POLICY "Admins can delete join links" ON public.join_links
      FOR DELETE
      USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- RLS policies for access_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'access_requests'
      AND policyname = 'Admins can view access requests'
  ) THEN
    CREATE POLICY "Admins can view access requests" ON public.access_requests
      FOR SELECT
      USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'access_requests'
      AND policyname = 'Admins can update access requests'
  ) THEN
    CREATE POLICY "Admins can update access requests" ON public.access_requests
      FOR UPDATE
      USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      )
      WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'access_requests'
      AND policyname = 'Admins can delete access requests'
  ) THEN
    CREATE POLICY "Admins can delete access requests" ON public.access_requests
      FOR DELETE
      USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Allow anyone (including anon) to create access requests via RPC
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'access_requests'
      AND policyname = 'Anyone can create access requests'
  ) THEN
    CREATE POLICY "Anyone can create access requests" ON public.access_requests
      FOR INSERT
      WITH CHECK (TRUE);
  END IF;
END $$;

-- Triggers for updated_at maintenance
DROP TRIGGER IF EXISTS update_join_links_updated_at ON public.join_links;
CREATE TRIGGER update_join_links_updated_at
  BEFORE UPDATE ON public.join_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_access_requests_updated_at ON public.access_requests;
CREATE TRIGGER update_access_requests_updated_at
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to fetch a join link by token safely
CREATE OR REPLACE FUNCTION public.get_join_link_by_token(p_token TEXT)
RETURNS public.join_links
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  join_record public.join_links;
BEGIN
  SELECT jl.*
  INTO join_record
  FROM public.join_links jl
  WHERE jl.token = p_token
    AND jl.status = 'active'
    AND (jl.expires_at IS NULL OR jl.expires_at > NOW())
    AND (jl.max_requests IS NULL OR jl.current_requests < jl.max_requests)
  LIMIT 1;

  RETURN join_record;
END;
$$;

-- Helper function to create an access request and increment join link usage atomically
CREATE OR REPLACE FUNCTION public.create_access_request(
  p_token TEXT,
  p_email TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS public.access_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  join_record public.join_links;
  new_request public.access_requests;
BEGIN
  SELECT *
  INTO join_record
  FROM public.join_links
  WHERE token = p_token
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_requests IS NULL OR current_requests < max_requests)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired join link'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.access_requests (join_link_id, join_token, email, full_name, notes)
  VALUES (join_record.id, p_token, p_email, p_full_name, p_notes)
  RETURNING * INTO new_request;

  UPDATE public.join_links
  SET current_requests = current_requests + 1,
      updated_at = NOW()
  WHERE id = join_record.id;

  RETURN new_request;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_join_link_by_token(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_access_request(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;


