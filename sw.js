// Asenso Bago — Service Worker
// Cache version is auto-generated at deploy time via vercel.json headers
// Single-page app: only index.html exists, not separate page files
const CACHE = 'asenso-bago-__CACHE_VERSION__';
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
  '/assets/images/bantayan.jpg',
  '/assets/images/kipot.jpg',
  '/assets/images/1311-Bago-City-St.-John-the-Baptist-Parish.jpg',
  '/assets/images/Buenos_Aires_Mountain_Resort_in_Bago_City.jpg',
  '/assets/images/javellana mansion.jpg',
  '/assets/images/rafael salas.jpg',
  '/assets/images/sugar central.jpg',
  '/assets/images/tan juan balay.jpg',
];

// Install — pre-cache all real assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean up ALL old caches automatically
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - Same-origin HTML/CSS/JS/images: network-first, cache fallback
// - External requests: network-only
// - Failed navigation: serve offline page
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  if (e.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    // Network-first: always try to get fresh content
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Network failed — serve from cache
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          // Navigation fallback
          if (e.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Listen for SKIP_WAITING message from update notification
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
