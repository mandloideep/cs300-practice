---
title: Views compose a screen, and a button chooses the view
mode: edit
entry: index.html
inspector:
  views: [network, dom]
api:
  default: fixtures
required: [bookmarks-view, browse-view-returns, current-button-marked]
---

The Bookmarks screen shows the same cards as Browse, with a different heading, a different message, and no search form.
A **view** function describes one screen as data: a title, a description, a message, and the markup for the results.
Because the reorganization of Step 8 is done, the second screen costs almost nothing, which is the payoff of that step.

First, record which screen is active.

```js file="app.js" action="insert-after" anchor="const state = {"
  view: "browse",
```

Then add the two views above `render`.

```js file="app.js" action="insert-before" anchor="function render() {"
function browseView() {
  const messages = {
    initial: "Search for books to get started.",
    loading: "Searching...",
    success: state.books.length + " books found.",
    empty: "No books found. Try another search.",
    error: state.error
  };
  return {
    title: "Find your next read.",
    description: "Search for a topic, then keep the books you want to revisit.",
    message: messages[state.status],
    html: bookList(state.books)
  };
}
function bookmarksView() {
  return {
    title: "Your reading shelf.",
    description: "Books saved in this browser. Remove a book when you no longer need it.",
    message: state.bookmarks.length ? state.bookmarks.length + " saved books." : "No bookmarks yet. Browse and save a book first.",
    html: bookList(state.bookmarks)
  };
}

```

The `messages` object moved out of `render` into `browseView`, because those sentences belong to the Browse screen.
`bookmarksView` passes the saved books through the same `bookList`, so a card on the shelf has the same button and the same pressed state.

Now `render` picks the view by name and applies its parts to the page, and marks the navigation button for the current view.

```js file="app.js" action="replace" anchor='function render() {\n  const messages = {\n    initial: "Search for books to get started.",\n    loading: "Searching...",\n    success: state.books.length + " books found.",\n    empty: "No books found. Try another search.",\n    error: state.error\n  };\n  form.querySelector("button").disabled = state.status === "loading";\n  results.setAttribute("aria-busy", String(state.status === "loading"));\n  message.textContent = messages[state.status];\n  results.innerHTML = bookList(state.books);\n}'
function render() {
  const views = { browse: browseView, bookmarks: bookmarksView };
  const view = views[state.view]();
  document.querySelector("#view-title").textContent = view.title;
  document.querySelector("#view-description").textContent = view.description;
  form.hidden = state.view !== "browse";
  form.querySelector("button").disabled = state.status === "loading";
  results.setAttribute("aria-busy", String(state.view === "browse" && state.status === "loading"));
  message.textContent = view.message;
  results.innerHTML = view.html;
  document.querySelectorAll("nav button").forEach(function (button) {
    if (button.dataset.view === state.view) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}
```

`views[state.view]` looks up a function by the name stored in state, and the trailing parentheses call it.
`render` updates the heading and description, hides the form on the shelf, and replaces only the result markup, so the search field keeps its value and the delegated listeners stay attached to `main`.
The last loop sets `aria-current` on the button for the current view, which the stylesheet underlines.

A bookmark click on the shelf must look up the book among the saved books, and when the removed card disappears there is no button left to focus.

```js file="app.js" action="replace" anchor="  const book = state.books.find(item => item.id === id);"
  const visibleBooks = state.view === "bookmarks" ? state.bookmarks : state.books;
  const book = visibleBooks.find(item => item.id === id);
```

```js file="app.js" action="replace" anchor="  if (replacement) replacement.focus();"
  if (replacement) replacement.focus();
  else document.querySelector("#view-title").focus();
```

Finally, let the two navigation buttons choose the view.
In Week 8 these were links whose `href` began with a hash, and a `hashchange` listener read the address: hash routing.
The lab's result pane has no address bar of its own, so here the buttons carry a `data-view` attribute and one delegated listener does the same job; the [Routing](#/topic/routing) topic does it with real addresses.

```js file="app.js" action="replace" anchor="render();"
document.querySelector("nav").addEventListener("click", function (event) {
  const button = event.target.closest("button[data-view]");
  if (!button) return;
  setState({ view: button.dataset.view });
  document.querySelector("#view-title").focus();
});
render();
```

When a person switches screens, focus moves to the new heading so keyboard and screen reader users land at the start of the new screen.

**Check:** Search and save two books.
Click **Bookmarks**: the heading changes to `Your reading shelf.`, the form disappears, the underline moves, and the two saved cards appear.
Remove one from the shelf and focus moves to the heading.
Click **Browse** and the search results return with the field still filled in.
Press **Run checks**; the checks switch views and switch back.

**If it breaks:** If the console reports `views[state.view] is not a function`, the view name in state does not match a key in the `views` object.
If clicking a navigation button does nothing, the listener is on `app` instead of `nav`, and the buttons sit in the header.
If the shelf shows `undefined`, `bookmarksView` is returning a different set of keys than `browseView`.

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
  view: "browse",
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

function browseView() {
  const messages = {
    initial: "Search for books to get started.",
    loading: "Searching...",
    success: state.books.length + " books found.",
    empty: "No books found. Try another search.",
    error: state.error
  };
  return {
    title: "Find your next read.",
    description: "Search for a topic, then keep the books you want to revisit.",
    message: messages[state.status],
    html: bookList(state.books)
  };
}
function bookmarksView() {
  return {
    title: "Your reading shelf.",
    description: "Books saved in this browser. Remove a book when you no longer need it.",
    message: state.bookmarks.length ? state.bookmarks.length + " saved books." : "No bookmarks yet. Browse and save a book first.",
    html: bookList(state.bookmarks)
  };
}

function render() {
  const views = { browse: browseView, bookmarks: bookmarksView };
  const view = views[state.view]();
  document.querySelector("#view-title").textContent = view.title;
  document.querySelector("#view-description").textContent = view.description;
  form.hidden = state.view !== "browse";
  form.querySelector("button").disabled = state.status === "loading";
  results.setAttribute("aria-busy", String(state.view === "browse" && state.status === "loading"));
  message.textContent = view.message;
  results.innerHTML = view.html;
  document.querySelectorAll("nav button").forEach(function (button) {
    if (button.dataset.view === state.view) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
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
  const visibleBooks = state.view === "bookmarks" ? state.bookmarks : state.books;
  const book = visibleBooks.find(item => item.id === id);
  if (!book) return;
  const saved = state.bookmarks.some(item => item.id === id);
  const bookmarks = saved ? state.bookmarks.filter(item => item.id !== id) : [...state.bookmarks, book];
  saveBookmarks(bookmarks);
  setState({ bookmarks });
  const replacement = [...results.querySelectorAll("button")].find(item => item.dataset.id === id);
  if (replacement) replacement.focus();
  else document.querySelector("#view-title").focus();
});

document.querySelector("nav").addEventListener("click", function (event) {
  const button = event.target.closest("button[data-view]");
  if (!button) return;
  setState({ view: button.dataset.view });
  document.querySelector("#view-title").focus();
});
render();
```

</details>
