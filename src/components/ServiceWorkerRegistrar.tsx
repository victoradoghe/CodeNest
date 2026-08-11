"use client";

import { useEffect } from "react";

/**
 * Registers the offline service worker.
 *
 * Development is deliberately excluded: a worker caching Next.js's dev assets
 * fights with hot reloading and produces stale, confusing pages. Offline
 * support is a property of the production build, and `pnpm verify:offline`
 * checks it there.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    // Registering after load keeps the precache download — which includes every
    // lesson page — from competing with the assets of the page being read.
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Unsupported, blocked by browser settings, or served over plain HTTP
        // from a non-localhost origin. The site still works; it just will not
        // survive going offline.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
