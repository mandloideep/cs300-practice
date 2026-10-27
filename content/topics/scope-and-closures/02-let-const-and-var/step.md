---
title: let, const, and var
mode: edit
entry: index.html
required: [var-leaves-the-block, var-is-hoisted, loop-counter-leaks]
---

JavaScript has three ways to declare a variable, and you have used two of them: `const` for a value that is not reassigned and `let` for one that is.
The third, `var`, is the original one, and you will meet it in older code, tutorials, and answers online.
This step shows the three ways `var` behaves differently from `let`, each of which once caused real bugs, so that you can read old code and know why this course never writes `var`.

Press **Run** and the console shows `Passing line: 60` and `Attempts: 1`.
`passingLine` is a `const` because a course's passing line does not change while the script runs; `attempts` is a `let` because the script adds one to it.
Reassigning the `const`, as you saw in JavaScript basics, is a `TypeError: Assignment to constant variable.`

First difference: `var` ignores blocks.

Predict before you run: after the next edit, does the last line show `var after the block: Quiz 1`, `var after the block: undefined`, or a `ReferenceError` like the one in Step 1?

```js file="src/main.js" action="append"

if (attempts > 0) {
  var lastQuiz = "Quiz 1";
}
console.log("var after the block:", lastQuiz);
```

Run it: `var after the block: Quiz 1`.
With `let` or `const`, `lastQuiz` would have lived only inside the braces, as `message` did in Step 1.
A `var` belongs to the whole function it is in, or to the whole file when it is in no function, so the braces of the `if` do not contain it.

Second difference: a `var` exists before its own line.

Predict before you run: the first new line reads `courseCode` before the line that declares it, so does it show `Before its line: CS300`, `Before its line: undefined`, or an error?

```js file="src/main.js" action="append"

console.log("Before its line:", courseCode);
var courseCode = "CS300";
console.log("After its line:", courseCode);
```

Run the code: `Before its line: undefined`, then `After its line: CS300`.
JavaScript creates every `var` of a function when the function starts, with the value `undefined`, and fills it in only when it reaches the line with `=`.
This is called **hoisting**, and it means a typo in the order of your lines gives you a quiet `undefined` instead of an error.
A `let` or `const` read before its line is an error instead, `ReferenceError: Cannot access 'courseCode' before initialization`, which points straight at the problem.

Third difference: a `var` loop counter outlives the loop.

Predict before you run: after the next edit, does the last line show `week after the loop: 3`, `week after the loop: 4`, or an error?

```js file="src/main.js" action="append"

for (var week = 1; week <= 3; week++) {
  console.log("Week", week);
}
console.log("week after the loop:", week);
```

Run it: `Week 1`, `Week 2`, `Week 3`, and then `week after the loop: 4`.
The loop stops when `week <= 3` is false, which first happens when `week` is `4`, and because a `var` is not tied to the loop, that `4` is still there afterwards.
There is only one `week` for the whole loop, shared by every pass, and the last step of this topic shows what that does to callbacks created inside the loop.

So which one do you write?
Use `const` by default, because most values in a program never need reassigning, and a `const` tells the reader that they never will.
Use `let` for the few values that change, such as a counter or a running total.
Do not write `var` in new code: it was replaced by `let` and `const` in 2015 precisely because of the three behaviors above.
When you meet `var` in older code, read it as a `let` that ignores blocks and exists from the top of its function.

One thing `const` does not mean: it stops reassignment of the variable, not change of what it holds.
`const roster = []` followed by `roster.push("Alice")` is fine, because the variable still holds the same array; a later topic on objects and references explains why.

Try the difference on purpose.
Change `var week` in the loop to `let week` and run: the three week lines still print, and then `ReferenceError: week is not defined` with an **uncaught** badge, because the `let` counter belongs to the loop.
Change it back to `var` so that the step's last line runs.

**If it breaks:** If the console shows `ReferenceError: lastQuiz is not defined`, the declaration inside the `if` uses `let` or `const`; this step uses `var` on purpose.
If `Before its line` shows an error about initialization, `courseCode` is declared with `let` or `const`.
If `week after the loop` is missing, the counter is declared with `let`.

**Check:** Run the code.
The console shows `var after the block: Quiz 1`, `Before its line: undefined`, `After its line: CS300`, the three weeks, and `week after the loop: 4`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const passingLine = 60;
let attempts = 0;
attempts = attempts + 1;

console.log("Passing line:", passingLine);
console.log("Attempts:", attempts);

if (attempts > 0) {
  var lastQuiz = "Quiz 1";
}
console.log("var after the block:", lastQuiz);

console.log("Before its line:", courseCode);
var courseCode = "CS300";
console.log("After its line:", courseCode);

for (var week = 1; week <= 3; week++) {
  console.log("Week", week);
}
console.log("week after the loop:", week);
```

</details>
