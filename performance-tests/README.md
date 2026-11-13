# Asenso Bago — Performance Test Suite

> Grafana k6 load testing for Asenso Bago PWA and Bago Safe  
> Target: 100 simultaneous active users  
> Platform: Supabase Free Plan + Vercel

---

## Directory Structure

```
performance-tests/
├── README.md           ← this file
├── scripts/
│   ├── smoke-test.js       1–2 VUs, ~1 min  (sanity check)
│   ├── baseline-test.js    5 VUs,   5 min  (normal load)
│   ├── load-test.js       25 VUs,  10 min  (target load)
│   ├── stress-test.js     75 VUs,   8 min  (stress — MANUAL ONLY)
│   └── soak-test.js       25 VUs,  30 min  (endurance)
└── config/
    └── thresholds.js           shared pass/fail thresholds
```

---

## Prerequisites

```bash
# Install k6 (Windows — requires Chocolatey or direct download)
choco install k6
# OR download from https://k6.io/docs/getting-started/installation/

# Verify install
k6 version
```

---

## Running Tests

### Step 1 — Smoke Test (always run first)
```bash
k6 run performance-tests/scripts/smoke-test.js
```
Expected: All requests succeed, no errors.

### Step 2 — Baseline (5 VUs)
```bash
k6 run performance-tests/scripts/baseline-test.js
```
Expected: p95 < 500ms, error rate < 0.5%

### Step 3 — Load Test (25 VUs)
```bash
k6 run performance-tests/scripts/load-test.js
```
Expected: p95 < 800ms, error rate < 1%

### Step 4 — Soak Test (25 VUs for 30 min)
```bash
k6 run performance-tests/scripts/soak-test.js
```
Expected: No memory leaks, stable response times over time.

### Step 5 — Stress Test (REQUIRES MANUAL APPROVAL)
⚠️ **DO NOT RUN AGAINST PRODUCTION WITHOUT APPROVAL**
```bash
# Only run against staging/preview deployment
k6 run --env BASE_URL=https://your-preview-url.vercel.app \
       performance-tests/scripts/stress-test.js
```

---

## Environment Variables

```bash
# Override base URLs (default: production)
k6 run --env ASENSO_URL=https://asenso-bago.vercel.app \
       --env BAGO_SAFE_URL=https://bago-reporting.vercel.app \
       performance-tests/scripts/load-test.js
```

---

## Acceptance Thresholds

| Metric                    | Target     | Critical   |
|---------------------------|------------|------------|
| API read p95              | < 500ms    | < 1000ms   |
| API write p95             | < 800ms    | < 2000ms   |
| Error rate                | < 1%       | < 5%       |
| HTTP 5xx rate             | 0%         | < 0.1%     |
| DB connection exhaustion  | Never      | Never      |

---

## Supabase Free Plan Limits (Know These)

| Resource              | Free Plan Limit          |
|-----------------------|--------------------------|
| Database connections  | 60 pooled (PgBouncer)    |
| API requests          | 2M/month                 |
| Storage               | 1GB                      |
| Realtime connections  | 200 concurrent           |
| Edge Function calls   | 500K/month               |

**At 100 concurrent users**: Each user holding 1 Supabase connection = 100 connections.  
Free plan has 60 pooled connections via PgBouncer. This is the **primary bottleneck**.

---

## Safety Rules

1. Never run stress-test.js against production
2. Always run smoke-test.js before any other test
3. Watch Supabase dashboard during tests for connection exhaustion
4. If error rate exceeds 5%, stop the test immediately
5. Use synthetic test data only — never real citizen PII
6. Test users: use `test-user-{n}@asenso-bago-perf.test` pattern

---

## Interpreting Results

```
✓ http_req_duration ........... p(95)=234ms
✓ http_req_failed ............. 0.12%
✓ checks ...................... 99.88%

scenarios: (100.00%) 1 scenario, 25 max VUs
default: 25 looping VUs for 10m0s (gracefulStop: 30s)
```

- `p(95)=234ms` → 95% of requests completed within 234ms ✅
- `http_req_failed=0.12%` → 0.12% of requests failed ✅  
- `checks=99.88%` → Business logic assertions passed ✅

---

## Notes on Asenso Bago Architecture

The PWA is a static HTML file served from Vercel CDN. All "API calls" are  
direct Supabase PostgREST requests from the browser. This means:

- **Static assets** (HTML, CSS, JS, images): Served by Vercel Edge CDN — extremely fast
- **Supabase queries**: Each browser tab opens a WebSocket + REST connection
- **No serverless functions**: No cold starts to worry about
- **Bottleneck**: Supabase Free Plan connection pooler (60 connections)

At 100 users, expect:
- Vercel CDN: No issue
- Supabase queries: Potential queue buildup if queries are slow
- Profile queries: Risk of RLS recursion errors (see TASK 7 from session)
