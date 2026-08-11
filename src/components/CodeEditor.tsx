"use client";

import { useEffect, useRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  bracketMatching,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  indentUnit,
} from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { useTheme } from "@/lib/theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Run handler bound to Ctrl/Cmd+Enter. */
  onRun?: () => void;
  readOnly?: boolean;
  minHeight?: number;
  ariaLabel?: string;
};

/**
 * A CodeMirror 6 editor configured for Python.
 *
 * Everything is bundled from npm — no CDN — so it loads with the network off.
 */
export default function CodeEditor({
  value,
  onChange,
  onRun,
  readOnly = false,
  minHeight = 120,
  ariaLabel = "Python code editor",
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartment = useRef(new Compartment());

  // Keep the latest callbacks reachable from the CodeMirror extensions without
  // tearing down and rebuilding the editor on every render. Updated in an
  // effect rather than during render, which would be a side effect.
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);

  useEffect(() => {
    onChangeRef.current = onChange;
    onRunRef.current = onRun;
  });

  const { theme } = useTheme();

  useEffect(() => {
    if (!hostRef.current || viewRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        highlightActiveLine(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        python(),
        indentUnit.of("    "), // Python convention: four spaces
        keymap.of([
          {
            key: "Mod-Enter",
            preventDefault: true,
            run: () => {
              onRunRef.current?.();
              return true;
            },
          },
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.editable.of(!readOnly),
        EditorState.readOnly.of(readOnly),
        EditorView.theme({
          "&": { minHeight: `${minHeight}px`, backgroundColor: "transparent" },
          ".cm-content": { padding: "10px 0" },
          ".cm-gutters": { backgroundColor: "transparent", border: "none" },
        }),
        themeCompartment.current.of(theme === "dark" ? oneDark : []),
      ],
    });

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    view.contentDOM.setAttribute("aria-label", ariaLabel);

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Intentionally mount-once; updates are handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap the colour scheme without losing editor state.
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: themeCompartment.current.reconfigure(
        theme === "dark" ? oneDark : [],
      ),
    });
  }, [theme]);

  // Adopt external value changes (e.g. "Reset" or "Show solution").
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  }, [value]);

  return (
    <div
      ref={hostRef}
      className="overflow-hidden rounded-lg border border-border bg-surface"
    />
  );
}
