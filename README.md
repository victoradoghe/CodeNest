# Travis Software — Learn Python Offline

A complete, self-contained Python course built with Next.js. Nineteen lessons
take a beginner from their first `print()` to classes, files and a capstone
project — and every code sample runs against a **real Python interpreter in the
browser**.

The whole thing works with the network disconnected.

## Why it is genuinely offline

Nothing is fetched from a third party at runtime:

| Concern | How it is handled |
| --- | --- |
| Python engine | Pyodide (CPython → WebAssembly) copied into `public/pyodide` at build time and served from our own origin |
| Code editor | CodeMirror 6, bundled from npm — no CDN |
| Fonts | System font stack; `next/font/google` is deliberately **not** used, since it fetches at build time |
| Icons | `lucide-react`, bundled |
| Lesson content | Plain TypeScript data compiled into the bundle — no CMS, no API, no database |
| Progress | `localStorage` in your own browser |

Load the site once and it keeps working with Wi-Fi off. Nothing is uploaded
anywhere; there is no account and no server component.

## Getting started

Requires Node 18+ and [pnpm](https://pnpm.io).

```bash
pnpm install     # also copies the Pyodide runtime into public/pyodide
pnpm dev         # http://localhost:3000
```

Other scripts:

```bash
pnpm build       # production build (static-generates every lesson)
pnpm start       # serve the production build
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm sync:pyodide  # re-copy the Python runtime by hand
```

`pnpm sync:pyodide` runs automatically before `dev` and `build`, so
`public/pyodide` is always in step with the installed version.

### Verifying it really works offline

1. `pnpm build && pnpm start`
2. Load the site and open a lesson; press **Run** once so the Python runtime is
   cached by the browser.
3. Disconnect the network (or tick *Offline* in the browser devtools).
4. Reload. Lessons, exercises, quizzes and the playground all still work.

## How the Python execution works

`public/py-worker.js` is a **classic Web Worker** — deliberately not bundled, so
it can `importScripts("/pyodide/pyodide.js")` with no bundler involvement and no
network access.

Running Python off the main thread buys two things:

- A runaway `while True:` never freezes the page. The **Stop** button terminates
  the worker, and the next run boots a fresh interpreter.
- Output streams into the UI as it is produced rather than all at once.

Each run gets a **fresh namespace**, so state never leaks between snippets.

### How exercises are graded

Every exercise carries a `tests` string of ordinary Python assertions. After the
learner's code runs, the worker exposes anything it printed as `_OUT` and then
executes the assertions **in the same namespace** — so they can call the
functions the learner just defined:

```python
assert fizzbuzz(15) == "FizzBuzz"
assert "Hello, world!" in _OUT
```

When an assertion fails, its message is shown to the learner directly. The
grading is real execution, not string matching against an expected answer.

### `input()` support

Pyodide cannot block for console input, so programs that call `input()` read
from the **stdin panel** in the playground — one value per line, entered before
you press Run. When the lines run out, Python sees EOF.

### What is not included

The copy script pulls only the Pyodide core plus the complete Python **standard
library**. The bundled third-party wheels (numpy, pandas, scipy …) are skipped —
they would add hundreds of megabytes that this course never uses. Importing them
raises `ModuleNotFoundError`, which is honest and expected.

## Project layout

```
src/
  app/
    page.tsx                 landing page
    learn/page.tsx           course outline
    learn/[slug]/page.tsx    lesson (statically generated, one page each)
    playground/page.tsx      free-form editor
    reference/page.tsx       one-page cheat sheet
  content/
    types.ts                 the content model
    modules/01-foundations.ts … 05-applied.ts
    index.ts                 aggregation + lookup helpers
  components/
    PythonRunner.tsx         editor + run/stop + output + grading
    CodeEditor.tsx           CodeMirror 6, Python mode, theme-aware
    LessonBody.tsx           renders content blocks
    Quiz.tsx, Sidebar.tsx, …
  lib/
    python-runtime.tsx       worker lifecycle, shared by every editor
    markdown.tsx             small renderer — React nodes, no raw HTML
    progress.tsx             localStorage progress
    theme.tsx                light/dark, no flash on load
public/
  py-worker.js               Python worker (hand-written, unbundled)
  pyodide/                   runtime, copied from node_modules at build
scripts/
  copy-pyodide.mjs
```

## Adding a lesson

Lessons are data. Add an entry to the relevant file in `src/content/modules/`
and it appears in the sidebar, the outline, the progress total and the static
build automatically — no routing or component changes:

```ts
{
  slug: "sets-deep-dive",
  title: "Sets in depth",
  summary: "…",
  minutes: 12,
  objectives: ["…"],
  blocks: [
    { kind: "text", md: "Body copy with **bold** and `code`." },
    { kind: "code", runnable: true, code: "print('hi')", output: "hi" },
    { kind: "callout", tone: "tip", title: "…", md: "…" },
    {
      kind: "exercise",
      id: "sets-1",
      prompt: "…",
      starter: "…",
      solution: "…",
      tests: "assert f(1) == 2",
    },
  ],
  quiz: [{ question: "…", options: ["a", "b"], answer: 0, explain: "…" }],
}
```

Exercise `id`s must be unique across the course — progress is keyed on them.
