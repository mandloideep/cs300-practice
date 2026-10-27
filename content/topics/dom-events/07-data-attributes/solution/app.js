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
