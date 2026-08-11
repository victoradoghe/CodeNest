import type { Module } from "../types";

export const foundations: Module = {
  id: "foundations",
  title: "Foundations",
  description:
    "Run your first program, then learn the four building blocks every Python script is made of: values, names, numbers, and text.",
  lessons: [
    {
      slug: "hello-python",
      title: "Hello, Python",
      summary:
        "What Python is, how a program actually runs, and your first working script.",
      minutes: 10,
      objectives: [
        "Explain what an interpreter does with your code",
        "Print text to the console with print()",
        "Write comments that explain your intent",
      ],
      blocks: [
        {
          kind: "text",
          md: `Python is a **general-purpose programming language**. You write plain text instructions in a file, and a program called the **interpreter** reads them top to bottom and carries them out immediately.

That "top to bottom, one line at a time" model is the single most useful thing to hold in your head as a beginner. There is no hidden starting point and no magic — execution begins at the first line of the file and walks down.`,
        },
        {
          kind: "text",
          md: `### Your first instruction

\`print()\` displays a value. The text inside the quotes is a **string** — a piece of text. Press **Run** below and watch the output panel.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `print("Hello, Python!")`,
          output: "Hello, Python!",
        },
        {
          kind: "text",
          md: `Everything to the right of \`print\` lives inside parentheses. Those parentheses mean *call this thing*. \`print\` is a **function**, and calling it with a value hands that value over to be displayed.

You can pass several values at once, separated by commas. Python puts a single space between them.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `print("CodeNest", 2026)
print("Line one")
print("Line two")`,
          output: `CodeNest 2026
Line one
Line two`,
        },
        {
          kind: "callout",
          tone: "note",
          title: "Order is everything",
          md: `Each \`print\` runs only after the one above it has finished. Reordering the lines above reorders the output — nothing else changes. Programs are recipes, and steps happen in the order written.`,
        },
        {
          kind: "text",
          md: `### Comments

A \`#\` marks the rest of the line as a **comment**. Python ignores it completely. Comments are for humans reading the code later — usually you.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `# This whole line is ignored by Python.
print("Visible")  # ...and so is everything after the hash here.

# print("This never runs because it is commented out.")`,
          output: "Visible",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Comment the why, not the what",
          md: `\`# add 1 to count\` next to \`count = count + 1\` is noise — the code already says that. \`# skip the header row\` is useful, because the reason is not visible in the code itself.`,
        },
        {
          kind: "exercise",
          id: "hello-1",
          prompt:
            "Print exactly two lines: first `Hello, world!`, then your own name on the line below it.",
          starter: `# Print "Hello, world!" on the first line,
# then print your name on the second line.
`,
          solution: `print("Hello, world!")
print("Ada")`,
          hint: "Two separate print() calls, one per line.",
          tests: `lines = [l for l in _OUT.strip().split("\\n") if l.strip()]
assert len(lines) >= 2, "Expected two lines of output, got %d" % len(lines)
assert lines[0].strip() == "Hello, world!", "First line should be exactly: Hello, world!"
assert lines[1].strip(), "Second line should contain your name"`,
        },
      ],
      quiz: [
        {
          question: "What does the Python interpreter do with a line starting with `#`?",
          options: [
            "Runs it faster than normal code",
            "Ignores it entirely",
            "Prints it to the console",
            "Reports a syntax error",
          ],
          answer: 1,
          explain:
            "A `#` begins a comment. The interpreter skips the rest of that line, so comments never affect what the program does.",
        },
        {
          question: "What does `print(\"A\", \"B\")` display?",
          options: ["AB", "A B", "A, B", "\"A\" \"B\""],
          answer: 1,
          explain:
            "Multiple arguments are printed separated by a single space by default, and the quotes are not part of the text.",
        },
      ],
    },

    {
      slug: "variables-and-types",
      title: "Variables and Types",
      summary:
        "Give values names so you can reuse them, and learn the four core types you will use constantly.",
      minutes: 14,
      objectives: [
        "Assign values to variables and reassign them",
        "Identify int, float, str, and bool values",
        "Convert between types deliberately with int(), float(), and str()",
      ],
      blocks: [
        {
          kind: "text",
          md: `A **variable** is a name attached to a value. You create one with \`=\`, which is *not* the equals of mathematics — read it as "gets" or "is assigned".`,
        },
        {
          kind: "code",
          runnable: true,
          code: `course = "Python"
lessons = 20
rating = 4.8
is_free = True

print(course, lessons, rating, is_free)`,
          output: "Python 20 4.8 True",
        },
        {
          kind: "text",
          md: `The name goes on the **left**, the value on the **right**. Python evaluates the right side first, then binds the result to the name.

A variable can be reassigned at any time, and the new value can even be a different type.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `score = 10
print(score)

score = score + 5   # read the right side first: 10 + 5 -> 15
print(score)

score = "ten"       # perfectly legal: names are not locked to a type
print(score)`,
          output: `10
15
ten`,
        },
        {
          kind: "text",
          md: `### The four core types

| Type | Meaning | Examples |
|---|---|---|
| \`int\` | whole number | \`0\`, \`42\`, \`-7\` |
| \`float\` | number with a decimal point | \`3.14\`, \`-0.5\`, \`2.0\` |
| \`str\` | text, in quotes | \`"hi"\`, \`'a'\`, \`""\` |
| \`bool\` | truth value | \`True\`, \`False\` |

\`type()\` tells you what you are holding — invaluable when debugging.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `print(type(42))
print(type(3.14))
print(type("42"))
print(type(True))`,
          output: `<class 'int'>
<class 'float'>
<class 'str'>
<class 'bool'>`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "\"42\" is not 42",
          md: `\`42\` is a number you can do arithmetic with. \`"42"\` is text that merely looks like a number. Adding \`"42" + 1\` raises a \`TypeError\`, because Python refuses to guess whether you meant \`43\` or \`"421"\`.`,
        },
        {
          kind: "text",
          md: `### Converting on purpose

When you do need to cross between types, say so explicitly with \`int()\`, \`float()\`, or \`str()\`.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `age_text = "30"
age = int(age_text)      # str -> int
print(age + 1)

price = float("19.99")   # str -> float
print(price * 2)

label = str(2026)        # int -> str
print("Year " + label)

print(int(7.9))          # float -> int truncates toward zero, it does not round`,
          output: `31
39.98
Year 2026
7`,
        },
        {
          kind: "text",
          md: `### Naming rules and habits

Names may contain letters, digits, and underscores, and may not *start* with a digit. They are case-sensitive: \`total\` and \`Total\` are two different variables.

The Python convention is \`snake_case\` — lowercase words joined by underscores. Prefer \`items_sold\` over \`x\`; the extra typing pays for itself the first time you reread the code.`,
        },
        {
          kind: "exercise",
          id: "vars-1",
          prompt:
            "Create a variable `minutes` holding the integer `150`. Then create `hours` holding that value converted to a float number of hours (150 / 60). Print `hours`.",
          starter: `minutes =
hours =
print(hours)`,
          solution: `minutes = 150
hours = minutes / 60
print(hours)`,
          hint: "Division with / always produces a float.",
          tests: `assert minutes == 150, "minutes should be the integer 150"
assert isinstance(minutes, int), "minutes should be an int, not a string"
assert abs(hours - 2.5) < 1e-9, "hours should be 2.5"
assert "2.5" in _OUT, "Remember to print(hours)"`,
        },
      ],
      quiz: [
        {
          question: "After `x = 5` then `x = x + 2`, what is `x`?",
          options: ["5", "7", "\"52\"", "An error — you cannot use x on both sides"],
          answer: 1,
          explain:
            "The right side is evaluated first using the old value (5 + 2 = 7), and the result is then reassigned to `x`.",
        },
        {
          question: "What is the type of `3.0`?",
          options: ["int", "float", "str", "bool"],
          answer: 1,
          explain:
            "The decimal point makes it a float, even though the value happens to be a whole number.",
        },
        {
          question: "What does `int(9.7)` produce?",
          options: ["10", "9", "9.7", "A TypeError"],
          answer: 1,
          explain:
            "`int()` truncates toward zero rather than rounding. Use `round(9.7)` if you want 10.",
        },
      ],
    },

    {
      slug: "numbers-and-operators",
      title: "Numbers and Operators",
      summary:
        "Arithmetic, integer division, remainders, powers, and the precedence rules that decide what runs first.",
      minutes: 12,
      objectives: [
        "Use +, -, *, /, //, %, and ** correctly",
        "Predict whether a result is an int or a float",
        "Use % to test divisibility and extract digits",
      ],
      blocks: [
        {
          kind: "text",
          md: `Python's arithmetic operators look familiar, with two that are worth real attention: \`//\` and \`%\`.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `a = 17
b = 5

print(a + b)    # addition
print(a - b)    # subtraction
print(a * b)    # multiplication
print(a / b)    # true division -> always a float
print(a // b)   # floor division -> drops the fractional part
print(a % b)    # modulo -> the remainder
print(a ** 2)   # exponent -> a squared`,
          output: `22
12
85
3.4
3
2
289`,
        },
        {
          kind: "callout",
          tone: "note",
          title: "/ always gives a float",
          md: `\`10 / 2\` is \`5.0\`, not \`5\`. If you need a whole number — an index, a count, a page number — use \`//\` or wrap the result in \`int()\`.`,
        },
        {
          kind: "text",
          md: `### Why \`%\` matters

The remainder operator answers "what is left over?", and it turns up everywhere:

- \`n % 2 == 0\` tests whether \`n\` is **even**
- \`n % 3 == 0\` tests divisibility by 3
- \`total % 60\` converts a second count into leftover seconds
- \`n % 10\` extracts the **last digit** of a number`,
        },
        {
          kind: "code",
          runnable: true,
          code: `seconds = 3725

minutes = seconds // 60      # how many whole minutes
leftover = seconds % 60      # seconds that did not fill a minute
print(minutes, "min", leftover, "sec")

print(1234 % 10)             # last digit
print(7 % 2 == 0)            # is 7 even?`,
          output: `62 min 5 sec
4
False`,
        },
        {
          kind: "text",
          md: `### Precedence

Python follows standard mathematical precedence: \`**\` first, then \`*  /  //  %\`, then \`+  -\`. Operators at the same level run left to right.

Parentheses override all of it, and are almost always clearer than relying on the table.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `print(2 + 3 * 4)      # 3*4 happens first
print((2 + 3) * 4)    # parentheses force the addition first
print(2 ** 3 ** 2)    # ** groups right to left: 2 ** (3 ** 2)
print(-3 ** 2)        # ** binds tighter than the minus sign`,
          output: `14
20
512
-9`,
        },
        {
          kind: "text",
          md: `### Shorthand assignment

Updating a variable using its own value is so common it has a shorthand. \`x += 3\` means exactly \`x = x + 3\`, and the same pattern works for \`-=\`, \`*=\`, \`/=\`, \`//=\`, \`%=\`, and \`**=\`.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `total = 100
total += 25     # 125
total -= 5      # 120
total *= 2      # 240
total //= 7     # 34
print(total)`,
          output: "34",
        },
        {
          kind: "exercise",
          id: "num-1",
          prompt:
            "You have `total_minutes = 500`. Compute `hours` (whole hours) and `mins` (leftover minutes) using `//` and `%`, then print them as `8h 20m`.",
          starter: `total_minutes = 500
hours =
mins =
print(...)`,
          solution: `total_minutes = 500
hours = total_minutes // 60
mins = total_minutes % 60
print(str(hours) + "h " + str(mins) + "m")`,
          hint: "// gives whole hours, % gives what is left over. Build the string with str() or an f-string.",
          tests: `assert hours == 8, "hours should be 8"
assert mins == 20, "mins should be 20"
assert "8h 20m" in _OUT.replace("  ", " "), "Output should contain: 8h 20m"`,
        },
      ],
      quiz: [
        {
          question: "What is `7 // 2`?",
          options: ["3.5", "3", "4", "1"],
          answer: 1,
          explain:
            "Floor division discards the fractional part and returns the int 3.",
        },
        {
          question: "What is `10 % 3`?",
          options: ["3", "3.33", "1", "0"],
          answer: 2,
          explain: "3 goes into 10 three times with 1 left over, so the remainder is 1.",
        },
        {
          question: "What is the value of `2 + 3 * 4 ** 2`?",
          options: ["400", "50", "80", "26"],
          answer: 1,
          explain: "`4 ** 2` is 16, then `3 * 16` is 48, then `2 + 48` is 50.",
        },
      ],
    },

    {
      slug: "strings",
      title: "Working with Text",
      summary:
        "Build, format, slice, and clean up strings — the type you will handle more than any other.",
      minutes: 16,
      objectives: [
        "Combine strings with concatenation and f-strings",
        "Index and slice to extract parts of a string",
        "Use common string methods like upper(), strip(), replace(), and split()",
      ],
      blocks: [
        {
          kind: "text",
          md: `A **string** is text. Single and double quotes work identically — pick whichever avoids escaping the quotes inside your text. Triple quotes span multiple lines.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `single = 'Hello'
double = "Hello"
apostrophe = "It's fine"       # double quotes avoid escaping the '
multi = """Line one
Line two"""

print(single, double)
print(apostrophe)
print(multi)`,
          output: `Hello Hello
It's fine
Line one
Line two`,
        },
        {
          kind: "text",
          md: `### f-strings: the way to build text

Putting an \`f\` before the opening quote lets you drop expressions straight into the text inside \`{}\`. This is clearer and less error-prone than gluing pieces together with \`+\`.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `name = "Ada"
lessons = 20

# The old way — noisy, and str() is required for numbers
print("Hi " + name + ", you have " + str(lessons) + " lessons.")

# The f-string way
print(f"Hi {name}, you have {lessons} lessons.")

# Any expression works inside the braces
print(f"Half done means {lessons / 2} lessons.")
print(f"{name.upper()} has {len(name)} letters.")`,
          output: `Hi Ada, you have 20 lessons.
Hi Ada, you have 20 lessons.
Half done means 10.0 lessons.
ADA has 3 letters.`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Rounding inside an f-string",
          md: `\`f"{price:.2f}"\` formats a number to exactly two decimal places — \`19.5\` becomes \`19.50\`. The part after the colon is a *format spec*, and \`.2f\` is the one you will reach for most.`,
        },
        {
          kind: "text",
          md: `### Indexing and slicing

Characters are numbered from \`0\`. Negative numbers count back from the end, so \`-1\` is the last character.

A **slice** \`text[start:stop]\` takes everything from \`start\` up to *but not including* \`stop\`.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `word = "Python"
#        012345
#       -654321

print(word[0])      # first character
print(word[-1])     # last character
print(word[0:2])    # characters 0 and 1 — stop is excluded
print(word[2:])     # from index 2 to the end
print(word[:2])     # from the start up to index 2
print(word[::-1])   # step of -1 reverses the string
print(len(word))    # how many characters`,
          output: `P
n
Py
thon
Py
nohtyP
6`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Strings cannot be changed in place",
          md: `\`word[0] = "J"\` raises a \`TypeError\`. Strings are **immutable**. Every method that "changes" a string actually returns a *new* one — you must assign it: \`word = word.replace("P", "J")\`.`,
        },
        {
          kind: "text",
          md: `### Methods you will use constantly

A **method** is a function attached to a value, called with a dot: \`value.method()\`.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `messy = "  CodeNest  "

print(messy.strip())              # remove whitespace from both ends
print(messy.strip().upper())      # methods chain left to right
print("hello".capitalize())
print("a,b,c".split(","))         # split into a list on a separator
print("-".join(["2026", "08", "09"]))
print("python".replace("py", "PY"))
print("report.pdf".endswith(".pdf"))
print("Code" in "CodeNest")   # substring test`,
          output: `CodeNest
CODENEST
Hello
['a', 'b', 'c']
2026-08-09
PYthon
True
True`,
        },
        {
          kind: "exercise",
          id: "str-1",
          prompt:
            "Given `raw = \"  ada LOVELACE  \"`, produce `clean` equal to `\"Ada Lovelace\"` — trimmed, with each word capitalised. Then print a greeting: `Hello, Ada Lovelace!`",
          starter: `raw = "  ada LOVELACE  "
clean =
print(...)`,
          solution: `raw = "  ada LOVELACE  "
clean = raw.strip().title()
print(f"Hello, {clean}!")`,
          hint: "strip() removes the padding; title() capitalises the first letter of each word.",
          tests: `assert clean == "Ada Lovelace", "clean should be exactly 'Ada Lovelace', got %r" % clean
assert "Hello, Ada Lovelace!" in _OUT, "Print the greeting: Hello, Ada Lovelace!"`,
        },
        {
          kind: "exercise",
          id: "str-2",
          prompt:
            "Write a function `initials(full_name)` that returns the uppercase initials of a name. `initials(\"ada lovelace\")` should return `\"AL\"`.",
          starter: `def initials(full_name):
    # split the name into words, take the first letter of each
    ...

print(initials("ada lovelace"))`,
          solution: `def initials(full_name):
    parts = full_name.split()
    letters = [p[0].upper() for p in parts]
    return "".join(letters)

print(initials("ada lovelace"))`,
          hint: "split() with no arguments splits on whitespace. Take part[0] of each word, uppercase it, and join with \"\".",
          tests: `assert initials("ada lovelace") == "AL", "initials('ada lovelace') should be 'AL'"
assert initials("Grace Brewster Murray Hopper") == "GBMH"
assert initials("guido") == "G"`,
        },
      ],
      quiz: [
        {
          question: "What does `\"Python\"[1:4]` produce?",
          options: ["\"Pyt\"", "\"yth\"", "\"ytho\"", "\"yth\" plus an error"],
          answer: 1,
          explain:
            "Slicing starts at index 1 ('y') and stops *before* index 4, giving 'yth'.",
        },
        {
          question: "Which produces `Total: 7.50` when `amount = 7.5`?",
          options: [
            "f\"Total: {amount}\"",
            "f\"Total: {amount:.2f}\"",
            "\"Total: \" + amount",
            "f\"Total: {amount:2f}\"",
          ],
          answer: 1,
          explain:
            "The `.2f` format spec pads to exactly two decimal places. Plain `{amount}` gives `7.5`, and concatenating a float with `+` raises a TypeError.",
        },
        {
          question: "After `s = \"hi\"` and `s.upper()`, what does `print(s)` show?",
          options: ["HI", "hi", "Hi", "An error"],
          answer: 1,
          explain:
            "Strings are immutable. `s.upper()` returns a new string that was discarded; `s` itself is unchanged. You would need `s = s.upper()`.",
        },
      ],
    },
  ],
};
