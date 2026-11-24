-- ============================================================================
-- BAGO BUDDY 2.0 - PHASE 2: KNOWLEDGE BASE DATABASE SCHEMA
-- Designed for Supabase PostgreSQL with pgvector extension
-- Version: 1.0
-- Date: November 20, 2026
-- ============================================================================

-- Prerequisites: pgvector extension must be enabled
-- Run verify-pgvector.sql first to confirm availability

-- ============================================================================
-- ENUMS AND TYPES
-- ============================================================================

-- Document categories (expandable)
CREATE TYPE knowledge_category AS ENUM (
  'government_services',
  'business_permits',
  'civil_registry',
  'health_programs',
  'barangay_services',
  'tourism',
  'ordinances',
  'resolutions',
  'announcements',
  'emergency_procedures',
  'contact_information',
  'faq',
  'other'
);

-- Document status for approval workflow
CREATE TYPE document_status AS ENUM (
  'draft',           -- Initial upload, not reviewed
  'for_review',      -- Submitted for admin review
  'approved',        -- Approved but not yet published
  'published',       -- Live and searchable
  'archived',        -- No longer active
  'rejected'         -- Rejected during review
);

-- Document types
CREATE TYPE document_type AS ENUM (
  'pdf',
  'docx',
  'txt',
  'html',
  'url',
  'manual'  -- Manually created content
);

-- ============================================================================
-- TABLE 1: KNOWLEDGE_BASE_DOCUMENTS
-- Master table for all knowledge base documents
-- ============================================================================

CREATE TABLE knowledge_base_documents (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT UNIQUE NOT NULL,  -- e.g., KB-2026-00001
  
  -- Document metadata
  title TEXT NOT NULL,
  description TEXT,
  category knowledge_category NOT NULL,
  sub_category TEXT,  -- More specific categorization
  document_type document_type NOT NULL,
  
  -- Original document info
  original_filename TEXT,
  file_url TEXT,  -- Supabase storage URL (if uploaded)
  external_url TEXT,  -- External source URL (if applicable)
  file_size_bytes INTEGER,
  file_hash TEXT,  -- SHA-256 hash for duplicate detection
  
  -- Content
  full_text TEXT,  -- Extracted full text content
  full_text_tsvector TSVECTOR,  -- For PostgreSQL full-text search
  language TEXT DEFAULT 'en',  -- Primary language: en, fil, hil
  
  -- Responsible office/department
  responsible_office TEXT NOT NULL,
  contact_person TEXT,
  contact_number TEXT,
  contact_email TEXT,
  
  -- Dates and versioning
  version INTEGER DEFAULT 1,
  effective_date DATE,  -- When requirements/policy takes effect
  expiration_date DATE,  -- When document becomes outdated
  review_date DATE,  -- When document should be reviewed
  superseded_by UUID REFERENCES knowledge_base_documents(id) ON DELETE SET NULL,
  
  -- Workflow tracking
  status document_status NOT NULL DEFAULT 'draft',
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  
  -- Admin notes
  review_notes TEXT,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Search and display
  view_count INTEGER DEFAULT 0,
  search_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  
  -- Tags for flexible categorization
  tags TEXT[],
  keywords TEXT[],
  
  -- Processing status
  processing_status TEXT DEFAULT 'pending',  -- pending, processing, completed, failed
  processing_error TEXT,
  chunks_count INTEGER DEFAULT 0,
  embeddings_generated BOOLEAN DEFAULT FALSE,
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (
    effective_date IS NULL OR 
    expiration_date IS NULL OR 
    effective_date <= expiration_date
  ),
  CONSTRAINT valid_version CHECK (version > 0)
);

-- ============================================================================
-- TABLE 2: KNOWLEDGE_BASE_CHUNKS
-- Document chunks with embeddings for RAG retrieval
-- ============================================================================

CREATE TABLE knowledge_base_chunks (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES knowledge_base_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,  -- Order within document
  
  -- Chunk content
  content TEXT NOT NULL,
  content_tsvector TSVECTOR,  -- For hybrid search
  token_count INTEGER,  -- Number of tokens
  
  -- Vector embedding (384 dimensions for multilingual-e5-small)
  embedding vector(384),
  
  -- Chunk metadata
  chunk_type TEXT DEFAULT 'paragraph',  -- paragraph, heading, list, table
  heading_context TEXT,  -- Parent heading/section
  page_number INTEGER,  -- For PDF documents
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_chunk_index CHECK (chunk_index >= 0),
  CONSTRAINT non_empty_content CHECK (LENGTH(content) > 0),
  UNIQUE(document_id, chunk_index)
);

