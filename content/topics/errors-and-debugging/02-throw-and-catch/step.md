---
title: Throw and catch
mode: edit
entry: index.html
required: [own-message, report-continues, no-trace]
---

The gradebook from the last step stops at Diana with a message about `length` that says nothing about students.
This step makes `reportLine` **throw** an error of its own that says what is wrong in words, then **catches** it inside the loop so that one bad record skips one line instead of ending the report.
Watch where each error lands: a thrown error travels up through the functions that called it until a `catch` takes it.

Press **Run** and the console shows the three report lines, the five line trace from the last step, and `The script reached its last line.`

Add a fifth student after Diana, so you can see whether the report gets past her.

```js file="src/main.js" action="replace" anchor='  { name: "Diana" }'
  { name: "Diana" },
  { name: "Eve", scores: [91, 85, 97] }
```

Predict before you run: does the console show `Eve: 91.0`, or does the report end at Diana?
Run it, and Eve is missing.
The error in `average` ended `reportLine`, then ended the loop in `printReport`, and was caught only by the `catch` at the bottom, so the loop never reached Eve.

Now let `reportLine` check its input and say what is wrong.
Add these lines as the first lines inside `reportLine`.

```js file="src/main.js" action="insert-after" anchor="function reportLine(student) {"
  if (student.scores === undefined) {
    throw new Error(`${student.name} has no scores yet`);
  }
```

`new Error(message)` makes an error object with that message, and `throw` hands it to whoever is waiting to catch it, which ends `reportLine` on that line.

Predict before you run: what is the first line of the logged trace now, `TypeError: Cannot read properties of undefined (reading 'length')`, `Error: Diana has no scores yet`, or no trace at all?
Run it.
The trace now starts with `Error: Diana has no scores yet`, and its top frame is `at reportLine (src/main.js:19:11)`, the `throw` line.
`average` is not in the trace at all, because `reportLine` threw before calling it.
The message is one you wrote, so it names the student instead of a property.

Last, catch the error where something useful can be done with it: in the loop, one student at a time.
Replace the line inside the loop of `printReport`.

```js file="src/main.js" action="replace" anchor="    console.log(reportLine(student));"
    try {
      console.log(reportLine(student));
    } catch (error) {
      console.log("Skipped:", error.message);
    }
```

Predict before you run: after `Charlie: 86.0`, does the console show `Skipped: Diana has no scores yet` and then `Eve: 91.0`, or the trace from the bottom `catch`?
Run it.
The console shows `Skipped: Diana has no scores yet`, then `Eve: 91.0`, then the last line, and no trace.
The inner `catch` took the error first, the loop went on to Eve, and the `catch` at the bottom had nothing to do.

A `throw` leaves the function it is in at once, and then the function that called it, and the one that called that, one frame of the stack at a time, until it reaches a `try` whose `catch` takes it.
The nearest `catch` wins.
If no frame has one, the error is **uncaught**: the browser prints it in red and the script stops, which is what happened in the last step before you added the first `try`.
So the question is never "should I catch this" but "where": catch an error in the place that knows what to do next, here the loop, which can skip one student and carry on.

Inside a `catch`, the error has a `name` (`Error`, `TypeError`, and so on), a `message`, and a `stack`.
A `try` can also end with a `finally` block, which runs whether or not anything was thrown; you will meet it again with promises in the next topic.

Try the common mistake on purpose.
Change `throw new Error(...)` to ``throw `${student.name} has no scores yet`;``, throwing a plain string, and run.
The console shows `Skipped: undefined`, because a string has no `message` property and no stack.
JavaScript lets you throw any value, but throw an `Error` so that whoever catches it gets a message and a trace; change it back.

**If it breaks:** If Eve is still missing, the `try` and `catch` are around the call at the bottom only, not inside the `for` loop of `printReport`.
If the console shows `Skipped: undefined`, the `throw` throws a string instead of `new Error(...)`, or the `catch` logs `error.msg` instead of `error.message`.
If the trace still starts with `TypeError`, the `if` is after the `average` line instead of before it.
If every student is skipped, the `if` reads `student.score` without the `s`, which is `undefined` for everyone.

**Check:** Run the code.
The console shows `Alice: 91.7`, `Bob: 74.0`, `Charlie: 86.0`, `Skipped: Diana has no scores yet`, `Eve: 91.0`, and `The script reached its last line.`, with no trace.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const students = [
  { name: "Alice", scores: [95, 88, 92] },
  { name: "Bob", scores: [73, 80, 69] },
  { name: "Charlie", scores: [88, 91, 79] },
  { name: "Diana" },
  { name: "Eve", scores: [91, 85, 97] }
];

function average(scores) {
  let total = 0;
  for (let i = 0; i < scores.length; i++) {
    total += scores[i];
  }
  return total / scores.length;
}

function reportLine(student) {
  if (student.scores === undefined) {
    throw new Error(`${student.name} has no scores yet`);
  }
  const value = average(student.scores);
  return `${student.name}: ${value.toFixed(1)}`;
}

function printReport(list) {
  for (const student of list) {
    try {
      console.log(reportLine(student));
    } catch (error) {
      console.log("Skipped:", error.message);
    }
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
