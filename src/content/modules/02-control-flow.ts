import type { Module } from "../types";

export const controlFlow: Module = {
  id: "control-flow",
  title: "Control Flow",
  description:
    "Make programs that decide and repeat. Conditions, branches, and the two kinds of loop.",
  lessons: [
    {
      slug: "booleans-and-comparisons",
      title: "Booleans and Comparisons",
      summary:
        "Ask yes/no questions about your data and combine the answers with and, or, and not.",
      minutes: 12,
      objectives: [
        "Compare values with ==, !=, <, >, <=, >=",
        "Combine conditions using and, or, not",
        "Predict which values Python treats as falsy",
      ],
      blocks: [
        {
          kind: "text",
          md: `Every decision a program makes comes down to a **bool**: \`True\` or \`False\`. Comparison operators produce them.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `age = 20

print(age == 20)   # equal to        (two equals signs!)
print(age != 20)   # not equal to
print(age > 18)    # greater than
print(age <= 18)   # less than or equal to
print("a" < "b")   # strings compare alphabetically`,
          output: `True
False
True
False
True`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "= assigns, == compares",
          md: `\`age = 20\` *sets* age to 20. \`age == 20\` *asks whether* age is 20. Using \`=\` inside an \`if\` is a \`SyntaxError\` in Python — a deliberate design choice that catches this classic bug for you.`,
        },
        {
          kind: "text",
          md: `### Combining conditions

- \`and\` — True only when **both** sides are True
- \`or\` — True when **at least one** side is True
- \`not\` — flips a bool`,
        },
        {
          kind: "code",
          runnable: true,
          code: `age = 25
has_ticket = True

print(age >= 18 and has_ticket)     # both must hold
print(age < 13 or age > 65)         # either qualifies for a discount
print(not has_ticket)

# Python lets you chain comparisons the way maths does
temperature = 22
print(18 <= temperature <= 24)      # same as: 18 <= t and t <= 24`,
          output: `True
False
False
True`,
        },
        {
          kind: "text",
          md: `### Truthiness

Any value can be used where a bool is expected. Python treats a small, memorable set of values as **falsy**; everything else is **truthy**.

Falsy: \`False\`, \`0\`, \`0.0\`, \`""\` (empty string), \`[]\` (empty list), \`{}\` (empty dict), \`None\`.

This is why \`if items:\` reads so naturally — it means "if there are any items".`,
        },
        {
          kind: "code",
          runnable: true,
          code: `print(bool(0), bool(42))
print(bool(""), bool("hi"))
print(bool([]), bool([1]))
print(bool(None))

name = ""
if not name:
    print("Name is missing")`,
          output: `False True
False True
False True
False
Name is missing`,
        },
        {
          kind: "exercise",
          id: "bool-1",
          prompt:
            "Write a function `can_vote(age, is_citizen)` that returns `True` only when the person is at least 18 **and** a citizen.",
          starter: `def can_vote(age, is_citizen):
    ...
`,
          solution: `def can_vote(age, is_citizen):
    return age >= 18 and is_citizen`,
          hint: "Return the comparison directly — no if statement needed.",
          tests: `assert can_vote(20, True) is True or can_vote(20, True) == True
assert not can_vote(17, True), "A 17 year old cannot vote"
assert not can_vote(30, False), "A non-citizen cannot vote"
assert can_vote(18, True), "18 is old enough"`,
        },
      ],
      quiz: [
        {
          question: "What does `not (5 > 3)` evaluate to?",
          options: ["True", "False", "5", "An error"],
          answer: 1,
          explain: "`5 > 3` is True, and `not True` is False.",
        },
        {
          question: "Which of these is truthy?",
          options: ["0", "\"\"", "[]", "\"0\""],
          answer: 3,
          explain:
            "`\"0\"` is a non-empty string, so it is truthy. The number 0, the empty string, and the empty list are all falsy.",
        },
      ],
    },

    {
      slug: "if-statements",
      title: "if, elif, else",
      summary:
        "Branch your program down different paths, and understand why indentation is part of the syntax.",
      minutes: 14,
      objectives: [
        "Write if / elif / else chains",
        "Use indentation to define a block",
        "Choose the right ordering for overlapping conditions",
      ],
      blocks: [
        {
          kind: "text",
          md: `An \`if\` statement runs a block of code **only when** its condition is truthy. Note the colon at the end of the line and the indented block beneath it.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `temperature = 31

if temperature > 30:
    print("It is hot.")
    print("Drink water.")

print("This always runs — it is not indented.")`,
          output: `It is hot.
Drink water.
This always runs — it is not indented.`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Indentation is the syntax",
          md: `Most languages use \`{ }\` to group statements. Python uses **indentation** — conventionally four spaces. Everything indented under the \`if\` belongs to it, and the first line back at the outer level ends the block. Mixing tabs and spaces causes \`IndentationError\`, so let your editor insert spaces.`,
        },
        {
          kind: "text",
          md: `### Adding alternatives

\`else\` catches everything the \`if\` did not. \`elif\` ("else if") adds more tests in between. Python checks them **top to bottom and stops at the first match** — at most one block ever runs.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `score = 78

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Score {score} earns a {grade}")`,
          output: "Score 78 earns a C",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Order matters when ranges overlap",
          md: `A score of 95 satisfies \`>= 90\`, \`>= 80\`, and \`>= 70\` all at once. The chain works because it tests the *most selective* condition first and stops there. Reverse the order and every passing score would come out as a "D".`,
        },
        {
          kind: "text",
          md: `### Nesting

An \`if\` can contain another \`if\`. Useful, but each level of indentation costs the reader something — if you find yourself three or four levels deep, consider combining conditions with \`and\` or extracting a function.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `logged_in = True
is_admin = False

if logged_in:
    if is_admin:
        print("Welcome, admin.")
    else:
        print("Welcome back.")
else:
    print("Please sign in.")`,
          output: "Welcome back.",
        },
        {
          kind: "exercise",
          id: "if-1",
          prompt:
            "Write a function `fizzbuzz(n)` that returns `\"FizzBuzz\"` if `n` divides by both 3 and 5, `\"Fizz\"` if only by 3, `\"Buzz\"` if only by 5, and otherwise the number itself as a string.",
          starter: `def fizzbuzz(n):
    ...

print(fizzbuzz(15), fizzbuzz(9), fizzbuzz(10), fizzbuzz(7))`,
          solution: `def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    elif n % 3 == 0:
        return "Fizz"
    elif n % 5 == 0:
        return "Buzz"
    else:
        return str(n)

print(fizzbuzz(15), fizzbuzz(9), fizzbuzz(10), fizzbuzz(7))`,
          hint: "Test the both-divisible case FIRST, or it will never be reached.",
          tests: `assert fizzbuzz(15) == "FizzBuzz"
assert fizzbuzz(30) == "FizzBuzz"
assert fizzbuzz(9) == "Fizz"
assert fizzbuzz(10) == "Buzz"
assert fizzbuzz(7) == "7", "Non-matching numbers come back as a string"`,
        },
      ],
      quiz: [
        {
          question: "In an if / elif / elif / else chain where two conditions are both True, how many blocks run?",
          options: ["Both matching blocks", "Exactly one — the first match", "All of them", "None"],
          answer: 1,
          explain:
            "Python evaluates conditions top to bottom and runs only the first block whose condition is truthy, then skips the rest of the chain.",
        },
        {
          question: "What ends an indented block in Python?",
          options: [
            "A closing brace }",
            "The `end` keyword",
            "Returning to a lower indentation level",
            "A blank line",
          ],
          answer: 2,
          explain:
            "Blocks are delimited purely by indentation. The block ends at the first line indented back to the enclosing level.",
        },
      ],
    },

    {
      slug: "for-loops",
      title: "for Loops and range()",
      summary:
        "Repeat work once per item — over a range of numbers, the characters of a string, or any collection.",
      minutes: 14,
      objectives: [
        "Loop over a sequence with for",
        "Generate number sequences with range()",
        "Accumulate a running total inside a loop",
      ],
      blocks: [
        {
          kind: "text",
          md: `A \`for\` loop runs its body **once per item** in a collection, assigning each item to the loop variable in turn.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `for language in ["Python", "Rust", "Go"]:
    print(f"I am learning {language}")

for letter in "cat":
    print(letter)`,
          output: `I am learning Python
I am learning Rust
I am learning Go
c
a
t`,
        },
        {
          kind: "text",
          md: `### range()

\`range()\` generates a sequence of integers on demand. It comes in three forms, and — like slicing — the stop value is **excluded**.

- \`range(5)\` → 0, 1, 2, 3, 4
- \`range(2, 6)\` → 2, 3, 4, 5
- \`range(0, 10, 3)\` → 0, 3, 6, 9`,
        },
        {
          kind: "code",
          runnable: true,
          code: `for i in range(5):
    print(i, end=" ")
print()

for i in range(2, 6):
    print(i, end=" ")
print()

for i in range(10, 0, -2):   # count down
    print(i, end=" ")
print()`,
          output: `0 1 2 3 4
2 3 4 5
10 8 6 4 2 `,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "range(1, n + 1) for counting from one",
          md: `\`range(5)\` starts at 0, which is right for indexes but wrong for "print 1 through 5". Use \`range(1, 6)\` — or in general \`range(1, n + 1)\` — when the numbers are meant for humans.`,
        },
        {
          kind: "text",
          md: `### Accumulating a result

The most common loop pattern: start with an empty or zero **accumulator** outside the loop, update it inside, then use it after.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `prices = [4.50, 12.00, 3.25, 8.75]

total = 0            # accumulator starts outside the loop
for price in prices:
    total += price   # updated once per item

print(f"Total: {total:.2f}")
print(f"Average: {total / len(prices):.2f}")`,
          output: `Total: 28.50
Average: 7.12`,
        },
        {
          kind: "text",
          md: `### enumerate(): index and value together

When you need the position as well as the item, \`enumerate()\` gives you both, and is far less error-prone than managing a counter by hand.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `tasks = ["write", "test", "ship"]

for i, task in enumerate(tasks, start=1):
    print(f"{i}. {task}")`,
          output: `1. write
2. test
3. ship`,
        },
        {
          kind: "exercise",
          id: "for-1",
          prompt:
            "Write a function `sum_even(n)` that returns the sum of all even numbers from 1 up to and including `n`. `sum_even(10)` should return 30 (2+4+6+8+10).",
          starter: `def sum_even(n):
    total = 0
    # loop from 1 to n, add the even ones
    return total

print(sum_even(10))`,
          solution: `def sum_even(n):
    total = 0
    for i in range(1, n + 1):
        if i % 2 == 0:
            total += i
    return total

print(sum_even(10))`,
          hint: "range(1, n + 1) to include n, and `i % 2 == 0` to test for even.",
          tests: `assert sum_even(10) == 30, "sum_even(10) should be 30"
assert sum_even(1) == 0, "No even numbers at or below 1"
assert sum_even(2) == 2
assert sum_even(100) == 2550`,
        },
      ],
      quiz: [
        {
          question: "How many times does the body of `for i in range(3):` run?",
          options: ["2", "3", "4", "Once"],
          answer: 1,
          explain: "`range(3)` yields 0, 1, 2 — three values, so three iterations.",
        },
        {
          question: "What does `range(1, 5)` produce?",
          options: ["1 2 3 4 5", "1 2 3 4", "0 1 2 3 4", "1 5"],
          answer: 1,
          explain: "It starts at 1 and stops *before* 5, giving 1, 2, 3, 4.",
        },
      ],
    },

    {
      slug: "while-loops",
      title: "while Loops, break, and continue",
      summary:
        "Repeat for as long as a condition holds — and stay out of infinite loops.",
      minutes: 13,
      objectives: [
        "Write a while loop with a condition that eventually becomes False",
        "Exit early with break and skip an iteration with continue",
        "Recognise and avoid infinite loops",
      ],
      blocks: [
        {
          kind: "text",
          md: `Use \`for\` when you know *what to loop over*. Use \`while\` when you only know *when to stop*.

A \`while\` loop rechecks its condition before every pass and keeps going while it is truthy.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `count = 3

while count > 0:
    print(count)
    count -= 1        # this line is what eventually ends the loop

print("Liftoff!")`,
          output: `3
2
1
Liftoff!`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Every while loop needs an exit",
          md: `Delete the \`count -= 1\` above and the condition stays True forever — an **infinite loop**. Before you run a \`while\`, find the line that moves it toward stopping. If you cannot point at one, it will hang.

The playground on this site runs Python in a background worker, so if you do freeze one, the **Stop** button will recover it.`,
        },
        {
          kind: "text",
          md: `### break and continue

- \`break\` leaves the loop immediately
- \`continue\` skips the rest of this pass and jumps to the next one

Both work in \`for\` loops too.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `# break: stop at the first match
for n in [4, 9, 15, 22, 30]:
    if n % 3 == 0:
        print(f"First multiple of 3: {n}")
        break

# continue: skip the ones you do not want
for n in range(1, 11):
    if n % 2 == 0:
        continue          # skip evens
    print(n, end=" ")
print()`,
          output: `First multiple of 3: 9
1 3 5 7 9 `,
        },
        {
          kind: "text",
          md: `### A processing queue

\`while\` shines when the collection shrinks or grows as you work through it.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `queue = ["render", "compress", "upload", "notify"]

while queue:                      # truthy while the list has items
    job = queue.pop(0)            # take from the front
    print(f"Running {job}... {len(queue)} left")

print("Queue empty.")`,
          output: `Running render... 3 left
Running compress... 2 left
Running upload... 1 left
Running notify... 0 left
Queue empty.`,
        },
        {
          kind: "exercise",
          id: "while-1",
          prompt:
            "Write a function `digit_count(n)` that returns how many digits a positive integer has, using a `while` loop and `//`. `digit_count(4071)` should return 4.",
          starter: `def digit_count(n):
    count = 0
    # Loop while n is still greater than 0.
    # Each pass: chop off a digit with n //= 10, and add 1 to count.
    return count

print(digit_count(4071))`,
          solution: `def digit_count(n):
    count = 0
    while n > 0:
        n //= 10
        count += 1
    return count

print(digit_count(4071))`,
          hint: "Dividing by 10 with // chops off one digit each pass. Loop while n > 0.",
          tests: `assert digit_count(4071) == 4
assert digit_count(7) == 1
assert digit_count(1000000) == 7`,
        },
      ],
      quiz: [
        {
          question: "What does `break` do inside a loop?",
          options: [
            "Skips to the next iteration",
            "Exits the loop entirely",
            "Restarts the loop from the beginning",
            "Pauses until a key is pressed",
          ],
          answer: 1,
          explain:
            "`break` terminates the loop immediately. `continue` is the one that skips to the next iteration.",
        },
        {
          question: "Which loop is the natural choice when you do not know in advance how many iterations you need?",
          options: ["for", "while", "range", "enumerate"],
          answer: 1,
          explain:
            "`while` repeats based on a condition, so it fits open-ended repetition. `for` is for iterating a known collection.",
        },
      ],
    },
  ],
};
