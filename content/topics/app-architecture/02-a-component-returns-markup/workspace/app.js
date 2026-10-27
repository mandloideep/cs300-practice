const app = document.querySelector("#app");
const form = document.querySelector("#search-form");
const results = document.querySelector("#results");
const message = document.querySelector("#message");

const sampleBooks = [
  { id: "/works/demo-1", title: "Learning JavaScript", author: "Alex Rivera", year: "2024" },
  { id: "/works/demo-2", title: "Accessible Interfaces", author: "Jordan Lee", year: "2023" },
  { id: "/works/demo-3", title: "CSS Layout Notebook", author: "Sam Patel", year: "2025" }
];

function renderBooks(books) {
  results.replaceChildren();
  for (const book of books) {
    const card = document.createElement("article");
    card.className = "book-card";
    const title = document.createElement("h3");
    title.textContent = book.title;
    const meta = document.createElement("p");
    meta.className = "book-meta";
    meta.textContent = book.author + ", " + book.year;
    card.append(title, meta);
    results.append(card);
  }
  message.textContent = books.length + " books shown.";
}
renderBooks(sampleBooks);
