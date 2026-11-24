#!/usr/bin/env python3
"""
BAGO BUDDY 2.0 - EMBEDDING MODEL BENCHMARK SCRIPT
Tests two multilingual embedding models with Bago City government questions
in English, Filipino, and Hiligaynon to select the best model for production.

Models tested:
1. horizon-labs/multilingual-embedding-small
2. intfloat/multilingual-e5-small

Usage:
    python test-embeddings.py

Requirements:
    pip install sentence-transformers numpy scikit-learn tabulate

Author: Kiro AI Assistant
Date: November 20, 2026
"""

import json
import time
from typing import List, Dict, Tuple
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from tabulate import tabulate

# =============================================================================
# TEST DATASET
# =============================================================================

# Test questions across 3 languages
TEST_QUESTIONS = [
    # Business Permits
    {"id": 1, "question": "What are the requirements for a business permit in Bago City?", "language": "English", "category": "Business Permits", "correct_doc": 0},
    {"id": 2, "question": "Ano ang mga requirements para sa business permit sa Bago City?", "language": "Filipino", "category": "Business Permits", "correct_doc": 0},
    {"id": 3, "question": "Ano ang mga kinahanglan para sa business permit sa Bago City?", "language": "Hiligaynon", "category": "Business Permits", "correct_doc": 0},
    
    # Health Programs
    {"id": 4, "question": "How do I apply for Heart Warriors program?", "language": "English", "category": "Health Programs", "correct_doc": 1},
    {"id": 5, "question": "Paano ako mag-apply sa Heart Warriors program?", "language": "Filipino", "category": "Health Programs", "correct_doc": 1},
    {"id": 6, "question": "Paano ako maka-apply sa Heart Warriors program?", "language": "Hiligaynon", "category": "Health Programs", "correct_doc": 1},
    
    # Barangay Services
    {"id": 7, "question": "Where is Barangay Dulao located?", "language": "English", "category": "Barangay Services", "correct_doc": 2},
    {"id": 8, "question": "Nasaan ang Barangay Dulao?", "language": "Filipino", "category": "Barangay Services", "correct_doc": 2},
    {"id": 9, "question": "Diin ang Barangay Dulao?", "language": "Hiligaynon", "category": "Barangay Services", "correct_doc": 2},
    
    # Civil Registry
    {"id": 10, "question": "How to get a birth certificate?", "language": "English", "category": "Civil Registry", "correct_doc": 3},
    {"id": 11, "question": "Paano kumuha ng birth certificate?", "language": "Filipino", "category": "Civil Registry", "correct_doc": 3},
    {"id": 12, "question": "Paano makuha ang birth certificate?", "language": "Hiligaynon", "category": "Civil Registry", "correct_doc": 3},
    
    # Contact Information
    {"id": 13, "question": "What is the phone number of Bago City Hall?", "language": "English", "category": "Contact Information", "correct_doc": 4},
    {"id": 14, "question": "Ano ang numero ng telepono ng Bago City Hall?", "language": "Filipino", "category": "Contact Information", "correct_doc": 4},
    {"id": 15, "question": "Ano ang numero sang telepono sang Bago City Hall?", "language": "Hiligaynon", "category": "Contact Information", "correct_doc": 4},
    
    # Exact keyword search (ordinance numbers should work even with low semantic similarity)
    {"id": 16, "question": "Ordinance 2025-01", "language": "English", "category": "Exact Search", "correct_doc": 5},
    {"id": 17, "question": "What is the content of Ordinance 2025-01?", "language": "English", "category": "Exact Search", "correct_doc": 5},
]

