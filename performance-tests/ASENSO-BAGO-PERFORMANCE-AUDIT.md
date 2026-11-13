# ASENSO BAGO — PERFORMANCE AUDIT REPORT
**Date:** November 13, 2026  
**Auditor:** Kiro AI (Senior Performance Engineer Role)  
**Scope:** Asenso Bago PWA + Bago Safe Incident Reporting System  
**Target:** 100 Simultaneous Active Users  
**Method:** Code inspection (no live load tests run yet)

---

## EXECUTIVE SUMMARY

The Asenso Bago ecosystem consists of two apps sharing one Supabase Free Plan project. The static PWA can comfortably serve 100+ users from Vercel's CDN. The primary bottleneck is **Supabase Free Plan's 60-connection pool** — this is the single most critical constraint for 100-user readiness.

**Current Status: NOT READY for 100 concurrent users** without the fixes listed below.  
**Estimated effort to reach readiness: 3–5 hours** of targeted fixes.

---

## PART 1 — ARCHITECTURE OVERVIEW
*(Measured: code inspection. Not load-tested.)*

### 1.1 Asenso Bago PWA

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Vanilla HTML/CSS/JS (SPA) | Single 3,193-line `index.html` |
| Hosting | Vercel (static) | CDN-distributed globally |
| Auth | Supabase Auth via CDN JS | `window.supabaseClient` |
| Database | Supabase PostgREST (REST API) | Anon key hardcoded in JS |
| Realtime | None | No WebSocket subscriptions |
| PWA | Service Worker (`sw.js`) | Network-first strategy |
| Build | `node build.js` | Injects SW cache version |
| CSS | Single `app.css` (~4,900 lines) | No bundling/minification |

### 1.2 Bago Safe

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 15.5.28, React 19, TypeScript | App Router |
| Hosting | Vercel (serverless) | SSR + static hybrid |
| Auth | `@supabase/ssr` with cookie sessions | Middleware-protected routes |
| Database | Same Supabase project | `@supabase/supabase-js` v2 |
| Maps | Leaflet + react-leaflet | Dynamic import (no SSR) |
| Forms | react-hook-form + zod | Client-side validation |

### 1.3 Shared Supabase Project

```
Project URL : https://esvbibxavfrxkkfujhmz.supabase.co
Plan        : FREE
Key tables  : profiles, incidents, incident_media,
              incident_updates, announcements,
              health_service_requests, barangays
```

---

## PART 2 — SUPABASE AUDIT
*(Code inspection findings)*

### 🔴 CRITICAL — C1: Supabase Free Plan Connection Limit

**Severity: CRITICAL**  
**Measured: NO** (identified by code inspection)

Supabase Free Plan provides **60 pooled connections** via PgBouncer. At 100 concurrent users, the community dashboard query alone can saturate this pool:

```
100 users × 1 active query = 100 connections needed
Free plan provides = 60 pooled connections
Result = 40 users queued or receiving errors
```

**Evidence:** `community/page.tsx` line ~75:
```typescript
const { data, error } = await supabase
  .from('incidents')
  .select('reference_number, category, severity, title, barangay, address_text, status, created_at')
  .order('created_at', { ascending: false })
  .limit(50)
```
This runs on every page load with no caching.

**Fix required:**
```typescript
// Add cache headers to Supabase responses
// Use Supabase's built-in HTTP caching for read-heavy queries
const { data } = await supabase
  .from('incidents')
  .select('reference_number, category, severity, title, barangay, address_text, status, created_at')
  .order('created_at', { ascending: false })
  .limit(50)
  .abortSignal(AbortSignal.timeout(5000)) // prevent hung connections
```

**Long-term fix:** Upgrade to Supabase Pro ($25/month) for 200+ connections.

---

### 🔴 CRITICAL — C2: RLS Infinite Recursion on `profiles` Table

**Severity: CRITICAL**  
**Measured: NO** (reported by user in TASK 7, confirmed by code inspection)

