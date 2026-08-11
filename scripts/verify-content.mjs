/**
 * Verifies the course content against a real Python interpreter.
 *
 * It mirrors exactly what public/py-worker.js does in the browser — fresh
 * namespace, captured stdout, `_OUT` exposed to the assertions — and then:
 *
 *   1. Runs every runnable code sample that declares an expected `output`
 *      and checks that Python really prints that.
 *   2. Runs every exercise's `solution` against its `tests` and requires a pass.
 *   3. Runs every exercise's `starter` against its `tests` and requires a
 *      FAIL — a test suite the empty starter already satisfies is not testing
 *      anything.
 *
 * Run with:  pnpm verify
 */
import { loadPyodide } from "pyodide";

const MODULES = [
  "../src/content/modules/01-foundations.ts",
  "../src/content/modules/02-control-flow.ts",
  "../src/content/modules/03-data-structures.ts",
  "../src/content/modules/04-functions.ts",
  "../src/content/modules/05-applied.ts",
];

const modules = [];
for (const path of MODULES) {
  const mod = await import(new URL(path, import.meta.url).href);
  modules.push(Object.values(mod)[0]);
}

const pyodide = await loadPyodide();

/** Same execution shape as the worker. */
async function execute(code, tests) {
  let captured = "";
  pyodide.setStdout({ batched: (t) => (captured += t + "\n") });
  pyodide.setStderr({ batched: () => {} });

  const namespace = pyodide.toPy({});
  try {
    await pyodide.runPythonAsync(code, { globals: namespace });
  } catch (err) {
    namespace.destroy();
    return { ok: false, phase: "code", error: err.message, out: captured };
  }

  if (tests) {
    try {
      namespace.set("_OUT", captured);
      await pyodide.runPythonAsync(tests, { globals: namespace });
    } catch (err) {
      namespace.destroy();
      return { ok: false, phase: "tests", error: err.message, out: captured };
    }
  }

  namespace.destroy();
  return { ok: true, out: captured };
}

const norm = (s) =>
  s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");

const failures = [];
let samples = 0;
let exercises = 0;

for (const courseModule of modules) {
  for (const lesson of courseModule.lessons) {
    process.stdout.write(`  ${lesson.slug} `);
    for (const [i, block] of lesson.blocks.entries()) {
      const where = `${lesson.slug} · block ${i}`;
      process.stdout.write(".");

      if (block.kind === "code" && block.runnable !== false) {
        const result = await execute(block.code);

        if (!result.ok) {
          failures.push(`${where}: sample raised\n    ${result.error.split("\n").pop()}`);
          continue;
        }
        if (block.output !== undefined) {
          samples++;
          if (norm(result.out) !== norm(block.output)) {
            failures.push(
              `${where}: output mismatch\n  expected: ${JSON.stringify(norm(block.output))}\n  actual:   ${JSON.stringify(norm(result.out))}`,
            );
          }
        }
      }

      if (block.kind === "exercise") {
        exercises++;

        const solved = await execute(block.solution, block.tests);
        if (!solved.ok) {
          failures.push(
            `${where} (${block.id}): SOLUTION fails its own tests [${solved.phase}]\n    ${solved.error.split("\n").pop()}`,
          );
        }

        const starter = await execute(block.starter, block.tests);
        if (starter.ok) {
          failures.push(
            `${where} (${block.id}): starter code already passes — the tests do not check anything`,
          );
        }
      }
    }
    process.stdout.write("\n");
  }
}

const lessons = modules.reduce((n, m) => n + m.lessons.length, 0);
console.log(
  `\nChecked ${lessons} lessons: ${samples} code samples with declared output, ${exercises} exercises (solution + starter).`,
);

if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n`);
  for (const f of failures) console.error(" ✗ " + f + "\n");
  process.exit(1);
}

console.log("All content verified against real Python.\n");
