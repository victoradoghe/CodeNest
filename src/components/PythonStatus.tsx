"use client";

import { usePython } from "@/lib/python-runtime";

/** A small dot in the header showing whether the Python runtime is live. */
export default function PythonStatus() {
  const { status, statusText } = usePython();

  const colour =
    status === "ready"
      ? "bg-emerald-500"
      : status === "loading"
        ? "bg-amber-500 animate-pulse"
        : status === "error"
          ? "bg-red-500"
          : "bg-border";

  const label =
    status === "ready"
      ? "Python ready"
      : status === "loading"
        ? "Loading Python…"
        : status === "error"
          ? "Python unavailable"
          : "Python idle";

  return (
    <span
      className="hidden items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-[11px] text-muted md:inline-flex"
      title={statusText}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colour}`} aria-hidden />
      {label}
    </span>
  );
}
