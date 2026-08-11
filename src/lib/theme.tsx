"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePref = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "codenest:theme";

/**
 * Runs before first paint to stamp data-theme on <html>, so the page never
 * flashes the wrong colours. Kept in sync with the provider below.
 */
export const themeBootScript = `(function(){try{
var p=localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"system";
var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.setAttribute("data-theme",d?"dark":"light");
}catch(e){}})();`;

type ThemeContextValue = {
  preference: ThemePref;
  theme: ResolvedTheme;
  setPreference: (pref: ThemePref) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemIsDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePref>("system");
  const [theme, setTheme] = useState<ResolvedTheme>("light");

  // Adopt whatever the boot script already decided, then keep it in sync.
  // localStorage and matchMedia are client-only, so this must be an effect.
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemePref) || "system";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe read of an external store
    setPreferenceState(stored);
    setTheme(
      stored === "system" ? (systemIsDark() ? "dark" : "light") : stored,
    );
  }, []);

  // Resolving "system" needs matchMedia, and the result is pushed to the DOM
  // here too — this effect is the bridge to those external systems.
  useEffect(() => {
    const resolved =
      preference === "system"
        ? systemIsDark()
          ? "dark"
          : "light"
        : preference;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolves against matchMedia, client-only
    setTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);

    if (preference !== "system") return;

    // Follow the OS while the preference is "system".
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      const next = e.matches ? "dark" : "light";
      setTheme(next);
      document.documentElement.setAttribute("data-theme", next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((pref: ThemePref) => {
    setPreferenceState(pref);
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      // Private browsing with storage disabled — theme just won't persist.
    }
  }, []);

  const toggle = useCallback(() => {
    setPreference(theme === "dark" ? "light" : "dark");
  }, [theme, setPreference]);

  const value = useMemo(
    () => ({ preference, theme, setPreference, toggle }),
    [preference, theme, setPreference, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside a <ThemeProvider>");
  return ctx;
}
