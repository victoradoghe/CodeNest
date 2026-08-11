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

const STORAGE_KEY = "travis:progress:v1";

export type ProgressState = {
  /** Lesson slugs the learner has marked complete. */
  completed: Record<string, boolean>;
  /** Exercise id -> solved. */
  exercises: Record<string, boolean>;
  /** Lesson slug -> best quiz score as a fraction 0..1. */
  quiz: Record<string, number>;
};

const EMPTY: ProgressState = { completed: {}, exercises: {}, quiz: {} };

type ProgressContextValue = {
  state: ProgressState;
  /** False until localStorage has been read, so the UI can avoid a flash. */
  loaded: boolean;
  isComplete: (slug: string) => boolean;
  setComplete: (slug: string, value: boolean) => void;
  markExercise: (id: string) => void;
  recordQuiz: (slug: string, fraction: number) => void;
  reset: () => void;
  completedCount: number;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  // Read after hydration: localStorage is unavailable during SSR, so seeding
  // state from it in a useState initialiser would desynchronise the markup.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProgressState>;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe read of an external store
        setState({
          completed: parsed.completed ?? {},
          exercises: parsed.exercises ?? {},
          quiz: parsed.quiz ?? {},
        });
      }
    } catch {
      // Corrupt or unavailable storage — start fresh rather than crash.
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: ProgressState) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage full or blocked; progress stays in memory for this session.
    }
  }, []);

  const isComplete = useCallback(
    (slug: string) => Boolean(state.completed[slug]),
    [state.completed],
  );

  const setComplete = useCallback(
    (slug: string, value: boolean) => {
      const completed = { ...state.completed };
      if (value) completed[slug] = true;
      else delete completed[slug];
      persist({ ...state, completed });
    },
    [state, persist],
  );

  const markExercise = useCallback(
    (id: string) => {
      if (state.exercises[id]) return;
      persist({ ...state, exercises: { ...state.exercises, [id]: true } });
    },
    [state, persist],
  );

  const recordQuiz = useCallback(
    (slug: string, fraction: number) => {
      const best = Math.max(state.quiz[slug] ?? 0, fraction);
      if (best === state.quiz[slug]) return;
      persist({ ...state, quiz: { ...state.quiz, [slug]: best } });
    },
    [state, persist],
  );

  const reset = useCallback(() => persist(EMPTY), [persist]);

  const completedCount = useMemo(
    () => Object.keys(state.completed).length,
    [state.completed],
  );

  const value = useMemo(
    () => ({
      state,
      loaded,
      isComplete,
      setComplete,
      markExercise,
      recordQuiz,
      reset,
      completedCount,
    }),
    [
      state,
      loaded,
      isComplete,
      setComplete,
      markExercise,
      recordQuiz,
      reset,
      completedCount,
    ],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used inside a <ProgressProvider>");
  }
  return ctx;
}
