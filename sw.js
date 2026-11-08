// 🏛️ 꿈바온 디지털도서관(꿈디도) PWA Service Worker v1.0
const CACHE_NAME = 'kkumdido-pwa-v1';
const CORE_ASSETS = [
  './index.html',
  './kkumdido_encyclopedia.html',
  './kkumdido_sermon_ai_studio.html',
  './kkumdido_pastoral_secretary_studio.html',
  './kkumdido_church_support_annex.html',
  './manifest.json',
  './assets/icons/kkumdido_icon_192.png',
  './assets/icons/kkumdido_icon_512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
