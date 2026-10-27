---
title: Data attributes
mode: edit
entry: index.html
inspector:
  views: []
required: [items-carry-data, remove-uses-the-id, filter-by-category]
---

Step 6 found a project by reading its title back out of the page.
That works until two projects share a title, and it ties the script to the exact markup of the item.
HTML has a cleaner way to attach information to an element: any attribute whose name starts with `data-` is a **data attribute**, and JavaScript reads and writes all of them through the element's `dataset` property.

Two things changed in the workspace.
Every project in the array now has an `id`, and the submit listener gives a new project `Date.now()` as its id, a number that is different for every entry.
The page also has a row of category buttons, **All**, **HTML**, **CSS**, and **JavaScript**, each carrying a `data-filter` attribute in the HTML; read them in `index.html`.

Start by writing two data attributes on each item as it is built.

```js file="app.js" action="insert-after" anchor='    const item = document.createElement("li");'
    item.dataset.id = project.id;
    item.dataset.category = project.category;
```

`item.dataset.id = 1` produces `data-id="1"` on the element, and `dataset.category` produces `data-category`.
A name with several words converts between kebab-case in HTML and camelCase in JavaScript, so `data-due-date` would be `dataset.dueDate`.
Run the code and look at an item in the DOM view of the inspector: the attributes are there, written by the script.

Now the remove listener can identify a project without reading its title.

```js file="app.js" action="replace" anchor='  const title = item.querySelector(".title").textContent;\n  const index = projects.findIndex((project) => project.title === title);'
  const id = Number(item.dataset.id);
  const index = projects.findIndex((project) => project.id === id);
```

Data attribute values are always strings, because attributes are strings.
`dataset.id` is `"1"`, not `1`, and `"1" === 1` is `false`, so we convert with `Number` before comparing.
Forgetting that conversion is the usual data attribute bug, and it fails silently: `findIndex` returns `-1` and `splice(-1, 1)` removes the last project instead of the clicked one.

The category buttons combine data attributes with delegation.
One listener on the group reads which filter was clicked and hides every item whose category does not match.

```js file="app.js" action="append"

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  const category = button.dataset.filter;
  for (const item of list.children) {
    item.classList.toggle("hidden", category !== "all" && item.dataset.category !== category);
  }
  for (const other of filters.querySelectorAll("button")) {
    other.setAttribute("aria-pressed", String(other === button));
  }
});
```

`[data-filter]` is an attribute selector, so `closest` finds the button no matter which button it is.
The first loop compares the filter with each item's `data-category` and toggles the `hidden` class, which the stylesheet turns into `display: none`; the `all` filter hides nothing.
The second loop presses the clicked button and releases the others.
The data on the elements decides everything, and the script never needs a separate list of which button goes with which category.

**Check:** Run the code and click **CSS**: only `Landing page` stays visible and the CSS button is pressed.
Click **All** to see every project.
Add a project named `Landing page` and remove the original one; the right item goes, because the ids differ.
Press **Run checks**.

**If it breaks:** If clicking Remove deletes the last project instead of the clicked one, `dataset.id` is compared without `Number`.
If every item disappears on a filter click, the comparison uses `item.category` instead of `item.dataset.category`.
If nothing happens when a filter is clicked, the listener is not on `#filters` or the selector is missing its square brackets.

<details>
<summary>app.js after this step</summary>

```js
const status = document.querySelector("#status");
const list = document.querySelector("#project-list");
const filterButton = document.querySelector("#filter-button");
const filters = document.querySelector("#filters");
const form = document.querySelector("#add-form");
const projects = [
  { id: 1, title: "Profile card", category: "HTML", done: true },
  { id: 2, title: "Landing page", category: "CSS", done: false },
  { id: 3, title: "Reading list", category: "JavaScript", done: false }
];
let doneOnly = false;

function renderProjects() {
  const visible = doneOnly ? projects.filter((project) => project.done) : projects;
  list.replaceChildren();
  for (const project of visible) {
    const item = document.createElement("li");
    item.dataset.id = project.id;
    item.dataset.category = project.category;
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = project.title;
    const category = document.createElement("span");
    category.className = "category";
    category.textContent = project.category;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove";
    remove.textContent = "Remove";
    item.append(title, category, remove);
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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = new FormData(form).get("title").trim();
  if (!title) {
    status.textContent = "Type a project title first.";
    return;
  }
  projects.push({ id: Date.now(), title, category: "New", done: false });
  renderProjects();
  form.reset();
});

document.querySelector("main").addEventListener("submit", (event) => {
  console.log("main heard a submit from", event.target.id);
});

list.addEventListener("click", (event) => {
  const button = event.target.closest(".remove");
  if (!button) return;
  const item = button.closest("li");
  const id = Number(item.dataset.id);
  const index = projects.findIndex((project) => project.id === id);
  projects.splice(index, 1);
  renderProjects();
});

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  const category = button.dataset.filter;
  for (const item of list.children) {
    item.classList.toggle("hidden", category !== "all" && item.dataset.category !== category);
  }
  for (const other of filters.querySelectorAll("button")) {
    other.setAttribute("aria-pressed", String(other === button));
  }
});
```

</details>
