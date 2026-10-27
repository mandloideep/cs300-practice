---
title: Remember the list with localStorage
mode: edit
entry: index.html
inspector:
  views: []
required: [storage-matches-the-list, add-saves, remove-saves]
---

Add a project, press **Run**, and it is gone.
Every change we made lives in a JavaScript array in memory, and a reload starts the script from the beginning with the array as it was typed.
In Week 7 we fixed this with **localStorage**, a small store the browser keeps for each site, which survives reloads and restarts until the user or the script clears it.

localStorage has one rule that shapes everything: it stores strings only.
`setItem(key, value)` saves a string under a name, `getItem(key)` returns the string or `null` when nothing was saved under that name, and arrays and objects go through `JSON.stringify` on the way in and `JSON.parse` on the way out.

Start by loading the saved list, or the starter list when nothing is saved.

```js file="app.js" action="replace" anchor='const projects = [\n  { id: 1, title: "Profile card", category: "HTML", done: true },\n  { id: 2, title: "Landing page", category: "CSS", done: false },\n  { id: 3, title: "Reading list", category: "JavaScript", done: false }\n];'
const STORAGE_KEY = "project-browser";
const starterProjects = [
  { id: 1, title: "Profile card", category: "HTML", done: true },
  { id: 2, title: "Landing page", category: "CSS", done: false },
  { id: 3, title: "Reading list", category: "JavaScript", done: false }
];
const projects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || starterProjects;
```

The key is a constant so that saving and loading can never disagree about its spelling.
On the first run `getItem` returns `null`, `JSON.parse(null)` is `null`, and `null || starterProjects` picks the typed list.
After a save, `getItem` returns the JSON text, `JSON.parse` turns it back into an array of objects, and that array wins.
This is the safe load pattern from Week 7, with the starter list in place of `[]`.

Now a function that saves.

```js file="app.js" action="insert-after" anchor="let doneOnly = false;"

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
```

`JSON.stringify` turns the array into text such as `[{"id":1,"title":"Profile card",...}]`, which is what gets stored.
Nothing calls this function yet, and that is the whole discipline of persistence: **call save after every change to the data**.
There are two changes in this script, the submit and the remove.

```js file="app.js" action="insert-after" anchor='  projects.push({ id: Date.now(), title, category: "New", done: false });'
  saveProjects();
```

```js file="app.js" action="insert-after" anchor="  projects.splice(index, 1);"
  saveProjects();
```

Each change now follows the same three beats: change the array, save it, render it.
The toggle and the category filter do not save, because they change what is shown rather than what the list contains.

The lab's **Run** button clears the result's storage before it runs, so that every run starts clean.
To see persistence, use **Run, keeping saved data**, which runs the code again without clearing, the way a real reload keeps what the page saved.

**Check:** Run the code, add a project, and remove `Profile card`.
Press **Run, keeping saved data**: the list comes back as you left it, with the new project and without `Profile card`.
Press **Run** and the starter list is back, because the storage was cleared.
Press **Run checks**; the checks compare the stored JSON with the list after an add and a remove.

**If it breaks:** If the list is always the starter list after a kept run, `saveProjects` is never called, or the key in `setItem` differs from the key in `getItem`.
If the console says `Unexpected token` from `JSON.parse`, something other than JSON was stored under the key; press **Run** to clear it.
If new projects save but the starter list never shows, the `||` fallback is missing and `projects` is `null` on the first run.

<details>
<summary>app.js after this step</summary>

```js
const status = document.querySelector("#status");
const list = document.querySelector("#project-list");
const filterButton = document.querySelector("#filter-button");
const filters = document.querySelector("#filters");
const form = document.querySelector("#add-form");
const STORAGE_KEY = "project-browser";
const starterProjects = [
  { id: 1, title: "Profile card", category: "HTML", done: true },
  { id: 2, title: "Landing page", category: "CSS", done: false },
  { id: 3, title: "Reading list", category: "JavaScript", done: false }
];
const projects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || starterProjects;
let doneOnly = false;

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

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
  saveProjects();
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
  saveProjects();
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
