"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { lessonCount } from "@/content";

export default function ResetProgress() {
  const { reset, completedCount, loaded } = useProgress();
  const [confirming, setConfirming] = useState(false);

  if (!loaded || completedCount === 0) return null;

  return (
    <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-border pt-6 text-sm">
      <p className="mr-auto text-muted">
        {completedCount} of {lessonCount} lessons complete. Progress is stored
        only in this browser.
      </p>

      {confirming ? (
        <>
          <span className="text-muted">Erase all progress?</span>
          <button
            onClick={() => {
              reset();
              setConfirming(false);
            }}
            className="rounded-lg border border-red-500/50 px-2.5 py-1.5 font-medium text-red-500 hover:bg-red-500/10"
          >
            Yes, reset
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-border px-2.5 py-1.5 hover:bg-surface-2"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-muted hover:bg-surface-2 hover:text-fg"
        >
          <Trash2 size={14} aria-hidden /> Reset progress
        </button>
      )}
    </div>
  );
}