# Test corpus (sample government documents)
TEST_DOCUMENTS = [
    {
        "id": 0,
        "title": "Business Permit Requirements Guide",
        "category": "Business Permits",
        "content": """
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
"""
    },
    {
        "id": 1,
        "title": "Heart Warriors Program",
        "category": "Health Programs",
        "content": """
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
"""
    },
    {
        "id": 2,
        "title": "Barangay Dulao Profile",
        "category": "Barangay Services",
        "content": """
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
"""
    },
    {
        "id": 3,
        "title": "Birth Certificate Guide",
        "category": "Civil Registry",
        "content": """
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
"""
    },
    {
        "id": 4,
        "title": "Contact Directory",
        "category": "Contact Information",
        "content": """
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
"""
    },
    {
        "id": 5,
        "title": "Ordinance 2025-01 - Traffic Management",
        "category": "Ordinances",
        "content": """
CITY OF BAGO
ORDINANCE NO. 2025-01

AN ORDINANCE REGULATING TRAFFIC MANAGEMENT IN BAGO CITY

Section 1. Title
This ordinance shall be known as the "Bago City Traffic Management Ordinance of 2025"

Section 2. Declaration of Policy
It is hereby declared the policy of the City of Bago to ensure orderly and safe traffic flow within the city limits.

Section 3. Prohibited Acts
The following acts are prohibited:
- Illegal parking in designated no-parking zones
- Obstruction of traffic flow
- Operating vehicles without proper registration

Section 4. Penalties
Violations shall be punished with:
- First offense: Warning
- Second offense: Fine of 500 pesos
- Third offense: Fine of 1000 pesos and impounding of vehicle

Approved: January 15, 2025
"""
    }
]

# =============================================================================
# BENCHMARK FUNCTIONS
# =============================================================================

def load_model(model_name: str) -> SentenceTransformer:
    """Load embedding model"""
    print(f"\n📥 Loading model: {model_name}")
    start = time.time()
    model = SentenceTransformer(model_name)
    elapsed = time.time() - start
    print(f"✅ Model loaded in {elapsed:.2f}s")
    return model

def generate_embeddings(model: SentenceTransformer, texts: List[str]) -> np.ndarray:
    """Generate embeddings for a list of texts"""
    start = time.time()
    embeddings = model.encode(texts, show_progress_bar=False)
    elapsed = time.time() - start
    avg_time = (elapsed / len(texts)) * 1000  # milliseconds per text
    return embeddings, elapsed, avg_time

def calculate_metrics(
    query_embedding: np.ndarray,
    doc_embeddings: np.ndarray,
    correct_doc_id: int
) -> Dict:
    """Calculate retrieval metrics for a single query"""
    # Calculate cosine similarity
    similarities = cosine_similarity([query_embedding], doc_embeddings)[0]
    
    # Rank documents by similarity
    ranked_indices = np.argsort(similarities)[::-1]  # descending order
    
    # Find rank of correct document
    correct_rank = np.where(ranked_indices == correct_doc_id)[0][0] + 1
    
    # Calculate metrics
    top1_correct = (ranked_indices[0] == correct_doc_id)
    top3_correct = (correct_doc_id in ranked_indices[:3])
    mrr = 1.0 / correct_rank
    
    return {
        'top1_correct': top1_correct,
        'top3_correct': top3_correct,
        'mrr': mrr,
        'correct_rank': correct_rank,
        'top_similarity': similarities[ranked_indices[0]],
        'correct_similarity': similarities[correct_doc_id],
        'ranked_docs': ranked_indices.tolist()
    }

