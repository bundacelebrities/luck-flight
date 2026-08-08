// Luck Flight — offline cache
// Cache-first for app shell + gift images, so a shaky connection during a
// live stream doesn't leave the overlay blank or missing icons.

const CACHE_NAME = 'luck-flight-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  './gift/rose.webp',
  './gift/tiktok.webp',
  './gift/heartMe.webp',
  './gift/donut.webp',
  './gift/fingerHeart.webp',
  './gift/lion.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache what exists; don't fail install if one gift image is missing.
      return Promise.all(
        CORE_ASSETS.map((url) => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
