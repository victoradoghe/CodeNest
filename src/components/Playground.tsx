"use client";

import { useState } from "react";
import PythonRunner from "./PythonRunner";

const STARTER = `# CodeNest — Python playground
# Everything here runs locally in your browser. Press Ctrl+Enter to run.

def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)

for i in range(1, 21):
    print(fizzbuzz(i), end=" ")
print()
`;

const SNIPPETS: { label: string; code: string }[] = [
  { label: "Blank", code: "" },
  { label: "FizzBuzz", code: STARTER },
  {
    label: "Word count",
    code: `from collections import Counter

text = """the quick brown fox jumps over the lazy dog
the dog barks and the fox runs"""

counts = Counter(text.lower().split())
for word, n in counts.most_common(5):
    print(f"{word:8} {n}")
`,
  },
  {
    label: "Classes",
    code: `class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("must be positive")
        self.balance += amount
        return self.balance

    def __str__(self):
        return f"{self.owner}: {self.balance:.2f}"

a = Account("Ada", 100)
a.deposit(50)
print(a)
`,
  },
  {
    label: "Files",
    code: `# A private in-memory filesystem — nothing touches your real disk.
with open("data.txt", "w") as f:
    f.write("alpha\\nbeta\\ngamma\\n")

with open("data.txt") as f:
    for i, line in enumerate(f, start=1):
        print(i, line.strip())
`,
  },
  {
    label: "input()",
    code: `# Open the stdin panel above and type a name, then a number.
name = input("Name: ")
age = int(input("Age: "))
print(f"Hi {name}, next year you turn {age + 1}.")
`,
  },
  {
    label: "Standard library",
    code: `import math, json, random
from datetime import date, timedelta

print(math.sqrt(2), math.pi)

random.seed(7)
print(random.sample(range(1, 50), 6))

today = date(2026, 8, 9)
print(today, "->", today + timedelta(days=100))

print(json.dumps({"ok": True, "items": [1, 2, 3]}, indent=2))
`,
  },
];

export default function Playground() {
  const [snippet, setSnippet] = useState(1);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted">
          Examples
        </span>
        {SNIPPETS.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setSnippet(i)}
            aria-pressed={snippet === i}
            className={`rounded-lg border px-2.5 py-1 text-[13px] transition-colors ${
              snippet === i
                ? "border-accent bg-accent/10 font-medium text-accent"
                : "border-border text-muted hover:bg-surface-2 hover:text-fg"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {/*
          Remounting on snippet change is deliberate: it resets the editor,
          output and draft to the chosen example.
        */}
        <PythonRunner
          key={snippet}
          initialCode={SNIPPETS[snippet].code}
          allowStdin
          minHeight={340}
          fill
          storageKey={snippet === 1 ? "codenest:playground:draft" : undefined}
        />
      </div>
    </div>
  );
}
