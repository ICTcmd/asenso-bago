-- ============================================================================
-- ASENSO BAGO: SUPABASE SECURITY & PERFORMANCE UPGRADE
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Composite indexes for fast admin filtering and role checks
CREATE INDEX IF NOT EXISTS idx_health_program_status_created
  ON public.health_service_requests(program, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles(role);

-- 2. Prevent race condition on concurrent health request reference numbers
CREATE OR REPLACE FUNCTION public.generate_health_reference_number(program_type health_program)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  year_str TEXT;
  next_num INTEGER;
  ref_number TEXT;
BEGIN
  prefix := CASE program_type
    WHEN 'heart_warriors' THEN 'HW'
    WHEN 'wheels_of_love' THEN 'WOL'
    WHEN 'smile_bright' THEN 'SBB'
    ELSE 'HSR'
  END;

  year_str := TO_CHAR(NOW(), 'YYYY');

  -- Transaction-scoped advisory lock per program+year prevents duplicate numbers
  PERFORM pg_advisory_xact_lock(hashtext(prefix || '-' || year_str));

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reference_number FROM '\d+$') AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM public.health_service_requests
  WHERE reference_number LIKE prefix || '-' || year_str || '-%';

  ref_number := prefix || '-' || year_str || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN ref_number;
END;
$$ LANGUAGE plpgsql;

-- 3. Secure public request tracking via exact reference_number lookup RPC
CREATE OR REPLACE FUNCTION public.track_health_request(p_reference_number TEXT)
RETURNS TABLE (
  reference_number TEXT,
  program health_program,
  status request_status,
  full_name TEXT,
  barangay TEXT,
  created_at TIMESTAMPTZ,
  scheduled_date TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.reference_number,
    r.program,
    r.status,
    r.full_name,
    r.barangay,
    r.created_at,
    r.scheduled_date
  FROM public.health_service_requests r
  WHERE r.reference_number = UPPER(TRIM(p_reference_number))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.track_health_request(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_health_request(TEXT) TO anon, authenticated;

-- 4. Lock down table-wide SELECT so anonymous users cannot dump all citizen requests
DROP POLICY IF EXISTS "Anyone can view health service requests" ON public.health_service_requests;
DROP POLICY IF EXISTS "Admins can view health service requests" ON public.health_service_requests;

CREATE POLICY "Admins can view health service requests"
  ON public.health_service_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  );
