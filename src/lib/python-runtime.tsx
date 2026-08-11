"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Stream = "stdout" | "stderr";

export type RunResult = {
  ok: boolean;
  /** Present when tests were supplied: did every assertion pass? */
  testsPassed?: boolean;
  /** Human-readable failure detail. */
  error?: string;
  /** True when the run was cancelled with stop(). */
  cancelled?: boolean;
};

export type RunOptions = {
  stdin?: string;
  tests?: string;
  onOut?: (text: string, stream: Stream) => void;
};

type Status = "idle" | "loading" | "ready" | "error";

type PythonContextValue = {
  status: Status;
  statusText: string;
  busy: boolean;
  /** Kick off the runtime download without running anything. */
  warm: () => void;
  run: (code: string, options?: RunOptions) => Promise<RunResult>;
  /** Kill a runaway program. The next run boots a fresh interpreter. */
  stop: () => void;
};

const PythonContext = createContext<PythonContextValue | null>(null);

type Pending = {
  resolve: (result: RunResult) => void;
  onOut?: (text: string, stream: Stream) => void;
};

export function PythonProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("idle");
  const [statusText, setStatusText] = useState("Python not started");
  const [busy, setBusy] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<number, Pending>>(new Map());
  const idRef = useRef(0);
  /** Serialises runs — Pyodide handles one program at a time. */
  const chainRef = useRef<Promise<unknown>>(Promise.resolve());

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;

    // Module worker: py-worker.js statically imports Pyodide's ESM build.
    const worker = new Worker("/py-worker.js", { type: "module" });
    workerRef.current = worker;
    setStatus("loading");
    setStatusText("Loading Python runtime…");

    worker.onmessage = (event: MessageEvent) => {
      const msg = event.data;

      switch (msg.type) {
        case "status":
          setStatusText(msg.text);
          break;

        case "ready":
          setStatus("ready");
          setStatusText(`Python ${msg.version} ready`);
          break;

        case "out": {
          pendingRef.current.get(msg.id)?.onOut?.(msg.text, msg.stream);
          break;
        }

        case "done": {
          const pending = pendingRef.current.get(msg.id);
          pendingRef.current.delete(msg.id);
          pending?.resolve({
            ok: msg.ok,
            testsPassed: msg.testsPassed,
            error: msg.error,
          });
          break;
        }
      }
    };

    worker.onerror = () => {
      setStatus("error");
      setStatusText("Python runtime failed to load");
      for (const pending of pendingRef.current.values()) {
        pending.resolve({ ok: false, error: "Python runtime failed to load." });
      }
      pendingRef.current.clear();
      setBusy(false);
    };

    worker.postMessage({ type: "init" });
    return worker;
  }, []);

  const warm = useCallback(() => {
    ensureWorker();
  }, [ensureWorker]);

  const stop = useCallback(() => {
    const worker = workerRef.current;
    if (!worker) return;

    worker.terminate();
    workerRef.current = null;

    for (const pending of pendingRef.current.values()) {
      pending.resolve({ ok: false, cancelled: true, error: "Stopped." });
    }
    pendingRef.current.clear();

    setBusy(false);
    setStatus("idle");
    setStatusText("Stopped — the next run will restart Python");
  }, []);

  const run = useCallback(
    (code: string, options: RunOptions = {}): Promise<RunResult> => {
      // Queue behind any in-flight run rather than interleaving.
      const job = chainRef.current.then(
        () =>
          new Promise<RunResult>((resolve) => {
            const worker = ensureWorker();
            const id = ++idRef.current;

            pendingRef.current.set(id, { resolve, onOut: options.onOut });
            setBusy(true);

            worker.postMessage({
              type: "run",
              id,
              code,
              stdin: options.stdin ?? "",
              tests: options.tests ?? "",
            });
          }),
      );

      chainRef.current = job.then(
        () => {
          if (pendingRef.current.size === 0) setBusy(false);
        },
        () => setBusy(false),
      );

      return job;
    },
    [ensureWorker],
  );

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const value = useMemo(
    () => ({ status, statusText, busy, warm, run, stop }),
    [status, statusText, busy, warm, run, stop],
  );

  return (
    <PythonContext.Provider value={value}>{children}</PythonContext.Provider>
  );
}

export function usePython() {
  const ctx = useContext(PythonContext);
  if (!ctx) {
    throw new Error("usePython must be used inside a <PythonProvider>");
  }
  return ctx;
}
