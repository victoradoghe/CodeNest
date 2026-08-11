"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The server cannot know the visitor's theme, so render a stable placeholder
  // until we are on the client. Avoids a hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- standard post-hydration mount flag
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={toggle}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-surface-2 hover:text-fg"
      aria-label={
        mounted
          ? `Switch to ${theme === "dark" ? "light" : "dark"} theme`
          : "Toggle theme"
      }
      title="Toggle theme"
    >
      {mounted && theme === "dark" ? (
        <Sun size={15} aria-hidden />
      ) : (
        <Moon size={15} aria-hidden />
      )}
    </button>
  );
}
