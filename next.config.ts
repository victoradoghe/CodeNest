import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder. Without it Turbopack walks up and
  // finds the lockfile in the home directory, then warns about inferring a
  // root that would include everything above the project.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },

  // Type errors fail the build by default in Next 16; `pnpm typecheck` and
  // `pnpm lint` run the same checks explicitly during development.
  async headers() {
    return [
      {
        // The Pyodide runtime is content-addressed by version and never edited
        // in place, so it is safe to cache hard. This is what makes the second
        // visit instant — and what lets the app work with no network at all.
        source: "/pyodide/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/py-worker.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      {
        // The service worker and its generated precache list must never be
        // served stale: a cached copy of either would pin returning visitors to
        // an old build whose hashed assets no longer exist.
        source: "/:file(sw.js|sw-precache.js)",
        headers: [
          { key: "Cache-Control", value: "no-cache, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
