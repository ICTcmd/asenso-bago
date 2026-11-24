-- ============================================================================
-- PGVECTOR VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to verify vector extension availability
-- ============================================================================

-- Step 1: Check if pgvector extension is available
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- Step 2: Try to enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 3: Verify extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Step 4: Test vector functionality
-- Create a test table with vector column (smaller dimension for testing)
CREATE TABLE IF NOT EXISTS test_vectors (
  id SERIAL PRIMARY KEY,
  embedding vector(3),  -- Small dimension for quick test
  content TEXT
);

-- Insert test data
INSERT INTO test_vectors (embedding, content) VALUES
  ('[0.1, 0.2, 0.3]'::vector, 'Test document 1'),
  ('[0.4, 0.5, 0.6]'::vector, 'Test document 2');

-- Test similarity search
SELECT 
  content,
  embedding <-> '[0.1, 0.2, 0.3]'::vector AS distance
FROM test_vectors
ORDER BY distance
LIMIT 5;

-- Clean up test table
DROP TABLE IF EXISTS test_vectors;

-- ============================================================================
-- EXPECTED RESULTS:
-- 1. pg_available_extensions should show 'vector' with version info
-- 2. CREATE EXTENSION should succeed (or show it already exists)
-- 3. pg_extension should list 'vector' as installed
-- 4. Test similarity search should return results ordered by distance
-- 
-- If all succeed: ✅ pgvector is available and functional
-- If any fail: ❌ Report the error for alternative solutions
-- ============================================================================

-- Get vector extension version and details
SELECT 
  extname AS extension_name,
  extversion AS version,
  extrelocatable AS relocatable
FROM pg_extension 
WHERE extname = 'vector';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ pgvector verification complete!';
  RAISE NOTICE 'If no errors appeared above, pgvector is ready to use.';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '1. Report results to development team';
  RAISE NOTICE '2. Proceed with Phase 2 database schema design';
END $$;
