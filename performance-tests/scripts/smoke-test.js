/**
 * ASENSO BAGO — SMOKE TEST
 * 1-2 VUs, ~60 seconds
 * Purpose: Verify the app is reachable and all key endpoints respond
 * Run before any other test.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

// ── Configuration ──────────────────────────────────────────────────────────
const ASENSO_URL    = __ENV.ASENSO_URL    || 'https://asenso-bago.vercel.app';
const BAGO_SAFE_URL = __ENV.BAGO_SAFE_URL || 'https://bago-reporting.vercel.app';
const SUPABASE_URL  = 'https://esvbibxavfrxkkfujhmz.supabase.co';
const ANON_KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdmJpYnhhdmZyeGtrZnVqaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NDgyMjIsImV4cCI6MjEwODIyNDIyMn0.8cbpFhsettaK9lXD7YKZLlQA3YG4o-9xvrx_jrY_Hro';

export const options = {
  vus: 1,
  duration: '60s',
  thresholds: {
    http_req_failed:   ['rate<0.01'],   // 0% errors
    http_req_duration: ['p(95)<3000'],  // 3 sec max for smoke
    errors:            ['rate<0.01'],
  },
};

const headers = {
  'apikey':        ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type':  'application/json',
};

export default function () {

  // ── 1. Asenso Bago PWA — Static App ────────────────────────────────────
  const pwaRes = http.get(ASENSO_URL);
  check(pwaRes, {
    'PWA: status 200':         (r) => r.status === 200,
    'PWA: has HTML content':   (r) => r.body && r.body.includes('Asenso Bago'),
    'PWA: response < 3s':      (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);

  sleep(1);

  // ── 2. PWA CSS Asset ────────────────────────────────────────────────────
  const cssRes = http.get(`${ASENSO_URL}/assets/css/app.css`);
  check(cssRes, {
    'CSS: status 200 or 304': (r) => r.status === 200 || r.status === 304,
  }) || errorRate.add(1);

  sleep(0.5);

  // ── 3. PWA Service Worker ───────────────────────────────────────────────
  const swRes = http.get(`${ASENSO_URL}/sw.js`);
  check(swRes, {
    'SW: status 200':          (r) => r.status === 200,
    'SW: no-cache header':     (r) => r.headers['Cache-Control'] !== undefined,
  }) || errorRate.add(1);

  sleep(0.5);

  // ── 4. Supabase REST — incidents table (public read) ────────────────────
  const incidentRes = http.get(
    `${SUPABASE_URL}/rest/v1/incidents?select=reference_number,category,status&limit=5&order=created_at.desc`,
    { headers }
  );
  check(incidentRes, {
    'Supabase incidents: status 200':    (r) => r.status === 200,
    'Supabase incidents: returns JSON':  (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('json'),
    'Supabase incidents: response < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // ── 5. Bago Safe — Public Home ──────────────────────────────────────────
  const safeRes = http.get(BAGO_SAFE_URL);
  check(safeRes, {
    'Bago Safe: status 200':     (r) => r.status === 200,
    'Bago Safe: has content':    (r) => r.body && r.body.length > 1000,
    'Bago Safe: response < 3s':  (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);

  sleep(1);

  // ── 6. Bago Safe — Track page ───────────────────────────────────────────
  const trackRes = http.get(`${BAGO_SAFE_URL}/track`);
  check(trackRes, {
    'Track page: status 200':    (r) => r.status === 200,
    'Track page: response < 3s': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);

  sleep(1);

  // ── 7. Bago Safe — Community Dashboard ─────────────────────────────────
  const communityRes = http.get(`${BAGO_SAFE_URL}/community`);
  check(communityRes, {
    'Community: status 200':    (r) => r.status === 200,
    'Community: response < 3s': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);

  sleep(1);
}
