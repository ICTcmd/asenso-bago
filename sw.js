// Asenso Bago — Service Worker
// Single-page app: only index.html exists, not separate page files
const CACHE = 'asenso-bago-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/assets/css/app.css',
  '/assets/images/bago-city-logo.png',
  '/assets/images/hw-logo.png',
  '/assets/images/hw-cover.png',
  '/assets/images/wol-logo.png',
  '/assets/images/wol-cover.png',
  '/assets/images/sbb-logo.png',
  '/assets/images/sbb-cover.png',
];

// Install — pre-cache all real assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - Same-origin HTML/CSS/JS/images: cache-first, network fallback
// - External requests (program sites, Facebook): network-only
// - Failed navigation: serve index.html from cache (offline fallback)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET and external origins
  if (e.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request)
        .then(res => {
          // Cache successful same-origin responses
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => {
          // Offline fallback — serve offline page for navigation, cached asset otherwise
          if (e.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return caches.match(e.request);
        });
    })
  );
});

// Listen for SKIP_WAITING message from update notification
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
