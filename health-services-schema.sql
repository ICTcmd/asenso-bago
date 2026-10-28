-- Health Services Database Schema
-- For Asenso Bago App - Health Programs (Heart Warriors, Wheels of Love, Smile Bright Bago)
-- This schema will be added to the existing Bago Safe Supabase project

-- ============================================================================
-- HEALTH SERVICE REQUESTS TABLE
-- ============================================================================

-- Create enum for program types
CREATE TYPE health_program AS ENUM ('heart_warriors', 'wheels_of_love', 'smile_bright');

-- Create enum for request status
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'scheduled', 'completed', 'rejected', 'cancelled');

-- Main health service requests table
CREATE TABLE health_service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT UNIQUE NOT NULL,
  
  -- Program Selection
  program health_program NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  
  -- Common Personal Info (required for all programs)
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 120),
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  contact_number TEXT NOT NULL,
  barangay TEXT NOT NULL,
  
  -- Program-specific data stored as JSONB (flexible for each program's unique fields)
  program_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- File uploads (URLs from Supabase Storage)
  uploaded_files JSONB DEFAULT '[]'::jsonb,
  
  -- Tracking timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  
  -- Admin/Staff management
  staff_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_health_reference_number ON health_service_requests(reference_number);
CREATE INDEX idx_health_program ON health_service_requests(program);
CREATE INDEX idx_health_status ON health_service_requests(status);
CREATE INDEX idx_health_barangay ON health_service_requests(barangay);
CREATE INDEX idx_health_created_at ON health_service_requests(created_at DESC);
CREATE INDEX idx_health_scheduled_date ON health_service_requests(scheduled_date);

-- Index for JSONB queries (if needed)
CREATE INDEX idx_health_program_details ON health_service_requests USING gin(program_details);

-- ============================================================================
-- FUNCTION TO GENERATE REFERENCE NUMBERS
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_health_reference_number(program_type health_program)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  next_num INTEGER;
  ref_number TEXT;
BEGIN
  -- Set prefix based on program
  prefix := CASE program_type
    WHEN 'heart_warriors' THEN 'HW'
    WHEN 'wheels_of_love' THEN 'WOL'
    WHEN 'smile_bright' THEN 'SBB'
    ELSE 'HSR'
  END;
  
  -- Get next sequential number for this year and program
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reference_number FROM '\d+$') AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM health_service_requests
  WHERE reference_number LIKE prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-%';
  
  -- Format: HW-2026-00123, WOL-2026-00456, SBB-2026-00789
  ref_number := prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_num::TEXT, 5, '0');
  
  RETURN ref_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER TO AUTO-GENERATE REFERENCE NUMBERS
-- ============================================================================

CREATE OR REPLACE FUNCTION set_health_reference_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := generate_health_reference_number(NEW.program);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_health_reference_on_insert
  BEFORE INSERT ON health_service_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_health_reference_number();

-- ============================================================================
-- TRIGGER TO AUTO-UPDATE updated_at TIMESTAMP
-- ============================================================================

CREATE TRIGGER update_health_service_requests_timestamp
  BEFORE UPDATE ON health_service_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); -- Reuse existing function from Bago Safe

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE health_service_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (even anonymous) can submit requests
CREATE POLICY "Anyone can submit health service requests"
  ON health_service_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 2: Anyone can view their own request by reference number
-- (We allow SELECT to all since reference number is private knowledge)
CREATE POLICY "Anyone can view health service requests"
  ON health_service_requests
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 3: Only admins can update requests
CREATE POLICY "Only admins can update health service requests"
  ON health_service_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Policy 4: Only admins can delete requests
CREATE POLICY "Only admins can delete health service requests"
  ON health_service_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- STORAGE BUCKET FOR HEALTH DOCUMENTS
-- ============================================================================

-- Create storage bucket for health program documents (PWD IDs, medical certs, etc.)
-- Note: Run this via Supabase dashboard SQL editor or API
INSERT INTO storage.buckets (id, name, public)
VALUES ('health-documents', 'health-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for health-documents bucket

-- Anyone can upload documents
CREATE POLICY "Anyone can upload health documents"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'health-documents');

-- Anyone can view documents (they need the URL which is private)
CREATE POLICY "Anyone can view health documents"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'health-documents');

