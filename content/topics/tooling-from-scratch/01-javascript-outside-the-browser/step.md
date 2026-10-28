---
title: JavaScript outside the browser
mode: edit
entry: index.html
required: [browser-globals, no-process, where-it-runs]
---

**We used this in:** [JavaScript basics](#/topic/javascript-basics) ran every line of JavaScript in a browser; this topic follows the same language onto your own computer, where the tools that build React projects run.

This step asks the code where it is running, by printing the type of three names that only exist in some places.
JavaScript is one language with more than one home: the browser is one, and Node.js, which runs JavaScript in a terminal, is another.
Watch which names exist in the browser, and then compare with what the same file prints in Node.

```demo name="terminal"
```

Press **Run**: the console shows `Hello from JavaScript` and `Largest score: 96`.
Nothing in those two lines depends on where the code runs: strings, arrays, `Math`, and `console` are part of the language and of every place that runs it.

The browser gives every page two more names, `window` for the browser window and `document` for the page.

```js file="src/main.js" action="append"

console.log("typeof window:", typeof window);
console.log("typeof document:", typeof document);
```

Run the code: both print `object`.
`typeof` is safe on a name that might not exist; it answers `undefined` instead of throwing, which is why it is the tool for this question.

Node gives its programs a different name, `process`, which describes the running program: its arguments, its environment variables, and the version of Node.

```js file="src/main.js" action="append"

console.log("typeof process:", typeof process);
```

```predict
What does the console show for `typeof process` here?
- `typeof process: object`
- A red `ReferenceError: process is not defined`
= `typeof process: undefined`
```

It shows `undefined`, with no error, because this site runs your code in a browser page, which has no `process`.

The last edit uses the answer to decide, the way real code that runs in both places does.

```js file="src/main.js" action="append"

const where = typeof window === "undefined" ? "Node" : "a browser";
console.log(`This file is running in ${where}.`);
```

Run it: `This file is running in a browser.`

## Read more

### The same file in Node

Node is a program you install on your computer, and it runs a JavaScript file from the terminal with `node` and the file's name.
If you have Node installed already, download this workspace, open a terminal in the unzipped folder, and run the file there.

```bash
node src/main.js
```

```text
Hello from JavaScript
Largest score: 96
typeof window: undefined
typeof document: undefined
typeof process: object
This file is running in Node.
```

The first two lines are the same, because they use only the language.
The rest flip: Node has no window and no page, so there is nothing for `window` or `document` to name, and it has `process` instead.
That is the whole difference between the two homes: the same language, with different things around it.
A file that uses `document.querySelector` cannot run in Node, and a file that reads `process.argv` cannot run in a browser.

Why this matters for the rest of the semester: the tools that turn a React project into a page, npm, Vite, and the bundler inside it, are JavaScript programs that run in Node on your computer, and the page they produce runs in the browser.
The next steps meet each of those tools, one at a time, with this site showing what each one reads and writes.

If you do not have Node yet, nothing in this topic needs it until the last step, which shows you how to install it.

**If it breaks:** If the console shows `ReferenceError: process is not defined`, the line used `process` directly, such as `console.log(process)`, instead of `typeof process`; only `typeof` is safe on a name that does not exist.
If the last line prints `This file is running in Node.` in the browser, the comparison is flipped; it should test `=== "undefined"` and pick `"Node"` when it is true.
If `node src/main.js` on your computer says `command not found`, Node is not installed yet; the last step of this topic installs it.

**Check:** Run the code.
The console shows the two starter lines, `typeof window: object`, `typeof document: object`, `typeof process: undefined`, and `This file is running in a browser.`
The three checks pass.

```quiz
Which line runs the same in a browser and in Node?
- `document.querySelector("h1")`
- `console.log(process.argv)`
= `console.log(Math.max(3, 9, 4))`
> `Math` and `console` belong to the language and to every place that runs it, while `document` exists only on a page and `process` only in Node.
```

<details>
<summary>src/main.js after this step</summary>

```js
const scores = [72, 96, 88];

console.log("Hello from JavaScript");
console.log("Largest score:", Math.max(...scores));

console.log("typeof window:", typeof window);
console.log("typeof document:", typeof document);

console.log("typeof process:", typeof process);

const where = typeof window === "undefined" ? "Node" : "a browser";
console.log(`This file is running in ${where}.`);
```

</details>
