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

const state = {
  query: "",
  status: "initial",
  books: [],
  bookmarks: loadBookmarks(),
  error: ""
};
function setState(changes) {
  Object.assign(state, changes);
  render();
}

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
    const saved = state.bookmarks.some(item => item.id === book.id);
    return bookCard(book, saved, index + 1);
  }).join("");
}

function render() {
  const messages = {
    initial: "Search for books to get started.",
    loading: "Searching...",
    success: state.books.length + " books found.",
    empty: "No books found. Try another search.",
    error: state.error
  };
  form.querySelector("button").disabled = state.status === "loading";
  results.setAttribute("aria-busy", String(state.status === "loading"));
  message.textContent = messages[state.status];
  results.innerHTML = bookList(state.books);
}

async function requestBooks(query) {
  const url = `${import.meta.env.API_BASE}/search.json?q=${encodeURIComponent(query)}&fields=key,title,author_name,first_publish_year&limit=12`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!data || !Array.isArray(data.docs)) throw new Error("Expected a docs array");
  const books = data.docs.map(function (book) {
    if (!book || typeof book.key !== "string" || !book.key || typeof book.title !== "string") {
      throw new Error("A book is missing its key or title");
    }
    return {
      id: book.key,
      title: book.title,
      author: Array.isArray(book.author_name) && typeof book.author_name[0] === "string"
        ? book.author_name[0] : "Unknown author",
      year: Number.isInteger(book.first_publish_year) ? String(book.first_publish_year) : "Year unavailable"
    };
  });
  return books.filter((book, index) => books.findIndex(item => item.id === book.id) === index);
}

async function searchBooks(query) {
  if (state.status === "loading") return;
  setState({ query, status: "loading", books: [], error: "" });
  try {
    const books = await requestBooks(query);
    setState({ books, status: books.length ? "success" : "empty" });
  } catch (error) {
    console.error("Search failed:", error);
    setState({ status: "error", books: [], error: "We could not load books. Check the API source or the connection, then try again." });
  }
}

app.addEventListener("submit", function (event) {
  if (event.target !== form) return;
  event.preventDefault();
  const data = new FormData(form);
  const query = data.get("query").trim();
  if (!query) {
    setState({ status: "error", books: [], error: "Enter a title or topic first." });
    document.querySelector("#query").focus();
    return;
  }
  searchBooks(query);
});

app.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action='bookmark']");
  if (!button || !app.contains(button)) return;
  const id = button.dataset.id;
  const book = state.books.find(item => item.id === id);
  if (!book) return;
  const saved = state.bookmarks.some(item => item.id === id);
  const bookmarks = saved ? state.bookmarks.filter(item => item.id !== id) : [...state.bookmarks, book];
  saveBookmarks(bookmarks);
  setState({ bookmarks });
  const replacement = [...results.querySelectorAll("button")].find(item => item.dataset.id === id);
  if (replacement) replacement.focus();
});

render();
