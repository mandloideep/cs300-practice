---
title: npm and package.json
mode: edit
entry: index.html
required: [reads-the-project, three-scripts, two-kinds-of-dependency]
---

This step reads a project's `package.json` from JavaScript and prints what it says, so that every field you add shows up in the console.
`package.json` is the file every JavaScript project on a computer starts from: it names the project, lists the commands you run, and lists the packages it needs.
Watch how each field you add becomes something npm will do for you.

The workspace has a new file, `package.json`, beside `index.html`.
`src/main.js` imports it, which the lab allows, as Vite does: a module that imports a `.json` file gets its value as an object.
Press **Run**: the console shows `Project: study-timer 1.0.0`, read from the `name` and `version` fields.

Open `package.json` and read it from the top.
`name` and `version` identify the project.
`"private": true` means the project is never published to the npm registry by accident, which is right for an app.
`"type": "module"` says that the project's `.js` files use `import` and `export`, the module syntax we use all semester.
`scripts` names commands, and `dependencies` names packages; the next edits print both.

```js file="src/main.js" action="append"

for (const [name, command] of Object.entries(project.scripts)) {
  console.log(`npm run ${name} runs: ${command}`);
}
```

`Object.entries` turns an object into a list of `[key, value]` pairs, and the loop unpacks each pair into `name` and `command`.
Run it: `npm run dev runs: vite` and `npm run build runs: vite build`.
That is all a script is: a name for a command, so that you type `npm run dev` in a project and npm runs whatever this project means by `dev`.

Every Vite project has a third script, `preview`, which serves the finished build so that you can look at it before you put it online.
Add it after `build`; the line above it gains a comma, because JSON needs a comma between items and allows none after the last one.

```json file="package.json" action="replace" anchor='    "build": "vite build"'
    "build": "vite build",
    "preview": "vite preview"
```

Predict before you run: does the console now show two `npm run` lines, three, or a red error about `package.json`?
It shows three, because the loop reads whatever the file says; you changed what the project can do without touching the code that prints it.
Now try the mistake everyone makes once: delete the comma after `"vite build"` and run.
The result pane says **Did not compile** and names `package.json`, with a message such as `Expected ',' or '}' after property value in JSON` and the line and column where reading stopped.
npm refuses such a file the same way, so every `npm` command in that folder fails until the comma is back; put it back.

## Two kinds of dependency

`dependencies` lists the packages the page itself uses while it runs, and this project uses one, `ms`, which turns a number of milliseconds into words such as `2h`.
The tools that build the page are packages too, but the page never runs them, so they go in a second list, `devDependencies`.

```json file="package.json" action="replace" anchor='  "dependencies": {\n    "ms": "^2.1.3"\n  }'
  "dependencies": {
    "ms": "^2.1.3"
  },
  "devDependencies": {
    "vite": "^8.2.4"
  }
```

Print both lists.

```js file="src/main.js" action="append"

console.log("The page needs:", Object.keys(project.dependencies));
console.log("Only the tools need:", Object.keys(project.devDependencies));
```

Run it: `The page needs: ["ms"]` and `Only the tools need: ["vite"]`.

## Versions and the caret

Each package name is paired with a version **range**, not one version.
`^8.2.4` means "8.2.4 or any newer 8.x release", because packages number their releases as major, minor, and patch, and a release that keeps the major number promises not to break the code that used the one before.
So two students who install this project a month apart can get different versions of Vite, both allowed by the range.
The next step shows where npm writes down the exact version it chose, so that the second install matches the first.

You never write these lists by hand in a real project.
`npm install ms` adds `ms` to `dependencies` and downloads it, `npm install --save-dev vite` adds Vite to `devDependencies`, and `npm install` with no name installs everything both lists name.
The projects you download in this course pin exact versions, such as `"vite": "8.2.4"` with no caret, so that every computer in our class runs the same code.

**If it breaks:** If the result says **Did not compile** and names `package.json`, go to the line and column in the message and look there for a missing comma between two entries, an extra comma after the last entry of an object, or single quotes, which JSON does not allow.
If the console shows only two `npm run` lines, the `preview` line was added somewhere other than inside `"scripts"`.
If the last line throws `Cannot convert undefined or null to object`, the `devDependencies` object is missing or misspelled, so `project.devDependencies` is `undefined`.

**Check:** Run the code.
The console shows the project line, three `npm run` lines for `dev`, `build`, and `preview`, then `The page needs: ["ms"]` and `Only the tools need: ["vite"]`.
The three checks pass.

<details>
<summary>package.json after this step</summary>

```json
{
  "name": "study-timer",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "ms": "^2.1.3"
  },
  "devDependencies": {
    "vite": "^8.2.4"
  }
}
```

</details>

<details>
<summary>src/main.js after this step</summary>

```js
import project from "../package.json";

console.log("Project:", project.name, project.version);

for (const [name, command] of Object.entries(project.scripts)) {
  console.log(`npm run ${name} runs: ${command}`);
}

console.log("The page needs:", Object.keys(project.dependencies));
console.log("Only the tools need:", Object.keys(project.devDependencies));
```

</details>
