// Service Worker for 1% Daily PWA
// Minimal SW to satisfy Chrome's installability requirements

const CACHE_NAME = '1percent-daily-v1';

// Install event — cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/manifest.json',
                '/icon-192.png',
                '/icon-512.png'
            ]);
        })
    );
    self.skipWaiting();
});

// Activate event — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch event — network-first strategy (always try fresh content)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone and cache the fresh response
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clone);
                });
                return response;
            })
            .catch(() => {
                // Fallback to cache if offline
                return caches.match(event.request);
            })
    );
});
