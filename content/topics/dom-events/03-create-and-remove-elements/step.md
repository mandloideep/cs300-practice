---
title: Create and remove elements
mode: edit
entry: index.html
inspector:
  views: []
required: [placeholder-removed, one-item-per-project, items-have-parts]
---

So far the three projects were typed into the HTML.
Real pages get their data from a file, a server, or the user, and the elements have to be made from that data.
In this workspace the list in `index.html` holds only a placeholder item, and `app.js` holds the projects as an array of objects, the way Week 6 Session 1 grouped related values.

Creating an element follows one pattern every time: **create, configure, append**.
`document.createElement` makes a node that exists only in memory, you set its text and classes, and `append` connects it to the document, which is the moment it appears.
Add a loop that makes one item per project.

```js file="app.js" action="append"

for (const project of projects) {
  const item = document.createElement("li");
  item.textContent = project.title;
  list.append(item);
}
```

Run it.
Three new items appear, but the placeholder `No projects loaded yet.` is still at the top of the list, because nothing removed it.
Every node has a `remove` method that takes it out of the tree.
Remove the placeholder before the loop runs.

```js file="app.js" action="insert-before" anchor="for (const project of projects) {"
document.querySelector("#placeholder").remove();
```

The order matters: select it, remove it, then build the new items.
Once a node is removed, selecting it again returns `null`, which is the Step 1 bug waiting to happen; a script should remove a node once.

A title alone loses the category and the finished mark we had in the typed version.
Build each item from two spans, so the stylesheet's `.title` and `.category` rules apply, and set the `done` class from the data.

```js file="app.js" action="replace" anchor="  item.textContent = project.title;"
  const title = document.createElement("span");
  title.className = "title";
  title.textContent = project.title;
  const category = document.createElement("span");
  category.className = "category";
  category.textContent = project.category;
  item.append(title, category);
  item.classList.toggle("done", project.done);
```

`append` accepts several nodes at once and adds them in order.
Assigning `className` is fine here because the span is brand new and has no classes to lose.
`classList.toggle` with a second argument adds the class when the argument is `true` and removes it when it is `false`, which is shorter than an `if`.

Finish with the status line, written from the array rather than from the page.

```js file="app.js" action="append"
status.textContent = `${projects.length} projects on the page.`;
```

Look at what we have: data in an array, and a loop that turns the data into elements.
When the data changes, we can clear the list and run the loop again, and that is the next step.

**Check:** Run the code.
The placeholder is gone, three items show a title and a category, the first one is struck through, and the status line reads `3 projects on the page.`
Press **Run checks**.

**If it breaks:** If the placeholder is still there, the `remove` line is missing or runs after a line that fails.
If the console says `Cannot read properties of null (reading 'remove')`, the placeholder was already removed or the id is misspelled.
If the items show no category, the span is created but never appended; the `append` call must list both spans.

<details>
<summary>app.js after this step</summary>

```js
const status = document.querySelector("#status");
const list = document.querySelector("#project-list");
const projects = [
  { title: "Profile card", category: "HTML", done: true },
  { title: "Landing page", category: "CSS", done: false },
  { title: "Reading list", category: "JavaScript", done: false }
];

document.querySelector("#placeholder").remove();
for (const project of projects) {
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
status.textContent = `${projects.length} projects on the page.`;
```

</details>
