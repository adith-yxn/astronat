// sw.js — AstroNat offline cache + network-first for live API
const CACHE_NAME = "astronat-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./favicon.svg"
];

// Install: cache core assets
self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API; cache-first for local assets
self.addEventListener("fetch", evt => {
  const req = evt.request;
  const url = new URL(req.url);

  // Network-first for Spaceflight News API to keep news fresh
  if (url.hostname.includes("spaceflightnewsapi")) {
    evt.respondWith(
      fetch(req)
        .then(res => {
          // store a copy in cache for offline fallback
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first for local assets (fast shell)
  evt.respondWith(
    caches.match(req).then(hit => hit || fetch(req).catch(() => caches.match("./")))
  );
});

// Message listener for skipWaiting / manual cache clear
self.addEventListener("message", evt => {
  if (evt.data === "skipWaiting") self.skipWaiting();
  if (evt.data === "clearCache") {
    caches.delete(CACHE_NAME);
  }
});
