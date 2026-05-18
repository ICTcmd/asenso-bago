// Asenso Bago — Service Worker
const CACHE = 'asenso-bago-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/home.html',
  '/programs.html',
  '/news.html',
  '/services.html',
  '/profile.html',
  '/assets/css/app.css',
  '/assets/js/app.js',
  '/assets/images/bago-city-logo.png',
  '/assets/images/hw-logo.png',
  '/assets/images/hw-cover.png',
  '/assets/images/wol-logo.png',
  '/assets/images/wol-cover.png',
  '/assets/images/sbb-logo.png',
  '/assets/images/sbb-cover.png',
  '/manifest.json',
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache first, network fallback
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('/index.html')))
  );
});
