# EMBEDDING MODEL BENCHMARK PLAN
**Phase 2 - Task 1: Evaluate Multilingual Embedding Models**

---

## MODELS TO EVALUATE

### Model 1: horizon-labs/multilingual-embedding-small
- **Dimensions:** 384
- **Languages:** 100+ including English, Filipino
- **Size:** ~120MB
- **Provider:** Hugging Face
- **License:** Apache 2.0

### Model 2: intfloat/multilingual-e5-small
- **Dimensions:** 384
- **Languages:** 100+ including English, Filipino
- **Size:** ~118MB
- **Provider:** Hugging Face
- **License:** MIT

---

## BENCHMARK TEST DATASET

### Test Questions (English, Filipino, Hiligaynon)

**Category: Business Permits**
1. English: "What are the requirements for a business permit in Bago City?"
2. Filipino: "Ano ang mga requirements para sa business permit sa Bago City?"
3. Hiligaynon: "Ano ang mga kinahanglan para sa business permit sa Bago City?"

**Category: Health Programs**
4. English: "How do I apply for Heart Warriors program?"
5. Filipino: "Paano ako mag-apply sa Heart Warriors program?"
6. Hiligaynon: "Paano ako maka-apply sa Heart Warriors program?"

**Category: Barangay Services**
7. English: "Where is Barangay Dulao located?"
8. Filipino: "Nasaan ang Barangay Dulao?"
9. Hiligaynon: "Diin ang Barangay Dulao?"

**Category: Civil Registry**
10. English: "How to get a birth certificate?"
11. Filipino: "Paano kumuha ng birth certificate?"
12. Hiligaynon: "Paano makuha ang birth certificate?"

**Category: Contact Information**
13. English: "What is the phone number of Bago City Hall?"
14. Filipino: "Ano ang numero ng telepono ng Bago City Hall?"
15. Hiligaynon: "Ano ang numero sang telepono sang Bago City Hall?"

**Category: Exact Search (Must work with keyword matching)**
16. English: "Ordinance 2025-01"
17. Filipino: "Ordinansa 2025-01"
18. Hiligaynon: "Ordinansa 2025-01"

---

## TEST CORPUS (Sample Documents)

### Document 1: Business Permit Guide
```
BUSINESS PERMIT REQUIREMENTS - BAGO CITY

Requirements for New Business:
1. Barangay Clearance
2. DTI Business Name Registration
3. Cedula (Community Tax Certificate)
4. Location Map
5. Contract of Lease (if applicable)

Requirements for Renewal:
1. Previous Business Permit
2. Updated Barangay Clearance
3. Cedula
4. Official Receipts

Office: Business Permits and Licensing Office
Location: Bago City Hall, General Luna St.
Contact: (034) 446-1319
Hours: Monday-Friday, 8:00 AM - 5:00 PM
```

### Document 2: Heart Warriors Program
```
HEART WARRIORS PROGRAM

Free cardiac screening for Bago City residents.

Services Provided:
- Blood pressure monitoring
- ECG screening
- Cardiac consultation
- Free medicines (when available)

How to Apply:
1. Open Asenso Bago app
2. Go to Health Services > Heart Warriors
3. Fill out request form
4. Wait for confirmation

Requirements:
- Valid ID
- Bago City residency proof

Contact: City Health Office
Phone: (034) 446-1319
```

### Document 3: Barangay Dulao Profile
```
BARANGAY DULAO

Location: Southern district of Bago City
Area: 2.5 square kilometers
Population: Approximately 3,500 residents

Barangay Hall Address:
Purok 1, Barangay Dulao
Bago City, Negros Occidental

Barangay Captain: [Name]
Contact Number: [Number]

Services:
- Barangay Clearance
- Indigency Certificates
- Business Permits
- Blotter Records
```

### Document 4: Birth Certificate Guide
```
BIRTH CERTIFICATE - CIVIL REGISTRY

How to Obtain:
1. Visit Civil Registry Office, Bago City Hall
2. Fill out request form
3. Present valid ID
4. Pay processing fee

Requirements:
- Valid government-issued ID
- Request form (available at office)
- Payment

Processing Time: 1-3 business days
Fee: [Amount per copy]

For PSA-authenticated copy:
- Apply at PSA Bacolod or online at serbilis.psa.gov.ph

Office Hours: Monday-Friday, 8:00 AM - 5:00 PM
```

