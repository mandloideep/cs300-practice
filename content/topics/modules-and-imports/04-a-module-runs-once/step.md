---
title: A module runs once
mode: edit
entry: index.html
required: [settings-ran-once, curve-applied, one-shared-object]
---

The instructor wants to add a five-point curve, and two files care about it: `main.js` decides the curve, and `format.js` applies it to every score.
This step puts the setting in a small file of its own, `src/settings.js`, and imports it into both.
Watch how many times `settings.js ran` appears, and whether the rows change.

Press **Run**.
The page and the console are the same as at the end of Step 3: four lines, ending with `main.js ran`.

Replace the placeholder in `src/settings.js` with one exported object.

```js file="src/settings.js" action="create"
export const settings = { curve: 0 };

console.log("settings.js ran");
```

The curve starts at `0`, so a file that reads it before anyone changes it gets no curve.

`format.js` applies the curve, so it imports the settings as its first line, followed by a blank line.

```js file="src/format.js" action="insert-before" anchor="function letterGrade(score) {"
import { settings } from "./settings.js";

```

Then replace the line that builds the row, so that it adds the curve to the score before it shows and grades it.

```js file="src/format.js" action="replace" anchor='  return student.name + ": " + student.score + " (" + letterGrade(student.score) + ")";'
  const score = student.score + settings.curve;
  return student.name + ": " + score + " (" + letterGrade(score) + ")";
```

`main.js` decides the curve, so it imports the settings too, under its first import.

```js file="src/main.js" action="insert-after" anchor='import { students } from "./students.js";'
import { settings } from "./settings.js";
```

And it sets the curve before it renders.

```js file="src/main.js" action="insert-before" anchor='renderGradebook(document.querySelector("#grades"), students);'
settings.curve = 5;
```

Predict before you run: two files import `settings.js`, and `main.js` changes `settings.curve` in its copy.
Does the console show `settings.js ran` twice with rows that have no curve, once with rows that have the curve, or once with rows that have no curve?
Run the code.
The console shows `settings.js ran` once, and the rows read `Alice: 100 (A)`, `Bob: 78 (C)`, `Charlie: 93 (A)`, `Diana: 67 (D)`, and `Frank: 50 (F)`: every score has the curve, and Charlie moved from a B to an A.

A module runs once per page, however many files import it.
The first import runs it and the browser remembers the result under the file's address; every later import of the same file gets the same exports without running it again.
So there is not a copy of `settings` in each file: there is one object, and `main.js` and `format.js` both hold it.
When `main.js` sets `curve` to `5`, `formatRow` reads `5` from the same object a moment later, when `renderGradebook` calls it.
Two `<script type="module">` tags on one page that load files importing `settings.js` would share it the same way.

This is how a whole application shares one thing, such as its settings, a list of saved items, or a connection to a server, without passing it through every function.
It also means a module that changes shared state affects every file that imports it, so keep shared objects few and give each one an obvious owner; here `main.js` is the only file that writes to `settings`.

The import itself cannot be reassigned, only the object it points to can change.
Replace `settings.curve = 5;` with `settings = { curve: 5 };` and run.
The console shows a red `TypeError: Assignment to constant variable.`, and the rows do not render, because an imported name is read-only in the file that imports it, exactly like a `const`.
Put back `settings.curve = 5;` and run again.

**If it breaks:** If the rows show the original scores, the curve is set after `renderGradebook` is called, or `formatRow` still uses `student.score` instead of `score`.
If the console says `settings is not defined`, one of the two files is missing its import of `./settings.js`.
If a score reads `955` instead of `100`, the curve was typed as the string `"5"`; it is the number `5` with no quotes.

**Check:** Run the code.
The console shows `settings.js ran` once and no red lines, and the five rows show the curved scores, from `Alice: 100 (A)` to `Frank: 50 (F)`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
import { students } from "./students.js";
import { settings } from "./settings.js";
import renderGradebook, { renderSummary } from "./render.js";

settings.curve = 5;
renderGradebook(document.querySelector("#grades"), students);
renderSummary(document.querySelector("#summary"), students);

console.log("main.js ran");
```

</details>

<details>
<summary>src/format.js after this step</summary>

```js
import { settings } from "./settings.js";

function letterGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function formatRow(student) {
  const score = student.score + settings.curve;
  return student.name + ": " + score + " (" + letterGrade(score) + ")";
}

console.log("format.js ran");
```

</details>