The `profiles` table in Bago Safe's schema has a circular RLS policy:

```sql
-- PROBLEMATIC POLICY (from schema.sql):
CREATE POLICY "Staff can view staff profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles         -- ← queries profiles to check profiles!
      WHERE id = auth.uid()
      AND role IN ('responder', 'supervisor', 'admin')
    )
    AND role IN ('responder', 'supervisor', 'admin')
  );
```

This causes `GET /profiles` to return HTTP 500 errors repeatedly, flooding the browser console and consuming database resources on every authenticated page load.

**Evidence:** Browser console shows "Infinite recursion detected in policy for relation 'profiles'" on every auth check.

**Fix (SQL — ready to run):**
```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Staff can view staff profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- ... (see fix-profiles-rls.sql already in repo)

-- Replace with simple, non-recursive policies
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

**File already created:** `bago-city-pwa/fix-profiles-rls.sql`

---

### 🟡 HIGH — H1: SELECT * in Dashboard Query

**Severity: HIGH**  
**Measured: NO** (code inspection)

`dashboard/page.tsx` line ~115:
```typescript
const { data } = await supabase
  .from('incidents')
  .select('*')           // ← fetches ALL columns including PII
  .order('created_at', { ascending: false })
```

This fetches `reporter_name`, `reporter_contact`, `description` (full text), `location_lat`, `location_lng` — all PII — for the entire incidents list. At 50 records, this is unnecessary data transfer on every dashboard load.

**Fix:**
```typescript
.select('id, reference_number, title, category, severity, status, address_text, barangay, created_at, location_lat, location_lng, reporter_name')
```

---

### 🟡 HIGH — H2: No Query Result Caching on Community Dashboard

**Severity: HIGH**  
**Measured: NO** (code inspection)

`community/page.tsx` runs a fresh Supabase query on every page render with no caching strategy. 100 users loading the community page simultaneously = 100 identical queries hitting the database.

**Fix (add SWR or React cache):**
```typescript
// Option A: Add revalidation time to Next.js fetch
// Option B: Use SWR for client-side caching
import useSWR from 'swr'

const { data } = useSWR('community-incidents', 
  () => supabase.from('incidents').select(...).limit(50),
  { refreshInterval: 30000 } // refresh every 30s instead of every load
)
```

---

### 🟡 HIGH — H3: Anon Key Exposed in Frontend (PWA)

**Severity: HIGH (security)**  
**Measured: NO** (code inspection)

`assets/js/supabase-config.js`:
```javascript
const SUPABASE_CONFIG = {
  url: 'https://esvbibxavfrxkkfujhmz.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // ← visible in source
};
```

The anon key is also embedded in `index.html` in the ES module script block. This is unavoidable for a client-side SPA — the anon key is designed to be public — but RLS policies **must be correct** to prevent data exposure. The current RLS recursion bug (C2) makes this more dangerous.

**Mitigation (not a fix):** Ensure RLS policies are correct and restrictive. The anon key itself being public is by design for Supabase.

---

### 🟡 HIGH — H4: Missing Index on `incidents.status`

**Severity: HIGH**  
**Measured: NO** (code inspection)

The community dashboard filters by multiple statuses client-side after fetching 50 records. While the schema has `idx_incidents_status`, the community query fetches all statuses and filters in JavaScript — this is fine for 50 records but will degrade as the incidents table grows.

**Current schema indexes (from schema.sql):**
```sql
CREATE INDEX idx_incidents_status      ON incidents(status);
CREATE INDEX idx_incidents_category    ON incidents(category);
CREATE INDEX idx_incidents_created_at  ON incidents(created_at DESC);
CREATE INDEX idx_incidents_reference_number ON incidents(reference_number);
```
Indexes exist. ✅ No action needed currently.

---

### 🟠 MEDIUM — M1: N+1 Risk in Dashboard Auth Check

**Severity: MEDIUM**  
**Measured: NO** (code inspection)

`dashboard/page.tsx` makes two sequential Supabase calls on every load:
```typescript
// Call 1: Get user
const { data: { user } } = await supabase.auth.getUser()
// Call 2: Get profile (sequential, not parallel)
const { data: profileData } = await supabase
  .from('profiles').select('*').eq('id', user.id).single()
