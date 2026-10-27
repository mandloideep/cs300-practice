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
