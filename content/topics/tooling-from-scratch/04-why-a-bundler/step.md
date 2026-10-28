---
title: Why a bundler
mode: edit
entry: index.html
required: [sessions-listed, no-bare-import-on-the-page, formatted-by-path]
---

**We used this in:** [Modules and imports](#/topic/modules-and-imports/6) watched a bare import fail in the browser; this step asks where a package lives on disk and who turns its name into a path.

This step imports a package by its name, the way every React file imports `react`, and watches the browser refuse.
Then it imports the same package by the path of its file, which the browser accepts, and that difference is the reason bundlers exist.
Watch the console for the browser's own error message, word for word.

```demo name="bare-import-fail"
```

The workspace pretends that `npm install` has already run: next to `src/` there is a `node_modules` folder with one small package in it, `study-format`, with its own `package.json` and an `index.js` that exports a function, `formatMinutes`.
Press **Run**: the console shows `Study sessions in minutes: [25,50,90]`.

Open `index.html` and add a second module script, written right in the page, that imports the package by its name.

```html file="index.html" action="insert-before" anchor='    <script type="module" src="/src/main.js"></script>'
    <script type="module">
      import { formatMinutes } from "study-format";
      console.log(formatMinutes(90));
    </script>
```

```predict
You run the page with the new inline script; what does the console show from it?
- `1 h 30 min`
= A red error that names `study-format`
- Nothing at all from the new script
```

Run it.
The console shows an **uncaught** error from the browser itself:

```text
TypeError: Failed to resolve module specifier "study-format". Relative references must start with either "/", "./", or "../".
```

This site passes a script written inside the page straight to the browser, so this is exactly what Chrome says on any web server, and other browsers say the same thing in their own words.
Read the second sentence: the browser only follows addresses.
`./format.js` and `/src/main.js` are addresses, relative to the page; `study-format` is a **bare specifier**, a name, and the browser has no idea that a name means "look in `node_modules`, read that folder's `package.json`, and load the file its `exports` field names".
That lookup is a rule of Node and npm, not of the web.
The starter's own line still printed, because each module script runs or fails on its own.

Remove the inline script.

```html file="index.html" action="delete" anchor='    <script type="module">\n      import { formatMinutes } from "study-format";\n      console.log(formatMinutes(90));\n    </script>'
```

Before the next edit, try the bare name inside `src/main.js` once: add `import { formatMinutes } from "study-format";` as its first line and run.
This time CS300 Practice stops before the browser sees the file, and the result says **Did not compile** with this site's own message, `Cannot import "study-format". CS300 Practice provides these packages:` followed by the React packages.
This site, like a bundler, reads your imports before the browser does; it knows only those few names, which is why every React step can import `react` and nothing else.
Delete that line again.

Now import the package the way the browser can follow, by the path of its file from `src/main.js`.

```js file="src/main.js" action="insert-before" anchor="const sessions = [25, 50, 90];"
import { formatMinutes } from "../node_modules/study-format/index.js";

```

`../` climbs out of `src/` to the project folder, and the rest of the path walks into the package to the file its `package.json` names.
Use it for every session.

```js file="src/main.js" action="append"

for (const minutes of sessions) {
  console.log(`${minutes} minutes is ${formatMinutes(minutes)}`);
}
```

Run it: `25 minutes is 25 min`, `50 minutes is 50 min`, and `90 minutes is 1 h 30 min`.

## Read more

### What a bundler does about it

Nobody writes `../node_modules/study-format/index.js` in a real project, for three reasons.
The path depends on where the importing file sits, so every file would spell it differently.
The file a package's `exports` names changes between versions, and the path would break when it does.
And many packages, `ms` from the last two steps among them, are still written in an older module format, CommonJS, with `require` and `module.exports`, which a browser cannot run at all.

A **bundler** is the tool that fixes all three.
It reads your files before the browser does, finds every `import`, resolves each bare name with the Node rule, converts CommonJS packages into modules, and writes code that uses only addresses.
In development, Vite rewrites `from "study-format"` into something like `from "/node_modules/.vite/deps/study-format.js?v=1a2b3c4d"`, a path to a copy it prepared, so the browser sees only addresses.
For production, it goes further and **bundles**: it follows the imports from `index.html` down through every file and package and writes them into a few files in `dist/`, so that the page makes a handful of requests instead of one per module.
That is the job of the next two steps.

**If it breaks:** If the console still shows `Failed to resolve module specifier`, the inline script is still in `index.html`; delete all four of its lines.
If the result says `Cannot find "../node_modules/study-format/index.js"`, the path is misspelled or starts with `./`, which would look inside `src/`.
If it says `formatMinutes is not defined`, the import line is missing from the top of `src/main.js`.

**Check:** Run the code.
The console shows the sessions line and the three formatted lines, with no red line at the top, and `index.html` has only the one script tag it started with.
The three checks pass.

```quiz
Which of these import specifiers can a browser follow on its own?
- `"study-format"`
= `"../node_modules/study-format/index.js"`
- `"react"`, because every page knows React
> A browser follows addresses only, ones that start with `/`, `./`, or `../`; a bare name needs a bundler or an import map to become an address.
```

```quiz
In development, what does Vite do with `import { formatMinutes } from "study-format"`?
- It sends the file to the browser unchanged and lets the browser find the package
= It rewrites the name into a path under `/node_modules/.vite/deps/` before the browser sees the file
- It refuses the import and asks for a relative path
> Vite resolves the bare name the way Node does and writes an address in its place, so the browser only ever sees paths.
```

<details>
<summary>src/main.js after this step</summary>

```js
import { formatMinutes } from "../node_modules/study-format/index.js";

const sessions = [25, 50, 90];
console.log("Study sessions in minutes:", sessions);

for (const minutes of sessions) {
  console.log(`${minutes} minutes is ${formatMinutes(minutes)}`);
}
```

</details>
