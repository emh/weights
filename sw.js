const CACHE_NAME = "weights-static-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./main.js",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png"
];
const SHELL_DESTINATIONS = new Set(["document", "script", "style", "manifest"]);

function isCacheable(response) {
  return !!response && response.status === 200 && response.type === "basic";
}

async function putInCache(request, response) {
  if (!isCacheable(response)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

function isAppShellRequest(request) {
  return request.mode === "navigate" || SHELL_DESTINATIONS.has(request.destination);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("weights-static-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event && event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isAppShellRequest(request)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        await putInCache(request, response);
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const fallback = await caches.match("./index.html");
          if (fallback) return fallback;
        }
        throw new Error("Offline and no cached shell response.");
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    const networkPromise = fetch(request)
      .then(async (response) => {
        await putInCache(request, response);
        return response;
      })
      .catch(() => cached);

    return cached || networkPromise;
  })());
});
