import type { Lesson, Module } from "./types";
import { foundations } from "./modules/01-foundations";
import { controlFlow } from "./modules/02-control-flow";
import { dataStructures } from "./modules/03-data-structures";
import { functions } from "./modules/04-functions";
import { applied } from "./modules/05-applied";

export const modules: Module[] = [
  foundations,
  controlFlow,
  dataStructures,
  functions,
  applied,
];

/** Every lesson in course order, paired with the module it belongs to. */
export const allLessons: { lesson: Lesson; module: Module }[] = modules.flatMap(
  (module) => module.lessons.map((lesson) => ({ lesson, module })),
);

export const lessonCount = allLessons.length;

export const totalMinutes = allLessons.reduce(
  (sum, { lesson }) => sum + lesson.minutes,
  0,
);

export function getLesson(slug: string) {
  return allLessons.find((entry) => entry.lesson.slug === slug);
}

/** Previous/next lesson in course order, for the footer navigation. */
export function getNeighbours(slug: string) {
  const index = allLessons.findIndex((entry) => entry.lesson.slug === slug);
  return {
    prev: index > 0 ? allLessons[index - 1] : null,
    next: index >= 0 && index < allLessons.length - 1 ? allLessons[index + 1] : null,
    index,
  };
}

/** All lesson slugs, used for static generation. */
export function allSlugs() {
  return allLessons.map(({ lesson }) => lesson.slug);
}

/** Count of exercises across the whole course. */
export const exerciseCount = allLessons.reduce(
  (sum, { lesson }) =>
    sum + lesson.blocks.filter((b) => b.kind === "exercise").length,
  0,
);

export type { Block, Lesson, Module, QuizQuestion } from "./types";
