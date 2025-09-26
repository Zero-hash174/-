// توليد اسم الكاش ديناميكي باستخدام timestamp لتجنب الكاش القديم
const CACHE_NAME = 'wasfaty-cache-' + new Date().getTime();
const OFFLINE_URL = 'index.html';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './chaf.png'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch(err => console.error('[Service Worker] Precache failed:', err))
  );
  self.skipWaiting();
});

// Activate event - clean old caches and notify clients
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => {
      // Notify clients that a new SW is active
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage('SW_UPDATED'));
      });
    })
  );
  self.clients.claim();
});

// Fetch event - handle cache and network
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    // Same-origin: cache-first
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(OFFLINE_URL)))
    );
  } else {
    // Cross-origin: network-first
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
  }
});
