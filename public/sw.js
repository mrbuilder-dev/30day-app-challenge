// LocalBeam Service Worker for PWA installability & offline caching
const CACHE_NAME = 'localbeam-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './favicon.svg',
        './pwa-192.png',
        './pwa-512.png',
        './manifest.json'
      ]).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let network handle WebRTC & live traffic; fallback to cache for offline static shell
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
