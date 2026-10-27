---
title: map and filter with a named and an inline callback
mode: edit
entry: src/main.js
required: [map-with-a-named-callback, filter-leaves-the-original, for-each-prints-each, chained-labels]
---

Step 4 looped over an array by hand.
Arrays come with methods that do the looping for you, and the three in this step, `map`, `filter`, and `forEach`, are the ones React is built on: every list on a React page is a `map`.
Each takes a **callback**, a function you hand over, and calls it once per item.

Press **Run** to see the five scores.
Start with `map` and a callback that has a name.

```js file="src/main.js" action="append"

const double = (score) => score * 2;
const doubled = scores.map(double);
console.log("Doubled:", doubled);
```

Run the code.
`double` is an **arrow function**: a parameter in parentheses, an arrow, and an expression whose value is returned.
`scores.map(double)` calls `double` with each score and collects the results into a **new** array of the same length, which is what `map` means: transform each item.
Notice that we pass `double` itself, with no parentheses; `scores.map(double())` would call it once, right now, with no argument, and hand `map` the result, `NaN`.

Most callbacks are too small to deserve a name, so they are written **inline**, right where they are used.

```js file="src/main.js" action="append"

const passing = scores.filter((score) => score >= 80);
console.log("Passing:", passing);
console.log("Original:", scores);
```

`filter` calls the callback with each item and keeps the items for which it returned `true`, so `passing` is a new array that may be shorter.
The callback here is the same arrow function shape as `double`, written in the parentheses instead of on its own line.
`Original` prints the five scores unchanged: `map` and `filter` build new arrays and never touch the one they were called on, the same rule the string methods followed in Step 2.

When you only want to do something per item, not build an array, use `forEach`.

```js file="src/main.js" action="append"

scores.forEach((score, index) => {
  console.log(`Score ${index + 1}: ${score}`);
});
```

Every one of these callbacks receives the index as a second parameter when you ask for it.
This callback has braces because it is a statement, not a value to return, and `forEach` returns nothing; a `const result = scores.forEach(...)` is always `undefined`.
If you catch yourself building an array inside a `forEach` with `push`, you wanted `map`.

Because `filter` and `map` each return an array, one feeds the next.

```js file="src/main.js" action="append"

const passingLabels = scores
  .filter((score) => score >= 80)
  .map((score) => `${score} pass`);
console.log("Passing labels:", passingLabels);
```

Read a chain top to bottom: keep the scores of 80 or more, then turn each into a label.
One mistake to try: give the last callback braces, `(score) => { \`${score} pass\` }`, and run.
The labels become five empty values, because an arrow function with braces returns nothing unless it says `return`; without braces the expression is the return value.

**Check:** Run the code.
The console shows the doubled scores, the four passing scores, the original five unchanged, five `Score n:` lines, and the four labels.
Press **Run checks** to confirm.

**If it breaks:** If `Doubled` is an array of five empty values, the callback has braces without `return`.
If `Passing` has all five scores, the callback compares with `>` `79` the wrong way or returns the score instead of a comparison.
If `Original` is doubled, a line assigned the result of `map` back into `scores`, which also fails because it is a `const`.

<details>
<summary>src/main.js after this step</summary>

```js
const scores = [85, 92, 73, 96, 81];

console.log("Scores:", scores);

const double = (score) => score * 2;
const doubled = scores.map(double);
console.log("Doubled:", doubled);

const passing = scores.filter((score) => score >= 80);
console.log("Passing:", passing);
console.log("Original:", scores);

scores.forEach((score, index) => {
  console.log(`Score ${index + 1}: ${score}`);
});

const passingLabels = scores
  .filter((score) => score >= 80)
  .map((score) => `${score} pass`);
console.log("Passing labels:", passingLabels);
```

</details>
