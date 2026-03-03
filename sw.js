// Service Worker for 1% Daily PWA
// Caching strategy updated to save bandwidth

const CACHE_NAME = '1percent-daily-v2';

const STATIC_ASSETS = [
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/sw.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                ...STATIC_ASSETS
            ]);
        })
    );
    self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const isStatic = STATIC_ASSETS.some(asset => url.pathname.endsWith(asset));

    if (isStatic) {
        // Cache-First strategy for static assets
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((response) => {
                    // Add 1-year cache headers as requested
                    const headers = new Headers(response.headers);
                    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

                    const newResponse = new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: headers
                    });

                    const clone = newResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                    return newResponse;
                });
            })
        );
    } else {
        // Network-first for index.html and other dynamic requests
        event.respondWith(
            fetch(event.request)
                .then((response) => {
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
    }
});
