const CACHE = "cxone-lab-v10";
const SHELL = [
  "./",
  "./index.html",
  "./assets/app.css",
  "./assets/university.css",
  "./assets/wow.css",
  "./assets/phone.css",
  "./assets/kit.css",
  "./js/tour.mjs",
  "./js/kit.mjs",
  "./js/dragbot.mjs",
  "./assets/dragbot.css",
  "./js/app.js",
  "./js/model.mjs",
  "./js/university.mjs",
  "./js/sources.mjs",
  "./js/diagrams.mjs",
  "./js/charts.mjs",
  "./js/effects.mjs",
  "./js/topology.js",
  "./js/hero-scene.mjs",
  "./js/icons.mjs",
  "./js/i18n.mjs",
  "./js/lightbox.mjs",
  "./js/icon-scenes.mjs",
  "./data/lesson-i18n.json",
  "./audio/use-the-floor.mp3",
  "./audio/share-the-floor.mp3",
  "./vendor/three.min.js",
  "./vendor/anime.esm.min.js",
  "./vendor/d3.min.js",
  "./vendor/rough.esm.js",
  "./vendor/confetti.module.mjs",
  "./vendor/markmap-view.js",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./favicon.ico",
  "./js/pixel.mjs",
  "./js/guide.mjs",
  "./data/guide-kb.json",
  "./data/manifest.json",
  "./data/atlas.json",
  "./downloads/index.html",
  "./downloads/cxone-offline-bundle.zip",
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