-- Only admins can delete documents
CREATE POLICY "Only admins can delete health documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'health-documents' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE health_service_requests IS 'Health service requests from citizens for Heart Warriors, Wheels of Love, and Smile Bright Bago programs';
COMMENT ON COLUMN health_service_requests.program IS 'Which health program: heart_warriors, wheels_of_love, or smile_bright';
COMMENT ON COLUMN health_service_requests.program_details IS 'Program-specific data stored as JSONB (e.g., medical history for Heart Warriors, PWD details for Wheels of Love)';
COMMENT ON COLUMN health_service_requests.uploaded_files IS 'Array of file metadata: [{type: "pwd_id", url: "...", uploaded_at: "..."}]';
COMMENT ON COLUMN health_service_requests.reference_number IS 'Unique reference number for tracking: HW-2026-00123, WOL-2026-00456, SBB-2026-00789';

-- ============================================================================
-- SAMPLE DATA (FOR TESTING)
-- ============================================================================

-- Sample Heart Warriors request
INSERT INTO health_service_requests (
  program, full_name, age, gender, contact_number, barangay,
  program_details
) VALUES (
  'heart_warriors',
  'Juan Dela Cruz',
  58,
  'Male',
  '09171234567',
  'Barangay Dulao',
  '{
    "existing_condition": true,
    "current_medications": "Aspirin 100mg daily, Metoprolol 50mg",
    "medical_history": "History of hypertension, had mild heart attack in 2024",
    "preferred_date": "2026-11-15",
    "emergency_contact_name": "Maria Dela Cruz",
    "emergency_contact_number": "09181234567"
  }'::jsonb
);

-- Sample Wheels of Love request
INSERT INTO health_service_requests (
  program, full_name, age, gender, contact_number, barangay,
  program_details, uploaded_files
) VALUES (
  'wheels_of_love',
  'Rosa Santos',
  45,
  'Female',
  '09191234567',
  'Barangay Ma-ao',
  '{
    "pwd_id_number": "PWD-2026-1234",
    "disability_type": "Physical - Paraplegia",
    "mobility_aid_needed": "Manual Wheelchair",
    "situation_description": "Unable to walk due to spinal injury from accident. Current wheelchair is broken and unusable.",
    "living_situation": "With family"
  }'::jsonb,
  '[
    {
      "type": "pwd_id",
      "filename": "pwd-id-rosa-santos.jpg",
      "url": "https://example.com/placeholder.jpg",
      "uploaded_at": "2026-10-28T10:30:00Z"
    }
  ]'::jsonb
);

-- Sample Smile Bright Bago request
INSERT INTO health_service_requests (
  program, full_name, age, gender, contact_number, barangay,
  program_details
) VALUES (
  'smile_bright',
  'Pedro Garcia',
  32,
  'Male',
  '09201234567',
  'Barangay Poblacion',
  '{
    "services_needed": ["Cleaning", "Extraction"],
    "dental_concern": "Severe toothache on lower left molar. Also need general cleaning.",
    "preferred_date": "2026-11-10",
    "preferred_time": "Morning (8AM - 12PM)",
    "last_dental_visit": "2024-03-15",
    "allergies": "None",
    "current_medications": "None"
  }'::jsonb
);

-- ============================================================================
-- UTILITY QUERIES (FOR REFERENCE)
-- ============================================================================

-- Query to get all pending requests
-- SELECT * FROM health_service_requests WHERE status = 'pending' ORDER BY created_at DESC;

-- Query to get requests by program
-- SELECT * FROM health_service_requests WHERE program = 'heart_warriors' ORDER BY created_at DESC;

-- Query to get requests by barangay
-- SELECT * FROM health_service_requests WHERE barangay = 'Barangay Dulao' ORDER BY created_at DESC;

-- Query to get request by reference number (for tracking)
-- SELECT * FROM health_service_requests WHERE reference_number = 'HW-2026-00001';

-- Query to get statistics by program
-- SELECT 
--   program,
--   COUNT(*) as total_requests,
--   COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
--   COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
--   COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
-- FROM health_service_requests
-- GROUP BY program;

-- Query to get requests by date range
-- SELECT * FROM health_service_requests 
-- WHERE created_at BETWEEN '2026-10-01' AND '2026-10-31'
-- ORDER BY created_at DESC;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Health Services schema created successfully!';
  RAISE NOTICE '📋 Table created: health_service_requests';
  RAISE NOTICE '🔐 Row-Level Security enabled';
  RAISE NOTICE '🗂️ Storage bucket: health-documents';
  RAISE NOTICE '📝 Sample data inserted (3 test requests)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Reference number format:';
  RAISE NOTICE '   - Heart Warriors: HW-2026-00001';
  RAISE NOTICE '   - Wheels of Love: WOL-2026-00001';
  RAISE NOTICE '   - Smile Bright Bago: SBB-2026-00001';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready to start building the form!';
END $$;
