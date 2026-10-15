const CACHE = "cxone-lab-v3";
const SHELL = [
  "./",
  "./index.html",
  "./assets/app.css",
  "./assets/university.css",
  "./js/app.js",
  "./js/model.mjs",
  "./js/university.mjs",
  "./js/diagrams.mjs",
  "./js/topology.js",
  "./manifest.webmanifest",
  "./data/manifest.json",
  "./data/atlas.json",
  "./downloads/index.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      } catch (error) {
        const cached = await cache.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const home = await cache.match("./index.html");
          if (home) return home;
        }
        throw error;
      }
    })()
  );
});
