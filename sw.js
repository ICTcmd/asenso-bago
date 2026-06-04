// Asenso Bago — Service Worker v20260526
// Version timestamp ensures cache busts on every deploy
const CACHE = 'asenso-bago-20260604-002';

const ASSETS = [
  '/',
  '/index.html',
  '/map.html',
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
  '/assets/images/sugar.png',
  '/assets/images/tan juan balay.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Network-first: always fetch fresh, cache as fallback
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Never cache map.html or index.html — always fetch fresh
  if (url.pathname === '/map.html' || url.pathname === '/index.html' || url.pathname === '/') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request)
        .then(cached => cached || (e.request.mode === 'navigate'
          ? caches.match('/offline.html') : null))
      )
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
