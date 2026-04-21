/* eslint-disable no-restricted-globals */
/**
 * Minimal service worker — caches shell + sermons list for offline resilience.
 * Registered from components/pwa-register.tsx (no extra PWA libraries).
 * Tune cache names when deploying breaking changes.
 */
const CACHE = "cosc-v1";
const PRECACHE = ["/", "/sermons"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for navigations; cache sermons list as stale-while-revalidate
  if (url.pathname === "/sermons") {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached ?? networkPromise;
      }),
    );
    return;
  }

  if (url.pathname === "/") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/") ?? Promise.reject()),
    );
  }
});
