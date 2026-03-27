const CACHE_NAME = 'mmm-samaniego-v9';

const urlsToCache = [
  '/tesoreria-samaniego/',
  '/tesoreria-samaniego/index.html',
  '/tesoreria-samaniego/style.css',
  '/tesoreria-samaniego/script.js',
  '/tesoreria-samaniego/manifest.json',
  '/tesoreria-samaniego/logo.png',

  '/tesoreria-samaniego/libs/all.min.css',
  '/tesoreria-samaniego/libs/jspdf.umd.min.js',
  '/tesoreria-samaniego/libs/jspdf.plugin.autotable.min.js',
  '/tesoreria-samaniego/libs/xlsx.full.min.js'

  // ⚠️ SOLO si existe realmente:
  // '/tesoreria-samaniego/libs/webfonts/fa-solid-900.woff2'
];

// INSTALL
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('Error cacheando:', err))
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request)
      .then(res => res || fetch(e.request))
      .catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('/tesoreria-samaniego/index.html');
        }
      })
  );
});