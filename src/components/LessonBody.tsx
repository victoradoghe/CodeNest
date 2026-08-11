"use client";

import { Lightbulb, TriangleAlert, Info, Dumbbell } from "lucide-react";
import type { Block } from "@/content/types";
import { Markdown } from "@/lib/markdown";
import PythonRunner from "./PythonRunner";
import { useProgress } from "@/lib/progress";

const CALLOUT_STYLES = {
  tip: {
    wrap: "border-emerald-500/35 bg-emerald-500/[0.07]",
    icon: "text-emerald-600 dark:text-emerald-400",
    Icon: Lightbulb,
  },
  warn: {
    wrap: "border-amber-500/40 bg-amber-500/[0.08]",
    icon: "text-amber-600 dark:text-amber-400",
    Icon: TriangleAlert,
  },
  note: {
    wrap: "border-sky-500/35 bg-sky-500/[0.07]",
    icon: "text-sky-600 dark:text-sky-400",
    Icon: Info,
  },
} as const;

function Callout({
  tone,
  title,
  md,
}: {
  tone: keyof typeof CALLOUT_STYLES;
  title: string;
  md: string;
}) {
  const { wrap, icon, Icon } = CALLOUT_STYLES[tone];
  return (
    <aside className={`my-6 rounded-xl border px-4 py-3.5 ${wrap}`}>
      <p className="mb-1 flex items-center gap-2 font-semibold">
        <Icon size={16} className={icon} aria-hidden />
        {title}
      </p>
      <div className="text-[15px]">
        <Markdown>{md}</Markdown>
      </div>
    </aside>
  );
}

function Exercise({
  block,
}: {
  block: Extract<Block, { kind: "exercise" }>;
}) {
  const { state } = useProgress();
  const solved = Boolean(state.exercises[block.id]);

  return (
    <section className="my-8 rounded-xl border border-border bg-surface-2/60 p-4">
      <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <Dumbbell size={14} aria-hidden />
        Exercise
        {solved && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-emerald-600 dark:text-emerald-400">
            solved
          </span>
        )}
      </p>
      <div className="text-[15px]">
        <Markdown>{block.prompt}</Markdown>
      </div>
      <PythonRunner
        initialCode={block.starter}
        tests={block.tests}
        solution={block.solution}
        hint={block.hint}
        exerciseId={block.id}
        minHeight={150}
      />
    </section>
  );
}

export default function LessonBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="text-[15.5px]">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "text":
            return <Markdown key={i}>{block.md}</Markdown>;

          case "callout":
            return (
              <Callout
                key={i}
                tone={block.tone}
                title={block.title}
                md={block.md}
              />
            );

          case "exercise":
            return <Exercise key={i} block={block} />;

          case "code":
            if (block.runnable === false) {
              return (
                <pre
                  key={i}
                  className="my-5 overflow-x-auto rounded-xl border border-border bg-surface-2 p-4 font-mono text-[13px] leading-relaxed"
                >
                  <code>{block.code}</code>
                </pre>
              );
            }
            return (
              <div key={i}>
                {block.caption && (
                  <p className="mb-1 text-sm text-muted">{block.caption}</p>
                )}
                <PythonRunner
                  initialCode={block.code}
                  expectedOutput={block.output}
                  minHeight={90}
                />
              </div>
            );
        }
      })}
    </div>
  );
}
