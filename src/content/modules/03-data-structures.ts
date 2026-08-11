import type { Module } from "../types";

export const dataStructures: Module = {
  id: "data-structures",
  title: "Data Structures",
  description:
    "Store many values at once. Lists, tuples, sets, and dictionaries — and how to pick the right one.",
  lessons: [
    {
      slug: "lists",
      title: "Lists",
      summary:
        "Ordered, changeable collections — the workhorse container of Python.",
      minutes: 16,
      objectives: [
        "Create, index, and slice lists",
        "Add and remove items with append, insert, pop, and remove",
        "Sort and reverse lists, in place or into a copy",
      ],
      blocks: [
        {
          kind: "text",
          md: `A **list** holds many values in order, written in square brackets. Items can be of any type, and — unlike strings — a list can be changed after it is created.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `scores = [88, 92, 79, 95, 61]
mixed = ["Ada", 36, True, 3.14]
empty = []

print(scores)
print(len(scores))
print(scores[0], scores[-1])   # first and last
print(scores[1:3])             # slicing works exactly like strings`,
          output: `[88, 92, 79, 95, 61]
5
88 61
[92, 79]`,
        },
        {
          kind: "text",
          md: `### Lists are mutable

You can assign straight into an index, which is the key difference from strings.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `colours = ["red", "green", "blue"]

colours[1] = "lime"          # replace in place
print(colours)

colours.append("violet")     # add to the end
colours.insert(0, "amber")   # add at a position
print(colours)

removed = colours.pop()      # remove and return the last item
print(removed, colours)

colours.remove("lime")       # remove by value (first match)
print(colours)`,
          output: `['red', 'lime', 'blue']
['amber', 'red', 'lime', 'blue', 'violet']
violet ['amber', 'red', 'lime', 'blue']
['amber', 'red', 'blue']`,
        },
        {
          kind: "callout",
          tone: "note",
          title: "append vs. extend",
          md: `\`a.append(b)\` adds \`b\` as a **single item** — appending a list gives you a nested list. \`a.extend(b)\` adds each of \`b\`'s items individually. \`a + b\` builds a new combined list without touching either.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `a = [1, 2]
b = [3, 4]

nested = [1, 2]
nested.append(b)
print(nested)          # b went in whole

flat = [1, 2]
flat.extend(b)
print(flat)            # items unpacked

print(a + b)           # a and b are unchanged
print(a * 2)           # repetition`,
          output: `[1, 2, [3, 4]]
[1, 2, 3, 4]
[1, 2, 3, 4]
[1, 2, 1, 2]`,
        },
        {
          kind: "text",
          md: `### Sorting

\`.sort()\` reorders the list **in place** and returns \`None\`. \`sorted()\` leaves the original alone and returns a **new** sorted list. Confusing the two is a classic beginner bug.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `scores = [88, 92, 79, 95, 61]

print(sorted(scores))               # new list
print(scores)                       # original untouched

scores.sort(reverse=True)           # in place, highest first
print(scores)

names = ["delta", "Alpha", "charlie"]
print(sorted(names, key=str.lower)) # case-insensitive sort

print(max(scores), min(scores), sum(scores))`,
          output: `[61, 79, 88, 92, 95]
[88, 92, 79, 95, 61]
[95, 92, 88, 79, 61]
['Alpha', 'charlie', 'delta']
95 61 415`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Two names can point at one list",
          md: `\`b = a\` does **not** copy — both names now refer to the same list, so changing one appears to change the other. Use \`b = a.copy()\` (or \`b = a[:]\`) when you want an independent copy.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `a = [1, 2, 3]
b = a            # same list, two names
b.append(4)
print(a)         # a changed too!

c = a.copy()     # independent copy
c.append(99)
print(a, c)`,
          output: `[1, 2, 3, 4]
[1, 2, 3, 4] [1, 2, 3, 4, 99]`,
        },
        {
          kind: "exercise",
          id: "list-1",
          prompt:
            "Write a function `top_three(scores)` that returns a new list of the three highest scores, highest first. The original list must not be modified.",
          starter: `def top_three(scores):
    ...

data = [55, 91, 78, 99, 62, 84]
print(top_three(data))
print(data)   # must be unchanged`,
          solution: `def top_three(scores):
    return sorted(scores, reverse=True)[:3]

data = [55, 91, 78, 99, 62, 84]
print(top_three(data))
print(data)`,
          hint: "sorted() returns a new list and never mutates. Slice the first three off the front.",
          tests: `original = [55, 91, 78, 99, 62, 84]
copy_of = original[:]
assert top_three(original) == [99, 91, 84], "Should return the three highest, highest first"
assert original == copy_of, "The input list must not be modified — use sorted(), not .sort()"
assert top_three([5, 1]) == [5, 1], "Fewer than three items should still work"`,
        },
      ],
      quiz: [
        {
          question: "What does `[1, 2, 3].append([4, 5])` produce?",
          options: ["[1, 2, 3, 4, 5]", "[1, 2, 3, [4, 5]]", "[[1,2,3],[4,5]]", "An error"],
          answer: 1,
          explain:
            "`append` adds its argument as one item, so the list ends up nested. `extend` would have flattened it into [1, 2, 3, 4, 5].",
        },
        {
          question: "What does `scores.sort()` return?",
          options: ["A new sorted list", "None", "The original list", "The number of items"],
          answer: 1,
          explain:
            "`.sort()` mutates in place and returns None — which is why `x = scores.sort()` leaves `x` as None. Use `sorted(scores)` for a new list.",
        },
        {
          question: "After `b = a` where `a = [1, 2]`, then `b.append(3)`, what is `a`?",
          options: ["[1, 2]", "[1, 2, 3]", "[3]", "An error"],
          answer: 1,
          explain:
            "Assignment binds another name to the *same* list object. Both names see the append. `b = a.copy()` would have kept them independent.",
        },
      ],
    },

    {
      slug: "tuples-and-sets",
      title: "Tuples and Sets",
      summary:
        "Two more containers: one that cannot change, one that removes duplicates.",
      minutes: 12,
      objectives: [
        "Create tuples and explain why immutability is useful",
        "Unpack a tuple into several variables",
        "Use sets for uniqueness and fast membership tests",
      ],
      blocks: [
        {
          kind: "text",
          md: `### Tuples

A **tuple** is an ordered collection like a list, but **immutable** — once built it cannot be changed. Write it with parentheses (or just commas).

Reach for a tuple when the group is a fixed record: a coordinate, an RGB colour, a row from a database.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `point = (3, 7)
colour = (255, 128, 0)
single = (42,)          # the trailing comma is what makes it a tuple

print(point[0], point[1])
print(len(colour))

try:
    point[0] = 99
except TypeError as e:
    print("Cannot change a tuple:", e)`,
          output: `3 7
3
Cannot change a tuple: 'tuple' object does not support item assignment`,
        },
        {
          kind: "text",
          md: `### Unpacking

Assigning a tuple to several names at once splits it apart. This is used constantly — it is also how a function returns more than one value.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `point = (3, 7)
x, y = point
print(x, y)

# swapping without a temporary variable
a, b = 1, 2
a, b = b, a
print(a, b)

def min_max(numbers):
    return min(numbers), max(numbers)   # returns a tuple

low, high = min_max([8, 3, 91, 22])
print(low, high)`,
          output: `3 7
2 1
3 91`,
        },
        {
          kind: "text",
          md: `### Sets

A **set** is an unordered collection with **no duplicates**. Written with braces, or built with \`set()\`.

Two things make sets worth knowing: removing duplicates is a one-liner, and testing membership is dramatically faster than scanning a list.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `visitors = ["ada", "bob", "ada", "cleo", "bob", "ada"]

unique = set(visitors)
print(len(unique), "unique visitors")

print("ada" in unique)      # membership test

# Printed via sorted(), because a set has no order of its own —
# printing it directly can show the names in any arrangement.
print(sorted(unique))`,
          output: `3 unique visitors
True
['ada', 'bob', 'cleo']`,
        },
        {
          kind: "callout",
          tone: "note",
          title: "Sets have no order",
          md: `Printing a set may show its items in any order, and there is no \`my_set[0]\` — indexing a set is an error. If order matters, convert to a list with \`sorted()\`.

Also note: \`{}\` alone creates an empty **dict**, not a set. Use \`set()\` for an empty set.`,
        },
        {
          kind: "text",
          md: `### Set maths

Sets support the operations you know from Venn diagrams, which makes "who is in both lists?" questions trivial.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `python_devs = {"ada", "bob", "cleo"}
rust_devs = {"bob", "dan"}

# sorted() again, purely so the output is in a predictable order
print(sorted(python_devs | rust_devs))   # union — either
print(sorted(python_devs & rust_devs))   # intersection — both
print(sorted(python_devs - rust_devs))   # difference — Python only
print(sorted(python_devs ^ rust_devs))   # symmetric difference — exactly one`,
          output: `['ada', 'bob', 'cleo', 'dan']
['bob']
['ada', 'cleo']
['ada', 'cleo', 'dan']`,
        },
        {
          kind: "exercise",
          id: "set-1",
          prompt:
            "Write `dedupe(items)` that returns a sorted list of the unique values in `items`.",
          starter: `def dedupe(items):
    ...

print(dedupe(["c", "a", "b", "a", "c"]))`,
          solution: `def dedupe(items):
    return sorted(set(items))

print(dedupe(["c", "a", "b", "a", "c"]))`,
          hint: "set() removes duplicates, sorted() puts them in order and returns a list.",
          tests: `assert dedupe(["c", "a", "b", "a", "c"]) == ["a", "b", "c"]
assert dedupe([3, 1, 3, 2]) == [1, 2, 3]
assert dedupe([]) == []
assert isinstance(dedupe([1]), list), "Return a list, not a set"`,
        },
      ],
      quiz: [
        {
          question: "Which statement about tuples is true?",
          options: [
            "They cannot be indexed",
            "They cannot be changed after creation",
            "They cannot hold strings",
            "They are always faster to create than lists",
          ],
          answer: 1,
          explain:
            "Tuples are immutable. They index and slice just like lists, and can hold any type.",
        },
        {
          question: "What is `len(set([1, 2, 2, 3, 3, 3]))`?",
          options: ["6", "3", "2", "1"],
          answer: 1,
          explain: "The set collapses duplicates to {1, 2, 3}, so its length is 3.",
        },
      ],
    },

    {
      slug: "dictionaries",
      title: "Dictionaries",
      summary:
        "Look values up by name instead of position — the structure behind settings, records, and JSON.",
      minutes: 16,
      objectives: [
        "Create dictionaries and read values by key",
        "Add, update, and delete entries safely",
        "Iterate over keys, values, and items",
      ],
      blocks: [
        {
          kind: "text",
          md: `A **dictionary** maps **keys** to **values**. Where a list answers "what is at position 2?", a dict answers "what is stored under \`'email'\`?"`,
        },
        {
          kind: "code",
          runnable: true,
          code: `user = {
    "name": "Ada Lovelace",
    "age": 36,
    "languages": ["Python", "assembly"],
    "active": True,
}

print(user["name"])
print(user["languages"][0])
print(len(user), "fields")`,
          output: `Ada Lovelace
Python
4 fields`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Missing keys raise KeyError",
          md: `\`user["email"]\` on a dict with no \`email\` key crashes with \`KeyError\`. Use \`user.get("email")\` to get \`None\` instead, or \`user.get("email", "none on file")\` to supply a default.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `user = {"name": "Ada", "age": 36}

print(user.get("email"))                  # None — no crash
print(user.get("email", "not provided"))  # your own default
print("age" in user)                      # membership tests the KEYS

try:
    print(user["email"])
except KeyError:
    print("KeyError — that key does not exist")`,
          output: `None
not provided
True
KeyError — that key does not exist`,
        },
        {
          kind: "text",
          md: `### Changing a dictionary

Assigning to a key sets it, whether or not it already existed.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `settings = {"theme": "light", "font_size": 14}

settings["theme"] = "dark"          # update existing
settings["autosave"] = True         # add new
print(settings)

del settings["font_size"]           # remove
print(settings)

removed = settings.pop("autosave", None)   # remove and return, safely
print(removed, settings)`,
          output: `{'theme': 'dark', 'font_size': 14, 'autosave': True}
{'theme': 'dark', 'autosave': True}
True {'theme': 'dark'}`,
        },
        {
          kind: "text",
          md: `### Looping

Looping over a dict directly gives you its **keys**. Use \`.values()\` for values and \`.items()\` for both at once — \`.items()\` is the one you will want most often.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `stock = {"apples": 12, "pears": 0, "figs": 7}

for name in stock:
    print(name, end=" ")
print()

for count in stock.values():
    print(count, end=" ")
print()

for name, count in stock.items():
    status = "in stock" if count else "OUT"
    print(f"{name:8} {count:3}  {status}")`,
          output: `apples pears figs
12 0 7
apples    12  in stock
pears      0  OUT
figs       7  in stock`,
        },
        {
          kind: "text",
          md: `### Counting with a dictionary

A dict is the natural tool for tallies. The \`.get(key, 0) + 1\` idiom handles the "first time I have seen this" case without a special branch.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `text = "the quick brown fox jumps over the lazy dog the end"

counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1

# sort by count, highest first
ranked = sorted(counts.items(), key=lambda pair: pair[1], reverse=True)
for word, n in ranked[:3]:
    print(f"{word}: {n}")`,
          output: `the: 3
quick: 1
brown: 1`,
        },
        {
          kind: "exercise",
          id: "dict-1",
          prompt:
            "Write `count_letters(text)` that returns a dict mapping each letter to how many times it appears. Ignore spaces, and treat upper and lower case as the same letter.",
          starter: `def count_letters(text):
    counts = {}
    ...
    return counts

print(count_letters("Hello World"))`,
          solution: `def count_letters(text):
    counts = {}
    for ch in text.lower():
        if ch == " ":
            continue
        counts[ch] = counts.get(ch, 0) + 1
    return counts

print(count_letters("Hello World"))`,
          hint: "Lowercase the whole string first, skip spaces with continue, and use counts.get(ch, 0) + 1.",
          tests: `r = count_letters("Hello World")
assert r["l"] == 3, "l appears 3 times in 'Hello World'"
assert r["o"] == 2
assert " " not in r, "Spaces should be ignored"
assert "H" not in r, "Case should be normalised to lowercase"
assert count_letters("") == {}`,
        },
      ],
      quiz: [
        {
          question: "What does `{\"a\": 1}.get(\"b\", 0)` return?",
          options: ["A KeyError", "None", "0", "1"],
          answer: 2,
          explain:
            "`.get()` returns the supplied default when the key is absent, so it gives 0 instead of raising.",
        },
        {
          question: "What does looping `for x in my_dict:` give you?",
          options: ["The values", "The keys", "(key, value) pairs", "Nothing — dicts are not iterable"],
          answer: 1,
          explain:
            "Iterating a dict yields its keys. Use `.values()` or `.items()` for the other two.",
        },
        {
          question: "Which is the correct way to add a new key?",
          options: [
            "d.append(\"k\", v)",
            "d[\"k\"] = v",
            "d.add(\"k\", v)",
            "d.insert(\"k\", v)",
          ],
          answer: 1,
          explain:
            "Assignment into a key both creates and updates. `append`/`add`/`insert` belong to lists and sets.",
        },
      ],
    },

    {
      slug: "comprehensions",
      title: "Comprehensions",
      summary:
        "Build a new list, set, or dict from an existing one in a single readable line.",
      minutes: 12,
      objectives: [
        "Rewrite a build-a-list loop as a list comprehension",
        "Filter items with an if clause",
        "Write dict comprehensions",
      ],
      blocks: [
        {
          kind: "text",
          md: `The "make an empty list, loop, append" pattern is so common that Python has dedicated syntax for it: the **comprehension**.

Both blocks below produce the same result.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `numbers = [1, 2, 3, 4, 5]

# The long way
squares = []
for n in numbers:
    squares.append(n ** 2)
print(squares)

# The comprehension
squares = [n ** 2 for n in numbers]
print(squares)`,
          output: `[1, 4, 9, 16, 25]
[1, 4, 9, 16, 25]`,
        },
        {
          kind: "text",
          md: `Read it as three parts, left to right after the brackets:

\`[ EXPRESSION   for ITEM in COLLECTION   if CONDITION ]\`

The optional \`if\` at the end **filters** — only items that pass reach the expression.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `numbers = range(1, 11)

print([n for n in numbers if n % 2 == 0])          # keep evens
print([n ** 2 for n in numbers if n % 2 == 0])     # square the evens

words = ["  ada ", "BOB", "cleo  "]
print([w.strip().title() for w in words])

# filtering a list of dicts
users = [
    {"name": "ada", "active": True},
    {"name": "bob", "active": False},
    {"name": "cleo", "active": True},
]
print([u["name"] for u in users if u["active"]])`,
          output: `[2, 4, 6, 8, 10]
[4, 16, 36, 64, 100]
['Ada', 'Bob', 'Cleo']
['ada', 'cleo']`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "if before `for` means something different",
          md: `\`[x if x > 0 else 0 for x in nums]\` is a *conditional expression* — it transforms every item, replacing negatives with 0. \`[x for x in nums if x > 0]\` **drops** the negatives. Trailing \`if\` filters; leading \`if/else\` substitutes.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `nums = [3, -1, 4, -5, 9]

print([n for n in nums if n > 0])          # filter: 2 items removed
print([n if n > 0 else 0 for n in nums])   # substitute: same length`,
          output: `[3, 4, 9]
[3, 0, 4, 0, 9]`,
        },
        {
          kind: "text",
          md: `### Set and dict comprehensions

Swap the brackets for braces to build a set, or add \`key: value\` to build a dict.`,
        },
        {
          kind: "code",
          runnable: true,
          code: `words = ["apple", "fig", "banana", "kiwi", "fig"]

print({len(w) for w in words})                 # set of distinct lengths
print({w: len(w) for w in words})              # dict of word -> length

prices = {"tea": 2.5, "coffee": 3.8, "juice": 4.2}
print({k: v for k, v in prices.items() if v < 4})   # filter a dict`,
          output: `{3, 4, 5, 6}
{'apple': 5, 'fig': 3, 'banana': 6, 'kiwi': 4}
{'tea': 2.5, 'coffee': 3.8}`,
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Keep them to one line's worth of thinking",
          md: `Comprehensions are for simple transforms. Once you need nested loops, several conditions, or a \`try\`, a plain \`for\` loop is the readable choice. Clever is not the goal.`,
        },
        {
          kind: "exercise",
          id: "comp-1",
          prompt:
            "Write `long_words(words, n)` returning a list of the words longer than `n` characters, all uppercased — using a single comprehension.",
          starter: `def long_words(words, n):
    return [...]

print(long_words(["hi", "python", "code", "comprehension"], 4))`,
          solution: `def long_words(words, n):
    return [w.upper() for w in words if len(w) > n]

print(long_words(["hi", "python", "code", "comprehension"], 4))`,
          hint: "Expression is w.upper(); the trailing if tests len(w) > n.",
          tests: `r = long_words(["hi", "python", "code", "comprehension"], 4)
assert r == ["PYTHON", "COMPREHENSION"], "Got %r" % r
assert long_words([], 3) == []
assert long_words(["abcd"], 4) == [], "Strictly longer than n, not equal"`,
        },
      ],
      quiz: [
        {
          question: "What is `[n * 2 for n in [1, 2, 3]]`?",
          options: ["[1, 2, 3, 1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]", "6"],
          answer: 1,
          explain: "Each item is doubled by the expression, producing [2, 4, 6].",
        },
        {
          question: "Which comprehension keeps only the strings longer than 3 characters?",
          options: [
            "[w for w in words if len(w) > 3]",
            "[w if len(w) > 3 for w in words]",
            "[len(w) > 3 for w in words]",
            "[w for w in words > 3]",
          ],
          answer: 0,
          explain:
            "The filter goes at the end. Option B is a syntax error, and option C would produce a list of booleans.",
        },
      ],
    },
  ],
};
