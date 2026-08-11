"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useProgress } from "@/lib/progress";

type Neighbour = { slug: string; title: string } | null;

export default function LessonFooter({
  slug,
  prev,
  next,
}: {
  slug: string;
  prev: Neighbour;
  next: Neighbour;
}) {
  const { isComplete, setComplete, loaded } = useProgress();
  const done = loaded && isComplete(slug);

  return (
    <footer className="mt-10 border-t border-border pt-6">
      <button
        onClick={() => setComplete(slug, !done)}
        aria-pressed={done}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 font-medium transition-colors ${
          done
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "border-border hover:bg-surface-2"
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
            done ? "border-emerald-500 bg-emerald-500 text-white" : "border-current"
          }`}
          aria-hidden
        >
          {done && <Check size={12} strokeWidth={3} />}
        </span>
        {done ? "Lesson complete" : "Mark this lesson complete"}
      </button>

      <nav
        className="mt-4 grid gap-3 sm:grid-cols-2"
        aria-label="Lesson navigation"
      >
        {prev ? (
          <Link
            href={`/learn/${prev.slug}`}
            className="group rounded-xl border border-border px-4 py-3 transition-colors hover:bg-surface-2"
          >
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <ArrowLeft size={13} aria-hidden /> Previous
            </span>
            <span className="mt-0.5 block font-medium">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link
            href={`/learn/${next.slug}`}
            className="group rounded-xl border border-border px-4 py-3 text-right transition-colors hover:bg-surface-2 sm:col-start-2"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs text-muted">
              Next <ArrowRight size={13} aria-hidden />
            </span>
            <span className="mt-0.5 block font-medium">{next.title}</span>
          </Link>
        ) : (
          <Link
            href="/learn"
            className="rounded-xl border border-border px-4 py-3 text-right transition-colors hover:bg-surface-2 sm:col-start-2"
          >
            <span className="text-xs text-muted">Course complete</span>
            <span className="mt-0.5 block font-medium">
              Back to the outline
            </span>
          </Link>
        )}
      </nav>
    </footer>
  );
}
