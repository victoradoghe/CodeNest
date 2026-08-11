/* eslint-disable */
/**
 * Python execution worker.
 *
 * Runs Pyodide (CPython compiled to WebAssembly) off the main thread so that a
 * runaway loop in a learner's code never freezes the page — the UI can simply
 * terminate this worker and spawn a fresh one.
 *
 * Everything it loads comes from /pyodide/ on this same origin, which is why
 * the site works with no network connection at all.
 *
 * This is an ES module worker (created with {type:"module"}), which lets it
 * statically import Pyodide's ESM build — the runtime is itself ESM, so this
 * avoids relying on dynamic import() inside a classic worker.
 *
 * Protocol
 *   in : {type:"init"}
 *        {type:"run", id, code, stdin?, tests?}
 *   out: {type:"status", text}
 *        {type:"ready", version}
 *        {type:"out", id, stream:"stdout"|"stderr", text}
 *        {type:"done", id, ok, error?, testsPassed?}
 */

import { loadPyodide } from "/pyodide/pyodide.mjs";

let pyodide = null;
let loading = null;

/** Lines fed to input(); consumed one call at a time. */
let stdinQueue = [];

function post(msg) {
  self.postMessage(msg);
}

async function boot() {
  if (pyodide) return pyodide;
  if (loading) return loading;

  loading = (async () => {
    post({ type: "status", text: "Loading Python runtime…" });

    pyodide = await loadPyodide({
      indexURL: "/pyodide/",
      // Suppress the default console noise; we route output ourselves.
      stdout: () => {},
      stderr: () => {},
    });

    // input() pulls from the stdin box in the UI. Returning null signals EOF,
    // which surfaces to Python as EOFError rather than hanging forever.
    pyodide.setStdin({
      stdin: () => (stdinQueue.length ? stdinQueue.shift() : null),
      isatty: false,
    });

    post({ type: "ready", version: pyodide.version });
    return pyodide;
  })();

  return loading;
}

/** Trim Pyodide's internal frames out of a traceback so the message is useful. */
function cleanTraceback(text) {
  const lines = String(text).split("\n");
  const kept = lines.filter(
    (l) =>
      !l.includes("/lib/python3") &&
      !l.includes("pyodide/_pyodide") &&
      !l.includes("importlib._bootstrap"),
  );
  return (kept.length ? kept : lines).join("\n").trim();
}

self.onmessage = async (event) => {
  const msg = event.data;

  if (msg.type === "init") {
    try {
      await boot();
    } catch (err) {
      post({ type: "status", text: "Failed to load Python: " + err.message });
    }
    return;
  }

  if (msg.type !== "run") return;

  const { id, code, stdin, tests } = msg;

  try {
    await boot();
  } catch (err) {
    post({ type: "done", id, ok: false, error: "Python runtime failed to load." });
    return;
  }

  stdinQueue = (stdin || "")
    .split("\n")
    .filter((line, i, arr) => !(i === arr.length - 1 && line === ""))
    .map((line) => line + "\n");

  let captured = "";
  pyodide.setStdout({
    batched: (text) => {
      captured += text + "\n";
      post({ type: "out", id, stream: "stdout", text: text + "\n" });
    },
  });
  pyodide.setStderr({
    batched: (text) => {
      post({ type: "out", id, stream: "stderr", text: text + "\n" });
    },
  });

  // A fresh namespace per run: no state leaks between executions.
  const namespace = pyodide.toPy({});

  try {
    await pyodide.runPythonAsync(code, { globals: namespace });
  } catch (err) {
    post({
      type: "out",
      id,
      stream: "stderr",
      text: cleanTraceback(err.message) + "\n",
    });
    post({ type: "done", id, ok: false, error: "runtime" });
    namespace.destroy();
    return;
  }

  // Exercise checking: expose the captured stdout as _OUT, then run the
  // assertions in the same namespace so they can call the learner's functions.
  if (tests) {
    try {
      namespace.set("_OUT", captured);
      await pyodide.runPythonAsync(tests, { globals: namespace });
      post({ type: "done", id, ok: true, testsPassed: true });
    } catch (err) {
      const raw = String(err.message);
      // Surface the assert message rather than the whole traceback.
      const match = raw.match(/AssertionError:?\s*(.*)$/m);
      const detail = match && match[1] ? match[1] : cleanTraceback(raw);
      post({
        type: "done",
        id,
        ok: false,
        testsPassed: false,
        error: detail || "Not quite yet — check the requirements again.",
      });
    }
  } else {
    post({ type: "done", id, ok: true });
  }

  namespace.destroy();
};
