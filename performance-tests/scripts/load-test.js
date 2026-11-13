/**
 * ASENSO BAGO — LOAD TEST
 * Progressive ramp: 5 → 10 → 25 → 50 → 100 VUs
 * Total: ~20 minutes
 * 
 * ⚠️  MANUAL APPROVAL REQUIRED before 75-VU and 100-VU stages.
 *     Stop the test after the 50-VU hold stage and confirm before continuing.
 * 
 * Simulates realistic public usage:
 *  - Browsing the PWA (static + JS)
 *  - Reading tourism / barangay info (static)
 *  - Loading the community incident feed (Supabase query)
 *  - Tracking an incident (Supabase RPC)
 *  - Submitting a new incident report (Supabase INSERT + Storage)
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ── Custom Metrics ──────────────────────────────────────────────────────────
const errorRate         = new Rate('errors');
const supabaseReadTime  = new Trend('supabase_read_ms',  true);
const supabaseWriteTime = new Trend('supabase_write_ms', true);
const pageLoadTime      = new Trend('page_load_ms',      true);
const submittedReports  = new Counter('reports_submitted');
const failedSubmits     = new Counter('failed_submits');

// ── Environment ─────────────────────────────────────────────────────────────
const ASENSO_URL    = __ENV.ASENSO_URL    || 'https://asenso-bago.vercel.app';
const BAGO_SAFE_URL = __ENV.BAGO_SAFE_URL || 'https://bago-reporting.vercel.app';
const SUPABASE_URL  = 'https://esvbibxavfrxkkfujhmz.supabase.co';
const ANON_KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdmJpYnhhdmZyeGtrZnVqaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NDgyMjIsImV4cCI6MjEwODIyNDIyMn0.8cbpFhsettaK9lXD7YKZLlQA3YG4o-9xvrx_jrY_Hro';

export const options = {
  stages: [
    // Phase 1 — Warm up
    { duration: '1m',  target: 5  },
    { duration: '2m',  target: 5  },
    // Phase 2 — Normal load
    { duration: '1m',  target: 10 },
    { duration: '2m',  target: 10 },
    // Phase 3 — Target load
    { duration: '1m',  target: 25 },
    { duration: '3m',  target: 25 },
    // Phase 4 — Elevated load (MANUAL APPROVAL before this in stress-test.js)
    { duration: '1m',  target: 50 },
    { duration: '3m',  target: 50 },
    // Phase 5 — Ramp down
    { duration: '2m',  target: 0  },
  ],
  thresholds: {
    http_req_failed:   ['rate<0.01'],    // < 1% error rate
    http_req_duration: ['p(95)<800'],    // 95% under 800ms
    supabase_read_ms:  ['p(95)<500'],    // DB reads under 500ms
    supabase_write_ms: ['p(95)<1000'],   // DB writes under 1s
    page_load_ms:      ['p(95)<1500'],   // Full page under 1.5s
    errors:            ['rate<0.01'],
  },
};

const headers = {
  'apikey':        ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type':  'application/json',
  'Accept':        'application/json',
  'Prefer':        'return=minimal',
};

// ── Synthetic test data ──────────────────────────────────────────────────────
const CATEGORIES = ['flood', 'road_obstruction', 'fallen_tree', 'building_damage', 'other'];
const SEVERITIES = ['low', 'medium', 'high'];
const BARANGAYS  = ['Poblacion', 'Ma-ao', 'Dulao', 'Calumangan', 'Balingasag', 'Atipuluan'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function syntheticReferenceNumber() {
  // Generate a fake reference to test the track endpoint
  const hex  = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
  const tail = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BS-${hex}-${tail}`;
}

function syntheticReport(vu) {
  return {
    category:         randomItem(CATEGORIES),
    severity:         randomItem(SEVERITIES),
    title:            `[PERF-TEST-${vu}] Road obstruction near covered court`,
    description:      `Performance test synthetic incident. VU ${vu}. ` +
                      `This is an automated test record and should be deleted after testing. ` +
                      `Fallen tree blocking main road near barangay covered court.`,
    location_lat:     10.5380 + (Math.random() - 0.5) * 0.05,
    location_lng:     122.8424 + (Math.random() - 0.5) * 0.05,
    address_text:     `Test Address ${vu}, ${randomItem(BARANGAYS)}, Bago City`,
    barangay:         randomItem(BARANGAYS),
    reporter_name:    null,                   // anonymous
    reporter_contact: `perf-test-${vu}@asenso-bago-perf.test`,
    status:           'submitted',
    reference_number: syntheticReferenceNumber(),
  };
}

function thinkTime(min = 1, max = 4) {
  sleep(min + Math.random() * (max - min));
}

// ── Scenario Weights ─────────────────────────────────────────────────────────
// 70% browse, 20% track, 10% submit — mirrors real usage

export default function () {
  const roll = Math.random();

  if (roll < 0.35) {
    // ─── Scenario A: Browse Asenso Bago PWA ──────────────────────────────
    group('Browse PWA', () => {
      const start = Date.now();
      const home = http.get(ASENSO_URL);
      pageLoadTime.add(Date.now() - start);

      check(home, {
        'PWA: 200':          (r) => r.status === 200,
        'PWA: has content':  (r) => r.body.includes('City of Bago'),
      }) || errorRate.add(1);

      thinkTime(2, 5);
    });

  } else if (roll < 0.55) {
    // ─── Scenario B: View Community Dashboard (Supabase read) ────────────
    group('Community Dashboard', () => {
      // Simulate the Next.js SSR page fetch
      const pageRes = http.get(`${BAGO_SAFE_URL}/community`);
      check(pageRes, {
        'Community page: 200':  (r) => r.status === 200,
        'Community page: fast': (r) => r.timings.duration < 2000,
      }) || errorRate.add(1);

      thinkTime(1, 2);

      // Client-side Supabase fetch that the page makes
      const start = Date.now();
      const apiRes = http.get(
        `${SUPABASE_URL}/rest/v1/incidents` +
        `?select=reference_number,category,severity,title,barangay,address_text,status,created_at` +
        `&order=created_at.desc&limit=50`,
        { headers }
      );
      supabaseReadTime.add(Date.now() - start);

      check(apiRes, {
        'Incidents API: 200':     (r) => r.status === 200,
        'Incidents API: < 500ms': (r) => r.timings.duration < 500,
      }) || errorRate.add(1);

      thinkTime(3, 6);
    });

  } else if (roll < 0.70) {
    // ─── Scenario C: Tourism / Barangay Info (static page sections) ──────
    group('Tourism Info', () => {
      const start = Date.now();
      const res = http.get(ASENSO_URL);
      pageLoadTime.add(Date.now() - start);

      check(res, {
        'Tourism content: 200':       (r) => r.status === 200,
        'Tourism content: has spots':  (r) => r.body.includes('Kipot'),
      }) || errorRate.add(1);

      thinkTime(3, 7);
    });

  } else if (roll < 0.85) {
    // ─── Scenario D: Track an Incident ───────────────────────────────────
    group('Track Incident', () => {
      const trackPage = http.get(`${BAGO_SAFE_URL}/track`);
      check(trackPage, {
        'Track page: 200': (r) => r.status === 200,
      }) || errorRate.add(1);

      thinkTime(1, 2);

      // Call Supabase RPC
      const ref   = syntheticReferenceNumber();
      const start = Date.now();
      const rpc   = http.post(
        `${SUPABASE_URL}/rest/v1/rpc/track_incident_by_reference`,
        JSON.stringify({ ref_num: ref }),
        { headers }
      );
      supabaseReadTime.add(Date.now() - start);

      check(rpc, {
        'Track RPC: 200 or 404':  (r) => r.status === 200 || r.status === 404,
        'Track RPC: < 500ms':     (r) => r.timings.duration < 500,
      }) || errorRate.add(1);

      thinkTime(2, 4);
    });

  } else {
    // ─── Scenario E: Submit Incident Report (10% of traffic) ─────────────
    group('Submit Report', () => {
      // Load the report page
      const reportPage = http.get(`${BAGO_SAFE_URL}/report`);
      check(reportPage, {
        'Report page: 200': (r) => r.status === 200,
      }) || errorRate.add(1);

      thinkTime(2, 5);  // Simulating form fill time

      // POST the incident
      const payload = JSON.stringify(syntheticReport(__VU));
      const start   = Date.now();
      const submit  = http.post(
        `${SUPABASE_URL}/rest/v1/incidents`,
        payload,
        {
          headers: {
            ...headers,
            'Prefer': 'return=representation',
          },
        }
      );
      supabaseWriteTime.add(Date.now() - start);

      const submitOk = check(submit, {
        'Submit: 201 created':    (r) => r.status === 201,
        'Submit: returns record': (r) => {
          try {
            const body = JSON.parse(r.body);
            return Array.isArray(body) && body.length > 0 && body[0].reference_number;
          } catch { return false; }
        },
        'Submit: < 2s':           (r) => r.timings.duration < 2000,
      });

      if (submitOk) {
        submittedReports.add(1);
      } else {
        failedSubmits.add(1);
        errorRate.add(1);
      }

      thinkTime(2, 4);
    });
  }
}
