const CACHE_NAME = 'aminul-islam-v6';
const OFFLINE_URL = '/offline.html';
const NAVIGATION_TIMEOUT = 10000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([OFFLINE_URL, '/manifest.webmanifest'])
    )
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
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Application APIs must always go directly to the network. Never let the
  // service worker turn an API/network failure into a stale or fake response.
  if (url.pathname.startsWith('/api/')) return;

  // Let Next.js and the browser handle document navigation directly. The
  // service worker should never replace a failed page request with an offline
  // page while the app is online, because that can make the UI appear frozen.
  if (request.mode === 'navigate') return;

  // Cache only explicitly safe static assets. Failed static requests should
  // propagate normally rather than creating an unhandled promise in the SW.
  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && response.type !== 'opaque') {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // No cached response exists. Return a normal failed fetch response to the
    // browser instead of throwing from an unhandled service-worker promise.
    return new Response('', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
