const topics = [
  { title: "Git basics", done: true },
  { title: "Git collaboration", done: false },
  { title: "Deploy with GitHub Pages", done: false },
];

const list = document.querySelector("#topics");
for (const topic of topics) {
  const item = document.createElement("li");
  item.textContent = topic.title;
  if (topic.done) item.classList.add("done");
  list.append(item);
}
