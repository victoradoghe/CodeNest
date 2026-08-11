import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { modules, lessonCount, totalMinutes } from "@/content";
import ResetProgress from "@/components/ResetProgress";

export const metadata: Metadata = {
  title: "Course outline",
  description:
    "All lessons in the offline Python course, in the order they are meant to be taken.",
};

export default function LearnIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Course outline</h1>
      <p className="mt-2 text-muted">
        {lessonCount} lessons, roughly {Math.round(totalMinutes / 60)} hours.
        Work through them in order — each one assumes the ones before it.
      </p>

      <div className="mt-9 space-y-9">
        {modules.map((module, mi) => (
          <section key={module.id}>
            <h2 className="flex items-baseline gap-2.5 text-xl font-semibold">
              <span className="text-muted tabular-nums">{mi + 1}.</span>
              {module.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {module.description}
            </p>

            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {module.lessons.map((lesson) => (
                <li key={lesson.slug}>
                  <Link
                    href={`/learn/${lesson.slug}`}
                    className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{lesson.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">
                        {lesson.summary}
                      </p>
                    </div>
                    <span className="shrink-0 pt-0.5 text-xs text-muted tabular-nums">
                      {lesson.minutes} min
                    </span>
                    <ArrowRight
                      size={15}
                      className="mt-0.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <ResetProgress />
    </div>
  );
}
