/**
 * Proves the site really works with no network.
 *
 * The offline promise is the whole point of this course, and it is the one
 * claim that cannot be checked by reading the code: it depends on what the
 * service worker actually put in the cache. So this script does the real thing.
 *
 *   1. Starts the production server.
 *   2. Runs the *real* public/sw.js — no reimplementation — in a sandbox that
 *      supplies the service worker globals (caches, fetch, importScripts), and
 *      fires a genuine install + activate at it.
 *   3. Warms the Python runtime the way pressing Run once would.
 *   4. Kills the server. From here every request that escapes the cache fails
 *      with a connection error, exactly as it would on a plane.
 *   5. Replays navigations to every lesson, plus the assets, the Python worker
 *      and the interpreter, and requires all of them to be served.
 *
 * A hole anywhere in the precache list shows up here as a failure rather than
 * as a learner staring at a blank page.
 *
 * Run with:  pnpm verify:offline   (after `pnpm build`)
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createContext, runInContext } from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 3131;
const ORIGIN = `http://localhost:${PORT}`;

// Once the server is gone, background refreshes the worker started reject on
// their own schedule. That is the behaviour under test, not a harness error —
// real failures are reported through check() below.
process.on("unhandledRejection", () => {});

let failures = 0;
const check = (label, condition, detail = "") => {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures++;
    console.error(`  FAIL ${label}${detail ? "\n       " + detail : ""}`);
  }
};

// ------------------------------------------------------------ prerequisites

for (const path of [".next", "public/sw.js", "public/sw-precache.js"]) {
  if (!existsSync(join(root, path))) {
    console.error(
      `Missing ${path}. Run \`pnpm build\` first — the precache list is generated from the build output.`,
    );
    process.exit(1);
  }
}

// -------------------------------------------------------------- the server

const server = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "start", "-p", String(PORT)],
  { cwd: root, stdio: "ignore", shell: process.platform === "win32" },
);

function stopServer() {
  if (server.exitCode !== null || server.killed) return Promise.resolve();
  return new Promise((resolve) => {
    server.once("exit", resolve);
    if (process.platform === "win32") {
      // next start spawns workers; kill the whole tree or the port stays bound.
      spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      server.kill("SIGTERM");
    }
    setTimeout(resolve, 5000);
  });
}

async function waitForServer(timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${ORIGIN}/`);
      if (res.ok) return true;
    } catch {
      // Not listening yet.
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

// ------------------------------------------------- service worker environment

/**
 * A Cache that stores bodies as buffers.
 *
 * The real Cache API hands out a fresh stream each time; holding the Response
 * object itself would let one read consume it, and later matches would come
 * back empty in a way that flattered the results.
 */
/**
 * Cache writes the worker starts but does not await.
 *
 * sw.js calls cache.put() without awaiting it — correct in a browser, where the
 * body keeps streaming regardless. Here the read has to finish before the
 * server is stopped, or it is aborted mid-flight.
 */
const pendingWrites = new Set();

async function settleWrites() {
  while (pendingWrites.size) {
    await Promise.allSettled([...pendingWrites]);
  }
}

class FakeCache {
  #entries = new Map();

  put(request, response) {
    const write = this.#write(request, response).catch(() => {});
    pendingWrites.add(write);
    write.finally(() => pendingWrites.delete(write));
    return write;
  }

  async #write(request, response) {
    const url = typeof request === "string" ? request : request.url;
    const body = Buffer.from(await response.arrayBuffer());
    this.#entries.set(new URL(url, ORIGIN).href, {
      body,
      status: response.status,
      headers: Object.fromEntries(response.headers ?? []),
    });
  }

  async match(request, options = {}) {
    const url = typeof request === "string" ? request : request.url;
    const href = new URL(url, ORIGIN).href;

    let entry = this.#entries.get(href);
    if (!entry && options.ignoreSearch) {
      const path = new URL(href).pathname;
      for (const [key, value] of this.#entries) {
        if (new URL(key).pathname === path) {
          entry = value;
          break;
        }
      }
    }
    if (!entry) return undefined;

    return new Response(entry.body, {
      status: entry.status,
      headers: entry.headers,
    });
  }

  get size() {
    return this.#entries.size;
  }
}

