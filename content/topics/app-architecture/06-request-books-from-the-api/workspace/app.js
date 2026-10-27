const app = document.querySelector("#app");
const form = document.querySelector("#search-form");
const results = document.querySelector("#results");
const message = document.querySelector("#message");

const STORAGE_KEY = "coursehub-bookmarks";
const warning = document.querySelector("#storage-warning");
function validBooks(value) {
  return Array.isArray(value) && value.every(function (book, index) {
    return book && typeof book.id === "string" && book.id.length > 0
      && typeof book.title === "string" && typeof book.author === "string"
      && typeof book.year === "string"
      && value.findIndex(item => item && item.id === book.id) === index;
  });
}
function showStorageWarning(text) {
  warning.textContent = text;
  warning.hidden = !text;
}
function loadBookmarks() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    const saved = text === null ? [] : JSON.parse(text);
    if (!validBooks(saved)) throw new Error("Unexpected bookmark data");
    return saved;
  } catch (error) {
    console.warn("Bookmarks could not be loaded:", error);
    showStorageWarning("Saved books could not be loaded. You can keep using this tab; the next successful save replaces the old data.");
    return [];
  }
}
function saveBookmarks(books) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    showStorageWarning("");
  } catch (error) {
    console.warn("Bookmarks could not be saved:", error);
    showStorageWarning("Your changes work in this tab, but could not be saved. Keep this tab open if you need them.");
  }
}

const sampleBooks = [
  { id: "/works/demo-1", title: "Learning JavaScript", author: "Alex Rivera", year: "2024" },
  { id: "/works/demo-2", title: "Accessible Interfaces", author: "Jordan Lee", year: "2023" },
  { id: "/works/demo-3", title: "CSS Layout Notebook", author: "Sam Patel", year: "2025" }
];

let bookmarks = loadBookmarks();
let shownBooks = [];

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
  });
}
function bookCard(book, saved, number) {
  return `<article class="book-card">
    <p class="book-number">${number}</p>
    <h3>${escapeHTML(book.title)}</h3>
    <p class="book-meta">${escapeHTML(book.author)}<br>${escapeHTML(book.year)}</p>
    <button type="button" data-action="bookmark" data-id="${escapeHTML(book.id)}"
      aria-pressed="${saved}"><span>${saved ? "Saved - remove" : "Bookmark"}</span></button>
  </article>`;
}
function bookList(books) {
  return books.map(function (book, index) {
    const saved = bookmarks.some(item => item.id === book.id);
    return bookCard(book, saved, index + 1);
  }).join("");
}

function renderBooks(books) {
  shownBooks = books;
  results.innerHTML = bookList(books);
  message.textContent = books.length + " books shown.";
}
renderBooks(sampleBooks);

app.addEventListener("submit", function (event) {
  if (event.target !== form) return;
  event.preventDefault();
  const data = new FormData(form);
  const query = data.get("query").trim();
  if (!query) {
    message.textContent = "Enter a title or topic first.";
    document.querySelector("#query").focus();
    return;
  }
  const matching = sampleBooks.filter(function (book) {
    return book.title.toLowerCase().includes(query.toLowerCase());
  });
  renderBooks(matching);
});

app.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action='bookmark']");
  if (!button || !app.contains(button)) return;
  const id = button.dataset.id;
  const book = shownBooks.find(item => item.id === id);
  if (!book) return;
  const saved = bookmarks.some(item => item.id === id);
  bookmarks = saved ? bookmarks.filter(item => item.id !== id) : [...bookmarks, book];
  saveBookmarks(bookmarks);
  renderBooks(shownBooks);
  const replacement = [...results.querySelectorAll("button")].find(item => item.dataset.id === id);
  if (replacement) replacement.focus();
});
