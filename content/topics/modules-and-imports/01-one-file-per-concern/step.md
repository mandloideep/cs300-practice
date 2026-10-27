---
title: One file per concern
mode: edit
entry: index.html
required: [five-rows, summary-line, students-module-ran]
---

**We used this in:** [JavaScript basics](#/topic/javascript-basics) built a roster from an array of objects and graded it, and [DOM and events](#/topic/dom-events) turned data like that into elements on the page.

This topic takes one script that does everything and splits it into files that each do one job.
This step moves the student data into a file of its own and brings it back with an `import`.
Watch the console: from now on, every file says when it runs.

Press **Run**.
The page shows five rows, from `Alice: 95 (A)` to `Frank: 45 (F)`, and the line `5 students graded.`, and the console shows `main.js ran`.
This is the first topic whose results land on the page, so read the result pane as well as the console.

Open `src/main.js` and read it from the top.
It does three different jobs, which programmers call **concerns**: it holds the data (the `students` array), it formats it (`letterGrade` and `formatRow`), and it writes the output to the page (the loop and the summary).
In a file this short that is fine.
In a file of four hundred lines, a change to how a grade is shown means scrolling past the data and the page code to find it, and a teammate changing the data at the same time edits the same file.
One file per concern means each job has one place to live.

Start with the data.
`src/students.js` is already in the file list and holds only `export {};`, which is an empty module; replace all of it with the array.

```js file="src/students.js" action="create"
export const students = [
  { name: "Alice", score: 95 },
  { name: "Bob", score: 73 },
  { name: "Charlie", score: 88 },
  { name: "Diana", score: 62 },
  { name: "Frank", score: 45 }
];

console.log("students.js ran");
```

The word `export` in front of `const` is what lets another file use `students`.
The log at the end is there so that the console tells you when this file runs.

The array now exists twice, so delete it from `src/main.js`, together with the blank line after it.

```js file="src/main.js" action="delete" anchor='const students = [\n  { name: "Alice", score: 95 },\n  { name: "Bob", score: 73 },\n  { name: "Charlie", score: 88 },\n  { name: "Diana", score: 62 },\n  { name: "Frank", score: 45 }\n];\n'
```

Predict before you run: does the page show five rows, the page with no rows, or an error in the console?
Run the code.
The console shows a red `ReferenceError: students is not defined` with an **uncaught** badge, the rows are gone, and `students.js ran` is nowhere.
Each file is a **module**, and a module has its own scope: a name declared in one file does not exist in another until that file imports it.
And a file that nothing imports never runs at all, which is why its log is missing.

Bring the array back with an import as the first line of `src/main.js`, followed by a blank line.

```js file="src/main.js" action="insert-before" anchor="function letterGrade(score) {"
import { students } from "./students.js";

```

`import { students } from "./students.js"` reads as "take the export named `students` from the file `students.js` in the same folder as this one".
Run the code.
The five rows and the summary are back, and the console shows `students.js ran` above `main.js ran`.

You may have typed lines like `import App from "./App.jsx"` before without being told what they do; this topic is the why.
The Week 8 CourseHub build in [Application architecture](#/topic/app-architecture) kept one `app.js` and organized it into sections by responsibility.
Modules take that one step further: a section becomes a file, and the `import` lines at the top of a file list exactly what it depends on.

Try one mistake on purpose.
Change `"./students.js"` in the import to `"./student.js"`, without the `s`, and run.
The result pane says the code did not compile and names the problem: `Cannot find "./student.js" (looked for src/student.js in the workspace).`
Put the `s` back and run again.

**If it breaks:** If the console shows `Identifier 'students' has already been declared`, the array is still in `src/main.js` as well; delete it there.
If the console shows `students is not defined`, the import line is missing or names something other than `students`.
If the result pane says it cannot find the file, the path in the import does not match the file name; it starts with `./` and ends with `.js`.

**Check:** Run the code.
The page shows five rows and `5 students graded.`, and the console shows `students.js ran` and then `main.js ran`, with no red lines.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
import { students } from "./students.js";

function letterGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function formatRow(student) {
  return student.name + ": " + student.score + " (" + letterGrade(student.score) + ")";
}

const list = document.querySelector("#grades");
for (const student of students) {
  const item = document.createElement("li");
  item.textContent = formatRow(student);
  list.append(item);
}
document.querySelector("#summary").textContent = students.length + " students graded.";

console.log("main.js ran");
```

</details>
