import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Target } from "lucide-react";
import { allSlugs, getLesson, getNeighbours, lessonCount } from "@/content";
import LessonBody from "@/components/LessonBody";
import Quiz from "@/components/Quiz";
import LessonFooter from "@/components/LessonFooter";

type Params = { slug: string };

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getLesson(slug);
  if (!entry) return { title: "Lesson not found" };
  return {
    title: entry.lesson.title,
    description: entry.lesson.summary,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const entry = getLesson(slug);
  if (!entry) notFound();

  const { lesson, module } = entry;
  const { prev, next, index } = getNeighbours(slug);

  return (
    <article className="mx-auto max-w-3xl px-4 py-9 pb-24 lg:pb-9">
      <header className="mb-8">
        <p className="mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted">
          <span className="rounded-full bg-surface-2 px-2.5 py-1 font-medium">
            {module.title}
          </span>
          <span>
            Lesson {index + 1} of {lessonCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} aria-hidden />
            {lesson.minutes} min
          </span>
        </p>

        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {lesson.title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          {lesson.summary}
        </p>

        <div className="mt-6 rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Target size={13} aria-hidden />
            By the end you will be able to
          </p>
          <ul className="space-y-1 text-sm">
            {lesson.objectives.map((objective) => (
              <li key={objective} className="flex gap-2">
                <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                {objective}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <LessonBody blocks={lesson.blocks} />

      {lesson.quiz.length > 0 && (
        <Quiz questions={lesson.quiz} lessonSlug={lesson.slug} />
      )}

      <LessonFooter
        slug={lesson.slug}
        prev={
          prev
            ? { slug: prev.lesson.slug, title: prev.lesson.title }
            : null
        }
        next={
          next
            ? { slug: next.lesson.slug, title: next.lesson.title }
            : null
        }
      />
    </article>
  );
}
