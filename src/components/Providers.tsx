"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme";
import { ProgressProvider } from "@/lib/progress";
import { PythonProvider } from "@/lib/python-runtime";

/**
 * All client-side context in one place.
 *
 * PythonProvider is outermost-but-one so a single Pyodide worker is shared by
 * every editor on the page — the runtime is downloaded at most once per visit.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ProgressProvider>
        <PythonProvider>{children}</PythonProvider>
      </ProgressProvider>
    </ThemeProvider>
  );
}
