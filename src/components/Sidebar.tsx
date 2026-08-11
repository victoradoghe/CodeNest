"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { modules, lessonCount } from "@/content";
import { useProgress } from "@/lib/progress";

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { state, loaded, completedCount } = useProgress();

  const pct = lessonCount ? Math.round((completedCount / lessonCount) * 100) : 0;

  return (
    <nav aria-label="Course contents" className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <div className="mb-1.5 flex items-baseline justify-between text-xs">
          <span className="font-medium">Your progress</span>
          <span className="text-muted tabular-nums">
            {loaded ? `${completedCount}/${lessonCount}` : "—"}
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Course completion"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${loaded ? pct : 0}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {modules.map((module, mi) => (
          <section key={module.id} className="mb-4">
            <h2 className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              <span className="mr-1.5 opacity-60">{mi + 1}</span>
              {module.title}
            </h2>
            <ul className="space-y-0.5">
              {module.lessons.map((lesson) => {
                const href = `/learn/${lesson.slug}`;
                const active = pathname === href;
                const done = loaded && state.completed[lesson.slug];

                return (
                  <li key={lesson.slug}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13.5px] transition-colors ${
                        active
                          ? "bg-accent/12 font-medium text-accent"
                          : "text-fg/80 hover:bg-surface-2 hover:text-fg"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                          done
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : active
                              ? "border-accent"
                              : "border-border"
                        }`}
                        aria-hidden
                      >
                        {done && <Check size={10} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {lesson.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted tabular-nums">
                        {lesson.minutes}m
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
