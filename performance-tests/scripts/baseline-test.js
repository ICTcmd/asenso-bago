/**
 * ASENSO BAGO — BASELINE TEST
 * 5 VUs, 5 minutes (ramp 1m → hold 3m → ramp-down 1m)
 * Purpose: Establish normal-load performance benchmarks.
 * This is your reference point — run after smoke, before load test.
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ── Custom Metrics ──────────────────────────────────────────────────────────
const errorRate         = new Rate('errors');
const supabaseQueryTime = new Trend('supabase_query_duration', true);
const pageLoadTime      = new Trend('page_load_duration', true);

// ── Configuration ───────────────────────────────────────────────────────────
const ASENSO_URL    = __ENV.ASENSO_URL    || 'https://asenso-bago.vercel.app';
const BAGO_SAFE_URL = __ENV.BAGO_SAFE_URL || 'https://bago-reporting.vercel.app';
const SUPABASE_URL  = 'https://esvbibxavfrxkkfujhmz.supabase.co';
const ANON_KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdmJpYnhhdmZyeGtrZnVqaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NDgyMjIsImV4cCI6MjEwODIyNDIyMn0.8cbpFhsettaK9lXD7YKZLlQA3YG4o-9xvrx_jrY_Hro';

export const options = {
  stages: [
    { duration: '1m',  target: 5  },  // ramp up to 5 VUs
    { duration: '3m',  target: 5  },  // hold at 5 VUs
    { duration: '1m',  target: 0  },  // ramp down
  ],
  thresholds: {
    http_req_failed:          ['rate<0.005'],  // < 0.5% error rate
    http_req_duration:        ['p(95)<500'],   // 95% under 500ms
    'supabase_query_duration':['p(95)<400'],   // DB queries under 400ms
    'page_load_duration':     ['p(95)<800'],   // Full page under 800ms
    errors:                   ['rate<0.005'],
  },
};

const headers = {
  'apikey':        ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type':  'application/json',
  'Accept':        'application/json',
};

// ── Helper ──────────────────────────────────────────────────────────────────
function thinkTime(min = 1, max = 3) {
  sleep(min + Math.random() * (max - min));
}

// ── Main Scenario ────────────────────────────────────────────────────────────
export default function () {

  // Scenario: Citizen browses the Asenso Bago app
  group('Asenso Bago PWA — Page Load', () => {
    const start = Date.now();
    const res = http.get(ASENSO_URL);
    pageLoadTime.add(Date.now() - start);

    check(res, {
      'PWA home: 200':           (r) => r.status === 200,
      'PWA home: < 2s':          (r) => r.timings.duration < 2000,
      'PWA home: has app body':  (r) => r.body.includes('Asenso Bago'),
    }) || errorRate.add(1);

    thinkTime(1, 2);
  });

  // Scenario: Load CSS (should be CDN-cached)
  group('Static Assets', () => {
    const batch = http.batch([
      ['GET', `${ASENSO_URL}/assets/css/app.css`],
      ['GET', `${ASENSO_URL}/manifest.json`],
    ]);

    batch.forEach(res => {
      check(res, {
        'Static: 200 or 304': (r) => r.status === 200 || r.status === 304,
      }) || errorRate.add(1);
    });

    thinkTime(0.5, 1);
  });

  // Scenario: Fetch public incidents (Community Dashboard)
  group('Supabase — Public Incidents Query', () => {
    const start = Date.now();
    const res = http.get(
      `${SUPABASE_URL}/rest/v1/incidents` +
      `?select=reference_number,category,severity,title,barangay,address_text,status,created_at` +
      `&order=created_at.desc&limit=50`,
      { headers }
    );
    supabaseQueryTime.add(Date.now() - start);

    check(res, {
      'Incidents: status 200':    (r) => r.status === 200,
      'Incidents: JSON array':    (r) => {
        try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
      },
      'Incidents: query < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);

    thinkTime(2, 4);
  });

  // Scenario: Track an incident by reference number (RPC call)
  group('Supabase — Track Incident RPC', () => {
    // Use a known test reference or a likely pattern
    const start = Date.now();
    const res = http.post(
      `${SUPABASE_URL}/rest/v1/rpc/track_incident_by_reference`,
      JSON.stringify({ ref_num: 'BS-TEST-0001' }),
      { headers }
    );
    supabaseQueryTime.add(Date.now() - start);

    check(res, {
      'Track RPC: 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Track RPC: < 500ms':    (r) => r.timings.duration < 500,
    }) || errorRate.add(1);

    thinkTime(1, 3);
  });

  // Scenario: Bago Safe Community Dashboard
  group('Bago Safe — Community Feed', () => {
    const start = Date.now();
    const res = http.get(`${BAGO_SAFE_URL}/community`);
    pageLoadTime.add(Date.now() - start);

    check(res, {
      'Community: 200':     (r) => r.status === 200,
      'Community: < 2s':    (r) => r.timings.duration < 2000,
    }) || errorRate.add(1);

    thinkTime(2, 4);
  });

  // Scenario: Bago Safe Track page
  group('Bago Safe — Track Page', () => {
    const res = http.get(`${BAGO_SAFE_URL}/track`);

    check(res, {
      'Track page: 200':  (r) => r.status === 200,
      'Track page: < 2s': (r) => r.timings.duration < 2000,
    }) || errorRate.add(1);

    thinkTime(1, 2);
  });
}