### Document 5: Contact Directory
```
BAGO CITY GOVERNMENT CONTACT INFORMATION

City Hall Main Office
Address: General Luna St., Bago City, Negros Occidental
Phone: (034) 446-1319
Hours: Monday-Friday, 8:00 AM - 5:00 PM

Disaster Risk Reduction Management Office (DRRMO)
Hotline: (034) 473-0043 (24/7)

Mayor's Office
Phone: (034) 446-1319 local 101

City Health Office
Phone: (034) 446-1319 local 201

Facebook: The Citybridge (Official Page)
```

---

## BENCHMARK METRICS

### 1. Retrieval Accuracy
For each test question, evaluate:
- **Top-1 Accuracy:** Is the most relevant document ranked #1?
- **Top-3 Accuracy:** Is the relevant document in top 3 results?
- **Mean Reciprocal Rank (MRR):** Average ranking position of relevant doc

### 2. Multilingual Performance
- Do equivalent questions in English/Filipino/Hiligaynon return the same document?
- Does semantic similarity work across languages?
- Are there language-specific biases?

### 3. Speed
- Average embedding generation time per query
- Average vector search time per query
- Total query time (embedding + search)

### 4. Exact Keyword Matching
- Test with ordinance numbers, office names, specific dates
- Verify that hybrid search catches exact matches even if semantic similarity is low

### 5. Cost (if using API)
- API calls per query
- Estimated monthly cost for 1000 queries/day
- Self-hosting feasibility

---

## BENCHMARK IMPLEMENTATION

### Step 1: Set Up Test Environment
```bash
# Install required packages
pip install sentence-transformers
pip install psycopg2-binary
pip install python-dotenv
```

### Step 2: Generate Embeddings
```python
from sentence_transformers import SentenceTransformer

# Test Model 1
model1 = SentenceTransformer('horizon-labs/multilingual-embedding-small')
embeddings1 = model1.encode(test_questions)

# Test Model 2  
model2 = SentenceTransformer('intfloat/multilingual-e5-small')
embeddings2 = model2.encode(test_questions)
```

### Step 3: Vector Search
```python
import psycopg2
import numpy as np

# Store test corpus embeddings in database
# Perform similarity search for each test question
# Calculate metrics
```

### Step 4: Compare Results
- Create comparison table with all metrics
- Visualize retrieval accuracy by language
- Measure speed differences
- Document cost implications

---

## DECISION CRITERIA

**Select the model that:**
1. ✅ Has highest Top-1 accuracy across all languages
2. ✅ Shows consistent performance for Filipino and Hiligaynon
3. ✅ Acceptable speed (<500ms for embedding + search)
4. ✅ Lowest cost (prefer self-hostable)
5. ✅ Works well with hybrid search for exact matches

**Backup Plan:**
- If both models perform similarly, choose `multilingual-e5-small` (MIT license, widely adopted)
- If performance is insufficient, evaluate larger models (e.g., multilingual-e5-base, 768 dimensions)
- If self-hosting is too slow, evaluate hosted inference options

---

## DELIVERABLES

After benchmark completion, provide:
1. ✅ Benchmark results table
2. ✅ Accuracy comparison by language
3. ✅ Speed metrics
4. ✅ Cost analysis
5. ✅ Recommended model with justification
6. ✅ Implementation code for chosen model

---

## TIMELINE

**Estimated Duration:** 2-3 days

**Tasks:**
- Day 1: Set up environment, generate embeddings, store in test database
- Day 2: Run benchmark queries, calculate metrics
- Day 3: Analyze results, create recommendation report

---

## NEXT STEPS AFTER BENCHMARK

Once model is selected:
1. Implement embedding generation API endpoint
2. Design chunking strategy
3. Create document ingestion pipeline
4. Integrate with knowledge base database

---

**STATUS:** Ready to proceed with benchmark implementation
**AWAITING:** pgvector verification results from Supabase
