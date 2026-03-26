const CACHE_NAME = 'mmm-samaniego-v7';

const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './logo.png',
  './libs/all.min.css',
  './libs/jspdf.umd.min.js',
  './libs/jspdf.plugin.autotable.min.js',
  './libs/xlsx.full.min.js',

  // LIBRERÍAS LOCALES
  './libs/all.min.css',
  './libs/jspdf.umd.min.js',
  './libs/jspdf.plugin.autotable.min.js',
  './libs/xlsx.full.min.js',

  // FONT AWESOME
  './libs/webfonts/fa-solid-900.woff2'
];
// INSTALACIÓN
// INSTALACIÓN SEGURA
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const asset of assets) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('No se pudo cachear:', asset);
        }
      }
    })
  );
  self.skipWaiting();
});

// ACTIVACIÓN
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH (robusto offline)
self.addEventListener('fetch', e => {

  // 🔴 SOLUCIÓN CLAVE: ignorar requests inválidos (extensiones, chrome://, etc)
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request)
      .then(res => {
        if (res) return res;

        return fetch(e.request)
          .then(networkRes => {

            // ⚠ evitar guardar respuestas inválidas
            if (!networkRes || networkRes.status !== 200 || networkRes.type !== 'basic') {
              return networkRes;
            }

            return caches.open(CACHE_NAME).then(cache => {
              cache.put(e.request, networkRes.clone());
              return networkRes;
            });
          })
          .catch(() => {
            if (e.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});