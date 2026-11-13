/**
 * ASENSO BAGO — SOAK TEST
 * 25 VUs for 30 minutes
 * Purpose: Detect memory leaks, connection pool exhaustion, and performance
 * degradation over time. Normal load held for an extended period.
 *
 * Watch for:
 *  - Response times increasing over time (memory leak signal)
 *  - Error rate climbing after 15-20 min (connection pool exhaustion)
 *  - Supabase 429 / 503 responses (rate limit or overload)
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate    = new Rate('errors');
const dbReadTime   = new Trend('db_read_ms',   true);
const dbWriteTime  = new Trend('db_write_ms',  true);
const pageLoadTime = new Trend('page_load_ms', true);
const writes       = new Counter('total_writes');

const ASENSO_URL    = __ENV.ASENSO_URL    || 'https://asenso-bago.vercel.app';
const BAGO_SAFE_URL = __ENV.BAGO_SAFE_URL || 'https://bago-reporting.vercel.app';
const SUPABASE_URL  = 'https://esvbibxavfrxkkfujhmz.supabase.co';
const ANON_KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdmJpYnhhdmZyeGtrZnVqaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NDgyMjIsImV4cCI6MjEwODIyNDIyMn0.8cbpFhsettaK9lXD7YKZLlQA3YG4o-9xvrx_jrY_Hro';

export const options = {
  stages: [
    { duration: '2m',  target: 25 },  // ramp up
    { duration: '26m', target: 25 },  // hold — the soak
    { duration: '2m',  target: 0  },  // ramp down
  ],
  thresholds: {
    http_req_failed:   ['rate<0.01'],   // < 1% errors over full 30 min
    http_req_duration: ['p(95)<800'],   // should stay stable
    db_read_ms:        ['p(95)<500'],
    db_write_ms:       ['p(95)<1000'],
    errors:            ['rate<0.01'],
  },
};

const headers = {
  'apikey':        ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type':  'application/json',
};

const BARANGAYS = ['Poblacion', 'Ma-ao', 'Dulao', 'Calumangan', 'Balingasag'];
const CATEGORIES = ['flood', 'road_obstruction', 'fallen_tree', 'other'];

function thinkTime(min = 2, max = 5) {
  sleep(min + Math.random() * (max - min));
}

export default function () {
  const roll = Math.random();

  if (roll < 0.40) {
    group('Soak — PWA Static Load', () => {
      const start = Date.now();
      const res = http.get(ASENSO_URL);
      pageLoadTime.add(Date.now() - start);

      check(res, {
        'PWA: 200':    (r) => r.status === 200,
        'PWA: < 2s':   (r) => r.timings.duration < 2000,
      }) || errorRate.add(1);

      thinkTime(3, 8);
    });

  } else if (roll < 0.70) {
    group('Soak — Supabase Read (Incidents)', () => {
      const start = Date.now();
      const res = http.get(
        `${SUPABASE_URL}/rest/v1/incidents` +
        `?select=reference_number,category,severity,title,status,created_at` +
        `&order=created_at.desc&limit=50`,
        { headers }
      );
      dbReadTime.add(Date.now() - start);

      check(res, {
        'Read: 200':      (r) => r.status === 200,
        'Read: < 500ms':  (r) => r.timings.duration < 500,
        'Read: no 429':   (r) => r.status !== 429,
        'Read: no 503':   (r) => r.status !== 503,
      }) || errorRate.add(1);

      thinkTime(2, 6);
    });

  } else if (roll < 0.90) {
    group('Soak — Community Dashboard (Next.js SSR)', () => {
      const res = http.get(`${BAGO_SAFE_URL}/community`);
      check(res, {
        'Community: 200':  (r) => r.status === 200,
        'Community: < 3s': (r) => r.timings.duration < 3000,
      }) || errorRate.add(1);

      thinkTime(3, 7);
    });

  } else {
    group('Soak — Incident Write', () => {
      // 10% of traffic creates records — tests connection pool under sustained load
      const payload = JSON.stringify({
        category:         CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        severity:         'low',
        title:            `[SOAK-VU${__VU}] Soak test record — please delete`,
        description:      `Automated soak test. VU ${__VU} Iter ${__ITER}. ` +
                          `Created at ${new Date().toISOString()}. Delete after test.`,
        location_lat:     10.5380 + (Math.random() - 0.5) * 0.03,
        location_lng:     122.8424 + (Math.random() - 0.5) * 0.03,
        address_text:     `Soak Test Address ${__VU}-${__ITER}, Bago City`,
        barangay:         BARANGAYS[Math.floor(Math.random() * BARANGAYS.length)],
        reporter_name:    null,
        reporter_contact: `soak-test-vu${__VU}@asenso-bago-perf.test`,
        status:           'submitted',
        reference_number: `SOAK-${__VU}-${__ITER}-${Date.now()}`,
      });

      const start = Date.now();
      const res = http.post(
        `${SUPABASE_URL}/rest/v1/incidents`,
        payload,
        { headers }
      );
      dbWriteTime.add(Date.now() - start);
      writes.add(1);

      check(res, {
        'Write: 201 or 200':  (r) => r.status === 201 || r.status === 200,
        'Write: < 2s':        (r) => r.timings.duration < 2000,
        'Write: no 500':      (r) => r.status !== 500,
      }) || errorRate.add(1);

      thinkTime(2, 5);
    });
  }
}

export function handleSummary(data) {
  const p50  = data.metrics.http_req_duration?.values?.['p(50)']  || 0;
  const p95  = data.metrics.http_req_duration?.values?.['p(95)']  || 0;
  const p99  = data.metrics.http_req_duration?.values?.['p(99)']  || 0;
  const err  = (data.metrics.errors?.values?.rate || 0) * 100;
  const reqs = data.metrics.http_reqs?.values?.count || 0;
  const rps  = data.metrics.http_reqs?.values?.rate  || 0;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SOAK TEST SUMMARY (25 VUs × 30 min)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total Requests : ${reqs}`);
  console.log(`  Avg Throughput : ${rps.toFixed(2)} req/s`);
  console.log(`  p50 Latency    : ${p50.toFixed(0)}ms`);
  console.log(`  p95 Latency    : ${p95.toFixed(0)}ms`);
  console.log(`  p99 Latency    : ${p99.toFixed(0)}ms`);
  console.log(`  Error Rate     : ${err.toFixed(2)}%`);
  console.log('');

  if (err > 1) {
    console.log('  ❌ FAILED: Error rate exceeded 1% — connection pool may be exhausted');
  } else if (p95 > 800) {
    console.log('  ⚠️  DEGRADED: p95 > 800ms — possible memory leak or slow queries');
  } else {
    console.log('  ✅ PASSED: Stable over 30 minutes — no memory/connection leaks detected');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return {};
}
