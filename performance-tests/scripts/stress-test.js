/**
 * ASENSO BAGO — STRESS TEST
 * ⚠️  DO NOT RUN AGAINST PRODUCTION WITHOUT EXPLICIT APPROVAL ⚠️
 * 
 * Target: 75 VUs → 100 VUs
 * Purpose: Find the breaking point and verify graceful degradation.
 * 
 * Safety limits:
 *  - Hard stop if error rate > 10%
 *  - Hard stop if p99 > 10 seconds
 *  - Max 10 minutes total
 *  - Run against staging/preview only
 * 
 * Before running:
 *  1. Set BASE_URL to a staging/preview deployment URL
 *  2. Notify team
 *  3. Watch Supabase dashboard during test
 *  4. Have rollback plan ready
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const dbLatency = new Trend('db_latency_ms', true);

const ASENSO_URL    = __ENV.ASENSO_URL    || 'https://asenso-bago.vercel.app';
const BAGO_SAFE_URL = __ENV.BAGO_SAFE_URL || 'https://bago-reporting.vercel.app';
const SUPABASE_URL  = 'https://esvbibxavfrxkkfujhmz.supabase.co';
const ANON_KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdmJpYnhhdmZyeGtrZnVqaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NDgyMjIsImV4cCI6MjEwODIyNDIyMn0.8cbpFhsettaK9lXD7YKZLlQA3YG4o-9xvrx_jrY_Hro';

export const options = {
  stages: [
    { duration: '1m',  target: 25  },  // ramp to 25
    { duration: '2m',  target: 25  },  // hold
    { duration: '1m',  target: 50  },  // ramp to 50
    { duration: '2m',  target: 50  },  // hold
    { duration: '1m',  target: 75  },  // ramp to 75 — WATCH CLOSELY
    { duration: '2m',  target: 75  },  // hold
    // ⚠️  Uncomment 100-VU stages ONLY after verifying 75-VU passes
    // { duration: '30s', target: 100 },
    // { duration: '2m',  target: 100 },
    { duration: '1m',  target: 0   },  // ramp down
  ],
  thresholds: {
    // These thresholds define PASS — the test will continue even if breached
    // but mark the test as failed in reporting
    http_req_failed:   ['rate<0.10'],  // allow up to 10% errors under stress
    http_req_duration: ['p(95)<3000'], // allow up to 3s under stress
    db_latency_ms:     ['p(99)<5000'], // hard stop criterion (monitored)
    errors:            ['rate<0.10'],
  },
  // ── Safety Abort ───────────────────────────────────────────────────────
  // k6 abortOnFail: uncomment to auto-abort if error rate spikes
  // thresholds: { errors: [{ threshold: 'rate<0.10', abortOnFail: true }] },
};

const headers = {
  'apikey':        ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type':  'application/json',
};

function thinkTime() {
  sleep(0.5 + Math.random() * 1.5); // shorter think time under stress
}

export default function () {
  const roll = Math.random();

  if (roll < 0.6) {
    // Heavy read scenario — incidents list
    group('Stress — Supabase Reads', () => {
      const start = Date.now();
      const res = http.get(
        `${SUPABASE_URL}/rest/v1/incidents` +
        `?select=reference_number,category,severity,title,status,created_at` +
        `&order=created_at.desc&limit=50`,
        { headers }
      );
      dbLatency.add(Date.now() - start);

      check(res, {
        'Read: not 500':    (r) => r.status !== 500,
        'Read: not 503':    (r) => r.status !== 503,
        'Read: got result': (r) => r.status === 200 || r.status === 404,
      }) || errorRate.add(1);

      thinkTime();
    });

  } else if (roll < 0.85) {
    // Static assets from Vercel CDN — should handle 100+ easily
    group('Stress — Static Assets', () => {
      const res = http.get(ASENSO_URL);
      check(res, {
        'Static: 200': (r) => r.status === 200,
      }) || errorRate.add(1);
      thinkTime();
    });

  } else {
    // Write load — incident submission
    group('Stress — Supabase Writes', () => {
      const payload = JSON.stringify({
        category:         'other',
        severity:         'low',
        title:            `[STRESS-TEST-VU${__VU}] Automated stress test record`,
        description:      `Stress test synthetic record. VU: ${__VU}. Iteration: ${__ITER}. DELETE AFTER TESTING.`,
        location_lat:     10.5380,
        location_lng:     122.8424,
        address_text:     `Stress Test Location VU${__VU}, Bago City`,
        barangay:         'Poblacion',
        reporter_name:    null,
        reporter_contact: `stress-test-${__VU}@asenso-bago-perf.test`,
        status:           'submitted',
        reference_number: `STRESS-${__VU}-${__ITER}-${Date.now()}`,
      });

      const start = Date.now();
      const res = http.post(
        `${SUPABASE_URL}/rest/v1/incidents`,
        payload,
        { headers }
      );
      dbLatency.add(Date.now() - start);

      check(res, {
        'Write: not 500':     (r) => r.status !== 500,
        'Write: 201 created': (r) => r.status === 201 || r.status === 200,
      }) || errorRate.add(1);

      thinkTime();
    });
  }
}

export function handleSummary(data) {
  const errorRateVal = data.metrics.errors?.values?.rate || 0;
  const p95          = data.metrics.http_req_duration?.values?.['p(95)'] || 0;
  const p99          = data.metrics.http_req_duration?.values?.['p(99)'] || 0;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  STRESS TEST SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Error Rate:  ${(errorRateVal * 100).toFixed(2)}%`);
  console.log(`  p95 Latency: ${p95.toFixed(0)}ms`);
  console.log(`  p99 Latency: ${p99.toFixed(0)}ms`);

  if (errorRateVal > 0.10) {
    console.log('\n  ❌ FAILED: Error rate exceeded 10% — system is overloaded');
  } else if (p95 > 3000) {
    console.log('\n  ⚠️  DEGRADED: p95 > 3s — system is under stress');
  } else {
    console.log('\n  ✅ PASSED: System handled stress load within thresholds');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return {};
}