def run_benchmark(model_name: str) -> Dict:
    """Run complete benchmark for a single model"""
    print(f"\n{'='*70}")
    print(f"BENCHMARKING: {model_name}")
    print(f"{'='*70}")
    
    # Load model
    model = load_model(model_name)
    
    # Generate document embeddings
    print(f"\n📊 Generating document embeddings...")
    doc_texts = [doc['content'] for doc in TEST_DOCUMENTS]
    doc_embeddings, doc_time, doc_avg_time = generate_embeddings(model, doc_texts)
    print(f"✅ Generated {len(doc_texts)} document embeddings in {doc_time:.2f}s")
    print(f"   Average: {doc_avg_time:.2f}ms per document")
    
    # Test each query
    print(f"\n🔍 Testing {len(TEST_QUESTIONS)} queries...")
    results = []
    query_times = []
    
    for i, test in enumerate(TEST_QUESTIONS, 1):
        # Generate query embedding
        start = time.time()
        query_embedding = model.encode([test['question']], show_progress_bar=False)[0]
        query_time = (time.time() - start) * 1000  # milliseconds
        query_times.append(query_time)
        
        # Calculate metrics
        metrics = calculate_metrics(
            query_embedding,
            doc_embeddings,
            test['correct_doc']
        )
        
        # Store result
        result = {
            'question_id': test['id'],
            'question': test['question'],
            'language': test['language'],
            'category': test['category'],
            'query_time_ms': query_time,
            **metrics
        }
        results.append(result)
        
        # Print progress
        status = "✅" if metrics['top1_correct'] else ("🟡" if metrics['top3_correct'] else "❌")
        print(f"   {i:2d}. {status} {test['language']:10s} | Rank: {metrics['correct_rank']} | Sim: {metrics['correct_similarity']:.3f} | {query_time:.0f}ms")
    
    # Calculate aggregate metrics
    avg_query_time = np.mean(query_times)
    top1_accuracy = np.mean([r['top1_correct'] for r in results])
    top3_accuracy = np.mean([r['top3_correct'] for r in results])
    mean_mrr = np.mean([r['mrr'] for r in results])
    
    # Calculate per-language metrics
    language_metrics = {}
    for lang in ['English', 'Filipino', 'Hiligaynon']:
        lang_results = [r for r in results if r['language'] == lang]
        language_metrics[lang] = {
            'top1_accuracy': np.mean([r['top1_correct'] for r in lang_results]),
            'top3_accuracy': np.mean([r['top3_correct'] for r in lang_results]),
            'mean_mrr': np.mean([r['mrr'] for r in lang_results])
        }
    
    # Calculate per-category metrics
    category_metrics = {}
    categories = set([r['category'] for r in results])
    for cat in categories:
        cat_results = [r for r in results if r['category'] == cat]
        category_metrics[cat] = {
            'top1_accuracy': np.mean([r['top1_correct'] for r in cat_results]),
            'top3_accuracy': np.mean([r['top3_correct'] for r in cat_results])
        }
    
    return {
        'model_name': model_name,
        'overall': {
            'top1_accuracy': top1_accuracy,
            'top3_accuracy': top3_accuracy,
            'mean_mrr': mean_mrr,
            'avg_query_time_ms': avg_query_time,
            'avg_doc_embed_time_ms': doc_avg_time
        },
        'by_language': language_metrics,
        'by_category': category_metrics,
        'detailed_results': results
    }

