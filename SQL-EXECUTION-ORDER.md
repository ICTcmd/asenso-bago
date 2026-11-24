# 📋 CORRECT ORDER TO RUN SQL SCRIPTS

**You got errors because you skipped Step 1.** Here's the correct sequence:

---

## 🔴 STEP 1: Enable pgvector Extension (MUST DO FIRST!)

**File:** `01-enable-pgvector.sql` ⬅️ **START HERE**

**What it does:**
- Enables the pgvector extension in your database
- Tests that vector operations work
- Verifies 384-dimensional vectors can be stored

**How to run:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `01-enable-pgvector.sql`
3. Paste and click "Run"

**Expected output:**
```
✅ pgvector is ready!
✅ Vector operations working!
✅ pgvector ENABLED SUCCESSFULLY!
```

**Time:** 10 seconds

---

## 🟢 STEP 2: Deploy Knowledge Base Schema (After Step 1)

**File:** `phase2-database-schema.sql`

**What it does:**
- Creates 6 knowledge base tables
- Sets up vector indexes for fast search
- Configures Row-Level Security (RLS)
- Creates triggers and functions
- Sets up storage bucket

**How to run:**
1. After Step 1 succeeds
2. Open `phase2-database-schema.sql`
3. Copy ALL contents
4. Paste in Supabase SQL Editor
5. Click "Run"

**Expected output:**
```
✅ Created Tables:
   - knowledge_base_documents
   - knowledge_base_chunks
   - knowledge_base_categories_meta
   - knowledge_base_search_log
   - knowledge_base_feedback
   - knowledge_base_audit_log

✅ Row-Level Security enabled
✅ Indexes created for optimal search performance
✅ Ready for Phase 2 implementation!
```

**Time:** 30-60 seconds

---

## 🔵 STEP 3: Verify Everything (Recommended)

Run these verification queries in SQL Editor:

```sql
-- 1. Check pgvector is enabled
SELECT extname, extversion 
FROM pg_extension 
WHERE extname = 'vector';
-- Should return 1 row with version number

-- 2. Check all 6 tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'knowledge_base%'
ORDER BY table_name;
-- Should return 6 rows

-- 3. Check vector index exists
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'knowledge_base_chunks';
-- Should include 'idx_kb_chunks_embedding'

-- 4. Test insert a document (optional)
INSERT INTO knowledge_base_documents (
  reference_number,
  title,
  category,
  document_type,
  responsible_office,
  full_text,
  status
) VALUES (
  'KB-2026-TEST',
  'Test Document',
  'faq',
  'manual',
  'IT Office',
  'This is a test document to verify the schema works.',
  'draft'
);

-- If no errors, everything works! ✅
```

---

## 📊 VISUAL FLOW

```
┌─────────────────────────────────────┐
│  01-enable-pgvector.sql             │
│  (10 seconds)                       │
│                                     │
│  ✅ Enables vector extension        │
└──────────────┬──────────────────────┘
               │
               │ MUST COMPLETE FIRST
               │
               ▼
┌─────────────────────────────────────┐
│  phase2-database-schema.sql         │
│  (30-60 seconds)                    │
│                                     │
│  ✅ Creates 6 tables                │
│  ✅ Sets up indexes                 │
│  ✅ Configures RLS                  │
│  ✅ Creates functions               │
└──────────────┬──────────────────────┘
               │
               │ VERIFY SUCCESS
               │
               ▼
┌─────────────────────────────────────┐
│  Verification Queries               │
│  (10 seconds)                       │
│                                     │
│  ✅ 6 tables exist                  │
│  ✅ Indexes created                 │
│  ✅ RLS enabled                     │
└─────────────────────────────────────┘
               │
               │ SUCCESS!
               │
               ▼
       Ready for Phase 2! 🚀
```

---

## ❌ WHAT YOU DID WRONG

You tried this (wrong order):

```
❌ Run phase2-database-schema.sql
   → ERROR: type "vector" does not exist
   → ERROR: expected 384 dimensions, not 3
```

The schema needs pgvector to be enabled FIRST.

---

## ✅ CORRECT SEQUENCE

Do this instead:

```
1. ✅ Run 01-enable-pgvector.sql
   → pgvector extension enabled
   
2. ✅ Run phase2-database-schema.sql  
   → All tables, indexes, RLS created
   
3. ✅ Run verification queries
   → Confirm everything works
```

---

## 🚨 IF STEP 1 FAILS

If `01-enable-pgvector.sql` gives an error like:

**"extension vector is not available"**

This means your Supabase plan doesn't support pgvector. Solutions:

### Option A: Upgrade Supabase Plan
- Upgrade to Pro ($25/month)
- pgvector included in Pro plan

### Option B: Use Alternative Vector Database
- Switch to Pinecone (free tier: 100K vectors)
- We have a backup schema for this

### Option C: Contact Supabase Support
- Ask if pgvector can be enabled on Free tier
- Sometimes they enable it for specific projects

**Don't proceed to Step 2 until Step 1 succeeds!**

---

## 📁 FILE LOCATIONS

All files are in: `c:\Users\OJTBEEG\Desktop\LGU-Bago-App\bago-city-pwa\`

- ✅ `01-enable-pgvector.sql` ← Run this first
- ✅ `phase2-database-schema.sql` ← Run this second
- ✅ `verify-pgvector.sql` (old file, don't use)
- ✅ `FIX-SQL-ERRORS.md` (troubleshooting guide)
- ✅ `SQL-EXECUTION-ORDER.md` (this file)

---

## 🎯 QUICK START (TL;DR)

1. Open Supabase → SQL Editor
2. Run `01-enable-pgvector.sql` (copy/paste, click Run)
3. Wait for success message
4. Run `phase2-database-schema.sql` (copy/paste, click Run)
5. Wait for success message
6. Done! ✅

**That's it.** Follow this order and it will work.

---

## 📞 STILL STUCK?

If you still get errors:
1. Screenshot the error
2. Note which step failed (Step 1 or Step 2)
3. Share error with development team

We'll help you find an alternative solution.

---

**Remember:** Step 1 MUST succeed before Step 2. Don't skip steps! 🎯
