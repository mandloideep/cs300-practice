---
title: sort and its surprise
mode: edit
entry: index.html
required: [default-sort-compares-text, compare-function-sorts-numbers, sort-changes-the-array, to-sorted-copies]
---

Sorting a gradebook sounds like the simplest thing an array can do, and `sort` has two surprises waiting.
The first is the order it picks for numbers when you give it nothing else, and the second is what it does to the array you called it on.
This step meets both and ends with `toSorted`, the version that leaves your array alone.

Press **Run**.
The console shows `scores: [88,9,100,72,95]`, five scores in the order they were entered.

Start with three small numbers.
Predict before you run: does the console show `[1,9,10]`, `[1,10,9]`, or `[10,9,1]`?

```js file="src/main.js" action="append"

console.log("[10, 9, 1].sort():", [10, 9, 1].sort());
```

Run the code.
The console shows `[1,10,9]`.
With no arguments, `sort` turns every item into a string and puts the strings in dictionary order, character by character, and `"10"` comes before `"9"` for the same reason "ant" comes before "bee": its first character, `"1"`, comes before `"9"`.
That default is right for a list of words and wrong for every list of numbers.

Tell `sort` how to compare, with a **compare function**.

```js file="src/main.js" action="append"

const lowToHigh = scores.sort((a, b) => a - b);
console.log("Low to high:", lowToHigh);
```

`sort` calls the function with two items, `a` and `b`, many times, and reads the sign of the answer: negative puts `a` first, positive puts `b` first, and zero leaves them as they are.
`a - b` is negative exactly when `a` is smaller, so the console shows `Low to high: [9,72,88,95,100]`; `b - a` would sort from high to low.

Now look at `scores` itself.
Predict before you run: does the console show `scores now: [88,9,100,72,95]` or `scores now: [9,72,88,95,100]`?

```js file="src/main.js" action="append"

console.log("scores now:", scores);
console.log("Same array?", lowToHigh === scores);
```

Run the code.
`scores` is sorted too, and `Same array?` is `true`.
`sort` changes the array **in place** and then returns that same array, so `lowToHigh` is a second arrow to `scores`, not a sorted copy, and the order the scores were entered in is gone.
Unlike `map` and `filter`, which you met as methods that never touch their array, `sort` does.

When you need a sorted copy, use `toSorted`, which takes the same compare function and returns a new array.

```js file="src/main.js" action="append"

const byScore = roster.toSorted((a, b) => b.score - a.score);
console.log("By score:", byScore.map((student) => student.name));
console.log("roster still:", roster.map((student) => student.name));
```

The compare function reads a property of each student, `b.score - a.score`, so the highest score comes first: `By score: ["Alice","Bob","Diana"]`.
`roster still` shows the original order, `["Diana","Alice","Bob"]`, because `toSorted` built a new array and left `roster` alone.
`toSorted` is new enough that older code writes `[...roster].sort(...)` instead: copy with spread, then sort the copy.

Two things to try.
Take the compare function out of the `lowToHigh` line so that it reads `scores.sort()`, run, and see `[100,72,88,9,95]`, the same string order as `[1,10,9]`; put `(a, b) => a - b` back.
Then sort the roster by name with `roster.toSorted((a, b) => a.name.localeCompare(b.name))`; `localeCompare` compares two strings the way a dictionary does and returns a negative number, zero, or a positive number, exactly what `sort` wants, and it also puts `"alice"` and `"Alice"` together, which the default order does not.

**If it breaks:** If `Low to high` shows `[100,72,88,9,95]`, the compare function is missing.
If it sorts from high to low, the function says `b - a` instead of `a - b`.
If `roster still` is in score order, the line uses `roster.sort` instead of `roster.toSorted`.
If the console shows `TypeError: roster.toSorted is not a function`, the browser is older than 2023; update it, or use `[...roster].sort(...)`.

**Check:** Run the code.
The console shows `[1,10,9]`, `Low to high: [9,72,88,95,100]`, `scores now` with the same sorted order and `Same array? true`, `By score: ["Alice","Bob","Diana"]`, and `roster still: ["Diana","Alice","Bob"]`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const scores = [88, 9, 100, 72, 95];
const roster = [
  { name: "Diana", score: 62 },
  { name: "Alice", score: 95 },
  { name: "Bob", score: 73 }
];

console.log("scores:", scores);

console.log("[10, 9, 1].sort():", [10, 9, 1].sort());

const lowToHigh = scores.sort((a, b) => a - b);
console.log("Low to high:", lowToHigh);

console.log("scores now:", scores);
console.log("Same array?", lowToHigh === scores);

const byScore = roster.toSorted((a, b) => b.score - a.score);
console.log("By score:", byScore.map((student) => student.name));
console.log("roster still:", roster.map((student) => student.name));
```

</details>