// Call 3: Get all incidents (after profile loads)
const { data } = await supabase.from('incidents').select('*')...
```

Three sequential round trips on every dashboard load. At 100 concurrent staff users (unlikely but possible), this triples connection usage.

**Fix:** Parallelize independent calls:
```typescript
const [{ data: profileData }, { data: incidents }] = await Promise.all([
  supabase.from('profiles').select('*').eq('id', user.id).single(),
  supabase.from('incidents').select('id, reference_number, title...').order('created_at', { ascending: false })
])
```

---

### 🟠 MEDIUM — M2: No Connection Timeout in PWA

**Severity: MEDIUM**  
**Measured: NO** (code inspection)

The PWA's `auth-manager.js` and all Supabase calls have no timeout configuration:
```javascript
const { data, error } = await this.supabase
  .from('profiles')
  .select('*')
  .eq('id', this.currentUser.id)
  .single();
// ← no timeout — can hang indefinitely if Supabase is slow
```

Under connection pool exhaustion, these calls will hang, blocking the UI indefinitely.

**Fix:**
```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);
const { data, error } = await this.supabase
  .from('profiles')
  .select('id, email, full_name, phone_number')
  .eq('id', this.currentUser.id)
  .single()
  .abortSignal(controller.signal);
clearTimeout(timeout);
```

---

### 🟡 LOW — L1: health_service_requests INSERT Policy Too Open

**Severity: LOW**  
**Measured: NO** (code inspection)

```sql
CREATE POLICY "Anyone can submit health service requests"
  ON health_service_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

`WITH CHECK (true)` allows any anonymous user to insert with no validation at the database level. This enables spam/abuse. A bot could flood the table.

**Mitigation:** Add rate limiting at the application layer, or add a `WITH CHECK` that validates required fields.

---

## PART 3 — FRONTEND & VERCEL AUDIT
*(Code inspection)*

### 🔴 CRITICAL — C3: Single 3,193-line index.html

**Severity: CRITICAL (performance)**  
**Measured: NO** (code inspection)

The entire PWA is one HTML file with:
- ~400 Bible verses embedded as a JavaScript array
- All 24 barangay cards with full text descriptions
- 8-slide hero slideshow HTML
- All tourism content
- All page content

**Estimated initial HTML size: ~350KB uncompressed**

Vercel compresses with gzip, reducing this to ~80–100KB. But the browser still parses 3,193 lines of HTML on every cold start.

**Impact at 100 users:** Each user downloads and parses this file. With a Service Worker and Vercel CDN, repeat visits are cached — only first visits are heavy.

**Partial fix (quick):** The 400-verse array alone is ~25KB. Move it to a separate JSON file loaded lazily.

---

### 🟡 HIGH — H5: Google Fonts Block Rendering

**Severity: HIGH**  
**Measured: NO** (code inspection)

`app.css` line 1:
```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
```

CSS `@import` is render-blocking. The page cannot render until Google Fonts loads. On slow connections (common in Bago City), this adds 200–500ms to every first load.

**Fix:**
```html
<!-- In <head>, use <link rel="preconnect"> + <link rel="preload"> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" 
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Inter:wght@400;600&display=swap"
  onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">
</noscript>
```

---

### 🟡 HIGH — H6: Tourism Video (36MB) Not Served via CDN

**Severity: HIGH**  
**Measured: NO** (code inspection)

`assets/videos/tourism-video.mp4` is 36MB served from Vercel. Vercel serves static files but does **not** do adaptive bitrate streaming like a CDN video service.

At 100 users, 10 watching the video simultaneously = 360MB of bandwidth from a single Vercel deployment.

