---
title: Select the elements
mode: edit
entry: index.html
inspector:
  views: [dom]
required: [status-selected, three-items-counted, missing-is-null]
---

**We used this in:** [JavaScript basics](#/topic/javascript-basics), where we worked with arrays, objects, and callbacks in the console before touching the page.

In Week 5 and Week 6 Session 1 our JavaScript worked with numbers, strings, arrays, and objects, and it printed its results to the console.
The page did not change, because nothing connected the script to it.
That connection is the **DOM**, the Document Object Model.
When the browser reads `index.html`, it does not keep the text.
It builds a tree of objects in memory, one node per element, and the page you see is drawn from that tree.
JavaScript reaches the tree through one global object, `document`.

This workspace is a small project browser: a heading, a status line, and a list of three projects typed into the HTML.
Open `index.html` and read the ids and classes, because every selection below names one of them.
Then open `app.js`, which only prints `Starter ready`.

Before a script can change anything, it has to find the element.
`document.querySelector` takes a CSS selector, the same selectors we wrote in stylesheets, and returns the first element that matches.
Replace the starter line with a selection and a log.

```js file="app.js" action="replace" anchor='console.log("Starter ready");'
const status = document.querySelector("#status");
console.log("status is", status);
```

`#status` is the selector for the element whose id is `status`, exactly as it would be in CSS.
The console shows the element as `<p#status>`, which is the lab's short way of printing a node: tag, then id, then classes.

Several elements can match one selector.
`document.querySelectorAll` returns every match as a **NodeList**, which you can count with `length` and loop over with `forEach` or `for...of`.
Add a selection of the list items below the first log.

```js file="app.js" action="append"

const projects = document.querySelectorAll("#project-list li");
console.log(projects.length, "projects on the page");
```

The selector reads as "every `li` inside the element with id `project-list`", so the three typed items match and the console prints `3 projects on the page`.
A NodeList is not an array: `length`, indexing, and `forEach` work, but `map` and `filter` do not until you spread it into one with `[...projects]`.

The most common DOM bug is a selector that matches nothing.
`querySelector` then returns `null`, and the next line that touches the result crashes with `Cannot read properties of null`.
Add one deliberately misspelled selection so you can see what `null` looks like before it bites.

```js file="app.js" action="append"

const missing = document.querySelector("#project-lsit li");
console.log("misspelled selector gives", missing);
```

Nothing has the id `project-lsit`, so the result is `null` and the console says so.
`querySelectorAll` behaves differently: a selector that matches nothing gives an empty NodeList with `length` `0`, never `null`, so a loop over it simply does nothing.
We keep this line for this step only, so the next step's workspace starts without it.

**Check:** Run the code and read the console from the top.
It prints `status is <p#status>`, then `3 projects on the page`, then `misspelled selector gives null`.
Press **Run checks** to confirm all three.

**If it breaks:** If the first log shows `null`, compare the selector with the `id` in `index.html`; the `#` belongs in the selector and not in the HTML.
If the count is `0`, the selector has a typo in `project-list` or the space between the id and `li` is missing.
If the console shows `Cannot read properties of null`, a later line is using a selection that matched nothing; find the `null` log above it.

<details>
<summary>app.js after this step</summary>

```js
const status = document.querySelector("#status");
console.log("status is", status);

const projects = document.querySelectorAll("#project-list li");
console.log(projects.length, "projects on the page");

const missing = document.querySelector("#project-lsit li");
console.log("misspelled selector gives", missing);
```

</details>
