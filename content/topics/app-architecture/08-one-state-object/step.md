---
title: One object holds what the application knows
mode: edit
entry: index.html
inspector:
  views: [network]
api:
  default: fixtures
required: [initial-render-from-state, search-through-state, bookmark-through-state]
---

The application works, and its script has grown in the order we needed things.
It remembers things in separate places: a `bookmarks` variable, a `shownBooks` variable, a `loading` flag, and whatever text happens to be in the status line.
When a screen shows the wrong thing, there is no single place to look.
This step replaces the scattered variables with **one state object** and **one way to change it**, the second pattern from Week 8 Session 1 and the one that `useState` automates in React.

Nothing the user can do changes in this step; each edit replaces a scattered piece with a line that reads from `state` or writes through `setState`.

```js file="app.js" action="replace" anchor="let bookmarks = loadBookmarks();\nlet shownBooks = [];"
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
```

`status` is one of `initial`, `loading`, `success`, `empty`, or `error`, so the application can never be loading and failed at the same time.
`setState` merges only the fields you pass into `state` and then draws the page; it is our own small function, not a built-in feature.
Assigning to `state.query` directly changes data without drawing anything, which is exactly the bug `setState` prevents.

The display function becomes `render`, which reads everything it needs from `state`.

```js file="app.js" action="replace" anchor='function renderBooks(books) {\n  shownBooks = books;\n  results.innerHTML = bookList(books);\n  message.textContent = books.length + " books shown.";\n}'
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
```

`render` takes no arguments because `state` is the only input.
The `messages` object maps each status to its sentence, so the status line, the disabled button, and the busy flag all come from the same field.

The list reads the saved books from state.

```js file="app.js" action="replace" anchor="    const saved = bookmarks.some(item => item.id === book.id);"
    const saved = state.bookmarks.some(item => item.id === book.id);
```

The action shrinks, because it no longer touches the page.

```js file="app.js" action="replace" anchor='let loading = false;\nasync function searchBooks(query) {\n  if (loading) return;\n  loading = true;\n  form.querySelector("button").disabled = true;\n  results.setAttribute("aria-busy", "true");\n  renderBooks([]);\n  message.textContent = "Searching...";\n  try {\n    const books = await requestBooks(query);\n    renderBooks(books);\n    message.textContent = books.length ? books.length + " books found." : "No books found. Try another search.";\n  } catch (error) {\n    console.error("Search failed:", error);\n    message.textContent = "We could not load books. Check the API source or the connection, then try again.";\n  } finally {\n    loading = false;\n    form.querySelector("button").disabled = false;\n    results.setAttribute("aria-busy", "false");\n  }\n}'
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
```

It describes what is true, loading, then success or empty or error, and `render` turns each description into the right screen.
There is no `finally` block any more because every path ends in a `setState` call that leaves `loading` behind.

The two handlers change in the same way.

```js file="app.js" action="replace" anchor='    message.textContent = "Enter a title or topic first.";'
    setState({ status: "error", books: [], error: "Enter a title or topic first." });
```

```js file="app.js" action="replace" anchor="  const book = shownBooks.find(item => item.id === id);\n  if (!book) return;\n  const saved = bookmarks.some(item => item.id === id);\n  bookmarks = saved ? bookmarks.filter(item => item.id !== id) : [...bookmarks, book];\n  saveBookmarks(bookmarks);\n  renderBooks(shownBooks);"
  const book = state.books.find(item => item.id === id);
  if (!book) return;
  const saved = state.bookmarks.some(item => item.id === id);
  const bookmarks = saved ? state.bookmarks.filter(item => item.id !== id) : [...state.bookmarks, book];
  saveBookmarks(bookmarks);
  setState({ bookmarks });
```

Finally, draw the initial screen from the initial state.

```js file="app.js" action="append"

render();
```

**Check:** Every behavior from Step 7 still works: searching, the five outcomes, bookmarking, and restoring after a kept run.
The page starts with `Search for books to get started.`, an empty submit says `Enter a title or topic first.`, and a search ends with `3 books found.` on fixtures.
Press **Run checks**.

**If it breaks:** If the console reports `renderBooks is not defined`, one call site still uses the old name.
If the page is blank, `render` is called before `state` exists; the `render()` call must be the last line of the file.
If a bookmark click does nothing, the handler is reading `shownBooks` instead of `state.books`.

<details>
<summary>app.js after this step</summary>

```js
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
```

</details>
