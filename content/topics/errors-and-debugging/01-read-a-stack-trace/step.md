---
title: Read a stack trace
mode: edit
entry: index.html
required: [three-lines-before, stack-logged, last-line]
---

This step breaks a small gradebook with one student who has no scores, and then reads the error it causes the way a developer does.
An error does not only say what went wrong; its **stack trace** lists every function that was running when it happened, from the one that failed out to the line that started it all.
Watch which function the trace names first, and which line the bug really lives on.

**We used this in:** [JavaScript basics](#/topic/javascript-basics) ended with a table of error messages and the advice to read the first red line; this topic reads all of it.

```demo name="call-stack"
```

Press **Run** and the console shows three report lines: `Alice: 91.7`, `Bob: 74.0`, and `Charlie: 86.0`.
Three functions do the work: `printReport` loops over the list, `reportLine` builds one line, and `average` adds up one student's scores.
`toFixed(1)` turns a number into a string with one digit after the point, which is why `74` prints as `74.0`.

Add a fourth student who joined the course this week and has no scores yet.
Put a comma after Charlie's object, since every item of an array but the last needs one.

```js file="src/main.js" action="replace" anchor='  { name: "Charlie", scores: [88, 91, 79] }'
  { name: "Charlie", scores: [88, 91, 79] },
  { name: "Diana" }
```

```predict
With Diana added, what does the console show when you run it?
- Four report lines, with `Diana: NaN` last
= Three report lines and then an error
- Only an error, with no report lines
```

Run it.
Three report lines print, and at the top of the console a red line with an **uncaught** badge says `TypeError: Cannot read properties of undefined (reading 'length')`.
Alice, Bob, and Charlie were fine; Diana's object has no `scores` key, so `student.scores` is `undefined`, and `average` tried to read `.length` from it.
The link under the message, `src/main.js:10`, is the line that failed; click it and the editor jumps there.

Add one more line at the very end of the file.

```js file="src/main.js" action="append"
console.log("The script reached its last line.");
```

```predict
Does the console show `The script reached its last line.`?
= No, it never prints
- Yes, after the red line
- Yes, before the report lines
```

Run it, and the line is missing.
An uncaught error stops the script at the line that threw, so nothing after it runs: not Diana's line, not the last line, nothing.

For an uncaught error, the console pane shows only the message and a link to the line that failed.
To see the whole trace, **catch** the error and log its `stack` property.
Replace the call at the bottom with a `try` and `catch`; the next step explains them fully, and for now it is enough that `catch` receives the error instead of letting it stop the script.

```js file="src/main.js" action="replace" anchor="printReport(students);"
try {
  printReport(students);
} catch (error) {
  console.log(error.stack);
}
```

```predict
Which function does the first `at` line of the logged trace name?
- `printReport`
- `reportLine`
= `average`
```

Run it.
The red line is gone, the last line now prints, and between them is one log entry with five lines:

```text
TypeError: Cannot read properties of undefined (reading 'length')
    at average (src/main.js:10:30)
    at reportLine (src/main.js:17:17)
    at printReport (src/main.js:23:17)
    at src/main.js:28:3
```

The first line is the type and the message, the same text the red line showed.
Each `at` line is one **frame**: a function that was running, the file, the line, and the column.
The frames are listed innermost first, so `average` is on top because it was running when the error happened, `reportLine` had called it, `printReport` had called `reportLine`, and the last frame, with no function name, is the top level of `src/main.js`, which called `printReport` on line 28.
Column 30 of line 10 is where `length` starts, the exact property that could not be read.

## Read more

Read the first line for **what** went wrong and the top frame for **where** it was noticed, then walk down the frames to find **why**.
The top frame is often not where the bug lives.
`average` is correct: it was handed `undefined`.
One frame down, `reportLine` passed `student.scores` along without asking whether it existed, and the real cause is the data, Diana's object on line 5, which no frame mentions at all.
That is the usual shape of a bug: the error shows up in the function that finally touches the bad value, and you follow the trace back toward the place the value came from.

Frames from code you did not write, such as the lab's own files or a library, can sit between yours in a longer trace; skip them and look for `src/` paths.
Other browsers write the same trace in their own format: Firefox, for example, writes `average@src/main.js:10:30` and leaves the message off the first line.
The functions and the order are the same everywhere.

Try the common mistake on purpose.
Change `console.log(error.stack)` to `console.log(error)` and run: the console shows only `TypeError: Cannot read properties of undefined (reading 'length')`, because the lab prints an error by its type and message.
The trace lives in `error.stack`; change it back.

**If it breaks:** If the console shows `SyntaxError` or the result says the code did not compile, a comma or a bracket is missing in the `students` array; every object but the last ends with `},`.
If the trace is a single line with no `at` lines, the `catch` block logs `error` instead of `error.stack`.
If the last line still does not print, the `console.log(error.stack)` line is outside the `catch` braces, or the call `printReport(students);` is still there below the `try`.

**Check:** Run the code.
The console shows the three report lines, the five line trace naming `average`, `reportLine`, and `printReport` in that order, and `The script reached its last line.`
Press **Run checks** to confirm.

```quiz
If a trace's first `at` line names `average` and the next names `reportLine`, what does that tell you?
- The bug is certainly inside `average`
= `average` was running when the error happened, and `reportLine` had called it
- `reportLine` ran after `average` finished
> Frames are listed innermost first, so the top one is where the error was noticed, and the cause can sit further down the trace or in the data.
```

<details>
<summary>src/main.js after this step</summary>

```js
const students = [
  { name: "Alice", scores: [95, 88, 92] },
  { name: "Bob", scores: [73, 80, 69] },
  { name: "Charlie", scores: [88, 91, 79] },
  { name: "Diana" }
];

function average(scores) {
  let total = 0;
  for (let i = 0; i < scores.length; i++) {
    total += scores[i];
  }
  return total / scores.length;
}

function reportLine(student) {
  const value = average(student.scores);
  return `${student.name}: ${value.toFixed(1)}`;
}

function printReport(list) {
  for (const student of list) {
    console.log(reportLine(student));
  }
}

try {
  printReport(students);
} catch (error) {
  console.log(error.stack);
}
console.log("The script reached its last line.");
```

</details>
