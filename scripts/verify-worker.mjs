/**
 * Exercises public/py-worker.js end to end, outside a browser.
 *
 * This is the closest thing to a real run we can do headlessly: it loads the
 * *copied* runtime in public/pyodide (not the one in node_modules, so it also
 * proves copy-pyodide.mjs produced a complete set), stubs the worker globals,
 * and then drives the real message protocol.
 *
 * The only edits are to the two origin-absolute paths ("/pyodide/pyodide.mjs"
 * and indexURL "/pyodide/"), which a browser resolves against the site origin
 * but Node would read as C:\pyodide. Both become file:// URLs. No logic is
 * touched.
 *
 * Run with:  pnpm verify:worker
 */
import { readFile, writeFile, unlink } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workerPath = join(root, "public", "py-worker.js");
const runtimePath = join(root, "public", "pyodide", "pyodide.mjs");

const source = await readFile(workerPath, "utf8");
// Node's Pyodide wants a filesystem path here, not a file:// URL.
const dirPath = join(root, "public", "pyodide").replace(/\\/g, "/") + "/";

const patched = source
  .replace('"/pyodide/pyodide.mjs"', JSON.stringify(pathToFileURL(runtimePath).href))
  .replace('indexURL: "/pyodide/"', `indexURL: ${JSON.stringify(dirPath)}`);

if (!patched.includes(dirPath)) {
  console.error(
    "Could not rewrite the origin-absolute pyodide paths in py-worker.js — " +
      "did the import specifier or indexURL change?",
  );
  process.exit(1);
}

const shimPath = join(root, ".worker-under-test.mjs");
await writeFile(shimPath, patched);

/** Collect everything the worker posts back. */
const posted = [];
const waiters = [];

globalThis.self = {
  postMessage: (msg) => {
    posted.push(msg);
    for (const w of [...waiters]) {
      if (w.match(msg)) {
        waiters.splice(waiters.indexOf(w), 1);
        w.resolve(msg);
      }
    }
  },
  onmessage: null,
};

function waitFor(match, label, ms = 120000) {
  const existing = posted.find(match);
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve, reject) => {
    const w = { match, resolve };
    waiters.push(w);
    setTimeout(() => reject(new Error(`timed out waiting for ${label}`)), ms);
  });
}

const send = (msg) => globalThis.self.onmessage({ data: msg });

let failures = 0;
const check = (label, condition, detail = "") => {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures++;
    console.error(`  FAIL ${label}${detail ? "\n       " + detail : ""}`);
  }
};

try {
  await import(pathToFileURL(shimPath).href);
  check("worker module parses and registers onmessage", typeof globalThis.self.onmessage === "function");

  send({ type: "init" });
  const ready = await waitFor((m) => m.type === "ready", "ready");
  check(`runtime boots from public/pyodide (Python ${ready.version})`, true);

  // 1. Plain program: stdout is streamed back.
  posted.length = 0;
  send({ type: "run", id: 1, code: "print('hello')\nprint(2 + 2)" });
  await waitFor((m) => m.type === "done" && m.id === 1, "done#1");
  const out1 = posted.filter((m) => m.type === "out" && m.id === 1).map((m) => m.text).join("");
  check("stdout streams back", out1 === "hello\n4\n", JSON.stringify(out1));

  // 2. A crash reports as a failure with the traceback on stderr, not a hang.
  posted.length = 0;
  send({ type: "run", id: 2, code: "raise ValueError('boom')" });
  const done2 = await waitFor((m) => m.type === "done" && m.id === 2, "done#2");
  const err2 = posted.filter((m) => m.stream === "stderr").map((m) => m.text).join("");
  check("runtime error reported, not thrown", done2.ok === false && err2.includes("boom"));

  // 3. Namespaces do not leak between runs.
  posted.length = 0;
  send({ type: "run", id: 3, code: "leaked = 42" });
  await waitFor((m) => m.type === "done" && m.id === 3, "done#3");
  posted.length = 0;
  send({ type: "run", id: 4, code: "print(leaked)" });
  const done4 = await waitFor((m) => m.type === "done" && m.id === 4, "done#4");
  check("each run gets a fresh namespace", done4.ok === false);

  // 4. Exercise grading: correct answer passes.
  posted.length = 0;
  send({
    type: "run",
    id: 5,
    code: "def double(x):\n    return x * 2",
    tests: "assert double(4) == 8",
  });
  const done5 = await waitFor((m) => m.type === "done" && m.id === 5, "done#5");
  check("passing exercise reports testsPassed", done5.ok === true && done5.testsPassed === true);

  // 5. Exercise grading: wrong answer surfaces the assert message.
  posted.length = 0;
  send({
    type: "run",
    id: 6,
    code: "def double(x):\n    return x * 3",
    tests: "assert double(4) == 8, 'double(4) should be 8'",
  });
  const done6 = await waitFor((m) => m.type === "done" && m.id === 6, "done#6");
  check(
    "failing exercise surfaces the assert message",
    done6.testsPassed === false && String(done6.error).includes("double(4) should be 8"),
    JSON.stringify(done6.error),
  );

  // 6. _OUT exposes what the learner printed.
  posted.length = 0;
  send({
    type: "run",
    id: 7,
    code: "print('Hello, world!')",
    tests: "assert 'Hello, world!' in _OUT",
  });
  const done7 = await waitFor((m) => m.type === "done" && m.id === 7, "done#7");
  check("_OUT exposes printed output to the tests", done7.testsPassed === true);

  // 7. input() reads from the stdin the UI supplies.
  posted.length = 0;
  send({
    type: "run",
    id: 8,
    code: "name = input()\nage = int(input())\nprint(f'{name} is {age}')",
    stdin: "Ada\n36\n",
  });
  await waitFor((m) => m.type === "done" && m.id === 8, "done#8");
  const out8 = posted.filter((m) => m.type === "out" && m.id === 8).map((m) => m.text).join("");
  check("input() reads supplied stdin", out8.includes("Ada is 36"), JSON.stringify(out8));

  // 8. The standard library is present offline.
  posted.length = 0;
  send({
    type: "run",
    id: 9,
    code: "import json, math, datetime, collections, statistics, random, re\nprint('stdlib ok')",
  });
  const done9 = await waitFor((m) => m.type === "done" && m.id === 9, "done#9");
  check("standard library imports work with no network", done9.ok === true);
} finally {
  await unlink(shimPath).catch(() => {});
}

console.log(
  failures === 0
    ? "\nWorker protocol verified against the copied runtime.\n"
    : `\n${failures} worker check(s) failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
