import type { Module } from "../types";

export const applied: Module = {
  id: "applied",
  title: "Applied Python",
  description:
    "Files, objects, and the standard library — then a capstone that puts the whole course together.",
  lessons: [
    {
      slug: "files",
      title: "Reading and Writing Files",
      summary:
        "Persist data to disk with `with open(...)`, and handle text line by line.",
      minutes: 14,
      objectives: [
        "Open files safely with a with block",
        "Choose between the r, w, and a modes",
        "Read a file line by line and write results back out",
      ],
      blocks: [
        {
          kind: "callout",
          tone: "note",
          title: "These examples really do run",
          md: `Python here executes in your browser through WebAssembly, with its own private in-memory filesystem. Files you create are real to Python but never touch your actual disk — and they disappear when the page reloads.`,
        },
        {
          kind: "text",
          md: `\`open()\` gives you a file object. Always use it in a \`with\` block: the file is closed automatically when the block ends, even if an error is raised partway through.

The second argument is the **mode**:

- \`"r"\` — read (the default); errors if the file is missing
- \`"w"\` — write; **creates or truncates**, wiping any existing content
- \`"a"\` — append; adds to the end, keeping what is there`,
        },
        {
          kind: "code",
          runnable: true,
          code: `# Write — creates the file (or wipes it if it already existed)
with open("notes.txt", "w") as f:
    f.write("First line\\n")        # \\n is the newline; write() adds none
    f.write("Second line\\n")

# Append — keeps what is already there
with open("notes.txt", "a") as f:
    f.write("Third line\\n")

# Read the whole thing
with open("notes.txt", "r") as f:
    content = f.read()

print(content)
print("---")
print(f"{len(content)} characters")`,
          output: `First line
Second line
Third line

---
34 characters`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "\"w\" destroys the file",
          md: `Opening an existing file with \`"w"\` empties it the moment it opens — before you have written anything. If you meant to add to a file, the mode you want is \`"a"\`.`,
        },
        {
          kind: "text",
          md: `### Reading line by line

For anything but a small file, loop over the file object directly. It yields one line at a time and never loads the whole thing into memory. Each line keeps its trailing newline, so \`.strip()\` is usually the next step.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `with open("scores.csv", "w") as f:
    f.write("ada,88\\nbob,92\\ncleo,79\\n")

total = 0
count = 0

with open("scores.csv") as f:          # "r" is the default
    for line in f:
        name, score = line.strip().split(",")
        print(f"{name:6} {score}")
        total += int(score)
        count += 1

print(f"Average: {total / count:.1f}")`,
          output: `ada    88
bob    92
cleo   79
Average: 86.3`,
        },
        {
          kind: "text",
          md: `### Missing files

Reading a file that does not exist raises \`FileNotFoundError\`. Catch it rather than letting the program die.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `def load(path, default=""):
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        return default

print(repr(load("nope.txt", "<no such file>")))`,
          output: `'<no such file>'`,
        },
        {
          kind: "exercise",
          id: "file-1",
          prompt:
            "Write `save_and_count(path, lines)` that writes each string in `lines` to `path` as its own line, then reopens the file and returns the number of lines it contains.",
          starter: `def save_and_count(path, lines):
    ...

print(save_and_count("out.txt", ["alpha", "beta", "gamma"]))`,
          solution: `def save_and_count(path, lines):
    with open(path, "w") as f:
        for line in lines:
            f.write(line + "\\n")
    with open(path) as f:
        return len(f.readlines())

print(save_and_count("out.txt", ["alpha", "beta", "gamma"]))`,
          hint: "Remember to add \\n after each line. readlines() returns a list of lines.",
          tests: `assert save_and_count("t1.txt", ["a", "b", "c"]) == 3
with open("t1.txt") as f:
    assert f.read() == "a\\nb\\nc\\n", "Each item should be on its own line"
assert save_and_count("t2.txt", []) == 0`,
        },
      ],
      quiz: [
        {
          question: "What is the advantage of `with open(...) as f:` over a plain `open()`?",
          options: [
            "It reads the file faster",
            "It closes the file automatically, even if an error occurs",
            "It allows reading and writing at once",
            "It creates the file if missing",
          ],
          answer: 1,
          explain:
            "The `with` block guarantees the file is closed when the block exits, by any route including an exception.",
        },
        {
          question: "What happens to an existing file opened with mode `\"w\"`?",
          options: [
            "New content is added to the end",
            "Its contents are erased",
            "Python raises an error",
            "It is opened read-only",
          ],
          answer: 1,
          explain:
            "`\"w\"` truncates the file to zero length on open. Use `\"a\"` to append instead.",
        },
      ],
    },

    {
      slug: "classes",
      title: "Classes and Objects",
      summary:
        "Bundle data with the functions that operate on it, and model things in your problem domain.",
      minutes: 17,
      objectives: [
        "Define a class with __init__ and instance attributes",
        "Write methods that use self",
        "Give a class a readable __str__",
      ],
      blocks: [
        {
          kind: "text",
          md: `You have already used objects constantly — every string, list, and dict is one, and methods like \`.append()\` are functions attached to them.

A **class** lets you define your own kind of object: a template that bundles data (**attributes**) with behaviour (**methods**).`,
        },
        {
          kind: "code",
          runnable: true,
          code: `class Dog:
    def __init__(self, name, age):
        # runs automatically when you create a Dog
        self.name = name          # store the data ON this object
        self.age = age

    def speak(self):
        return f"{self.name} says woof!"

    def human_years(self):
        return self.age * 7

rex = Dog("Rex", 3)               # calls __init__
bella = Dog("Bella", 5)

print(rex.name, rex.age)
print(rex.speak())
print(bella.speak())
print(f"{bella.name} is {bella.human_years()} in human years")`,
          output: `Rex 3
Rex says woof!
Bella says woof!
Bella is 35 in human years`,
        },
        {
          kind: "callout",
          tone: "note",
          title: "What is `self`?",
          md: `\`self\` is the object the method was called on. \`rex.speak()\` passes \`rex\` in as \`self\` automatically — which is why every method lists it first but you never supply it at the call site. Inside a method, \`self.name\` means "this particular dog's name".`,
        },
        {
          kind: "text",
          md: `### Methods that change state

Attributes can be updated like any variable. Methods that mutate the object are how you keep the rules in one place, rather than scattering them across the program.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        self.history = []

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self.balance += amount
        self.history.append(("deposit", amount))

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount
        self.history.append(("withdraw", amount))

acct = BankAccount("Ada", 100)
acct.deposit(50)
acct.withdraw(30)

print(acct.balance)
print(acct.history)

try:
    acct.withdraw(9999)
except ValueError as e:
    print("Rejected:", e)`,
          output: `120
[('deposit', 50), ('withdraw', 30)]
Rejected: insufficient funds`,
        },
        {
          kind: "text",
          md: `### \`__str__\`: printing something useful

By default, printing an object shows an unhelpful \`<__main__.Dog object at 0x...>\`. Define \`__str__\` to control that.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"Point({self.x}, {self.y})"

    def distance_to(self, other):
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5

a = Point(0, 0)
b = Point(3, 4)
print(a)
print(b)
print(a.distance_to(b))`,
          output: `Point(0, 0)
Point(3, 4)
5.0`,
        },
        {
          kind: "text",
          md: `### Inheritance

A class can build on another, keeping what fits and replacing what does not. \`super().__init__(...)\` runs the parent's setup so you do not repeat it.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

    def introduce(self):
        return f"{self.name} says {self.speak()}"

class Cat(Animal):
    def speak(self):
        return "meow"

class Cow(Animal):
    def speak(self):
        return "moo"

class Puppy(Animal):
    def __init__(self, name, breed):
        super().__init__(name)      # let Animal set self.name
        self.breed = breed

    def speak(self):
        return "yip"

for animal in [Cat("Tom"), Cow("Daisy"), Puppy("Rex", "corgi")]:
    print(animal.introduce())`,
          output: `Tom says meow
Daisy says moo
Rex says yip`,
        },
        {
          kind: "exercise",
          id: "class-1",
          prompt:
            "Write a `Rectangle` class taking `width` and `height`. Give it an `area()` method, a `perimeter()` method, and a `__str__` returning `Rectangle 3x4`.",
          starter: `class Rectangle:
    def __init__(self, width, height):
        ...

r = Rectangle(3, 4)
print(r, r.area(), r.perimeter())`,
          solution: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

    def __str__(self):
        return f"Rectangle {self.width}x{self.height}"

r = Rectangle(3, 4)
print(r, r.area(), r.perimeter())`,
          hint: "Store width and height on self in __init__, then use them in the other methods.",
          tests: `r = Rectangle(3, 4)
assert r.width == 3 and r.height == 4
assert r.area() == 12, "area should be width * height"
assert r.perimeter() == 14, "perimeter should be 2*(w+h)"
assert str(r) == "Rectangle 3x4", "__str__ should return 'Rectangle 3x4', got %r" % str(r)
assert Rectangle(5, 5).area() == 25`,
        },
      ],
      quiz: [
        {
          question: "When does `__init__` run?",
          options: [
            "When the class is defined",
            "Each time a new instance is created",
            "Only when you call it by name",
            "When the object is deleted",
          ],
          answer: 1,
          explain:
            "`__init__` is the initialiser — Python calls it automatically for every new instance, right after the object is created.",
        },
        {
          question: "What does `self` refer to inside a method?",
          options: [
            "The class itself",
            "The particular instance the method was called on",
            "The module",
            "The parent class",
          ],
          answer: 1,
          explain:
            "`self` is the instance. `rex.speak()` passes `rex` as `self`, so `self.name` is that dog's name.",
        },
        {
          question: "What does `super().__init__(name)` do in a subclass?",
          options: [
            "Creates a second object",
            "Runs the parent class's initialiser",
            "Deletes the parent class",
            "Renames the instance",
          ],
          answer: 1,
          explain:
            "It calls up to the parent's `__init__` so the inherited setup runs without being copied and pasted.",
        },
      ],
    },

    {
      slug: "standard-library",
      title: "The Standard Library",
      summary:
        "A tour of the batteries included: math, random, datetime, json, and collections.",
      minutes: 13,
      objectives: [
        "Reach for the standard library before writing it yourself",
        "Work with dates, JSON, and random values",
        "Use Counter and defaultdict to simplify tallying code",
      ],
      blocks: [
        {
          kind: "text",
          md: `Python ships with a large standard library — no installation required. Knowing roughly what is in it is one of the highest-leverage things a beginner can learn, because the alternative is reinventing it badly.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `import math, statistics

print(math.sqrt(81), math.floor(2.7), math.ceil(2.1))
print(round(math.pi, 4), math.factorial(5))

print(statistics.mean([4, 8, 15, 16, 23, 42]))
print(statistics.median([4, 8, 15, 16, 23, 42]))`,
          output: `9.0 2 3
3.1416 120
18
15.5`,
        },
        {
          kind: "text",
          md: `\`random\` produces different values on every run, so there is no fixed output to compare against — press Run a few times and watch it change. Calling \`random.seed(n)\` first makes a run **reproducible**, which is what you want in a test.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `import random

print(random.randint(1, 100))
print(random.choice(["north", "south", "east", "west"]))

deck = [1, 2, 3, 4, 5]
random.shuffle(deck)
print(deck)

random.seed(42)          # seed first...
a = random.randint(1, 100)
random.seed(42)          # ...reset to the same seed...
b = random.randint(1, 100)
print(a, b, "-> identical:", a == b)`,
        },
        {
          kind: "text",
          md: `### Dates and times`,
        },
        {
          kind: "code",
          runnable: true,
          code: `from datetime import date, datetime, timedelta

launch = date(2026, 8, 9)
print(launch)
print(launch.strftime("%A, %d %B %Y"))     # formatted for humans
print(launch.year, launch.month, launch.day)

later = launch + timedelta(days=45)        # date arithmetic
print(later)
print((later - launch).days, "days apart")

parsed = datetime.strptime("2026-12-25", "%Y-%m-%d")
print(parsed.date())`,
          output: `2026-08-09
Sunday, 09 August 2026
2026 8 9
2026-09-23
45 days apart
2026-12-25`,
        },
        {
          kind: "text",
          md: `### JSON

JSON is how programs exchange structured data. \`json.dumps\` turns Python objects into a JSON string; \`json.loads\` turns one back.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `import json

record = {"name": "Ada", "skills": ["Python", "maths"], "active": True, "score": None}

text = json.dumps(record, indent=2)
print(text)

back = json.loads(text)
print(back["skills"][0], type(back))`,
          output: `{
  "name": "Ada",
  "skills": [
    "Python",
    "maths"
  ],
  "active": true,
  "score": null
}
Python <class 'dict'>`,
        },
        {
          kind: "callout",
          tone: "note",
          title: "JSON is not quite Python",
          md: `\`True\` becomes \`true\`, \`None\` becomes \`null\`, and every JSON key is a string. Tuples come back as lists — the round trip is not perfectly lossless.`,
        },
        {
          kind: "text",
          md: `### collections

\`Counter\` and \`defaultdict\` replace whole blocks of hand-written tallying code.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `from collections import Counter, defaultdict

words = "the cat sat on the mat the end".split()

counts = Counter(words)               # one line replaces the whole loop
print(counts)
print(counts.most_common(2))
print(counts["the"], counts["missing"])   # missing keys give 0, not KeyError

# defaultdict: automatic starting value for new keys
groups = defaultdict(list)
for word in words:
    groups[word[0]].append(word)      # no "if key not in dict" needed
print(dict(groups))`,
          output: `Counter({'the': 3, 'cat': 1, 'sat': 1, 'on': 1, 'mat': 1, 'end': 1})
[('the', 3), ('cat', 1)]
3 0
{'t': ['the', 'the', 'the'], 'c': ['cat'], 's': ['sat'], 'o': ['on'], 'm': ['mat'], 'e': ['end']}`,
        },
        {
          kind: "exercise",
          id: "stdlib-1",
          prompt:
            "Using `collections.Counter`, write `most_common_word(text)` that returns the single most frequent word in a sentence, lowercased.",
          starter: `from collections import Counter

def most_common_word(text):
    ...

print(most_common_word("The cat sat on the mat the end"))`,
          solution: `from collections import Counter

def most_common_word(text):
    counts = Counter(text.lower().split())
    return counts.most_common(1)[0][0]

print(most_common_word("The cat sat on the mat the end"))`,
          hint: "most_common(1) returns a list with one (word, count) tuple — index into it twice.",
          tests: `assert most_common_word("The cat sat on the mat the end") == "the"
assert most_common_word("a a a b b c") == "a"
assert most_common_word("Solo") == "solo", "Result should be lowercased"`,
        },
      ],
      quiz: [
        {
          question: "What does `json.loads(text)` do?",
          options: [
            "Writes JSON to a file",
            "Converts a JSON string into Python objects",
            "Converts Python objects into a JSON string",
            "Validates JSON without parsing it",
          ],
          answer: 1,
          explain:
            "`loads` = load-from-string, parsing JSON into dicts and lists. `dumps` goes the other way.",
        },
        {
          question: "What does `Counter(['a','b','a'])['z']` return?",
          options: ["A KeyError", "None", "0", "1"],
          answer: 2,
          explain:
            "Counter returns 0 for absent keys rather than raising, which is what makes tallying code so short.",
        },
      ],
    },

    {
      slug: "capstone-project",
      title: "Capstone: Build a Quiz App",
      summary:
        "Put variables, loops, dicts, functions, classes, and error handling together into one working program.",
      minutes: 25,
      objectives: [
        "Combine the whole course into a single program",
        "Structure code as small, testable functions",
        "Handle bad input without crashing",
      ],
      blocks: [
        {
          kind: "text",
          md: `Time to build something end to end: a quiz engine that stores questions, scores answers, tracks results, and reports a summary.

Everything it uses has appeared earlier in the course. Read each stage, run it, then tackle the exercises at the bottom.`,
        },
        {
          kind: "text",
          md: `### Stage 1 — the data

Questions are a list of dicts. Keeping data separate from logic means adding a question never requires touching the code that scores one.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `QUESTIONS = [
    {
        "prompt": "What does len('Python') return?",
        "options": ["5", "6", "7"],
        "answer": 1,
        "topic": "strings",
    },
    {
        "prompt": "Which operator gives the remainder?",
        "options": ["//", "%", "**"],
        "answer": 1,
        "topic": "operators",
    },
    {
        "prompt": "What type does 3 / 2 produce?",
        "options": ["int", "float", "str"],
        "answer": 1,
        "topic": "numbers",
    },
]

for i, q in enumerate(QUESTIONS, start=1):
    print(f"{i}. {q['prompt']}  [{q['topic']}]")`,
          output: `1. What does len('Python') return?  [strings]
2. Which operator gives the remainder?  [operators]
3. What type does 3 / 2 produce?  [numbers]`,
        },
        {
          kind: "text",
          md: `### Stage 2 — scoring one question

One small function, one job. Easy to reason about and easy to test.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `QUESTIONS = [
    {"prompt": "len('Python')?", "options": ["5", "6", "7"], "answer": 1, "topic": "strings"},
    {"prompt": "Remainder operator?", "options": ["//", "%", "**"], "answer": 1, "topic": "operators"},
]

def check(question, choice):
    """Return True if 'choice' (a 0-based index) is correct."""
    if not isinstance(choice, int):
        raise TypeError("choice must be an int")
    if not 0 <= choice < len(question["options"]):
        raise ValueError(f"choice must be 0..{len(question['options']) - 1}")
    return choice == question["answer"]

q = QUESTIONS[0]
print(check(q, 1))
print(check(q, 0))

try:
    check(q, 9)
except ValueError as e:
    print("Rejected:", e)`,
          output: `True
False
Rejected: choice must be 0..2`,
        },
        {
          kind: "text",
          md: `### Stage 3 — the full engine as a class

The class holds the questions and the running results together, and reports on them.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `from collections import Counter

class Quiz:
    def __init__(self, questions):
        self.questions = questions
        self.results = []           # list of (index, chosen, correct)

    def answer(self, index, choice):
        q = self.questions[index]
        correct = choice == q["answer"]
        self.results.append((index, choice, correct))
        return correct

    @property
    def score(self):
        return sum(1 for _, _, ok in self.results if ok)

    def weak_topics(self):
        missed = [self.questions[i]["topic"] for i, _, ok in self.results if not ok]
        return Counter(missed)

    def report(self):
        total = len(self.results)
        if total == 0:
            return "No questions answered yet."
        pct = self.score / total * 100
        grade = "PASS" if pct >= 60 else "REVIEW"
        lines = [f"Score: {self.score}/{total} ({pct:.0f}%) — {grade}"]
        for topic, n in self.weak_topics().most_common():
            lines.append(f"  revise {topic} ({n} missed)")
        return "\\n".join(lines)

QUESTIONS = [
    {"prompt": "len('Python')?", "options": ["5", "6", "7"], "answer": 1, "topic": "strings"},
    {"prompt": "Remainder operator?", "options": ["//", "%", "**"], "answer": 1, "topic": "operators"},
    {"prompt": "Type of 3 / 2?", "options": ["int", "float", "str"], "answer": 1, "topic": "numbers"},
    {"prompt": "Which is immutable?", "options": ["list", "dict", "tuple"], "answer": 2, "topic": "types"},
]

quiz = Quiz(QUESTIONS)
for i, choice in enumerate([1, 0, 1, 0]):     # a simulated attempt
    ok = quiz.answer(i, choice)
    print(f"Q{i + 1}: {'correct' if ok else 'wrong'}")

print()
print(quiz.report())`,
          output: `Q1: correct
Q2: wrong
Q3: correct
Q4: wrong

Score: 2/4 (50%) — REVIEW
  revise operators (1 missed)
  revise types (1 missed)`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Taking real input",
          md: `Outside the browser you would collect answers with \`input()\`, which pauses for the user to type. The playground on this site supports it too — type the answers into the **stdin** box, one per line, before pressing Run.

\`\`\`
choice = int(input("Your answer (1-3): ")) - 1
\`\`\``,
        },
        {
          kind: "exercise",
          id: "capstone-1",
          prompt:
            "Write `grade(score, total)` that returns `\"A\"` for 90%+, `\"B\"` for 80%+, `\"C\"` for 70%+, `\"D\"` for 60%+, and `\"F\"` below that. Return `\"F\"` if `total` is 0 rather than crashing.",
          starter: `def grade(score, total):
    ...

print(grade(9, 10), grade(7, 10), grade(0, 0))`,
          solution: `def grade(score, total):
    if total == 0:
        return "F"
    pct = score / total * 100
    if pct >= 90:
        return "A"
    elif pct >= 80:
        return "B"
    elif pct >= 70:
        return "C"
    elif pct >= 60:
        return "D"
    return "F"

print(grade(9, 10), grade(7, 10), grade(0, 0))`,
          hint: "Guard the total == 0 case first, then compute the percentage and use an elif chain from highest to lowest.",
          tests: `assert grade(10, 10) == "A"
assert grade(9, 10) == "A"
assert grade(8, 10) == "B"
assert grade(7, 10) == "C"
assert grade(6, 10) == "D"
assert grade(3, 10) == "F"
assert grade(0, 0) == "F", "A zero total must not raise ZeroDivisionError"`,
        },
        {
          kind: "exercise",
          id: "capstone-2",
          prompt:
            "Write `summarise(results)` where `results` is a list of `(topic, correct)` tuples. Return a dict mapping each topic to its percentage correct, rounded to the nearest whole number. Example: `[(\"a\", True), (\"a\", False), (\"b\", True)]` → `{\"a\": 50, \"b\": 100}`.",
          starter: `def summarise(results):
    ...

print(summarise([("a", True), ("a", False), ("b", True)]))`,
          solution: `def summarise(results):
    totals = {}
    correct = {}
    for topic, ok in results:
        totals[topic] = totals.get(topic, 0) + 1
        correct[topic] = correct.get(topic, 0) + (1 if ok else 0)
    return {t: round(correct[t] / totals[t] * 100) for t in totals}

print(summarise([("a", True), ("a", False), ("b", True)]))`,
          hint: "Tally two dicts — attempts per topic and correct answers per topic — then build the result with a dict comprehension.",
          tests: `r = summarise([("a", True), ("a", False), ("b", True)])
assert r == {"a": 50, "b": 100}, "Got %r" % r
assert summarise([]) == {}
r2 = summarise([("x", False), ("x", False)])
assert r2 == {"x": 0}
r3 = summarise([("y", True), ("y", True), ("y", False)])
assert r3 == {"y": 67}, "Round to the nearest whole number, got %r" % r3`,
        },
        {
          kind: "text",
          md: `### Where to go next

You now have the whole core of the language. Natural next steps:

- **Practise** — rebuild the quiz app from a blank file without looking. Recall beats rereading.
- **Virtual environments and pip** — \`python -m venv .venv\` then \`pip install\` to use third-party packages.
- **Pick a direction** — \`requests\` and \`FastAPI\` for web, \`pandas\` for data, \`pytest\` for testing.
- **Write tests** — the \`tests\` behind every exercise on this site are ordinary \`assert\` statements. That is genuinely how testing starts.`,
        },
      ],
      quiz: [
        {
          question: "Why keep QUESTIONS as data separate from the scoring function?",
          options: [
            "It runs faster",
            "Adding a question needs no change to the logic",
            "Python requires it",
            "It uses less memory",
          ],
          answer: 1,
          explain:
            "Separating data from logic means the two change independently — you can add, edit, or reorder questions without touching tested code.",
        },
        {
          question: "In the Quiz class, why is `score` computed from `self.results` rather than stored in its own attribute?",
          options: [
            "Attributes cannot hold numbers",
            "It can never disagree with the recorded results",
            "It is the only way to use @property",
            "Storing it would be a syntax error",
          ],
          answer: 1,
          explain:
            "Deriving a value from the source of truth removes any chance of the two drifting out of sync — a very common class of bug.",
        },
      ],
    },
  ],
};
