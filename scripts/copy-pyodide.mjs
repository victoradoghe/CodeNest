/**
 * Copies the Pyodide runtime out of node_modules and into public/pyodide so it
 * is served from our own origin.
 *
 * This is what makes the playground work offline: no CDN, no network at run
 * time. We copy only the core runtime — the interpreter plus the full Python
 * standard library — and deliberately skip the bundled third-party wheels
 * (numpy, pandas and friends), which would add hundreds of megabytes that this
 * course never uses.
 *
 * Runs automatically via the `predev` and `prebuild` scripts.
 */
import { existsSync, mkdirSync, copyFileSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const src = join(root, "node_modules", "pyodide");
const dest = join(root, "public", "pyodide");

/**
 * Core runtime files. The worker imports pyodide.mjs, which in turn pulls in
 * pyodide.asm.mjs, the wasm binary and the stdlib zip. Anything missing is
 * reported loudly rather than silently skipped — a half-copied runtime would
 * fail at run time with a confusing error.
 */
const REQUIRED = [
  "pyodide.mjs",
  "pyodide.asm.mjs",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];

/** Nice to have: the CJS build and source maps for debugging. */
const OPTIONAL = ["pyodide.js", "pyodide.d.ts", "ffi.d.ts"];

if (!existsSync(src)) {
  console.error(
    "[pyodide] node_modules/pyodide not found. Run `pnpm install` first.",
  );
  process.exit(1);
}

mkdirSync(dest, { recursive: true });

let copied = 0;
let bytes = 0;
const missing = [];

for (const name of [...REQUIRED, ...OPTIONAL]) {
  const from = join(src, name);
  if (!existsSync(from)) {
    if (REQUIRED.includes(name)) missing.push(name);
    continue;
  }
  const to = join(dest, name);
  // Skip files already copied at the same size — keeps repeat builds fast.
  if (existsSync(to) && statSync(to).size === statSync(from).size) {
    bytes += statSync(to).size;
    continue;
  }
  copyFileSync(from, to);
  copied++;
  bytes += statSync(to).size;
}

if (missing.length) {
  console.error(
    `[pyodide] Missing required runtime files: ${missing.join(", ")}\n` +
      `[pyodide] Contents of ${src}:\n  ` +
      readdirSync(src).join("\n  "),
  );
  process.exit(1);
}

const mb = (bytes / 1024 / 1024).toFixed(1);
console.log(
  copied > 0
    ? `[pyodide] Copied ${copied} file(s) to public/pyodide (${mb} MB total). Playground is offline-ready.`
    : `[pyodide] public/pyodide already up to date (${mb} MB).`,
);
