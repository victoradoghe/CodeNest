"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

/** Slide-over course navigation for screens narrower than `lg`. */
export default function SidebarDrawer() {
  const [open, setOpen] = useState(false);

  // Close on Escape, and stop the page scrolling behind the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="no-print lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium shadow-lg"
        aria-label="Open course contents"
      >
        <Menu size={16} aria-hidden />
        Contents
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="relative flex h-full w-[19rem] max-w-[85vw] flex-col border-r border-border bg-bg"
            role="dialog"
            aria-modal="true"
            aria-label="Course contents"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-sm font-semibold">Course contents</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg"
                aria-label="Close course contents"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <Sidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
