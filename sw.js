// Service worker: tiene l'app in cache per usarla anche offline.
// Ad ogni aggiornamento dell'app va cambiata VERSION.
const VERSION = 'dieta-v1.1.0';

const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './js/app.js',
  './js/store.js',
  './js/ui.js',
  './js/data/foods.js',
  './js/data/substitutions.js',
  './js/data/plans/index.js',
  './js/data/plans/v1.js',
  './js/engine/checks.js',
  './js/engine/dates.js',
  './js/engine/pantry.js',
  './js/engine/plan.js',
  './js/engine/shopping.js',
  './js/engine/subs.js',
  './js/engine/units.js',
  './js/views/pantry.js',
  './js/views/settings.js',
  './js/views/sheets.js',
  './js/views/shop.js',
  './js/views/today.js',
  './js/views/week.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Rete prima (così gli aggiornamenti arrivano subito), cache se offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'))),
  );
});
