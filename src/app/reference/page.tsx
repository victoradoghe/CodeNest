import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reference",
  description:
    "A one-page Python cheat sheet covering syntax, built-ins, string and list methods, and the errors you will actually hit.",
};

type Row = [string, string];
type Section = { title: string; note?: string; rows: Row[] };

const SECTIONS: Section[] = [
  {
    title: "Types and conversion",
    rows: [
      ["int('42')", "text to whole number"],
      ["float('3.14')", "text to decimal number"],
      ["str(42)", "anything to text"],
      ["bool(x)", "truthiness — 0, '', [], {}, None are False"],
      ["type(x)", "what type is this?"],
      ["isinstance(x, int)", "type check that respects subclasses"],
      ["round(3.14159, 2)", "3.14"],
    ],
  },
  {
    title: "Operators",
    rows: [
      ["+  -  *", "add, subtract, multiply"],
      ["/", "true division — always a float"],
      ["//", "floor division — drops the remainder"],
      ["%", "remainder (modulo)"],
      ["**", "exponent"],
      ["+=  -=  *=  //=", "update in place"],
      ["==  !=  <  >  <=  >=", "comparison, yields a bool"],
      ["and  or  not", "combine conditions"],
      ["in  not in", "membership"],
      ["is  is not", "same object (use == for equality)"],
    ],
  },
  {
    title: "Strings",
    note: "Immutable — every method returns a new string.",
    rows: [
      ["f'{name} is {age}'", "f-string interpolation"],
      ["f'{value:.2f}'", "two decimal places"],
      ["s.upper() / s.lower()", "change case"],
      ["s.strip()", "remove surrounding whitespace"],
      ["s.title() / s.capitalize()", "title case / first letter only"],
      ["s.replace(a, b)", "substitute"],
      ["s.split(',')", "text to list"],
      ["','.join(items)", "list to text"],
      ["s.startswith(x) / s.endswith(x)", "prefix / suffix test"],
      ["s[0]  s[-1]  s[1:4]  s[::-1]", "index, slice, reverse"],
      ["len(s)", "character count"],
    ],
  },
  {
    title: "Lists",
    note: "Ordered and mutable.",
    rows: [
      ["items.append(x)", "add one item to the end"],
      ["items.extend(other)", "add each item of another list"],
      ["items.insert(i, x)", "add at a position"],
      ["items.pop() / items.pop(i)", "remove and return"],
      ["items.remove(x)", "remove first matching value"],
      ["items.sort() / items.sort(reverse=True)", "in place, returns None"],
      ["sorted(items)", "new sorted list"],
      ["items.copy() / items[:]", "independent copy"],
      ["len / sum / min / max", "aggregate built-ins"],
      ["[f(x) for x in items if cond]", "comprehension"],
    ],
  },
  {
    title: "Dictionaries and sets",
    rows: [
      ["d['key']", "read — raises KeyError if absent"],
      ["d.get('key', default)", "read safely"],
      ["d['key'] = value", "add or update"],
      ["del d['key'] / d.pop('key', None)", "remove"],
      ["d.keys() / d.values() / d.items()", "views for looping"],
      ["for k, v in d.items():", "the loop you want most often"],
      ["'key' in d", "tests keys, not values"],
      ["{k: v for k, v in pairs}", "dict comprehension"],
      ["set(items)", "unique values"],
      ["a | b   a & b   a - b", "union, intersection, difference"],
    ],
  },
  {
    title: "Control flow",
    rows: [
      ["if cond:  elif cond:  else:", "branch — first match wins"],
      ["for x in collection:", "once per item"],
      ["for i in range(start, stop, step)", "stop is excluded"],
      ["for i, x in enumerate(items, start=1)", "index and value"],
      ["for a, b in zip(xs, ys)", "walk two sequences together"],
      ["while cond:", "repeat until the condition fails"],
      ["break / continue", "exit the loop / skip this pass"],
      ["pass", "do nothing (placeholder)"],
    ],
  },
  {
    title: "Functions and classes",
    rows: [
      ["def f(a, b=1):", "definition with a default"],
      ["return value", "hand a result back to the caller"],
      ["return a, b", "return several values as a tuple"],
      ["f(*args, **kwargs)", "variable positional / keyword arguments"],
      ["lambda x: x * 2", "small anonymous function"],
      ["class Dog:", "define a type"],
      ["def __init__(self, ...)", "runs on creation"],
      ["def __str__(self)", "what print() shows"],
      ["class Puppy(Dog):", "inherit"],
      ["super().__init__(...)", "run the parent's initialiser"],
    ],
  },
  {
    title: "Errors",
    rows: [
      ["try: / except ValueError as e:", "handle a specific failure"],
      ["else:", "runs only if nothing was raised"],
      ["finally:", "always runs — cleanup goes here"],
      ["raise ValueError('message')", "reject bad input"],
      ["SyntaxError", "typo: missing colon, bracket, or quote"],
      ["NameError", "variable does not exist"],
      ["TypeError", "wrong type, e.g. 'a' + 1"],
      ["ValueError", "right type, impossible value, e.g. int('x')"],
      ["IndexError / KeyError", "no such position / no such key"],
      ["ZeroDivisionError", "divided by zero"],
    ],
  },
  {
    title: "Files and modules",
    rows: [
      ["with open(p) as f:", "read; closes automatically"],
      ["open(p, 'w')", "write — WIPES the existing file"],
      ["open(p, 'a')", "append — keeps existing content"],
      ["f.read() / f.readlines()", "whole file / list of lines"],
      ["for line in f:", "stream one line at a time"],
      ["import math", "then math.sqrt(9)"],
      ["from math import sqrt", "then sqrt(9)"],
      ["import numpy as np", "import under a shorter name"],
      ["if __name__ == '__main__':", "run only when executed directly"],
    ],
  },
  {
    title: "Useful standard library",
    rows: [
      ["math", "sqrt, floor, ceil, pi, factorial"],
      ["random", "randint, choice, shuffle, sample, seed"],
      ["datetime", "date, datetime, timedelta, strftime"],
      ["json", "dumps (to text), loads (from text)"],
      ["collections", "Counter, defaultdict, deque"],
      ["statistics", "mean, median, mode, stdev"],
      ["os / pathlib", "paths and the filesystem"],
      ["re", "regular expressions"],
    ],
  },
];

export default function ReferencePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Python reference</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Everything the course covers, on one page. Printable, and available with
        the network off like the rest of the site.
      </p>

      <div className="mt-9 grid gap-5 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="break-inside-avoid rounded-xl border border-border bg-surface p-4"
          >
            <h2 className="font-semibold">{section.title}</h2>
            {section.note && (
              <p className="mt-0.5 text-xs text-muted">{section.note}</p>
            )}
            <dl className="mt-3 space-y-1.5">
              {section.rows.map(([syntax, meaning]) => (
                <div
                  key={syntax}
                  className="grid grid-cols-1 gap-x-3 gap-y-0.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                >
                  <dt className="overflow-x-auto whitespace-nowrap font-mono text-[12.5px] text-accent">
                    {syntax}
                  </dt>
                  <dd className="text-[13px] text-muted">{meaning}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
