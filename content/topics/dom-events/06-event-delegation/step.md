---
title: Event delegation on the list
mode: edit
entry: index.html
inspector:
  views: []
required: [remove-button-on-every-item, one-listener-on-the-list, works-for-added-items]
---

Each project should have a **Remove** button.
The obvious plan is to add a click listener to every button inside `renderProjects`.
It works, but it has a cost we would pay on every render: the buttons are destroyed and recreated each time, so every listener is lost with its button, and a listener attached to today's buttons knows nothing about the ones a later submit creates.

Step 5 showed the way out.
A click on a button bubbles up to the list, so **one listener on the list** hears every button click, including clicks on buttons that do not exist yet.
This is **event delegation**, and we used it in Week 7 for the task list.

First, give every item a button.
Create it beside the two spans.

```js file="app.js" action="insert-before" anchor="    item.append(title, category);"
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove";
    remove.textContent = "Remove";
```

`type = "button"` matters: a button inside or near a form submits the form by default, and this one must not.
Then append it with the spans.

```js file="app.js" action="replace" anchor="    item.append(title, category);"
    item.append(title, category, remove);
```

Run it.
Every item has a Remove button, and clicking one does nothing yet.
Now the one listener.

```js file="app.js" action="append"

list.addEventListener("click", (event) => {
  const button = event.target.closest(".remove");
  if (!button) return;
  const item = button.closest("li");
  const title = item.querySelector(".title").textContent;
  const index = projects.findIndex((project) => project.title === title);
  projects.splice(index, 1);
  renderProjects();
});
```

The listener hears every click anywhere in the list, so the first job is to decide whether this click is one we care about.
`event.target.closest(".remove")` starts at the clicked element and walks up through its ancestors until it finds one that matches the selector, returning `null` if it reaches the top without a match.
Starting from the target, rather than testing `event.target` itself, means a click on text inside the button still counts.
A click on a title or on the space between items finds no button, and the early `return` ignores it.

From the button, `closest("li")` walks up to the item, and the title inside it tells us which project this is.
`findIndex` locates that project in the array, `splice` removes it, and `renderProjects` redraws the list from the array.
We change the data and render, as in Step 5; we never remove the `li` ourselves, because then the array and the page would disagree.

Looking a project up by its title is a weakness: two projects with the same title would be confused.
The next step gives every project an id and carries it on the element.

**Check:** Run the code and click **Remove** on `Landing page`: the item disappears and the status reads `2 of 2 projects shown.`
Add a project with the form, then remove it: the button on the new item works without any new listener, because the listener is on the list.
Press **Run checks**; the checks add an item and remove it again.

**If it breaks:** If clicking a Remove button submits the form, `remove.type` is not set to `"button"`.
If nothing happens on click and there is no error, the listener is on the wrong element or `closest` is given `"remove"` without the dot.
If the wrong project disappears, the `findIndex` comparison is not using the title from the clicked item.

<details>
<summary>app.js after this step</summary>

```js
const status = document.querySelector("#status");
const list = document.querySelector("#project-list");
const filterButton = document.querySelector("#filter-button");
const form = document.querySelector("#add-form");
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
  projects.push({ title, category: "New", done: false });
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
  const title = item.querySelector(".title").textContent;
  const index = projects.findIndex((project) => project.title === title);
  projects.splice(index, 1);
  renderProjects();
});
```

</details>
