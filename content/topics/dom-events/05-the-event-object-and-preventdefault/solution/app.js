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
