---
title: Objects and arrays of objects
mode: edit
entry: src/main.js
required: [dot-and-bracket, map-keeps-the-original, filter-groups, dashboard-lines]
---

An **object** holds the several facts that belong to one thing, each under a name: a student has a name and a score, a product has a title and a price.
This step reads and changes one object, then builds the Week 6 roster dashboard from an array of them, the shape of every API response and every list React renders.
Watch the original objects as you go: `map` makes new ones and leaves the old ones alone.

```demo name="object-shape"
```

Press **Run**.
`alice` is an object literal: curly braces around `key: value` pairs separated by commas, and the console prints it with its keys.
`getGrade` is the arrow function from the Week 5 session, with braces and early returns, and `roster` is six student objects in an array.

Read and change one object.

```js file="src/main.js" action="append"

console.log("Name:", alice.name);
const field = "score";
console.log("Score by variable:", alice[field]);
alice.grade = getGrade(alice.score);
console.log("With a grade:", alice);
```

Run the code.
`alice.name` is **dot notation**, `alice[field]` is **bracket notation**, which looks up whatever key the variable holds, and assigning to `alice.grade` adds a third key.

Now the whole roster.
`map` over an array of objects usually returns a new object per item.

```demo name="value-vs-reference"
```

```predict
After you append these lines and run, what does the `First original:` line print after its label?
= `{"name":"Alice","score":95}`
- `{"name":"Alice","score":95,"grade":"A"}`
- `undefined`
```

```js file="src/main.js" action="append"

const rosterWithGrades = roster.map((student) => {
  return { name: student.name, score: student.score, grade: getGrade(student.score) };
});
console.log("First with grade:", rosterWithGrades[0]);
console.log("First original:", roster[0]);
```

The callback returns a fresh object with the two original keys and a `grade`, and `roster[0]` still has two keys.

`filter` with objects asks a question about each one.

```js file="src/main.js" action="append"

const passing = rosterWithGrades.filter((student) => student.grade !== "F");
const honorRoll = rosterWithGrades.filter((student) => student.score >= 90);
console.log(`Passing: ${passing.length} of ${roster.length}`);
console.log("Honor roll:", honorRoll.map((student) => student.name));
```

Each callback reads one property with a dot and compares it, and the last line maps the honor roll to just the names.

Finish with the dashboard, one line per student.

```js file="src/main.js" action="append"

rosterWithGrades.forEach((student) => {
  const status = student.grade === "F" ? "failing" : "passing";
  console.log(`${student.name}: ${student.score} (${student.grade}) ${status}`);
});
```

`condition ? a : b` is the **ternary** operator, an `if` and `else` that produce a value.

## Read more

### Objects in arrays

An array holds many values of one kind.
Put objects in an array and you have the shape of every API response and every list React renders, which is why this step ends the topic.

### Dot, bracket, and a new key

`alice.name` is dot notation, the usual way to read a property.
`alice[field]` is bracket notation, which looks up whatever key the variable holds, so it reads `score`; `alice.field` would look for a key literally named `field` and find `undefined`.
Assigning to `alice.grade` adds a property that was not there, and the object prints with three keys, because objects, like arrays, can change in place even under `const`.

### New objects from map

The `map` callback has braces, so it says `return` explicitly, and what it returns is a fresh object with the two original keys and a `grade`.
`roster[0]` still has two keys: `map` built new objects and left the old ones alone.
It is also a different object from `alice`, even though the two hold the same name and score, so the grade added to `alice` does not show up in the roster.
That is the habit React depends on, "make a new one, do not change the old one", and it starts here.

### filter, then map

The last `filter` line chains a `map` onto the honor roll to pull out just the names, an array of strings from an array of objects.

### The ternary

The ternary is right for a two-way choice like this one and wrong for anything longer.
Six lines print, one per object, with the properties pulled into a template literal.

**If it breaks:** If `Score by variable` prints `undefined`, the line reads `alice.field` instead of `alice[field]`.
If `First with grade` has no grade or prints `undefined`, the `map` callback is missing its `return`.
If `Passing` says `6 of 6`, the filter compares `grade` with `"f"` in lowercase, and `===` is case-sensitive.

**Check:** Run the code.
The console shows Alice's name and score, her object with a grade, the first graded student beside the first original, `Passing: 5 of 6`, the two honor roll names, and six dashboard lines ending with `Frank: 45 (F) failing`.
Press **Run checks** to confirm.

```quiz
`field` holds the string `"score"`; what does `alice.field` give?
- `95`, the same as `alice[field]`
= `undefined`, because it looks for a key literally named `field`
- `"score"`, the value of the variable
> Dot notation uses the name you type as the key; bracket notation evaluates what is inside the brackets, so `alice[field]` reads `alice.score`.
```

<details>
<summary>src/main.js after this step</summary>

```js
const getGrade = (score) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

const alice = { name: "Alice", score: 95 };

const roster = [
  { name: "Alice", score: 95 },
  { name: "Bob", score: 73 },
  { name: "Charlie", score: 88 },
  { name: "Diana", score: 62 },
  { name: "Eve", score: 91 },
  { name: "Frank", score: 45 }
];

console.log("One student:", alice);
console.log("Total students:", roster.length);

console.log("Name:", alice.name);
const field = "score";
console.log("Score by variable:", alice[field]);
alice.grade = getGrade(alice.score);
console.log("With a grade:", alice);

const rosterWithGrades = roster.map((student) => {
  return { name: student.name, score: student.score, grade: getGrade(student.score) };
});
console.log("First with grade:", rosterWithGrades[0]);
console.log("First original:", roster[0]);

const passing = rosterWithGrades.filter((student) => student.grade !== "F");
const honorRoll = rosterWithGrades.filter((student) => student.score >= 90);
console.log(`Passing: ${passing.length} of ${roster.length}`);
console.log("Honor roll:", honorRoll.map((student) => student.name));

rosterWithGrades.forEach((student) => {
  const status = student.grade === "F" ? "failing" : "passing";
  console.log(`${student.name}: ${student.score} (${student.grade}) ${status}`);
});
```

</details>
