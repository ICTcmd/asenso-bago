# HOW TO FIX THE SQL ERRORS

**Problem:** You tried to run `phase2-database-schema.sql` but got errors because pgvector isn't enabled yet.

**Solution:** Run scripts in the correct order (2 steps)

---

## ✅ STEP 1: Enable pgvector Extension (1 minute)

### Copy and run this in Supabase SQL Editor:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify it worked
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Expected Result:
You should see a row with:
- `extname`: vector
- `extversion`: (some version number like 0.5.0 or 0.6.0)

### If This Fails:
Your Supabase plan may not support pgvector. Solutions:
1. Upgrade to Supabase Pro (~$25/month)
2. Use alternative vector database (Pinecone free tier)
3. Contact Supabase support

---

## ✅ STEP 2: Run the Full Schema (5 minutes)

After pgvector is enabled, NOW run the full schema:

1. Open: `phase2-database-schema.sql`
2. Copy ALL contents
3. Paste in Supabase SQL Editor
4. Click "Run"

### Expected Result:
```
✅ Created Tables:
   - knowledge_base_documents
   - knowledge_base_chunks
   - knowledge_base_categories_meta
   - knowledge_base_search_log
   - knowledge_base_feedback
   - knowledge_base_audit_log

✅ Row-Level Security enabled
✅ Storage bucket: knowledge-base-documents
✅ Indexes created for optimal search performance
✅ Triggers configured for automation

🚀 Ready for Phase 2 implementation!
```

---

## 🔍 TROUBLESHOOTING

### Error: "permission denied to create extension"
**Solution:** You need Supabase admin access. Check that you're logged in as the project owner.

### Error: "vector extension not available"
**Solution:** Your Supabase plan doesn't include pgvector. You need to:
- Upgrade to Pro plan, OR
- Use alternative solution (we have a backup plan)

### Error: "relation already exists"
**Solution:** Some tables were partially created. Clean up first:
```sql
DROP TABLE IF EXISTS knowledge_base_chunks CASCADE;
DROP TABLE IF EXISTS knowledge_base_documents CASCADE;
DROP TABLE IF EXISTS knowledge_base_categories_meta CASCADE;
DROP TABLE IF EXISTS knowledge_base_search_log CASCADE;
DROP TABLE IF EXISTS knowledge_base_feedback CASCADE;
DROP TABLE IF EXISTS knowledge_base_audit_log CASCADE;
```
Then run the schema again.

---

## 📋 VERIFICATION CHECKLIST

After running both scripts, verify everything worked:

```sql
-- Check pgvector is enabled
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- Check all 6 tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'knowledge_base%'
ORDER BY table_name;

-- Should return:
-- knowledge_base_audit_log
-- knowledge_base_categories_meta
-- knowledge_base_chunks
-- knowledge_base_documents
-- knowledge_base_feedback
-- knowledge_base_search_log

-- Check vector index exists
SELECT indexname FROM pg_indexes 
WHERE tablename = 'knowledge_base_chunks' 
AND indexname = 'idx_kb_chunks_embedding';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'knowledge_base%';
-- All should show: rowsecurity = t (true)
```

If all queries return expected results: **✅ SUCCESS!**

---

## 🎯 SUMMARY

**Wrong Order (causes errors):**
1. ❌ Run `phase2-database-schema.sql` → ERROR: vector type doesn't exist

**Correct Order:**
1. ✅ Enable pgvector extension (Step 1 above)
2. ✅ Run `phase2-database-schema.sql` (Step 2 above)
3. ✅ Run verification queries (Verification Checklist above)

---

## 📞 NEED HELP?

If you still get errors:
1. **Screenshot the exact error message**
2. **Note which step failed**
3. **Share with development team**

We can provide alternative solutions if pgvector isn't available on your Supabase plan.

---

**Good luck! Follow the 2 steps above and it should work.** 🚀