-- ============================================================================
-- TABLE 3: KNOWLEDGE_BASE_CATEGORIES
-- Category metadata and hierarchy
-- ============================================================================

CREATE TABLE knowledge_base_categories_meta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_name TEXT UNIQUE NOT NULL,
  category_key knowledge_category NOT NULL,
  description TEXT,
  parent_category UUID REFERENCES knowledge_base_categories_meta(id) ON DELETE SET NULL,
  icon_name TEXT,  -- For UI display
  display_order INTEGER DEFAULT 0,
  document_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 4: KNOWLEDGE_BASE_SEARCH_LOG
-- Track searches for analytics and knowledge gap identification
-- ============================================================================

CREATE TABLE knowledge_base_search_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_query TEXT NOT NULL,
  search_language TEXT,
  search_method TEXT,  -- vector, fulltext, hybrid, keyword
  results_count INTEGER,
  top_document_id UUID REFERENCES knowledge_base_documents(id) ON DELETE SET NULL,
  top_chunk_id UUID REFERENCES knowledge_base_chunks(id) ON DELETE SET NULL,
  confidence_score REAL,  -- Similarity score of top result
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 5: KNOWLEDGE_BASE_FEEDBACK
-- User feedback on answer quality
-- ============================================================================

CREATE TABLE knowledge_base_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_log_id UUID REFERENCES knowledge_base_search_log(id) ON DELETE CASCADE,
  document_id UUID REFERENCES knowledge_base_documents(id) ON DELETE SET NULL,
  chunk_id UUID REFERENCES knowledge_base_chunks(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL,  -- helpful, not_helpful, incorrect, report
  feedback_comment TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 6: KNOWLEDGE_BASE_AUDIT_LOG
-- Complete audit trail of all knowledge base changes
-- ============================================================================

CREATE TABLE knowledge_base_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES knowledge_base_documents(id) ON DELETE SET NULL,
  action TEXT NOT NULL,  -- created, updated, approved, published, archived, deleted
  action_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  ip_address INET,
  user_agent TEXT
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Documents table indexes
CREATE INDEX idx_kb_docs_reference ON knowledge_base_documents(reference_number);
CREATE INDEX idx_kb_docs_category ON knowledge_base_documents(category);
CREATE INDEX idx_kb_docs_status ON knowledge_base_documents(status);
CREATE INDEX idx_kb_docs_effective_date ON knowledge_base_documents(effective_date DESC);
CREATE INDEX idx_kb_docs_published_at ON knowledge_base_documents(published_at DESC);
CREATE INDEX idx_kb_docs_responsible_office ON knowledge_base_documents(responsible_office);
CREATE INDEX idx_kb_docs_file_hash ON knowledge_base_documents(file_hash);
CREATE INDEX idx_kb_docs_tags ON knowledge_base_documents USING GIN(tags);
CREATE INDEX idx_kb_docs_keywords ON knowledge_base_documents USING GIN(keywords);

-- Full-text search index
CREATE INDEX idx_kb_docs_fulltext ON knowledge_base_documents USING GIN(full_text_tsvector);

-- Chunks table indexes
CREATE INDEX idx_kb_chunks_document ON knowledge_base_chunks(document_id);
CREATE INDEX idx_kb_chunks_fulltext ON knowledge_base_chunks USING GIN(content_tsvector);

-- Vector similarity search index (IMPORTANT for performance)
CREATE INDEX idx_kb_chunks_embedding ON knowledge_base_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);  -- Adjust lists based on corpus size

-- Search log indexes
CREATE INDEX idx_kb_search_query ON knowledge_base_search_log(search_query);
CREATE INDEX idx_kb_search_timestamp ON knowledge_base_search_log(searched_at DESC);
CREATE INDEX idx_kb_search_doc ON knowledge_base_search_log(top_document_id);

-- Feedback indexes
CREATE INDEX idx_kb_feedback_doc ON knowledge_base_feedback(document_id);
CREATE INDEX idx_kb_feedback_type ON knowledge_base_feedback(feedback_type);
CREATE INDEX idx_kb_feedback_created ON knowledge_base_feedback(created_at DESC);

