"use client";

import { useMemo, useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import type { QuizQuestion } from "@/content/types";
import { useProgress } from "@/lib/progress";
import { MarkdownInline } from "@/lib/markdown";

export default function Quiz({
  questions,
  lessonSlug,
}: {
  questions: QuizQuestion[];
  lessonSlug: string;
}) {
  /** question index -> chosen option index */
  const [chosen, setChosen] = useState<Record<number, number>>({});
  const { recordQuiz, state } = useProgress();

  const answeredCount = Object.keys(chosen).length;
  const allAnswered = answeredCount === questions.length;

  const score = useMemo(
    () =>
      questions.reduce(
        (sum, q, i) => sum + (chosen[i] === q.answer ? 1 : 0),
        0,
      ),
    [chosen, questions],
  );

  function choose(qIndex: number, optionIndex: number) {
    if (chosen[qIndex] !== undefined) return; // one attempt per question
    const next = { ...chosen, [qIndex]: optionIndex };
    setChosen(next);

    if (Object.keys(next).length === questions.length) {
      const correct = questions.reduce(
        (sum, q, i) => sum + (next[i] === q.answer ? 1 : 0),
        0,
      );
      recordQuiz(lessonSlug, correct / questions.length);
    }
  }

  const best = state.quiz[lessonSlug];

  return (
    <section
      className="my-8 rounded-xl border border-border bg-surface p-5"
      aria-labelledby="quiz-heading"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="quiz-heading" className="text-lg font-semibold">
          Check your understanding
        </h2>
        <div className="flex items-center gap-3 text-xs text-muted">
          {best !== undefined && !allAnswered && (
            <span>Best so far: {Math.round(best * 100)}%</span>
          )}
          <span>
            {answeredCount}/{questions.length} answered
          </span>
          {answeredCount > 0 && (
            <button
              onClick={() => setChosen({})}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-surface-2"
            >
              <RotateCcw size={12} aria-hidden /> Retry
            </button>
          )}
        </div>
      </div>

      <ol className="space-y-6">
        {questions.map((q, qi) => {
          const pick = chosen[qi];
          const answered = pick !== undefined;

          return (
            <li key={qi}>
              <fieldset>
                <legend className="mb-2.5 font-medium">
                  <span className="mr-1.5 text-muted">{qi + 1}.</span>
                  <MarkdownInline>{q.question}</MarkdownInline>
                </legend>

                <div className="space-y-1.5">
                  {q.options.map((option, oi) => {
                    const isCorrect = oi === q.answer;
                    const isPicked = pick === oi;

                    let cls =
                      "border-border hover:border-accent/60 hover:bg-surface-2";
                    if (answered && isCorrect) {
                      cls =
                        "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
                    } else if (answered && isPicked) {
                      cls =
                        "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400";
                    } else if (answered) {
                      cls = "border-border opacity-55";
                    }

                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => choose(qi, oi)}
                        disabled={answered}
                        aria-pressed={isPicked}
                        className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-default ${cls}`}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-semibold">
                          {answered && isCorrect ? (
                            <Check size={12} aria-hidden />
                          ) : answered && isPicked ? (
                            <X size={12} aria-hidden />
                          ) : (
                            String.fromCharCode(65 + oi)
                          )}
                        </span>
                        <span className="font-mono text-[13px]">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {answered && (
                  <p className="mt-2.5 rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">
                    <MarkdownInline>{q.explain}</MarkdownInline>
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {allAnswered && (
        <p
          className={`mt-5 rounded-lg px-4 py-3 text-sm font-medium ${
            score === questions.length
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }`}
          role="status"
        >
          {score === questions.length
            ? `Perfect — ${score}/${questions.length}. Move on to the next lesson.`
            : `${score}/${questions.length} correct. Read the explanations above, then hit Retry.`}
        </p>
      )}
    </section>
  );
}
