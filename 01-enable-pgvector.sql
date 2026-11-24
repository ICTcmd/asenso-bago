-- ============================================================================
-- STEP 1: ENABLE PGVECTOR EXTENSION
-- Run this FIRST before running phase2-database-schema.sql
-- ============================================================================

-- Enable the vector extension (required for RAG embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify the extension is installed
SELECT 
  extname AS extension_name,
  extversion AS version,
  CASE 
    WHEN extname = 'vector' THEN '✅ pgvector is ready!'
    ELSE '❌ Extension not found'
  END AS status
FROM pg_extension 
WHERE extname = 'vector';

-- Quick test: create a temporary test table
CREATE TEMP TABLE test_embeddings (
  id SERIAL PRIMARY KEY,
  embedding vector(384),
  note TEXT
);

-- Insert a test vector
INSERT INTO test_embeddings (embedding, note) 
VALUES (
  array_fill(0.0, ARRAY[384])::vector,
  'Test embedding with 384 dimensions'
);

-- Verify it worked
SELECT 
  id, 
  note,
  vector_dims(embedding) AS dimensions,
  '✅ Vector operations working!' AS status
FROM test_embeddings;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                                                           ║';
  RAISE NOTICE '║            ✅ pgvector ENABLED SUCCESSFULLY!              ║';
  RAISE NOTICE '║                                                           ║';
  RAISE NOTICE '║   You can now run: phase2-database-schema.sql             ║';
  RAISE NOTICE '║                                                           ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;
