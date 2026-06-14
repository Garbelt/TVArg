const CACHE_NAME = "tvarg-cache-v1";

// Archivos básicos a cachear (solo UI, NO streams)
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// INSTALL
self.addEventListener("install", event => {
  console.log("TVArg SW instalado");

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ACTIVATE
self.addEventListener("activate", event => {
  console.log("TVArg SW activado");

  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      });
    })
  );
});

// FETCH (estrategia híbrida segura)
self.addEventListener("fetch", event => {
  const url = event.request.url;

  // ❌ NO cachear streams (MUY IMPORTANTE para tu app)
  if (
    url.includes(".m3u8") ||
    url.includes("youtube") ||
    url.includes("googlevideo") ||
    url.includes("akamaized")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // ✔ Cache-first para assets locales
  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request).then(response => {
          // Guardar solo respuestas válidas
          if (
            event.request.method === "GET" &&
            response &&
            response.status === 200
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
      );
    })
  );
});