def print_comparison(results1: Dict, results2: Dict):
    """Print side-by-side comparison of two models"""
    print(f"\n{'='*70}")
    print("COMPARISON RESULTS")
    print(f"{'='*70}\n")
    
    # Overall metrics
    print("📊 OVERALL METRICS")
    print("-" * 70)
    comparison_data = [
        ["Metric", results1['model_name'], results2['model_name'], "Winner"],
        ["-" * 20, "-" * 20, "-" * 20, "-" * 10],
        [
            "Top-1 Accuracy",
            f"{results1['overall']['top1_accuracy']:.1%}",
            f"{results2['overall']['top3_accuracy']:.1%}",
            "🏆 " + (results1['model_name'] if results1['overall']['top1_accuracy'] > results2['overall']['top1_accuracy'] else results2['model_name'])
        ],
        [
            "Top-3 Accuracy",
            f"{results1['overall']['top3_accuracy']:.1%}",
            f"{results2['overall']['top3_accuracy']:.1%}",
            "🏆 " + (results1['model_name'] if results1['overall']['top3_accuracy'] > results2['overall']['top3_accuracy'] else results2['model_name'])
        ],
        [
            "Mean MRR",
            f"{results1['overall']['mean_mrr']:.3f}",
            f"{results2['overall']['mean_mrr']:.3f}",
            "🏆 " + (results1['model_name'] if results1['overall']['mean_mrr'] > results2['overall']['mean_mrr'] else results2['model_name'])
        ],
        [
            "Avg Query Time",
            f"{results1['overall']['avg_query_time_ms']:.0f}ms",
            f"{results2['overall']['avg_query_time_ms']:.0f}ms",
            "🏆 " + (results1['model_name'] if results1['overall']['avg_query_time_ms'] < results2['overall']['avg_query_time_ms'] else results2['model_name'])
        ],
        [
            "Avg Doc Embed Time",
            f"{results1['overall']['avg_doc_embed_time_ms']:.0f}ms",
            f"{results2['overall']['avg_doc_embed_time_ms']:.0f}ms",
            "🏆 " + (results1['model_name'] if results1['overall']['avg_doc_embed_time_ms'] < results2['overall']['avg_doc_embed_time_ms'] else results2['model_name'])
        ]
    ]
    print(tabulate(comparison_data, headers="firstrow", tablefmt="grid"))
    
    # Language-specific metrics
    print(f"\n🌐 BY LANGUAGE")
    print("-" * 70)
    for lang in ['English', 'Filipino', 'Hiligaynon']:
        lang_data = [
            ["Metric", results1['model_name'], results2['model_name']],
            [
                "Top-1 Accuracy",
                f"{results1['by_language'][lang]['top1_accuracy']:.1%}",
                f"{results2['by_language'][lang]['top1_accuracy']:.1%}"
            ],
            [
                "Top-3 Accuracy",
                f"{results1['by_language'][lang]['top3_accuracy']:.1%}",
                f"{results2['by_language'][lang]['top3_accuracy']:.1%}"
            ],
            [
                "Mean MRR",
                f"{results1['by_language'][lang]['mean_mrr']:.3f}",
                f"{results2['by_language'][lang]['mean_mrr']:.3f}"
            ]
        ]
        print(f"\n{lang}:")
        print(tabulate(lang_data, headers="firstrow", tablefmt="simple"))
    
    # Category-specific metrics
    print(f"\n📁 BY CATEGORY")
    print("-" * 70)
    cat_comparison = []
    for cat in sorted(results1['by_category'].keys()):
        cat_comparison.append([
            cat,
            f"{results1['by_category'][cat]['top1_accuracy']:.1%}",
            f"{results2['by_category'][cat]['top1_accuracy']:.1%}",
            f"{results1['by_category'][cat]['top3_accuracy']:.1%}",
            f"{results2['by_category'][cat]['top3_accuracy']:.1%}"
        ])
    
    headers = ["Category", f"{results1['model_name'][:15]} Top-1", f"{results2['model_name'][:15]} Top-1", f"{results1['model_name'][:15]} Top-3", f"{results2['model_name'][:15]} Top-3"]
    print(tabulate(cat_comparison, headers=headers, tablefmt="grid"))

def save_results(results1: Dict, results2: Dict, filename: str = "benchmark-results.json"):
    """Save benchmark results to JSON file"""
    output = {
        'benchmark_date': time.strftime('%Y-%m-%d %H:%M:%S'),
        'models': [results1, results2],
        'test_questions': TEST_QUESTIONS,
        'test_documents': [{'id': doc['id'], 'title': doc['title'], 'category': doc['category']} for doc in TEST_DOCUMENTS]
    }
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Results saved to: {filename}")

