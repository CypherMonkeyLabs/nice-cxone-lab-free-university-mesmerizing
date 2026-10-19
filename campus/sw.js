const CACHE = "cxone-lab-v12";
const SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./favicon.ico",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./assets/app.css",
  "./assets/university.css",
  "./assets/wow.css",
  "./assets/phone.css",
  "./assets/kit.css",
  "./assets/dragbot.css",
  "./shared/cxbot-chat/engine.js",
  "./shared/cxbot-chat/ui.js",
  "./shared/cxbot-chat/chat.css",
  "./data/cxbot-index.json",
  "./data/manifest.json",
  "./data/atlas.json",
  "./data/guide-kb.json",
  "./js/app.js",
  "./js/guide.mjs",
  "./js/sources.mjs",
  "./js/callflow.mjs",
  "./js/model.mjs",
  "./js/dragbot.mjs",
  "./js/tour.mjs",
  "./data/boss.json",
  "./data/glossary.json",
  "./data/interview.json",
  "./data/tracks/acd.json",
  "./data/tracks/apis.json",
  "./data/tracks/crm.json",
  "./data/tracks/cti-cpaas.json",
  "./data/tracks/digital.json",
  "./data/tracks/eco-map.json",
  "./data/tracks/ecosystem.json",
  "./data/tracks/enlighten.json",
  "./data/tracks/foundations.json",
  "./data/tracks/ivr.json",
  "./data/tracks/migration.json",
  "./data/tracks/people.json",
  "./data/tracks/platform.json",
  "./data/tracks/qm-ia.json",
  "./data/tracks/quality.json",
  "./data/tracks/routing.json",
  "./data/tracks/skills-acd.json",
  "./data/tracks/studio.json",
  "./data/tracks/voice.json",
  "./data/tracks/wfm-day.json",
  "./data/tracks/wfm.json",
  "./js/charts.mjs",
  "./js/diagrams.mjs",
  "./js/effects.mjs",
  "./js/hero-scene.mjs",
  "./js/i18n.mjs",
  "./js/icon-scenes.mjs",
  "./js/icons.mjs",
  "./js/kit.mjs",
  "./js/lightbox.mjs",
  "./js/pixel.mjs",
  "./js/topology.js",
  "./js/university.mjs",
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
          const offline = await cache.match("./offline.html");
          if (offline) return offline;
          const home = await cache.match("./index.html");
          if (home) return home;
        }
        throw error;
      }
    })()
  );
});
