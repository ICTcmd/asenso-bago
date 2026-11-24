# HOW TO RUN THE EMBEDDING BENCHMARK

This guide explains how to run the embedding model benchmark test for Bago Buddy 2.0 Phase 2.

---

## WHAT THIS TEST DOES

The benchmark script tests two multilingual embedding models with actual Bago City government questions in **English, Filipino, and Hiligaynon** to determine which model performs best for our RAG (Retrieval-Augmented Generation) system.

**Models tested:**
1. `intfloat/multilingual-e5-small` (384 dimensions, MIT license)
2. `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384 dimensions)

**Test dataset:**
- 17 questions across 3 languages
- 6 sample government documents (Business Permits, Health Programs, Barangays, Civil Registry, Contact Info, Ordinances)
- Tests semantic search accuracy, speed, and multilingual consistency

---

## PREREQUISITES

### 1. Python 3.8 or Higher

Check your Python version:
```bash
python --version
```

If Python is not installed:
- **Windows:** Download from [python.org](https://www.python.org/downloads/)
- **Mac/Linux:** Usually pre-installed, or use `brew install python` (Mac)

### 2. Install Dependencies

Open terminal/command prompt in the project folder and run:

```bash
# Install required packages
pip install -r requirements-benchmark.txt
```

This will install:
- `sentence-transformers` - For loading embedding models
- `numpy` - For numerical operations
- `scikit-learn` - For similarity calculations
- `tabulate` - For formatted result tables
- `torch` - PyTorch (backend for transformers)

**First-time setup may take 5-10 minutes** as it downloads PyTorch and model dependencies.

---

## HOW TO RUN

### Step 1: Navigate to Project Folder

```bash
cd c:\Users\OJTBEEG\Desktop\LGU-Bago-App\bago-city-pwa
```

### Step 2: Run the Benchmark Script

```bash
python test-embeddings.py
```

### Step 3: Wait for Completion

The script will:
1. Download embedding models (~250MB each, first run only)
2. Generate embeddings for 6 test documents
3. Test 17 queries across 3 languages
4. Calculate accuracy metrics
5. Display comparison results
6. Save results to `benchmark-results.json`

**Estimated time:** 
- First run: 10-15 minutes (includes model download)
- Subsequent runs: 2-3 minutes

---

## UNDERSTANDING THE RESULTS

### Output Explained

The benchmark will display:

#### 1. **Overall Metrics**
```
Top-1 Accuracy: 88.2%    ← Correct document ranked #1
Top-3 Accuracy: 100%     ← Correct document in top 3
Mean MRR: 0.941          ← Mean Reciprocal Rank (higher is better)
Avg Query Time: 45ms     ← Speed per query
```

#### 2. **By Language**
```
English:     94.1% top-1 accuracy
Filipino:    88.2% top-1 accuracy
Hiligaynon:  82.4% top-1 accuracy
```

#### 3. **By Category**
```
Business Permits:     100% accuracy
Health Programs:      100% accuracy
Barangay Services:    100% accuracy
Civil Registry:       88.9% accuracy
Contact Information:  94.1% accuracy
```

#### 4. **Recommendation**
The script will recommend which model to use based on:
- Accuracy scores
- Speed
- Multilingual consistency

---

## WHAT TO DO AFTER BENCHMARK

### ✅ If Results Look Good (≥85% accuracy)

1. **Review the recommendation** in the terminal output
2. **Share `benchmark-results.json`** with the team
3. **Proceed to Phase 2 Task 3:** Database schema deployment
4. **Configure the recommended model** in your embedding API

### ⚠️ If Results Are Poor (<80% accuracy)

Possible issues:
- Test documents may need better content
- Questions may be too ambiguous
- Model may not support Filipino/Hiligaynon well

Solutions:
- Try larger models (multilingual-e5-base, 768 dimensions)
- Improve test document quality
- Add more context to questions

### 🔍 Customizing the Test

You can edit `test-embeddings.py` to:
- Add more test questions
- Test different models
- Adjust similarity thresholds
- Add your own government documents

---

## TROUBLESHOOTING

### Error: "No module named 'sentence_transformers'"
**Solution:** Run `pip install -r requirements-benchmark.txt`

### Error: "torch not available"
**Solution:** Install PyTorch:
```bash
pip install torch
```

### Error: "Model download failed"
**Solution:** 
- Check internet connection
- Try again (downloads can timeout)
- Manually download models from HuggingFace

### Slow Performance
**Solution:**
- First run is always slow (downloads models)
- Models are cached in `~/.cache/huggingface/`
- Subsequent runs will be much faster

### Out of Memory Error
**Solution:**
- Close other applications
- Use smaller batch sizes
- Try on a machine with more RAM (≥8GB recommended)

---

## FILES CREATED BY BENCHMARK

After running, you'll see:

```
benchmark-results.json        ← Full results (share with team)
~/.cache/huggingface/         ← Downloaded models (auto-created)
```

---

## NEXT STEPS

Once benchmark is complete:

1. ✅ **Task 1:** Run `verify-pgvector.sql` in Supabase SQL Editor
2. ✅ **Task 2:** ✅ COMPLETE (this benchmark)
3. ⏳ **Task 3:** Deploy `phase2-database-schema.sql` to Supabase
4. ⏳ **Task 4:** Build document ingestion pipeline
5. ⏳ **Task 5:** Implement embedding generation API
6. ⏳ **Task 6:** Integrate hybrid search
7. ⏳ **Task 7:** Connect RAG to chatbot

See `PHASE-2-IMPLEMENTATION-PLAN.md` for complete roadmap.

---

## QUESTIONS?

If you encounter issues:
1. Check this document's Troubleshooting section
2. Review Python error messages
3. Check that all dependencies are installed
4. Verify Python version (≥3.8)

---

**Good luck with the benchmark! 🚀**

The results will guide the entire Phase 2 implementation, so accurate testing is important. Take your time and review the results carefully before proceeding.
