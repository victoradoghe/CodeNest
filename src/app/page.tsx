import Link from "next/link";
import {
  ArrowRight,
  WifiOff,
  TerminalSquare,
  CircleCheckBig,
  BookOpen,
  Dumbbell,
  Clock,
} from "lucide-react";
import { modules, lessonCount, exerciseCount, totalMinutes, allLessons } from "@/content";
import ContinueButton from "@/components/ContinueButton";

const FEATURES = [
  {
    Icon: WifiOff,
    title: "Genuinely offline",
    body: "The Python interpreter, the editor, and every lesson ship with the app. Pull the network cable and nothing changes.",
  },
  {
    Icon: TerminalSquare,
    title: "Real Python, not a simulation",
    body: "CPython compiled to WebAssembly runs in a background worker. The full standard library is there — math, json, datetime, collections.",
  },
  {
    Icon: CircleCheckBig,
    title: "Checked exercises",
    body: "Every exercise is graded by real Python assertions running against your code, with the failure message shown to you.",
  },
];

export default function HomePage() {
  const firstLesson = allLessons[0]?.lesson.slug;

  return (
    <div className="mx-auto max-w-[1100px] px-4">
      {/* Hero */}
      <section className="py-14 sm:py-20">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
          No account, no server, no internet needed
        </p>

        <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          Learn Python properly —{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(100deg,#3776ab,#ffd43b)" }}
          >
            entirely offline
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          {lessonCount} lessons that take you from your first{" "}
          <code className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]">
            print()
          </code>{" "}
          to classes, files, and a capstone project. Every example runs in your
          browser against a real Python interpreter.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ContinueButton firstSlug={firstLesson} />
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 font-medium transition-colors hover:bg-surface-2"
          >
            Open the playground
          </Link>
        </div>

        <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-muted" aria-hidden />
            <dt className="sr-only">Lessons</dt>
            <dd>
              <strong className="font-semibold">{lessonCount}</strong> lessons
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Dumbbell size={15} className="text-muted" aria-hidden />
            <dt className="sr-only">Exercises</dt>
            <dd>
              <strong className="font-semibold">{exerciseCount}</strong> graded
              exercises
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-muted" aria-hidden />
            <dt className="sr-only">Duration</dt>
            <dd>
              about{" "}
              <strong className="font-semibold">
                {Math.round(totalMinutes / 60)} hours
              </strong>
            </dd>
          </div>
        </dl>
      </section>

      {/* Why */}
      <section className="grid gap-4 border-t border-border py-12 sm:grid-cols-3">
        {FEATURES.map(({ Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <Icon size={18} className="mb-2.5 text-accent" aria-hidden />
            <h2 className="mb-1.5 font-semibold">{title}</h2>
            <p className="text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </section>

      {/* Curriculum */}
      <section className="border-t border-border py-12">
        <h2 className="text-2xl font-bold tracking-tight">The curriculum</h2>
        <p className="mt-2 text-muted">
          Five modules, in order. Each lesson ends with exercises and a short
          quiz.
        </p>

        <ol className="mt-7 space-y-3">
          {modules.map((module, i) => (
            <li
              key={module.id}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-sm font-semibold tabular-nums">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold">{module.title}</h3>
                <span className="text-xs text-muted">
                  {module.lessons.length} lessons ·{" "}
                  {module.lessons.reduce((s, l) => s + l.minutes, 0)} min
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-muted">
                {module.description}
              </p>

              <ul className="mt-3 flex flex-wrap gap-1.5">
                {module.lessons.map((lesson) => (
                  <li key={lesson.slug}>
                    <Link
                      href={`/learn/${lesson.slug}`}
                      className="inline-block rounded-lg border border-border px-2.5 py-1 text-[13px] text-muted transition-colors hover:border-accent/50 hover:text-fg"
                    >
                      {lesson.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <Link
          href="/learn"
          className="mt-8 inline-flex items-center gap-2 font-medium text-accent hover:underline"
        >
          See the full course outline <ArrowRight size={16} aria-hidden />
        </Link>
      </section>
    </div>
  );
}