**Current risk:** Vercel Free plan has a 100GB/month bandwidth limit. The 36MB video could eat into this quickly.

**Fix options (ranked):**
1. YouTube embed (already in vercel.json CSP — blocked by YouTube's embed restrictions on some configs)
2. Bunny.net video CDN (free tier, purpose-built for video)
3. Cloudflare R2 + Stream (free tier)

---

### 🟠 MEDIUM — M3: app.css is 4,900+ Lines, No Minification

**Severity: MEDIUM**  
**Measured: NO** (code inspection)

The CSS file has significant duplication — the same classes are defined multiple times (observed `search-row`, `services-grid`, `.search-box` etc. defined 2x in the file from earlier migration layers). No minification is applied.

**Estimated savings from deduplication + minification: ~30%**

---

### 🟠 MEDIUM — M4: No Image Optimization on Tourist Spot Photos

**Severity: MEDIUM**  
**Measured: NO** (code inspection)

Tourist spot images (`st-john.jpg`, `kipot-twin-falls.jpg` etc.) are raw JPEGs served without:
- WebP conversion
- Responsive sizes (`srcset`)
- Lazy loading (most have `loading="lazy"` ✅ — good)
- Width/height attributes (causes layout shift)

**Fix:** Add `width` and `height` attributes to prevent CLS, and consider converting to WebP.

---

### 🟢 GOOD — Service Worker Implementation

**Severity: N/A (positive finding)**

The Service Worker correctly:
- Uses Network-first for `index.html` (always fresh) ✅
- Caches static assets with version-busting via build script ✅
- Handles offline gracefully with `offline.html` ✅
- Uses `skipWaiting` for instant updates ✅
- Shows update banner to users when new version available ✅

---

### 🟢 GOOD — Vercel Security Headers

The `vercel.json` CSP is well-configured:
- `X-Frame-Options: DENY` ✅
- `Strict-Transport-Security` ✅
- `X-Content-Type-Options: nosniff` ✅
- `Content-Security-Policy` properly configured ✅

---

## PART 4 — BAGO SAFE (NEXT.JS) SPECIFIC AUDIT

### 🟡 HIGH — H7: `typescript: { ignoreBuildErrors: true }` in next.config

**Severity: HIGH**  
**Measured: NO** (code inspection)

`next.config.ts`:
```typescript
typescript: { ignoreBuildErrors: true },
eslint: { ignoreDuringBuilds: true }
```

TypeScript errors are silently ignored during builds. This means broken type safety could ship to production undetected.

**Fix:** Remove these flags and fix any TypeScript errors properly.

---

### 🟠 MEDIUM — M5: Leaflet Map Cold Start

**Severity: MEDIUM**  
**Measured: NO** (code inspection)

The dashboard map uses `dynamic()` with `ssr: false` which is correct, but Leaflet and react-leaflet combined add ~200KB to the client bundle. First map load will be slow on mobile.

**Current state:** Handled correctly with dynamic import ✅  
**Improvement:** Add `loading` state with skeleton map placeholder (already implemented ✅).

---

### 🟠 MEDIUM — M6: No Pagination on Incidents Dashboard

**Severity: MEDIUM**  
**Measured: NO** (code inspection)

```typescript
const { data } = await supabase
  .from('incidents')
  .select('*')
  .order('created_at', { ascending: false })
// ← no .limit() on the dashboard query!
```

The staff dashboard fetches ALL incidents with no limit. As the incidents table grows (1,000, 10,000 records), this query will become slower and return increasingly large payloads.

**Fix:** Add `.limit(100)` and implement pagination or infinite scroll.

---

## PART 5 — SECURITY & RLS FINDINGS

### RLS Summary Table

| Table | Anon INSERT | Anon SELECT | Auth SELECT | Auth UPDATE | Notes |
|-------|-------------|-------------|-------------|-------------|-------|
| `profiles` | ❌ No | ❌ No | ✅ Own only | ✅ Own only | Recursion bug (C2) |
| `incidents` | ✅ Yes | ✅ Yes (all) | ✅ Yes | ✅ Staff only | Public SELECT is intentional |
| `incident_media` | ✅ Yes | ❌ Staff only | ✅ Staff only | N/A | Correct |
| `incident_updates` | ❌ No | ❌ Staff only | ✅ Staff only | N/A | Correct |
| `announcements` | ❌ No | ✅ Not expired | ✅ Yes | ✅ Supervisor+ | Correct |
| `health_service_requests` | ✅ Anon | ✅ All (concern) | ✅ All | ✅ Admin only | H1 above |

### 🟡 Data Exposure Concern

The `incidents` table has:
```sql
CREATE POLICY "Public can view incident by reference number"
  ON incidents FOR SELECT USING (true);  -- ← everyone sees everything
```

This means `reporter_contact` (phone/email) and `reporter_name` are publicly readable via the REST API. The community dashboard only selects safe fields, but a direct API call to `/rest/v1/incidents?select=*` returns PII.

**Fix:**
```sql
-- Replace open SELECT policy with column-level security
-- Or use a database view that excludes PII for anon access
CREATE VIEW public_incidents AS
  SELECT reference_number, category, severity, title,
         barangay, address_text, status, created_at
  FROM incidents;

-- Grant anon access to view only
GRANT SELECT ON public_incidents TO anon;
```

---

## PART 6 — LOAD TESTING RESULTS

> **Status: NOT YET RUN**  
> Performance tests are set up and ready. Run in this order:
> 1. `smoke-test.js` — verify endpoints are up
> 2. `baseline-test.js` — establish benchmarks (5 VUs)
> 3. `load-test.js` — progressive to 50 VUs
> 4. `soak-test.js` — 25 VUs for 30 min
> 5. `stress-test.js` — 75-100 VUs (staging only, manual approval)

Expected results based on architecture analysis:

| Stage | VUs | Expected p95 | Expected Error Rate |
|-------|-----|-------------|---------------------|
| Smoke | 1 | < 500ms | 0% |
| Baseline | 5 | < 300ms | < 0.1% |
| Normal | 25 | < 500ms | < 0.5% |
| Elevated | 50 | < 800ms | < 1% |
| Stress | 75 | 1–3s | 2–5% (pool pressure) |
| Max | 100 | > 3s likely | 5–10% (pool exhaustion) |

---

## PART 7 — PRODUCTION READINESS ASSESSMENT

### Can it handle 100 simultaneous users TODAY?

| Component | 100-User Ready? | Bottleneck |
|-----------|----------------|------------|
| Vercel CDN (static assets) | ✅ YES | No bottleneck |
| Vercel Edge (Bago Safe SSR) | ✅ YES | Minor cold starts |
| Supabase auth sessions | ⚠️ PARTIAL | 60-connection pool |
| Supabase reads (incidents) | ❌ NO | Pool exhaustion at ~60 concurrent |
| Supabase writes (reports) | ⚠️ PARTIAL | Slower under load |
| RLS policy performance | ❌ NO | Recursion bug causing 500s |
| Tourism video (36MB) | ⚠️ PARTIAL | Bandwidth, not connection |

**Overall verdict: NOT READY** — 2 critical fixes required first (C1 + C2).

---

## PART 8 — OPTIMIZATION PLAN (PRIORITIZED)

### Phase 1 — Critical Fixes (Do Immediately, ~2 hours)

| # | Fix | File | Effort |
|---|-----|------|--------|
| 1 | **Fix RLS recursion** on `profiles` table | Run `fix-profiles-rls.sql` in Supabase | 5 min |
| 2 | **Add `.limit(100)`** to dashboard incidents query | `dashboard/page.tsx` line ~115 | 2 min |
| 3 | **Add AbortSignal timeout** to all Supabase calls in PWA | `auth-manager.js` | 20 min |
| 4 | **Change `SELECT *`** to explicit columns on dashboard | `dashboard/page.tsx` | 5 min |

### Phase 2 — High Priority (~3 hours)

| # | Fix | Effort |
|---|-----|--------|
| 5 | Add 30-second client-side cache to community dashboard | 30 min |
| 6 | Parallelize auth + profile + incidents fetches in dashboard | 20 min |
| 7 | Move Bible verses array to lazy-loaded JSON file | 15 min |
| 8 | Fix Google Fonts `@import` → `<link rel="preload">` | 10 min |
| 9 | Restrict `incidents` SELECT to exclude PII columns for anon | 20 min (SQL) |

### Phase 3 — Medium Priority (~4 hours)

| # | Fix | Effort |
|---|-----|--------|
| 10 | Deduplicate app.css (remove duplicate class definitions) | 1 hour |
| 11 | Add pagination to Bago Safe dashboard | 1 hour |
| 12 | Host tourism video on Bunny.net or YouTube embed | 30 min |
| 13 | Remove `ignoreBuildErrors: true` from next.config.ts | 30 min + fix errors |

### Phase 4 — Infrastructure (When Budget Allows)

| # | Fix | Cost |
|---|-----|------|
| 14 | Upgrade Supabase to Pro plan | $25/month → 200+ connections |
| 15 | Add Supabase read replicas | Pro plan required |
| 16 | Implement edge caching for community feed | Vercel Edge Config |

---

## APPENDIX A — Findings Summary

| ID | Severity | Title | Measured | Fixed |
|----|---------|-------|----------|-------|
| C1 | 🔴 CRITICAL | Supabase 60-connection pool bottleneck | Inspection | No |
| C2 | 🔴 CRITICAL | RLS infinite recursion on profiles | Inspection | No (SQL ready) |
| C3 | 🔴 CRITICAL | 3,193-line single HTML file | Inspection | No |
| H1 | 🟡 HIGH | SELECT * in dashboard | Inspection | No |
| H2 | 🟡 HIGH | No query caching on community dashboard | Inspection | No |
| H3 | 🟡 HIGH | Anon key in frontend (by design) | Inspection | N/A |
| H4 | 🟡 HIGH | Missing indexes (already exist) | Inspection | ✅ |
| H5 | 🟡 HIGH | Google Fonts render-blocking | Inspection | No |
| H6 | 🟡 HIGH | 36MB video not on video CDN | Inspection | No |
| H7 | 🟡 HIGH | TypeScript errors ignored in builds | Inspection | No |
| M1 | 🟠 MEDIUM | N+1 auth check on dashboard | Inspection | No |
| M2 | 🟠 MEDIUM | No Supabase query timeouts | Inspection | No |
| M3 | 🟠 MEDIUM | CSS duplication, no minification | Inspection | No |
| M4 | 🟠 MEDIUM | No image optimization | Inspection | No |
| M5 | 🟠 MEDIUM | Leaflet bundle size | Inspection | Partial (dynamic import) |
| M6 | 🟠 MEDIUM | No pagination on incidents | Inspection | No |
| L1 | 🟢 LOW | Health requests INSERT too permissive | Inspection | No |

---

## APPENDIX B — What Works Well

- ✅ Service Worker with network-first strategy
- ✅ Vercel CDN for all static assets (PWA will scale to 1,000+ for reads)
- ✅ Dynamic import for Leaflet (prevents SSR issues)
- ✅ Proper `loading="lazy"` on most images
- ✅ Strong CSP headers in vercel.json
- ✅ HSTS and X-Frame-Options configured
- ✅ Supabase middleware protecting `/dashboard` and `/staff` routes
- ✅ Reference number generation with uniqueness check
- ✅ Proper `preload="metadata"` on video elements
- ✅ Touch swipe support on slideshow (reduces tap target requirements)
- ✅ Barangay profile pages use proper index-based routing
- ✅ RLS enabled on all tables

---

*Report generated by code inspection only. Run the k6 test suite in `performance-tests/scripts/` to get measured latency numbers.*
