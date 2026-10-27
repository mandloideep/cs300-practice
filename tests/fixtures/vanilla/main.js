const list = document.getElementById("books");
const count = document.getElementById("count");
const titles = ["Refactoring", "Clean Code", "Design Patterns"];

function updateCount() {
  const total = list.children.length;
  count.textContent = `${total} ${total === 1 ? "book" : "books"}`;
}

document.getElementById("add").addEventListener("click", () => {
  const item = document.createElement("li");
  item.className = "book";
  item.textContent = titles[list.children.length % titles.length];
  list.append(item);
  updateCount();
  console.log(`added ${item.textContent}`);
});

document.getElementById("toggle").addEventListener("click", () => {
  const compact = document.body.classList.toggle("compact");
  console.log(`compact is now ${compact}`);
});

updateCount();
console.log("reading list ready");
