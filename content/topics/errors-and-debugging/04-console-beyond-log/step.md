---
title: The console beyond log
mode: edit
entry: index.html
required: [info-line, object-with-comma, warn-and-debug, error-impossible]
---

`console.log` is one of five printing methods, and the other four, `info`, `warn`, `error`, and `debug`, mark each line with a **level** so that the important ones stand out.
This step checks a gradebook with one failing student and one impossible score, and prints each finding at the level it deserves.
Watch the badge beside each line in the console pane, and watch what happens to an object when you glue it to a string.

Press **Run** and the console shows one line, `Gradebook loaded`, with a **log** badge.

Turn the first line into a status message at the **info** level, and let it say how many students there are.

```js file="src/main.js" action="replace" anchor='console.log("Gradebook loaded");'
console.info("Gradebook loaded:", students.length, "students");
```

Run it: `Gradebook loaded: 4 students`, now with an **info** badge.
`info` is for milestones, the "this part worked" lines you want to see in passing.

Now print the first student, the way many people try it first.

```js file="src/main.js" action="append"

console.log("First student: " + students[0]);
```

Predict before you run: does the console show `First student: {"name":"Alice","score":95}`, `First student: [object Object]`, or an error?
Run it.
The console shows `First student: [object Object]`.
`+` with a string turns the other side into a string first, and an object turned into a string is the useless text `[object Object]`.
Pass the object as a separate argument instead, with a comma, so that the console receives the object itself.

```js file="src/main.js" action="replace" anchor='console.log("First student: " + students[0]);'
console.log("First student:", students[0]);
```

Run it, and the line reads `First student: {"name":"Alice","score":95}`, with every key.

Last, check every student and report each problem at its level.

```js file="src/main.js" action="append"

for (const student of students) {
  if (student.score > 100) {
    console.error(`${student.name} has an impossible score: ${student.score}`);
  } else if (student.score < 60) {
    console.warn(`${student.name} is failing with ${student.score}`);
  } else {
    console.debug(`${student.name} is fine with ${student.score}`);
  }
}
console.log("Checked every student.");
```

A score over 100 is a mistake in the data, so it is an **error**; a failing score is real but worth noticing, so it is a **warning**; a fine score is a detail you want only while debugging, so it is **debug**.

Predict before you run: Diana's line is printed with `console.error`, so does the console show `Checked every student.` after it, or does the loop stop at Diana?
Run it.
Alice and Charlie print with a **debug** badge, Bob with a **warning** badge, Diana with an **error** badge, and `Checked every student.` prints last.
`console.error` only prints a line in red; it does not throw, so the loop and the script carry on.
That is the difference from the last two steps: `throw` changes what the code does next, and `console.error` only tells you something.

The levels exist so that you can find the line that matters among a hundred that do not.
In the browser's own console, each level gets its own color and icon, and the **levels** filter at the top hides the ones you do not want; Chrome hides **debug**, which it calls **Verbose**, until you turn it on, while the lab shows all five.
The browser itself uses the **error** level for the problems it finds, so an error you print yourself sits beside the ones the browser prints, which is right for a real problem and wrong for anything else.

The console has more methods that print only in the browser's own console, not in the lab's console pane:

- `console.table(students)` draws an array of objects as a table with one row per object.
- `console.group("Bob")` and `console.groupEnd()` indent the lines between them under a heading you can fold.
- `console.count("checked")` prints how many times that line has run.
- `console.time("report")` and `console.timeEnd("report")` print how long the code between them took.

The next step opens the browser's console on the result frame, where you can try each of them.

Try the common mistake again, with the whole list this time.
Add `console.log("Roster: " + students);` at the end and run: four `[object Object]` pieces joined by commas.
With a comma instead of the `+`, the console shows the whole array; delete the line when you have seen it.

**If it breaks:** If the first student still prints `[object Object]`, the line uses `+` instead of a comma between the label and `students[0]`.
If Diana prints as a debug line that says she is fine, the `student.score > 100` branch is missing or compares the wrong way, so her score fell through to the last `else`.
If no debug lines appear, check that the last branch calls `console.debug`, spelled in full.

**Check:** Run the code.
The console shows `Gradebook loaded: 4 students` at the info level, the first student as an object, `Alice is fine with 95` and `Charlie is fine with 88` at the debug level, `Bob is failing with 54` as a warning, `Diana has an impossible score: 140` as an error, and `Checked every student.`
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const students = [
  { name: "Alice", score: 95 },
  { name: "Bob", score: 54 },
  { name: "Charlie", score: 88 },
  { name: "Diana", score: 140 }
];

console.info("Gradebook loaded:", students.length, "students");

console.log("First student:", students[0]);

for (const student of students) {
  if (student.score > 100) {
    console.error(`${student.name} has an impossible score: ${student.score}`);
  } else if (student.score < 60) {
    console.warn(`${student.name} is failing with ${student.score}`);
  } else {
    console.debug(`${student.name} is fine with ${student.score}`);
  }
}
console.log("Checked every student.");
```

</details>
