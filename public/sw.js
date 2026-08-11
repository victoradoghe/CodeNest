/* eslint-disable */
/**
 * Offline service worker.
 *
 * The course promises that it keeps working with the network off. HTTP cache
 * headers alone cannot deliver that: a reload with no connection never reaches
 * the server, and navigating to a lesson the learner has not opened before has
 * nothing to fall back on. This worker is what closes that gap.
 *
 * What it holds
 *   shell   every page of the course plus the hashed JS/CSS Next.js needs to
 *           hydrate them — precached on install, so even an unvisited lesson
 *           works offline
 *   python  the Pyodide runtime (~12 MB), cached the first time it is actually
 *           requested rather than eagerly, so a first visit stays light
 *   rsc     Next.js client-navigation payloads, cached as they are fetched
 *
 * Cache names carry a build hash (see scripts/generate-sw-precache.mjs), so a
 * new deploy installs alongside the old one and then evicts it on activate.
 */

// Generated at build time: __SW_VERSION, __PYODIDE_VERSION, __SW_ROUTES, __SW_ASSETS.
try {
  importScripts("/sw-precache.js");
} catch (err) {
  // Missing only when someone loads the worker from a tree that was never
  // built. Fall back to caching opportunistically rather than failing install.
}

const BUILD = self.__SW_VERSION || "dev";
const PYODIDE_VERSION = self.__PYODIDE_VERSION || "dev";
const ROUTES = self.__SW_ROUTES || ["/"];
const ASSETS = self.__SW_ASSETS || [];

const SHELL_CACHE = `codenest-shell-${BUILD}`;
const RSC_CACHE = `codenest-rsc-${BUILD}`;
/** Deliberately not keyed on the build — see the generator for why. */
const PYTHON_CACHE = `codenest-python-${PYODIDE_VERSION}`;

const CURRENT_CACHES = [SHELL_CACHE, RSC_CACHE, PYTHON_CACHE];

/** The worker script is served from /py-worker.js and changes with the app. */
const EXTRA_SHELL = ["/py-worker.js", "/manifest.webmanifest"];

// ------------------------------------------------------------------ install

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      const urls = [...ROUTES, ...ASSETS, ...EXTRA_SHELL];

      // Each URL is fetched independently. cache.addAll() would reject the whole
      // install if a single request failed, leaving the learner with no offline
      // support at all — one missing file is not worth that.
      await Promise.all(
        urls.map(async (url) => {
          try {
            // Bypass the HTTP cache so the precache matches this exact build.
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await cache.put(url, response);
          } catch (err) {
            // Offline or transient failure; the runtime handlers below will
            // pick this URL up the next time it is requested.
          }
        }),
      );

      // Take over as soon as the new build is cached rather than waiting for
      // every tab to close.
      await self.skipWaiting();
    })(),
  );
});

// ----------------------------------------------------------------- activate

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) =>
              !CURRENT_CACHES.includes(name) &&
              (name.startsWith("codenest-") || name.startsWith("travis-")),
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

// ---------------------------------------------------------------- strategies

/** Immutable assets: serve from cache, only touch the network on a miss. */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  // Range requests come back as 206 and must never be cached as if complete.
  if (response.ok && response.status === 200) {
    cache.put(request, response.clone());
  }
  return response;
}

/** Fresh when online, cached when not. Used for pages. */
async function networkFirst(request, cacheName, { ignoreSearch = false } = {}) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const hit = await cache.match(request, { ignoreSearch });
    if (hit) return hit;
    throw err;
  }
}

/** Serve cached immediately, refresh in the background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);

  const refresh = fetch(request)
    .then((response) => {
      if (response.ok && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (hit) return hit;

  const response = await refresh;
  if (response) return response;
  throw new Error("offline and not cached");
}

/**
 * Page navigations. Falls back to the cached copy, and finally to the course
 * outline — a learner who is offline should land somewhere useful rather than
 * on the browser's dinosaur.
 */
async function handleNavigation(request) {
  try {
    return await networkFirst(request, SHELL_CACHE, { ignoreSearch: true });
  } catch (err) {
    const cache = await caches.open(SHELL_CACHE);
    return (
      (await cache.match(request, { ignoreSearch: true })) ||
      (await cache.match("/learn")) ||
      (await cache.match("/")) ||
      new Response(
        "<!doctype html><meta charset=utf-8><title>Offline</title>" +
          "<p style='font:16px system-ui;padding:2rem'>This page has not been saved for offline use yet. " +
          "Reconnect once and it will be available from then on.",
        { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
      )
    );
  }
}

// ------------------------------------------------------------------- routing

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Never interfere with writes, or with other origins.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // The Python runtime: large, immutable for a given Pyodide version, and the
  // single most important thing to have locally.
  if (url.pathname.startsWith("/pyodide/")) {
    event.respondWith(cacheFirst(request, PYTHON_CACHE));
    return;
  }

  // Content-hashed build output — safe to serve from cache forever.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Client-side navigation payloads. These carry a cache-busting ?_rsc= query,
  // so they are kept in their own cache: matching them loosely against the
  // shell would hand the router an HTML document and break the navigation.
  if (url.searchParams.has("_rsc")) {
    event.respondWith(networkFirst(request, RSC_CACHE, { ignoreSearch: true }));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
});

// ------------------------------------------------------------------ messages

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
