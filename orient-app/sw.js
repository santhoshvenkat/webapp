const CACHE = 'orient-v1';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './assets/icon.svg',
  './manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    // App shell: cache-first
    e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
    return;
  }
  // Weather APIs: network-first with cache fallback
  if (/open-meteo|ipapi|bigdatacloud/.test(url.hostname)) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
  }
});