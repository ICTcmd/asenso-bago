// Asenso Bago Service Worker (__CACHE_VERSION__ replaced by build.js on Vercel deploy)
const CACHE = 'bago-pwa-__CACHE_VERSION__';
const IMAGE_CACHE = 'bago-images-v1';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/map.html',
  '/offline.html',
  '/manifest.json',
  '/assets/css/app.css',
  '/assets/css/mobile-fixes.css',
  '/assets/js/utils.js',
  '/assets/js/supabase-config.js',
  '/assets/js/auth-manager.js',
  '/assets/js/profile-manager.js',
  '/assets/js/health-request.js',
  '/assets/js/chatbot.js',
  '/health-request.html',
  '/health-track.html',
  '/health-success.html',
  '/assets/data/bible-verses.json',
  '/assets/images/app-icon.png',
  '/assets/images/bago-city-logo.png',
  '/assets/images/May%20Gugma%20Nga%20Panghimanwa%20Logo%20Final.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(
        CORE_ASSETS.map(url =>
          fetch(url, { cache: 'no-cache' })
            .then(res => (res && res.ok ? cache.put(url, res) : null))
            .catch(() => null)
        )
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE && k !== IMAGE_CACHE && k !== 'external-images-v1')
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Stale-While-Revalidate helper (instant cached response + background refresh)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: false });

  const networkPromise = fetch(request)
    .then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        cache.put(request, res.clone());
      }
      return res;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkRes = await networkPromise;
  if (networkRes) return networkRes;

  // Fallback without query string if versioned asset wasn't matched
  const fallback = await cache.match(request, { ignoreSearch: true });
  return fallback || Response.error();
}

// Cache-First helper for static images
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const res = await fetch(request);
    if (res && (res.status === 200 || res.type === 'opaque')) {
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return Response.error();
  }
}

// Network-First helper for HTML navigations
async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res && res.status === 200 && res.type === 'basic') {
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const offline = await cache.match('/offline.html');
    return offline || Response.error();
  }
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Cache external Unsplash images for offline use
  if (url.hostname === 'images.unsplash.com') {
    e.respondWith(cacheFirst(e.request, 'external-images-v1'));
    return;
  }

  // Never intercept cross-origin APIs (Supabase, Groq, Mapbox, Facebook, CDNs)
  if (url.origin !== self.location.origin) return;

  // Never cache serverless API endpoints or Range requests (videos)
  if (url.pathname.startsWith('/api/') || e.request.headers.has('range')) return;
  if (url.pathname.endsWith('.mp4') || url.pathname.endsWith('.webm')) return;

  // HTML navigations: Network-first with offline fallback
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    e.respondWith(networkFirstNavigation(e.request));
    return;
  }

  // Static images: Cache-first
  if (url.pathname.startsWith('/assets/images/')) {
    e.respondWith(cacheFirst(e.request, IMAGE_CACHE));
    return;
  }

  // CSS, JS, and JSON data: Stale-While-Revalidate for fast repeat loads + fresh updates
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.json')) {
    e.respondWith(staleWhileRevalidate(e.request, CACHE));
    return;
  }

  // Other same-origin GET requests: Network-first with cache fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(e.request);
        return cached || Response.error();
      })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
