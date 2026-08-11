import type { Module } from "../types";

export const functions: Module = {
  id: "functions",
  title: "Functions and Errors",
  description:
    "Package logic into reusable pieces, organise code across modules, and handle failure without crashing.",
  lessons: [
    {
      slug: "defining-functions",
      title: "Defining Functions",
      summary:
        "Name a piece of logic once, then use it everywhere — with parameters and return values.",
      minutes: 15,
      objectives: [
        "Define a function with def and call it",
        "Distinguish parameters from arguments",
        "Return a value rather than printing it",
      ],
      blocks: [
        {
          kind: "text",
          md: `A **function** is a named block of code you can run on demand. Defining one does not run it — the body only executes when you **call** it.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `def greet():
    print("Hello!")
    print("Welcome to Travis Software.")

print("Defined, but nothing has run yet.")

greet()      # now the body runs
greet()      # and again — that is the point`,
          output: `Defined, but nothing has run yet.
Hello!
Welcome to Travis Software.
Hello!
Welcome to Travis Software.`,
        },
        {
          kind: "text",
          md: `### Parameters and arguments

A **parameter** is the name in the definition. An **argument** is the actual value you pass in when calling. Parameters make a function general instead of hard-coded.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `def greet(name, greeting="Hello"):
    #     ^parameters, with a default for the second
    print(f"{greeting}, {name}!")

greet("Ada")                          # greeting falls back to its default
greet("Bob", "Good morning")          # positional arguments, in order
greet(greeting="Hi", name="Cleo")     # keyword arguments, any order`,
          output: `Hello, Ada!
Good morning, Bob!
Hi, Cleo!`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Never default to a list or dict",
          md: `\`def add(item, bag=[])\` is a well-known trap: the empty list is created **once**, at definition time, and shared by every call that relies on the default. Use \`bag=None\` and build a fresh list inside the function instead.`,
        },
        {
          kind: "text",
          md: `### return: handing a value back

\`print\` shows something to a human. \`return\` hands a value back to the code that called the function, so it can be stored, compared, or passed on. A function that only prints cannot be reused in a calculation.

\`return\` also exits the function immediately.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `def add_printing(a, b):
    print(a + b)          # shows it, but hands back nothing

def add(a, b):
    return a + b          # hands the value back

x = add_printing(2, 3)
print("captured:", x)     # None — there was nothing to capture

y = add(2, 3)
print("captured:", y)
print(add(add(1, 2), 4))  # results can feed into other calls`,
          output: `5
captured: None
captured: 5
7`,
        },
        {
          kind: "text",
          md: `### Returning several values, and early returns

Returning a tuple lets a function hand back more than one thing. And returning early on the simple cases keeps the main path un-nested.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `def stats(numbers):
    if not numbers:                 # guard clause — handle the edge case first
        return 0, 0, 0
    return min(numbers), max(numbers), sum(numbers) / len(numbers)

low, high, mean = stats([4, 8, 15, 16, 23, 42])
print(f"low={low} high={high} mean={mean:.2f}")
print(stats([]))`,
          output: `low=4 high=42 mean=18.00
(0, 0, 0)`,
        },
        {
          kind: "text",
          md: `### Docstrings

A string on the first line of a function documents it, and \`help()\` will show it. Worth writing for anything non-obvious.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `def celsius_to_f(c):
    """Convert a Celsius temperature to Fahrenheit."""
    return c * 9 / 5 + 32

print(celsius_to_f(100))
print(celsius_to_f.__doc__)`,
          output: `212.0
Convert a Celsius temperature to Fahrenheit.`,
        },
        {
          kind: "exercise",
          id: "func-1",
          prompt:
            "Write `apply_discount(price, percent=10)` that returns the price after subtracting the given percentage, rounded to 2 decimal places. `apply_discount(50)` should return `45.0`.",
          starter: `def apply_discount(price, percent=10):
    ...

print(apply_discount(50))
print(apply_discount(80, 25))`,
          solution: `def apply_discount(price, percent=10):
    return round(price * (1 - percent / 100), 2)

print(apply_discount(50))
print(apply_discount(80, 25))`,
          hint: "Multiply by (1 - percent/100), then wrap in round(x, 2).",
          tests: `assert apply_discount(50) == 45.0, "10% off 50 is 45.0"
assert apply_discount(80, 25) == 60.0
assert apply_discount(19.99, 0) == 19.99, "0% should leave the price alone"
assert apply_discount(33.33, 15) == 28.33, "Round to 2 decimal places"`,
        },
      ],
      quiz: [
        {
          question: "What does a function return if it has no `return` statement?",
          options: ["0", "None", "An empty string", "It raises an error"],
          answer: 1,
          explain:
            "Every function returns something; without an explicit `return`, that something is `None`.",
        },
        {
          question: "In `def greet(name):`, what is `name`?",
          options: ["An argument", "A parameter", "A return value", "A global variable"],
          answer: 1,
          explain:
            "Names in the definition are parameters. The values supplied at the call site are arguments.",
        },
        {
          question: "Why prefer `return` over `print` inside a reusable function?",
          options: [
            "print is slower",
            "A returned value can be stored and used by the caller",
            "print does not work inside functions",
            "return automatically displays the value",
          ],
          answer: 1,
          explain:
            "`print` only produces text on screen. `return` gives the caller a value it can assign, test, or feed into another call.",
        },
      ],
    },

    {
      slug: "scope-and-modules",
      title: "Scope and Modules",
      summary:
        "Where variables live, and how to split a program across files and reuse the standard library.",
      minutes: 13,
      objectives: [
        "Explain local versus global scope",
        "Import modules and specific names from them",
        "Use the __name__ guard in a script",
      ],
      blocks: [
        {
          kind: "text",
          md: `### Scope

Variables created **inside** a function are **local** to it. They exist while the call runs and vanish when it returns — which is exactly what you want, since it means two functions can safely use the same variable name.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `total = 100          # global

def spend():
    total = 5        # a NEW local variable — the global is untouched
    print("inside:", total)

spend()
print("outside:", total)`,
          output: `inside: 5
outside: 100`,
        },
        {
          kind: "text",
          md: `A function can **read** a global it never assigns to. But the moment a name is assigned anywhere in the body, Python treats it as local throughout — which produces a surprising error.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `count = 0

def read_only():
    print("can read the global:", count)   # fine

def broken():
    try:
        count = count + 1                  # assignment makes count local...
    except UnboundLocalError as e:
        print("UnboundLocalError:", e)     # ...so reading it first fails

read_only()
broken()`,
          output: `can read the global: 0
UnboundLocalError: cannot access local variable 'count' where it is not associated with a value`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Pass values in, return values out",
          md: `The \`global\` keyword exists to force a write to module scope, but reaching for it is usually a design smell. A function that takes what it needs as parameters and returns its result is easier to read, test, and reuse.`,
        },
        {
          kind: "text",
          md: `### Modules

A **module** is just a \`.py\` file. \`import\` makes its contents available. Python ships with a large standard library, all of it importable with no installation.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `import math

print(math.sqrt(144))
print(math.pi)
print(math.floor(3.9), math.ceil(3.1))

# rename a long module
import datetime as dt
print(dt.date(2026, 8, 9).strftime("%d %B %Y"))`,
          output: `12.0
3.141592653589793
3 4
09 August 2026`,
        },
        {
          kind: "text",
          md: `You can also import **specific names** to skip the module prefix. Run this one a few times — the results change, so there is no fixed expected output to show you.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `from random import randint, choice

print(randint(1, 6))
print(choice(["rock", "paper", "scissors"]))`,
        },
        {
          kind: "text",
          md: `### Your own modules

If you save this as \`tools.py\`:

\`\`\`
def shout(text):
    return text.upper() + "!"
\`\`\`

then a file beside it can use \`import tools\` and call \`tools.shout("hi")\`, or \`from tools import shout\` and call \`shout("hi")\` directly.

### The \`__name__\` guard

When a file is run directly, Python sets its \`__name__\` to \`"__main__"\`. When it is imported, \`__name__\` is the module's name instead. This line is how a file can be both a reusable module and a runnable script:

\`\`\`
if __name__ == "__main__":
    main()
\`\`\`

Without it, importing the file would execute its demo code as a side effect.`,
        },
        {
          kind: "exercise",
          id: "scope-1",
          prompt:
            "Write `circle_area(radius)` that uses `math.pi` to return the area (π r²), rounded to 2 decimals. Remember the import.",
          starter: `import ...

def circle_area(radius):
    ...

print(circle_area(3))`,
          solution: `import math

def circle_area(radius):
    return round(math.pi * radius ** 2, 2)

print(circle_area(3))`,
          hint: "Area is math.pi * radius ** 2. Wrap it in round(x, 2).",
          tests: `assert circle_area(3) == 28.27, "Area of r=3 is 28.27"
assert circle_area(1) == 3.14
assert circle_area(0) == 0`,
        },
      ],
      quiz: [
        {
          question: "A variable assigned inside a function is visible where?",
          options: [
            "Everywhere in the program",
            "Only inside that function",
            "Only in functions defined after it",
            "Only at the top level",
          ],
          answer: 1,
          explain:
            "It is local: it exists only for the duration of that call and is invisible outside.",
        },
        {
          question: "What does `from math import sqrt` let you write?",
          options: ["math.sqrt(9)", "sqrt(9)", "import.sqrt(9)", "math(9)"],
          answer: 1,
          explain:
            "Importing the name directly puts `sqrt` into your namespace, so no `math.` prefix is needed.",
        },
      ],
    },

    {
      slug: "errors-and-exceptions",
      title: "Errors and Exceptions",
      summary:
        "Read a traceback, catch the failures worth catching, and raise your own.",
      minutes: 15,
      objectives: [
        "Read a traceback from the bottom up",
        "Handle specific exceptions with try/except",
        "Use else and finally, and raise your own errors",
      ],
      blocks: [
        {
          kind: "text",
          md: `### Read the last line first

When Python cannot continue it prints a **traceback**. The bottom line names the error type and message — read that first, then walk *up* to find the line in your code that triggered it.

Common types worth recognising:

| Error | Usually means |
|---|---|
| \`SyntaxError\` | A typo — a missing colon, bracket, or quote |
| \`NameError\` | Used a variable that does not exist (often a misspelling) |
| \`TypeError\` | Wrong type — e.g. \`"3" + 1\` |
| \`ValueError\` | Right type, impossible value — e.g. \`int("abc")\` |
| \`IndexError\` | List index past the end |
| \`KeyError\` | Dict key does not exist |
| \`ZeroDivisionError\` | Divided by zero |`,
        },
        {
          kind: "text",
          md: `### try / except

Wrap the risky operation in \`try\`. If it raises, the matching \`except\` block runs instead of the program crashing.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `def to_int(text):
    try:
        return int(text)
    except ValueError:
        return None

print(to_int("42"))
print(to_int("forty-two"))     # would have crashed without the except

# Different failures deserve different handling
def divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return float("inf")
    except TypeError:
        return None

print(divide(10, 2))
print(divide(10, 0))
print(divide(10, "x"))`,
          output: `42
None
5.0
inf
None`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Do not use a bare `except:`",
          md: `A bare \`except:\` swallows **everything** — including your own typos and the Ctrl-C that stops the program. Catch the specific type you expect. If you truly must catch broadly, use \`except Exception as e:\` and at minimum log \`e\`.`,
        },
        {
          kind: "text",
          md: `### else and finally

- \`else\` runs only if the \`try\` block raised nothing
- \`finally\` runs **either way** — the place for cleanup that must not be skipped`,
        },
        {
          kind: "code",
          runnable: true,
          code: `def parse(text):
    try:
        value = int(text)
    except ValueError:
        print(f"  {text!r} is not a number")
        return None
    else:
        print(f"  parsed {value}")
        return value
    finally:
        print("  (finally always runs)")

parse("10")
parse("ten")`,
          output: `  parsed 10
  (finally always runs)
  'ten' is not a number
  (finally always runs)`,
        },
        {
          kind: "text",
          md: `### Raising your own

Use \`raise\` to reject input your function cannot sensibly handle. Failing loudly and immediately beats returning a nonsense value that corrupts something three steps later.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `def set_age(age):
    if not isinstance(age, int):
        raise TypeError("age must be an integer")
    if age < 0:
        raise ValueError(f"age cannot be negative, got {age}")
    return age

print(set_age(30))

for bad in [-5, "old"]:
    try:
        set_age(bad)
    except (TypeError, ValueError) as e:
        print(f"{type(e).__name__}: {e}")`,
          output: `30
ValueError: age cannot be negative, got -5
TypeError: age must be an integer`,
        },
        {
          kind: "exercise",
          id: "err-1",
          prompt:
            "Write `safe_average(numbers)` that returns the mean of a list, but returns `0` for an empty list instead of raising `ZeroDivisionError`.",
          starter: `def safe_average(numbers):
    try:
        ...
    except ZeroDivisionError:
        ...

print(safe_average([2, 4, 6]))
print(safe_average([]))`,
          solution: `def safe_average(numbers):
    try:
        return sum(numbers) / len(numbers)
    except ZeroDivisionError:
        return 0

print(safe_average([2, 4, 6]))
print(safe_average([]))`,
          hint: "sum(numbers) / len(numbers) raises ZeroDivisionError when the list is empty.",
          tests: `assert safe_average([2, 4, 6]) == 4
assert safe_average([]) == 0, "Empty list should give 0, not an exception"
assert safe_average([5]) == 5`,
        },
      ],
      quiz: [
        {
          question: "Which error does `int(\"hello\")` raise?",
          options: ["TypeError", "ValueError", "SyntaxError", "NameError"],
          answer: 1,
          explain:
            "The argument is the right *type* (a string) but not a value int() can convert, which is exactly what ValueError means.",
        },
        {
          question: "When does a `finally` block run?",
          options: [
            "Only when no exception occurred",
            "Only when an exception occurred",
            "Always, exception or not",
            "Only if you call it explicitly",
          ],
          answer: 2,
          explain:
            "`finally` always runs, which makes it the right place for cleanup such as closing a file.",
        },
        {
          question: "Why avoid a bare `except:`?",
          options: [
            "It is slower",
            "It catches every error, hiding bugs you did not anticipate",
            "It is invalid syntax",
            "It only works at the top level",
          ],
          answer: 1,
          explain:
            "It silences unrelated failures — typos, interrupts — making problems much harder to find. Catch the specific exception you expect.",
        },
      ],
    },
  ],
};
