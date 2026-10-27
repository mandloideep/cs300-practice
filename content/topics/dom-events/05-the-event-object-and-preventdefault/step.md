---
title: The event object and preventDefault
mode: edit
entry: index.html
inspector:
  views: []
required: [submit-is-prevented, submit-adds-a-project, submit-bubbles-to-main]
---

The page has a form now: a labeled text field and an **Add project** button.
A form has a built-in behavior that is older than JavaScript.
When it is submitted, by the button or by pressing Enter in the field, the browser collects the field values, sends them to the address in the form's `action`, and loads the response as a new page.
Our form has no `action`, so the browser would reload the current address, throwing away everything the script built.

When the browser runs a listener, it passes one argument, the **event object**, which describes what happened.
`event.target` is the element the event started on, `event.type` is the kind of event, and `event.preventDefault()` tells the browser to skip the built-in behavior.
Add a submit listener whose first line prevents the reload.

```js file="app.js" action="append"

form.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("submit from", event.target.id, "at", Math.round(event.timeStamp), "ms");
});
```

We listen for `submit` on the form, not for `click` on the button, because a submit happens from the button and from the Enter key alike, and one listener should cover both.
The arrow function is an anonymous callback, written where it is used, and `event` is the name we chose for its one parameter.
`event.timeStamp` is the time of the event in milliseconds since the page loaded, so the log shows that this code runs long after the script finished.

Run it, type a title, and press Enter.
The page stays, the log appears, and the field keeps its text.
Now see why the first line matters: delete `event.preventDefault();`, run, and submit again.
The result pane leaves your page entirely, because the browser submitted the form to a new address.
Press **Run** to get the page back, and put the line back.
Week 6 called this the one line you will almost always need in a submit listener.

Events do not stop at the element they started on.
After the form's listeners run, the same event travels up through the form's ancestors, `main`, `body`, and `html`, and listeners on any of them run too.
This is **bubbling**, and you can watch it with one more listener.

```js file="app.js" action="append"

document.querySelector("main").addEventListener("submit", (event) => {
  console.log("main heard a submit from", event.target.id);
});
```

Submit again and read the console: the form's log comes first, then `main heard a submit from add-form`.
`event.target` is still the form, because the target is where the event started, not where it is being heard.
The next step builds on bubbling to handle a whole list with one listener.

Now make the submit do its job.
`FormData` reads every named field of a form, and `get("title")` returns the text of the field whose `name` is `title`.
Replace the log with a guard clause and an update to the data.

```js file="app.js" action="replace" anchor='  console.log("submit from", event.target.id, "at", Math.round(event.timeStamp), "ms");'
  const title = new FormData(form).get("title").trim();
  if (!title) {
    status.textContent = "Type a project title first.";
    return;
  }
  projects.push({ title, category: "New", done: false });
  renderProjects();
  form.reset();
```

`trim` removes spaces around the text, so a field full of spaces counts as empty.
The guard clause handles that case with a message and returns early, as our Week 5 functions did.
Otherwise we add an object to the array and call `renderProjects`, which rebuilds the list from the array; the page is never edited directly.
`form.reset()` clears the field for the next entry.

**Check:** Run the code.
Type `Portfolio` and press Enter: a fourth item appears, the status reads `4 of 4 projects shown.`, the field clears, and the console shows `main heard a submit from add-form`.
Submit an empty field: the status asks for a title and nothing is added.
Press **Run checks**; the checks submit for you and remove what they added.

**If it breaks:** If the result pane shows a different page after a submit, `event.preventDefault()` is missing or runs after a `return`.
If the console says `Cannot read properties of null (reading 'trim')`, the field's `name` attribute is not `title`.
If the new item never appears but the console shows no error, the object was pushed but `renderProjects` was not called.

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
```

</details>
