---
title: A bare import fails
mode: edit
entry: index.html
required: [updated-line, no-inline-script, dates-module-ran]
---

A teammate wanted the gradebook to say when it was last updated, found a tutorial that uses a package called `date-fns`, and pasted its two lines into `index.html`.
This step runs that code, reads why the browser refuses it, and replaces it with a small file of our own that the lab can run.
Watch the top of the console and the new line under the rows.

Open `index.html`.
Under `<main>` there is a second module script, written inline between the tags instead of loaded with `src`, and its first line is `import { format } from "date-fns";`.
Predict before you run: does the page show the rows and an updated date, nothing at all, or the rows and an error about `date-fns`?
Press **Run**.
The five curved rows render, the last line still says `Not updated yet.`, and the console shows one red line with an **uncaught** badge: `TypeError: Failed to resolve module specifier "date-fns". Relative references must start with either "/", "./", or "../".`
Each module script on the page is loaded on its own, so the one that failed stopped only itself, and `main.js` ran as usual.

Read the message from the browser's side.
The text in quotes after `from` is the **module specifier**, and the browser treats every specifier as an address.
`"./students.js"` is an address: the file `students.js` next to the importing file.
`"date-fns"` starts with none of `/`, `./`, or `../` and is not a full URL, so it is a **bare specifier**, a name with no address, and the browser has nowhere to look it up.
The only place a browser can look up a bare name is an **import map**, a short list in the page that pairs each name with an address.
The lab's page has one, which is how React files here can say `import { useState } from "react"`, and it lists only React's own packages.

The lab checks the files your `<script src>` tags load before the browser ever sees them, and an inline script is left to the browser, so the same mistake reads differently in each place.
Try it: add `import { format } from "date-fns";` as the first line of `src/main.js` and run.
Nothing runs this time, and the result pane says the code did not compile: `Cannot import "date-fns". The lab provides these packages: react, react-dom, react-dom/client, react/jsx-runtime, react/jsx-dev-runtime, react-router.`
That list is the lab's import map, and `date-fns` is not on it.
Delete the line from `src/main.js` again.

The date itself does not need a package, because every browser can format one.
Replace the placeholder in `src/dates.js` with a function that does it.

```js file="src/dates.js" action="create"
export function formatUpdated(date) {
  return "Updated " + date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

console.log("dates.js ran");
```

`toLocaleDateString` turns a date into text such as `October 27`; the options name the parts to show.

Import it in `src/main.js`, under the import of `render.js`.

```js file="src/main.js" action="insert-after" anchor='import renderGradebook, { renderSummary } from "./render.js";'
import { formatUpdated } from "./dates.js";
```

Predict before you run: if you typed this import as `from "dates.js"`, without the `./`, would the date appear, would the result pane say it cannot import `"dates.js"`, or would the console show the browser's `Failed to resolve` error?
Type it that way first and run.
The result pane says the code did not compile with `Cannot import "dates.js"`, and the same list of packages: without `./`, the name of your own file is a bare specifier too, and it is in `main.js`, which the lab checks.
Put the `./` back.

Now show the date, after the summary is rendered.

```js file="src/main.js" action="insert-after" anchor='renderSummary(document.querySelector("#summary"), students);'
document.querySelector("#updated").textContent = formatUpdated(new Date());
```

`new Date()` is the moment the line runs, so the page always shows today.

Last, delete the pasted script from `index.html`, all four lines of it.

```html file="index.html" action="delete" anchor='    <script type="module">\n      import { format } from "date-fns";\n      document.querySelector("#updated").textContent = "Updated " + format(new Date(), "MMMM d");\n    </script>'
```

Run the code.
The last line of the page shows today's date, such as `Updated October 27`, the console shows `dates.js ran` before `main.js ran`, and there is no red line.

The fix the lab can run is always the same: an import whose path starts with `./` and names a file in the workspace.
A real project does want packages by name, though: thousands of them, installed with `npm install date-fns`, which downloads the package into a folder called `node_modules`.
The browser still cannot read `"date-fns"` from there, because it has no idea that folder exists.
So how does a real project's `import { format } from "date-fns"` ever work?
A tool reads your files before the browser does, finds `date-fns` in `node_modules`, and rewrites the import to an address the browser can load, the same job the lab did for your `./` imports all through this topic.
That tool is a **bundler**, Vite is the one we use, and the Tooling from scratch topic takes it apart.

**If it breaks:** If the console still shows `Failed to resolve module specifier "date-fns"`, part of the inline script is still in `index.html`; delete everything from `<script type="module">` to its `</script>`, and keep the tag in the `<head>`.
If the result pane says it cannot import `"dates.js"`, the import in `src/main.js` is missing its `./`.
If the last line says `Not updated yet.`, the line that sets `#updated` is missing or comes before an error; read the console from the top.

**Check:** Run the code.
The page shows the five curved rows and `Updated` with today's date, `index.html` has no inline script, and the console shows `dates.js ran` and no red lines.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
import { students } from "./students.js";
import { settings } from "./settings.js";
import renderGradebook, { renderSummary } from "./render.js";
import { formatUpdated } from "./dates.js";

settings.curve = 5;
renderGradebook(document.querySelector("#grades"), students);
renderSummary(document.querySelector("#summary"), students);
document.querySelector("#updated").textContent = formatUpdated(new Date());

console.log("main.js ran");
```

</details>
