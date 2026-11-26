-- ============================================================================
-- ASENSO BAGO: SECURITY & CROSS-DEVICE UPGRADE V2
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Link health requests to authenticated users (optional for anonymous guests)
ALTER TABLE public.health_service_requests
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_health_user_id
  ON public.health_service_requests(user_id)
  WHERE user_id IS NOT NULL;

DROP POLICY IF EXISTS "Users can view own health requests" ON public.health_service_requests;
CREATE POLICY "Users can view own health requests"
  ON public.health_service_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Lock down health-documents bucket SELECT to admins/supervisors only
--    (Admin panel now generates temporary 1-hour signed URLs via createSignedUrl)
DROP POLICY IF EXISTS "Anyone can view health documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view health documents" ON storage.objects;

CREATE POLICY "Admins can view health documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'health-documents' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  );