-- Audit log indexes
CREATE INDEX idx_kb_audit_doc ON knowledge_base_audit_log(document_id);
CREATE INDEX idx_kb_audit_action ON knowledge_base_audit_log(action);
CREATE INDEX idx_kb_audit_timestamp ON knowledge_base_audit_log(action_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function 1: Generate reference numbers for documents
CREATE OR REPLACE FUNCTION generate_kb_reference_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  ref_number TEXT;
BEGIN
  -- Get next sequential number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reference_number FROM '\d+$') AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM knowledge_base_documents
  WHERE reference_number LIKE 'KB-' || TO_CHAR(NOW(), 'YYYY') || '-%';
  
  -- Format: KB-2026-00001
  ref_number := 'KB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_num::TEXT, 5, '0');
  
  RETURN ref_number;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Auto-update tsvector for full-text search
CREATE OR REPLACE FUNCTION kb_update_fulltext()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'knowledge_base_documents' THEN
    NEW.full_text_tsvector := to_tsvector('english', 
      COALESCE(NEW.title, '') || ' ' || 
      COALESCE(NEW.description, '') || ' ' ||
      COALESCE(NEW.full_text, '')
    );
  ELSIF TG_TABLE_NAME = 'knowledge_base_chunks' THEN
    NEW.content_tsvector := to_tsvector('english', COALESCE(NEW.content, ''));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION kb_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function 4: Create audit log entry
CREATE OR REPLACE FUNCTION kb_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO knowledge_base_audit_log (document_id, action, action_by, new_values)
    VALUES (NEW.id, 'created', NEW.created_by, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO knowledge_base_audit_log (document_id, action, action_by, old_values, new_values)
    VALUES (NEW.id, 'updated', NEW.updated_by, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO knowledge_base_audit_log (document_id, action, old_values)
    VALUES (OLD.id, 'deleted', to_jsonb(OLD));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-generate reference number
CREATE TRIGGER set_kb_reference_number
  BEFORE INSERT ON knowledge_base_documents
  FOR EACH ROW
  WHEN (NEW.reference_number IS NULL OR NEW.reference_number = '')
  EXECUTE FUNCTION set_health_reference_number();  -- Reuse from health services

-- Trigger: Auto-update full-text search vectors
CREATE TRIGGER update_kb_docs_fulltext
  BEFORE INSERT OR UPDATE ON knowledge_base_documents
  FOR EACH ROW
  EXECUTE FUNCTION kb_update_fulltext();

CREATE TRIGGER update_kb_chunks_fulltext
  BEFORE INSERT OR UPDATE ON knowledge_base_chunks
  FOR EACH ROW
  EXECUTE FUNCTION kb_update_fulltext();

-- Trigger: Auto-update timestamps
CREATE TRIGGER update_kb_docs_timestamp
  BEFORE UPDATE ON knowledge_base_documents
  FOR EACH ROW
  EXECUTE FUNCTION kb_update_timestamp();

CREATE TRIGGER update_kb_chunks_timestamp
  BEFORE UPDATE ON knowledge_base_chunks
  FOR EACH ROW
  EXECUTE FUNCTION kb_update_timestamp();

-- Trigger: Audit trail
CREATE TRIGGER kb_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON knowledge_base_documents
  FOR EACH ROW
  EXECUTE FUNCTION kb_audit_changes();

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE knowledge_base_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_search_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can read published documents and their chunks
CREATE POLICY "Public can view published documents"
  ON knowledge_base_documents
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND (expiration_date IS NULL OR expiration_date > CURRENT_DATE));

CREATE POLICY "Public can view published chunks"
  ON knowledge_base_chunks
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_base_documents
      WHERE id = knowledge_base_chunks.document_id
      AND status = 'published'
      AND (expiration_date IS NULL OR expiration_date > CURRENT_DATE)
    )
  );

-- Policy 2: Admins can manage all documents
CREATE POLICY "Admins can manage documents"
  ON knowledge_base_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Admins can manage chunks"
  ON knowledge_base_chunks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Policy 3: Anyone can submit feedback
CREATE POLICY "Anyone can submit feedback"
  ON knowledge_base_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 4: Only admins can view feedback
CREATE POLICY "Admins can view feedback"
  ON knowledge_base_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Policy 5: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON knowledge_base_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- STORAGE BUCKET FOR DOCUMENTS
-- ============================================================================

-- Create storage bucket for knowledge base documents
-- Note: Run this via Supabase dashboard or storage API
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-base-documents', 'knowledge-base-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Admins can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'knowledge-base-documents' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Admins can view documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'knowledge-base-documents' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Admins can delete documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'knowledge-base-documents' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS FOR HYBRID SEARCH
-- ============================================================================

