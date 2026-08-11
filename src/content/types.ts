/**
 * Content model for the course.
 *
 * Lessons are plain data compiled into the bundle — no CMS, no fetch, no
 * database. That is what makes the whole site work with the network off.
 */

/** A run of lesson body content. */
export type Block =
  /** Body copy. Supports the small markdown subset in `lib/markdown.tsx`. */
  | { kind: "text"; md: string }
  /** A code sample. `runnable` adds an editor + Run button backed by Pyodide. */
  | {
      kind: "code";
      code: string;
      caption?: string;
      /** Expected console output, shown when the reader has not run it yet. */
      output?: string;
      runnable?: boolean;
    }
  /** A highlighted aside. */
  | { kind: "callout"; tone: "tip" | "warn" | "note"; title: string; md: string }
  /** A hands-on task, checked by running Python assertions against the code. */
  | {
      kind: "exercise";
      id: string;
      prompt: string;
      starter: string;
      solution: string;
      /**
       * Python appended after the learner's code. Raise/assert to fail.
       * Runs in the same namespace, so it can call their functions.
       */
      tests: string;
      hint?: string;
    };

export type QuizQuestion = {
  question: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  explain: string;
};

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  /** Rough reading + practice time, in minutes. */
  minutes: number;
  objectives: string[];
  blocks: Block[];
  quiz: QuizQuestion[];
};

export type Module = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
};
