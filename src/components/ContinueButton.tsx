"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { allLessons } from "@/content";
import { useProgress } from "@/lib/progress";

/**
 * Deep-links to the first lesson the learner has not finished, so returning
 * visitors land where they left off rather than back at lesson one.
 */
export default function ContinueButton({
  firstSlug,
}: {
  firstSlug?: string;
}) {
  const { state, loaded, completedCount } = useProgress();

  const next =
    allLessons.find(({ lesson }) => !state.completed[lesson.slug])?.lesson.slug ??
    firstSlug;

  const started = loaded && completedCount > 0;

  return (
    <Link
      href={`/learn/${next ?? ""}`}
      className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-fg transition-opacity hover:opacity-90"
    >
      {started ? "Continue where you left off" : "Start lesson 1"}
      <ArrowRight size={16} aria-hidden />
    </Link>
  );
}
