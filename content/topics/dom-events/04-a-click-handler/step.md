---
title: A click handler, and the parentheses mistake
mode: edit
entry: index.html
inspector:
  views: []
required: [handler-waits-for-click, click-filters, second-click-restores]
---

Everything so far ran once, when the script loaded.
A page becomes interactive when some of its code runs later, in response to something the user does.
That something is an **event**: a click, a key press, a form submission.
The pattern has three parts: select an element, listen for an event on it, and give the browser a function to run when the event happens.

The workspace grew between steps.
The loop from Step 3 now lives in a function, `renderProjects`, which empties the list with `replaceChildren` and builds it again from the array, so we can call it whenever the data changes.
A variable `doneOnly` decides whether the function shows every project or only the finished ones, and `toggleDoneOnly` flips it and renders again.
The page has a button, **Show finished only**, and the last lines of the script connect it to the function.

Run the starter before changing anything.
The status line says `1 of 3 projects shown.` before you click anything, the console already says `doneOnly is now true`, and clicking the button does nothing.
That is the most common mistake with `addEventListener`, and it is in the last lines of the file:

```js
filterButton.addEventListener("click", toggleDoneOnly());
```

The parentheses call `toggleDoneOnly` right now, while the script is loading.
The function runs once, flips `doneOnly`, and returns `undefined`, and `undefined` is what gets registered as the listener, so clicks have nothing to run.
`addEventListener` needs the function itself, not its result.
Remove the parentheses.

```js file="app.js" action="replace" anchor='filterButton.addEventListener("click", toggleDoneOnly());'
filterButton.addEventListener("click", toggleDoneOnly);
```

Read it as "save this function, and call it back when the button is clicked".
`toggleDoneOnly` without parentheses is a value, the function object, and we hand that value to the browser.
A function passed this way is called a **callback**, and the same idea is behind `forEach`, `map`, and `filter`.

The button has an `aria-pressed` attribute in the HTML, which tells assistive technology that it is a toggle and whether it is on.
Keep it in step with the variable.

```js file="app.js" action="insert-after" anchor="  doneOnly = !doneOnly;"
  filterButton.setAttribute("aria-pressed", String(doneOnly));
```

`setAttribute` writes any attribute; attributes are strings, so we convert the boolean first.
The stylesheet has a rule for `button[aria-pressed="true"]`, which is why the button changes color when it is on.

Finally, add one log at the very end of the file.

```js file="app.js" action="append"
console.log("Script finished. Waiting for clicks.");
```

Run the code and watch the console.
`Script finished` prints immediately, and nothing from `toggleDoneOnly` prints until you click, even though that function is written above the log.
Registering a listener does not run it.
The browser keeps the function and calls it each time the event happens, which can be once, many times, or never.

**Check:** Run the code.
The status line reads `3 of 3 projects shown.`, the console shows only `Script finished`, and the button is not pressed.
Click **Show finished only**: the console prints `doneOnly is now true`, one project remains, the status reads `1 of 3 projects shown.`, and the button changes color.
Click again to see all three.
Press **Run checks**; the checks click the button for you and put it back.

**If it breaks:** If the console prints `doneOnly is now true` before any click, the parentheses are still there.
If clicking does nothing and the console shows no error, the listener was added to a different element than `#filter-button`, or the event name is not exactly `"click"`.
If the button never changes color, `setAttribute` is writing `aria-pressed` outside `toggleDoneOnly`, so it runs once instead of on every click.

<details>
<summary>app.js after this step</summary>

```js
const status = document.querySelector("#status");
const list = document.querySelector("#project-list");
const filterButton = document.querySelector("#filter-button");
const projects = [
  { title: "Profile card", category: "HTML", done: true },
  { title: "Landing page", category: "CSS", done: false },
  { title: "Reading list", category: "JavaScript", done: false }
];
let doneOnly = false;

function renderProjects() {
  const visible = doneOnly ? projects.filter((project) => project.done) : projects;
  list.replaceChildren();
  for (const project of visible) {
    const item = document.createElement("li");
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = project.title;
    const category = document.createElement("span");
    category.className = "category";
    category.textContent = project.category;
    item.append(title, category);
    item.classList.toggle("done", project.done);
    list.append(item);
  }
  status.textContent = `${visible.length} of ${projects.length} projects shown.`;
}

function toggleDoneOnly() {
  doneOnly = !doneOnly;
  filterButton.setAttribute("aria-pressed", String(doneOnly));
  console.log("doneOnly is now", doneOnly);
  renderProjects();
}

filterButton.addEventListener("click", toggleDoneOnly);
renderProjects();
console.log("Script finished. Waiting for clicks.");
```

</details>
