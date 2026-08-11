"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Square,
  RotateCcw,
  Copy,
  Check,
  Lightbulb,
  Eye,
  CircleCheck,
  CircleX,
  Terminal,
} from "lucide-react";
import CodeEditor from "./CodeEditor";
import { usePython, type Stream } from "@/lib/python-runtime";
import { useProgress } from "@/lib/progress";

type Line = { text: string; stream: Stream };

type Props = {
  initialCode: string;
  /** Expected console output, shown as a preview before the first run. */
  expectedOutput?: string;
  /** Python assertions run after the learner's code. Turns this into an exercise. */
  tests?: string;
  solution?: string;
  hint?: string;
  /** Recorded in progress when the tests pass. */
  exerciseId?: string;
  /** Show the stdin box (for input()-driven programs). */
  allowStdin?: boolean;
  minHeight?: number;
  /** Fills its container instead of sizing to content — used by the playground. */
  fill?: boolean;
  /** When set, the editor contents survive a reload via localStorage. */
  storageKey?: string;
};

export default function PythonRunner({
  initialCode,
  expectedOutput,
  tests,
  solution,
  hint,
  exerciseId,
  allowStdin = false,
  minHeight = 120,
  fill = false,
  storageKey,
}: Props) {
  const [code, setCode] = useState(initialCode);
  const [stdin, setStdin] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const [running, setRunning] = useState(false);
  const [verdict, setVerdict] = useState<"pass" | "fail" | null>(null);
  const [verdictText, setVerdictText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showStdin, setShowStdin] = useState(false);

  const { run, stop, status, statusText } = usePython();
  const { markExercise } = useProgress();
  const outputRef = useRef<HTMLDivElement | null>(null);

  const isExercise = Boolean(tests);

  // Restore a saved draft (playground only). This has to happen in an effect
  // after hydration: localStorage does not exist on the server, so reading it
  // in a state initialiser would make the server and client markup disagree.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe read of an external store
      if (saved !== null) setCode(saved);
    } catch {
      // Storage unavailable — fall back to the starting code.
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, code);
    } catch {
      // Quota exceeded or storage blocked; drafts simply won't persist.
    }
  }, [storageKey, code]);

  const handleRun = useCallback(async () => {
    setLines([]);
    setVerdict(null);
    setVerdictText("");
    setHasRun(true);
    setRunning(true);

    const collected: Line[] = [];
    const result = await run(code, {
      stdin,
      tests,
      onOut: (text, stream) => {
        collected.push({ text, stream });
        // Replace wholesale so React sees a new array each time.
        setLines([...collected]);
        requestAnimationFrame(() => {
          if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
          }
        });
      },
    });

    setRunning(false);

    if (result.cancelled) {
      setVerdict(null);
      setLines((prev) => [
        ...prev,
        { text: "\n[stopped]\n", stream: "stderr" as Stream },
      ]);
      return;
    }

    if (isExercise) {
      if (result.testsPassed) {
        setVerdict("pass");
        setVerdictText("All checks passed.");
        if (exerciseId) markExercise(exerciseId);
      } else {
        setVerdict("fail");
        setVerdictText(
          result.error === "runtime"
            ? "Your code raised an error — see the output above."
            : result.error || "Not quite — check the requirements again.",
        );
      }
    }
  }, [code, stdin, tests, run, isExercise, exerciseId, markExercise]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard blocked (insecure context) — silently ignore.
    }
  }, [code]);

  const reset = useCallback(() => {
    setCode(initialCode);
    setLines([]);
    setHasRun(false);
    setVerdict(null);
    setVerdictText("");
  }, [initialCode]);

  const btn =
    "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-surface ${
        fill ? "flex h-full flex-col" : "my-5"
      }`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-2 px-3 py-2">
        <span className="mr-auto flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-muted">
          <Terminal size={13} aria-hidden />
          Python
        </span>

        {running ? (
          <button
            onClick={stop}
            className={`${btn} border-red-500/40 text-red-500`}
            title="Terminate the running program"
          >
            <Square size={13} aria-hidden /> Stop
          </button>
        ) : (
          <button
            onClick={handleRun}
            className={`${btn} border-transparent bg-accent text-accent-fg hover:opacity-90`}
            title="Run (Ctrl+Enter)"
          >
            <Play size={13} aria-hidden /> Run
          </button>
        )}

        {allowStdin && (
          <button
            onClick={() => setShowStdin((v) => !v)}
            className={btn}
            aria-pressed={showStdin}
          >
            stdin
          </button>
        )}

        {hint && (
          <button onClick={() => setShowHint((v) => !v)} className={btn}>
            <Lightbulb size={13} aria-hidden /> Hint
          </button>
        )}

        {solution && (
          <button onClick={() => setCode(solution)} className={btn}>
            <Eye size={13} aria-hidden /> Solution
          </button>
        )}

        <button onClick={reset} className={btn} title="Restore the starting code">
          <RotateCcw size={13} aria-hidden /> Reset
        </button>

        <button onClick={handleCopy} className={btn}>
          {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {showHint && hint && (
        <p className="border-b border-border bg-amber-400/10 px-3 py-2 text-sm">
          <strong className="font-semibold">Hint:</strong> {hint}
        </p>
      )}

      <div className={fill ? "min-h-0 flex-1 overflow-auto" : ""}>
        <CodeEditor
          value={code}
          onChange={setCode}
          onRun={handleRun}
          minHeight={minHeight}
          ariaLabel="Python code editor"
        />
      </div>

      {allowStdin && showStdin && (
        <div className="border-t border-border px-3 py-2">
          <label
            htmlFor="stdin-box"
            className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted"
          >
            Input for input() — one value per line
          </label>
          <textarea
            id="stdin-box"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={3}
            spellCheck={false}
            className="w-full resize-y rounded-md border border-border bg-bg px-2 py-1.5 font-mono text-[13px] outline-none focus:border-accent"
            placeholder={"Ada\n42"}
          />
        </div>
      )}

      {/* Output */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Output
          </span>
          <span className="font-mono text-[10px] text-muted">
            {running ? "running…" : status === "loading" ? statusText : ""}
          </span>
        </div>

        <div
          ref={outputRef}
          className={`max-h-64 overflow-auto bg-surface-2 px-3 pb-3 font-mono text-[12.5px] leading-relaxed ${
            fill ? "min-h-[8rem]" : ""
          }`}
          aria-live="polite"
        >
          {!hasRun && expectedOutput && (
            <pre className="whitespace-pre-wrap text-muted">
              {expectedOutput}
              {"\n"}
              <span className="text-[11px] italic">
                — expected output; press Run to execute it yourself
              </span>
            </pre>
          )}

          {!hasRun && !expectedOutput && (
            <p className="text-[12px] italic text-muted">
              Press Run to execute this code.
            </p>
          )}

          {hasRun && lines.length === 0 && !running && (
            <p className="text-[12px] italic text-muted">
              (no output — this code printed nothing)
            </p>
          )}

          {hasRun && running && lines.length === 0 && (
            <p className="text-[12px] italic text-muted">
              {status === "ready" ? "Running…" : statusText}
            </p>
          )}

          {lines.map((line, i) => (
            <pre
              key={i}
              className={`whitespace-pre-wrap ${
                line.stream === "stderr" ? "text-red-500" : ""
              }`}
            >
              {line.text.replace(/\n$/, "")}
            </pre>
          ))}
        </div>
      </div>

      {verdict && (
        <div
          className={`flex items-start gap-2 border-t px-3 py-2.5 text-sm ${
            verdict === "pass"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }`}
          role="status"
        >
          {verdict === "pass" ? (
            <CircleCheck size={16} className="mt-0.5 shrink-0" aria-hidden />
          ) : (
            <CircleX size={16} className="mt-0.5 shrink-0" aria-hidden />
          )}
          <span>{verdictText}</span>
        </div>
      )}
    </div>
  );
}
