---
title: Export and import
mode: edit
entry: index.html
required: [rows-still-render, format-module-ran, modules-in-order]
---

The second concern is formatting: `letterGrade` and `formatRow` turn a student object into the text of a row.
This step moves them into `src/format.js` and exports only the one function that `main.js` calls, so the other one stays private to its file.
Watch the order of the lines in the console, because it shows which file runs first.

Press **Run**.
The page is the same as at the end of Step 1, and the console shows `students.js ran` and `main.js ran`.

`src/format.js` holds the placeholder `export {};`; replace all of it with the two functions.

```js file="src/format.js" action="create"
function letterGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function formatRow(student) {
  return student.name + ": " + student.score + " (" + letterGrade(student.score) + ")";
}

console.log("format.js ran");
```

Only `formatRow` has `export` in front of it.
`letterGrade` is still there and `formatRow` still calls it, but no other file can reach it, the same way a variable declared inside a function cannot be reached from outside the function.

Delete both functions from `src/main.js`, with the blank line after them.

```js file="src/main.js" action="delete" anchor='function letterGrade(score) {\n  if (score >= 90) return "A";\n  if (score >= 80) return "B";\n  if (score >= 70) return "C";\n  if (score >= 60) return "D";\n  return "F";\n}\n\nfunction formatRow(student) {\n  return student.name + ": " + student.score + " (" + letterGrade(student.score) + ")";\n}\n'
```

`main.js` still calls `formatRow` in its loop, so import it under the first import.

```js file="src/main.js" action="insert-after" anchor='import { students } from "./students.js";'
import { formatRow } from "./format.js";
```

The braces hold the names you want, and each must match an `export` in that file exactly, capital letters included.
The path starts with `./`, which means "next to this file", and ends with `.js`, because the browser loads exactly the file you name.

Predict before you run: `main.js` imports `students.js` on its first line and `format.js` on its second, and it logs on its last line.
Does the console show `main.js ran` first, `students.js ran` then `format.js ran` then `main.js ran`, or `format.js ran` first?
Run the code.
The console shows `students.js ran`, `format.js ran`, `main.js ran`, in that order, and the page is unchanged.
Before the browser runs a single line of `main.js`, it reads its `import` lines, loads those files, and runs each one to the end, in the order the imports are written.
Only then does the body of `main.js` run, so by the time the loop calls `formatRow`, the function exists.

The `import` lines therefore always sit at the top of a file, and it does not matter which line of the file a value is first used on.
An `export` can go in front of `const`, `let`, `function`, or `class`; put it on the things other files need and nowhere else, so that a file's exports are a short list of what it offers.

Now ask for the private function on purpose.
Change the second import to `import { formatRow, letterGrade } from "./format.js";` and run.
The console shows one red line, `SyntaxError: The requested module 'src/format.js' does not provide an export named 'letterGrade'`, and nothing else: not even `students.js ran`.
The browser connects every import to its export before it runs any file, so a name that does not match stops the whole page before it starts.
Change the import back to `{ formatRow }` and run again.

**If it breaks:** If the console says `formatRow is not defined`, the second import line is missing.
If it says `does not provide an export named 'formatRow'`, the `export` in front of `function formatRow` in `src/format.js` is missing or the name is spelled differently.
If it says `Identifier 'formatRow' has already been declared`, the function is still in `src/main.js` as well as in the import.

**Check:** Run the code.
The page shows the same five rows and summary, and the console shows `students.js ran`, `format.js ran`, and `main.js ran`, in that order, with no red lines.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
import { students } from "./students.js";
import { formatRow } from "./format.js";

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