-- Function: Hybrid search (vector + full-text + metadata)
CREATE OR REPLACE FUNCTION kb_hybrid_search(
  query_text TEXT,
  query_embedding vector(384),
  match_threshold REAL DEFAULT 0.7,
  match_count INTEGER DEFAULT 10,
  filter_category knowledge_category DEFAULT NULL
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  document_title TEXT,
  chunk_content TEXT,
  similarity_score REAL,
  fulltext_rank REAL,
  combined_score REAL,
  category knowledge_category,
  responsible_office TEXT,
  published_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH vector_results AS (
    SELECT
      c.id AS chunk_id,
      c.document_id,
      c.content AS chunk_content,
      1 - (c.embedding <=> query_embedding) AS similarity
    FROM knowledge_base_chunks c
    WHERE c.embedding <=> query_embedding < (1 - match_threshold)
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  fulltext_results AS (
    SELECT
      c.id AS chunk_id,
      c.document_id,
      ts_rank(c.content_tsvector, plainto_tsquery('english', query_text)) AS rank
    FROM knowledge_base_chunks c
    WHERE c.content_tsvector @@ plainto_tsquery('english', query_text)
  )
  SELECT
    vr.chunk_id,
    vr.document_id,
    d.title AS document_title,
    vr.chunk_content,
    vr.similarity AS similarity_score,
    COALESCE(fr.rank, 0) AS fulltext_rank,
    (vr.similarity * 0.7 + COALESCE(fr.rank, 0) * 0.3) AS combined_score,
    d.category,
    d.responsible_office,
    d.published_at
  FROM vector_results vr
  JOIN knowledge_base_documents d ON d.id = vr.document_id
  LEFT JOIN fulltext_results fr ON fr.chunk_id = vr.chunk_id
  WHERE d.status = 'published'
    AND (d.expiration_date IS NULL OR d.expiration_date > CURRENT_DATE)
    AND (filter_category IS NULL OR d.category = filter_category)
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert category metadata
INSERT INTO knowledge_base_categories_meta (category_name, category_key, description, display_order) VALUES
  ('Government Services', 'government_services', 'General government services and procedures', 1),
  ('Business Permits', 'business_permits', 'Business permits and licensing information', 2),
  ('Civil Registry', 'civil_registry', 'Birth certificates, marriage certificates, death certificates', 3),
  ('Health Programs', 'health_programs', 'Health services and programs', 4),
  ('Barangay Services', 'barangay_services', 'Barangay-level services and information', 5),
  ('Tourism', 'tourism', 'Tourist destinations and attractions', 6),
  ('Ordinances', 'ordinances', 'Local ordinances and regulations', 7),
  ('Resolutions', 'resolutions', 'City council resolutions', 8),
  ('Announcements', 'announcements', 'Official government announcements', 9),
  ('Emergency Procedures', 'emergency_procedures', 'Emergency response and disaster procedures', 10),
  ('Contact Information', 'contact_information', 'Government office contact details', 11),
  ('Frequently Asked Questions', 'faq', 'Common questions and answers', 12)
ON CONFLICT (category_name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE knowledge_base_documents IS 'Master table for all knowledge base documents';
COMMENT ON TABLE knowledge_base_chunks IS 'Document chunks with vector embeddings for RAG retrieval';
COMMENT ON TABLE knowledge_base_search_log IS 'Search analytics and knowledge gap identification';
COMMENT ON TABLE knowledge_base_feedback IS 'User feedback on answer quality';
COMMENT ON TABLE knowledge_base_audit_log IS 'Complete audit trail of all changes';

COMMENT ON COLUMN knowledge_base_documents.reference_number IS 'Unique reference: KB-2026-00001';
COMMENT ON COLUMN knowledge_base_documents.superseded_by IS 'Link to newer version that replaces this document';
COMMENT ON COLUMN knowledge_base_chunks.embedding IS 'Vector embedding (384 dimensions for multilingual-e5-small)';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Bago Buddy 2.0 Knowledge Base schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Created Tables:';
  RAISE NOTICE '   - knowledge_base_documents';
  RAISE NOTICE '   - knowledge_base_chunks';
  RAISE NOTICE '   - knowledge_base_categories_meta';
  RAISE NOTICE '   - knowledge_base_search_log';
  RAISE NOTICE '   - knowledge_base_feedback';
  RAISE NOTICE '   - knowledge_base_audit_log';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Row-Level Security enabled';
  RAISE NOTICE '🗂️ Storage bucket: knowledge-base-documents';
  RAISE NOTICE '🔍 Indexes created for optimal search performance';
  RAISE NOTICE '⚙️ Triggers configured for automation';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready for Phase 2 implementation!';
END $$;