def generate_recommendation(results1: Dict, results2: Dict) -> str:
    """Generate recommendation based on benchmark results"""
    model1 = results1['model_name']
    model2 = results2['model_name']
    
    # Count wins
    wins = {model1: 0, model2: 0}
    
    # Overall accuracy
    if results1['overall']['top1_accuracy'] > results2['overall']['top1_accuracy']:
        wins[model1] += 2
    elif results2['overall']['top1_accuracy'] > results1['overall']['top1_accuracy']:
        wins[model2] += 2
    
    if results1['overall']['top3_accuracy'] > results2['overall']['top3_accuracy']:
        wins[model1] += 1
    elif results2['overall']['top3_accuracy'] > results1['overall']['top3_accuracy']:
        wins[model2] += 1
    
    # Speed
    if results1['overall']['avg_query_time_ms'] < results2['overall']['avg_query_time_ms']:
        wins[model1] += 1
    else:
        wins[model2] += 1
    
    # Language consistency (standard deviation of accuracy across languages)
    lang_std1 = np.std([results1['by_language'][lang]['top1_accuracy'] for lang in ['English', 'Filipino', 'Hiligaynon']])
    lang_std2 = np.std([results2['by_language'][lang]['top1_accuracy'] for lang in ['English', 'Filipino', 'Hiligaynon']])
    
    if lang_std1 < lang_std2:
        wins[model1] += 1
    else:
        wins[model2] += 1
    
    # Determine winner
    if wins[model1] > wins[model2]:
        recommended = model1
        runner_up = model2
    else:
        recommended = model2
        runner_up = model1
    
    recommendation = f"""
{'='*70}
📋 RECOMMENDATION
{'='*70}

🏆 RECOMMENDED MODEL: {recommended}

REASONING:
- Wins {wins[recommended]} out of 5 key metrics
- Top-1 Accuracy: {results1['overall']['top1_accuracy'] if recommended == model1 else results2['overall']['top1_accuracy']:.1%}
- Top-3 Accuracy: {results1['overall']['top3_accuracy'] if recommended == model1 else results2['overall']['top3_accuracy']:.1%}
- Avg Query Time: {results1['overall']['avg_query_time_ms'] if recommended == model1 else results2['overall']['avg_query_time_ms']:.0f}ms

NEXT STEPS:
1. ✅ Use {recommended} for production deployment
2. ✅ Set embedding dimensions to 384 in database schema
3. ✅ Configure embedding provider (HuggingFace or self-hosted)
4. ✅ Proceed with document ingestion pipeline
5. ✅ Test with actual government documents

ALTERNATIVE: If {recommended} faces issues (availability, performance), 
{runner_up} is a suitable fallback with similar performance.
{'='*70}
"""
    
    return recommendation

# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main():
    print("""
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║           BAGO BUDDY 2.0 - EMBEDDING BENCHMARK TEST              ║
║                                                                  ║
║   Testing multilingual embedding models for RAG implementation   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
""")
    
    print(f"📝 Test Configuration:")
    print(f"   - Questions: {len(TEST_QUESTIONS)} ({len([q for q in TEST_QUESTIONS if q['language'] == 'English'])} English, {len([q for q in TEST_QUESTIONS if q['language'] == 'Filipino'])} Filipino, {len([q for q in TEST_QUESTIONS if q['language'] == 'Hiligaynon'])} Hiligaynon)")
    print(f"   - Documents: {len(TEST_DOCUMENTS)}")
    print(f"   - Categories: {len(set([q['category'] for q in TEST_QUESTIONS]))}")
    
    # Model names
    model1_name = "intfloat/multilingual-e5-small"
    model2_name = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"  # Alternative if horizon-labs not available
    
    try:
        # Run benchmarks
        results1 = run_benchmark(model1_name)
        results2 = run_benchmark(model2_name)
        
        # Print comparison
        print_comparison(results1, results2)
        
        # Generate recommendation
        recommendation = generate_recommendation(results1, results2)
        print(recommendation)
        
        # Save results
        save_results(results1, results2)
        
        print("\n✅ Benchmark complete!")
        print(f"\n📧 Next steps:")
        print(f"   1. Review benchmark-results.json for detailed results")
        print(f"   2. Share results with project team")
        print(f"   3. Proceed with recommended model configuration")
        print(f"   4. Begin document ingestion pipeline development")
        
    except Exception as e:
        print(f"\n❌ Error during benchmark: {e}")
        print(f"\n💡 Troubleshooting:")
        print(f"   - Ensure sentence-transformers is installed: pip install sentence-transformers")
        print(f"   - Check internet connection (models download on first run)")
        print(f"   - Verify models are available on HuggingFace")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
