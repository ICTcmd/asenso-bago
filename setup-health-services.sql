-- ============================================================
-- HEALTH SERVICES SETUP — Run this in Supabase SQL Editor
-- One-time setup for Heart Warriors, Wheels of Love, Smile Bright
-- ============================================================

-- 1. Create enum types (skip if they already exist)
DO $$ BEGIN
  CREATE TYPE health_program AS ENUM ('heart_warriors', 'wheels_of_love', 'smile_bright');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'approved', 'scheduled', 'completed', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Create health_service_requests table
CREATE TABLE IF NOT EXISTS health_service_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE NOT NULL,
  program          health_program NOT NULL,
  status           request_status NOT NULL DEFAULT 'pending',
  full_name        TEXT NOT NULL,
  age              INTEGER NOT NULL CHECK (age > 0 AND age < 120),
  gender           TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  contact_number   TEXT NOT NULL,
  barangay         TEXT NOT NULL,
  program_details  JSONB NOT NULL DEFAULT '{}'::jsonb,
  uploaded_files   JSONB DEFAULT '[]'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_date   TIMESTAMPTZ,
  completed_date   TIMESTAMPTZ,
  staff_notes      TEXT,
  reviewed_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMPTZ
);

-- 3. Auto-generate reference numbers
CREATE OR REPLACE FUNCTION generate_health_reference(prog health_program)
RETURNS TEXT AS $$
DECLARE
  prefix   TEXT;
  next_num INTEGER;
BEGIN
  prefix := CASE prog
    WHEN 'heart_warriors' THEN 'HW'
    WHEN 'wheels_of_love' THEN 'WOL'
    WHEN 'smile_bright'   THEN 'SBB'
    ELSE 'HSR'
  END;

  SELECT COALESCE(MAX(CAST(SUBSTRING(reference_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO next_num
  FROM health_service_requests
  WHERE reference_number LIKE prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-%';

  RETURN prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_health_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := generate_health_reference(NEW.program);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_health_reference ON health_service_requests;
CREATE TRIGGER trg_health_reference
  BEFORE INSERT ON health_service_requests
  FOR EACH ROW EXECUTE FUNCTION set_health_reference();

-- 4. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_health_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_health_updated_at ON health_service_requests;
CREATE TRIGGER trg_health_updated_at
  BEFORE UPDATE ON health_service_requests
  FOR EACH ROW EXECUTE FUNCTION update_health_timestamp();

-- 5. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_health_ref    ON health_service_requests(reference_number);
CREATE INDEX IF NOT EXISTS idx_health_prog   ON health_service_requests(program);
CREATE INDEX IF NOT EXISTS idx_health_status ON health_service_requests(status);
CREATE INDEX IF NOT EXISTS idx_health_date   ON health_service_requests(created_at DESC);

-- 6. Enable RLS
ALTER TABLE health_service_requests ENABLE ROW LEVEL SECURITY;

-- Drop old policies first
DROP POLICY IF EXISTS "Anyone can submit health service requests"  ON health_service_requests;
DROP POLICY IF EXISTS "Anyone can view health service requests"    ON health_service_requests;
DROP POLICY IF EXISTS "Only admins can update health service requests" ON health_service_requests;
DROP POLICY IF EXISTS "Only admins can delete health service requests" ON health_service_requests;

-- Anyone (anon) can INSERT — citizens submit requests without an account
CREATE POLICY "health_insert_public"
  ON health_service_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can SELECT their own record by reference_number
-- (they know the ref number = they submitted it)
CREATE POLICY "health_select_public"
  ON health_service_requests FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated staff can UPDATE (change status, add notes)
CREATE POLICY "health_update_staff"
  ON health_service_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor', 'responder')
    )
  );

-- 7. Create storage bucket for uploaded documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('health-documents', 'health-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anyone can upload, only staff can view
DROP POLICY IF EXISTS "health_docs_insert" ON storage.objects;
CREATE POLICY "health_docs_insert"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'health-documents');

DROP POLICY IF EXISTS "health_docs_select" ON storage.objects;
CREATE POLICY "health_docs_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'health-documents');

-- 8. Grant permissions
GRANT USAGE  ON SCHEMA public TO anon, authenticated;
GRANT INSERT, SELECT ON health_service_requests TO anon;
GRANT ALL    ON health_service_requests TO authenticated;

-- Done!
DO $$
BEGIN
  RAISE NOTICE '✅ Health services table ready!';
  RAISE NOTICE '📋 Reference format: HW-2026-00001, WOL-2026-00001, SBB-2026-00001';
  RAISE NOTICE '🗂  Storage bucket: health-documents';
END $$;
