---
title: Default and named exports
mode: edit
entry: index.html
required: [rows-and-summary, render-module-ran, dependencies-first]
---

The last concern still in `main.js` is the output: the loop that creates the rows and the line that sets the summary.
This step moves both into `src/render.js`, the main one as the file's **default export** and the other as a **named export**, so you can see the two kinds side by side.
When it is done, `main.js` only connects the pieces.

Press **Run**.
Nothing has changed yet: five rows, the summary, and three lines in the console ending with `main.js ran`.

Replace the placeholder in `src/render.js` with the two rendering functions.

```js file="src/render.js" action="create"
import { formatRow } from "./format.js";

export default function renderGradebook(list, students) {
  for (const student of students) {
    const item = document.createElement("li");
    item.textContent = formatRow(student);
    list.append(item);
  }
}

export function renderSummary(summary, students) {
  summary.textContent = students.length + " students graded.";
}

console.log("render.js ran");
```

`render.js` imports `formatRow` itself, because it is the file that calls it now.
`export default` marks `renderGradebook` as the one thing this file is mainly for; a file can have at most one default export.
`export function renderSummary` is a named export like the ones in Step 2, and a file can have as many of those as it needs.
Both functions take the element to write into as a parameter instead of selecting it themselves, so the same function could fill any list on any page.

In `src/main.js`, replace the import of `format.js` with an import of the two rendering functions.

```js file="src/main.js" action="replace" anchor='import { formatRow } from "./format.js";'
import renderGradebook, { renderSummary } from "./render.js";
```

The default export comes first and has no braces; the named one comes after a comma, in braces, exactly as in Step 2.

Then replace the loop and the summary line with two calls.

```js file="src/main.js" action="replace" anchor='const list = document.querySelector("#grades");\nfor (const student of students) {\n  const item = document.createElement("li");\n  item.textContent = formatRow(student);\n  list.append(item);\n}\ndocument.querySelector("#summary").textContent = students.length + " students graded.";'
renderGradebook(document.querySelector("#grades"), students);
renderSummary(document.querySelector("#summary"), students);
```

`main.js` is now seven lines: two imports, two calls, and the log.

Predict before you run: `main.js` no longer imports `format.js`; only `render.js` does.
Does the console leave out `format.js ran`, show it above `render.js ran`, or show it below `render.js ran`?
Run the code.
The console shows `students.js ran`, `format.js ran`, `render.js ran`, `main.js ran`, and the page is unchanged.
A file runs when any file imports it, not only when `main.js` does, and a file's own imports always run before it: `render.js` needs `format.js`, so `format.js` goes first.
The files and their imports form a graph with `main.js` at the top, and the browser runs it from the bottom up.

Default and named exports differ in how they are imported.
A named export is imported by its exact name in braces, and `as` gives it another name in the importing file: `import { renderSummary as showCount } from "./render.js"`.
A default export is imported with no braces, under any name the importing file chooses, because the file has only one.
Try it: change `renderGradebook` to `drawRows` in the import and in the call below it, and run; the rows render exactly as before.
Change both back.

Now the mistake almost everyone makes once.
Put braces around the default import, `import { renderGradebook, renderSummary } from "./render.js";`, and run.
The console shows `SyntaxError: The requested module 'src/render.js' does not provide an export named 'renderGradebook'`, because braces ask for a named export and `renderGradebook` was exported as the default.
Take the braces off `renderGradebook` again and run.

The React files you will write follow one habit: a component file has its component as the default export, `export default function App()`, and is imported as `import App from "./App.jsx"`, while libraries offer many named exports, such as `import { useState } from "react"`.

**If it breaks:** If the console says `does not provide an export named 'renderGradebook'`, the default import has braces around it; remove them.
If it says `formatRow is not defined`, the import of `format.js` at the top of `src/render.js` is missing.
If the rows appear twice, the old loop is still in `src/main.js` beside the new call.

**Check:** Run the code.
The page shows the five rows and `5 students graded.`, and the console shows `students.js ran`, `format.js ran`, `render.js ran`, `main.js ran`, with no red lines.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
import { students } from "./students.js";
import renderGradebook, { renderSummary } from "./render.js";

renderGradebook(document.querySelector("#grades"), students);
renderSummary(document.querySelector("#summary"), students);

console.log("main.js ran");
```

</details>