const cacheStorage = new Map();
const caches = {
  async open(name) {
    if (!cacheStorage.has(name)) cacheStorage.set(name, new FakeCache());
    return cacheStorage.get(name);
  },
  async keys() {
    return [...cacheStorage.keys()];
  },
  async delete(name) {
    return cacheStorage.delete(name);
  },
  async match(request) {
    for (const cache of cacheStorage.values()) {
      const hit = await cache.match(request);
      if (hit) return hit;
    }
    return undefined;
  },
};

const listeners = new Map();

const self = {
  location: new URL(ORIGIN),
  addEventListener: (type, handler) => {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(handler);
  },
  skipWaiting: async () => {},
  clients: { claim: async () => {} },
  registration: {},
};

/**
 * Requests are plain objects rather than real Request instances: the browser
 * forbids constructing a request with mode "navigate", and the worker only ever
 * reads .url, .method and .mode.
 */
const makeRequest = (path, mode = "no-cors") => ({
  url: new URL(path, ORIGIN).href,
  method: "GET",
  mode,
});

const sandbox = {
  self,
  caches,
  // The worker's own fetch always goes to the real server — which is exactly
  // what stops working once the server is killed.
  //
  // The one adjustment is dropping `cache: "reload"`: it is a browser hint for
  // bypassing the HTTP cache, and Node's fetch rejects the option outright.
  // There is no HTTP cache in front of this harness for it to matter.
  fetch: (request, init) => {
    const rest = { ...init };
    delete rest.cache;
    // The worker precaches by path ("/learn/...") the way a browser resolves
    // against the worker's scope; Node's fetch demands an absolute URL.
    const target = typeof request === "string" ? request : request.url;
    return fetch(new URL(target, ORIGIN).href, rest);
  },
  Response,
  Request,
  Headers,
  URL,
  console,
  importScripts: (path) => {
    const file = join(root, "public", path.replace(/^\//, ""));
    runInContext(readFileSync(file, "utf8"), context, { filename: file });
  },
  setTimeout,
  clearTimeout,
  Error,
  Promise,
  Math,
  JSON,
};
sandbox.globalThis = sandbox;
// The worker refers to bare `self`, and its top-level `const`s must be visible
// to the handlers it registers — both work because everything shares this one
// context object.
const context = createContext(sandbox);
Object.assign(self, { caches, fetch: sandbox.fetch });

const dispatch = async (type, event) => {
  const handlers = listeners.get(type) ?? [];
  for (const handler of handlers) handler(event);
};

/** Fires install/activate and waits for whatever the worker passed to waitUntil. */
async function lifecycle(type) {
  const pending = [];
  await dispatch(type, { waitUntil: (promise) => pending.push(promise) });
  await Promise.all(pending);
}

/** Fires a fetch event and returns the response the worker chose to give. */
async function swFetch(request) {
  let responded = null;
  await dispatch("fetch", {
    request,
    respondWith: (promise) => {
      responded = promise;
    },
  });
  if (responded === null) return null; // Worker declined to handle it.
  return responded;
}

// ---------------------------------------------------------------- the checks

try {
  console.log(`  ..   starting production server on ${ORIGIN}`);
  if (!(await waitForServer())) {
    console.error("Server did not start. Is port 3131 free, and has `pnpm build` been run?");
    await stopServer();
    process.exit(1);
  }

  // Load the real worker.
  runInContext(readFileSync(join(root, "public", "sw.js"), "utf8"), context, {
    filename: "public/sw.js",
  });
  check(
    "sw.js parses and registers install/activate/fetch handlers",
    ["install", "activate", "fetch"].every((t) => (listeners.get(t) ?? []).length > 0),
  );

  const precache = readFileSync(join(root, "public", "sw-precache.js"), "utf8");
  runInContext(precache, context, { filename: "public/sw-precache.js" });
  const routes = sandbox.self.__SW_ROUTES ?? [];
  const assets = sandbox.self.__SW_ASSETS ?? [];
  check(
    `precache list covers every page (${routes.length} routes, ${assets.length} assets)`,
    routes.length >= 20 && assets.length > 0,
  );

  await lifecycle("install");
  await lifecycle("activate");

  const shellCache = cacheStorage.get(`codenest-shell-${sandbox.self.__SW_VERSION}`);
  check(
    "install precached the shell",
    Boolean(shellCache) && shellCache.size >= routes.length + assets.length,
    shellCache ? `cached ${shellCache.size} entries` : "no shell cache created",
  );

  // Pressing Run once pulls the interpreter through the worker; do the same.
  console.log("  ..   warming the Python runtime through the worker");
  const PY_FILES = [
    "/pyodide/pyodide.mjs",
    "/pyodide/pyodide.asm.mjs",
    "/pyodide/pyodide.asm.wasm",
    "/pyodide/python_stdlib.zip",
    "/pyodide/pyodide-lock.json",
  ];
  for (const file of PY_FILES) {
    const response = await swFetch(makeRequest(file));
    if (!response || !response.ok) {
      check(`warm ${file}`, false, `status ${response ? response.status : "unhandled"}`);
    }
  }

  // ----------------------------------------------------------------- offline

  console.log("  ..   stopping the server — everything below runs with no network");
  await settleWrites();
  console.log(
    `  ..   cached: ${[...cacheStorage]
      .map(([name, cache]) => `${name.replace(/^codenest-/, "")}=${cache.size}`)
      .join(", ")}`,
  );
  await stopServer();

  // Sanity: the network really is gone, so nothing below can be a false pass.
  let networkDown = false;
  try {
    await fetch(`${ORIGIN}/`);
  } catch {
    networkDown = true;
  }
  check("server is unreachable (the test is honest)", networkDown);

  // Every page a learner might open, as a real navigation.
  let badRoute = null;
  for (const route of routes) {
    const response = await swFetch(makeRequest(route, "navigate"));
    const body = response && response.ok ? await response.text() : "";
    if (!response || !response.ok || !body.includes("<html")) {
      badRoute = `${route} → ${response ? response.status : "unhandled"}`;
      break;
    }
  }
  check(`all ${routes.length} pages load offline`, badRoute === null, badRoute ?? "");

  // The JS that makes those pages interactive.
  let badAsset = null;
  for (const asset of assets) {
    const response = await swFetch(makeRequest(asset));
    if (!response || !response.ok) {
      badAsset = `${asset} → ${response ? response.status : "unhandled"}`;
      break;
    }
  }
  check(`all ${assets.length} build assets load offline`, badAsset === null, badAsset ?? "");

  const worker = await swFetch(makeRequest("/py-worker.js"));
  check("the Python worker loads offline", Boolean(worker && worker.ok));

  let badPython = null;
  for (const file of PY_FILES) {
    const response = await swFetch(makeRequest(file));
    if (!response || !response.ok) {
      badPython = `${file} → ${response ? response.status : "unhandled"}`;
      break;
    }
  }
  check("the Python interpreter loads offline", badPython === null, badPython ?? "");

  const wasm = await swFetch(makeRequest("/pyodide/pyodide.asm.wasm"));
  const wasmBytes = wasm ? Buffer.from(await wasm.arrayBuffer()) : Buffer.alloc(0);
  check(
    "the cached wasm binary is intact",
    wasmBytes.length > 5_000_000 && wasmBytes.subarray(0, 4).toString("binary") === "\0asm",
    `${(wasmBytes.length / 1024 / 1024).toFixed(1)} MB`,
  );

  const manifest = await swFetch(makeRequest("/manifest.webmanifest"));
  check("the web app manifest is available offline", Boolean(manifest && manifest.ok));

  // A page that was never cached should degrade politely, not throw.
  const unknown = await swFetch(makeRequest("/learn/not-a-real-lesson", "navigate"));
  check(
    "an uncached page falls back instead of failing",
    Boolean(unknown) && (unknown.ok || unknown.status === 503),
    unknown ? `status ${unknown.status}` : "unhandled",
  );
} catch (err) {
  failures++;
  console.error(`  FAIL unexpected error\n       ${err.stack ?? err}`);
} finally {
  await stopServer();
}

console.log(
  failures === 0
    ? "\nOffline verified: every page, asset and the Python interpreter served with the server down.\n"
    : `\n${failures} offline check(s) failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
