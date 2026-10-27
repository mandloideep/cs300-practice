---
title: Show waiting, empty, and failed outcomes
mode: edit
entry: index.html
inspector:
  views: [network]
api:
  default: fixtures
required: [loading-shows-first, outcome-is-shown, controls-restored]
---

**We used this in:** [Fetch basics](#/topic/fetch-basics) rendered the loading, success, empty, and error states with `try`, `catch`, and `finally`.

A request takes time and can fail.
Right now a slow response leaves the old cards on screen with no hint, and a failure stops the script with an error in the console.
Move the work into an **action** function that shows every outcome.

```js file="app.js" action="insert-before" anchor='app.addEventListener("submit", async function (event) {'
let loading = false;
async function searchBooks(query) {
  if (loading) return;
  loading = true;
  form.querySelector("button").disabled = true;
  results.setAttribute("aria-busy", "true");
  renderBooks([]);
  message.textContent = "Searching...";
  try {
    const books = await requestBooks(query);
    renderBooks(books);
    message.textContent = books.length ? books.length + " books found." : "No books found. Try another search.";
  } catch (error) {
    console.error("Search failed:", error);
    message.textContent = "We could not load books. Check the API source or the connection, then try again.";
  } finally {
    loading = false;
    form.querySelector("button").disabled = false;
    results.setAttribute("aria-busy", "false");
  }
}

```

The handler now only validates the input and hands the query to the action.

```js file="app.js" action="replace" anchor='app.addEventListener("submit", async function (event) {'
app.addEventListener("submit", function (event) {
```

```js file="app.js" action="replace" anchor="  const books = await requestBooks(query);\n  renderBooks(books);"
  searchBooks(query);
```

Before the `await`, the action clears old cards, disables the button, marks the region busy, and shows `Searching...`; that is the loading state.
After the `await`, a non-empty array is success and an empty array is the empty state with its own sentence.
Any throw from `requestBooks` lands in `catch`, which logs the real error for us and shows a recoverable message for the user.
`finally` runs whether the request succeeded or failed, so the button and the busy flag are always restored.
The `loading` flag refuses a second submission while one is pending.

**Check:** Run the code with **Fixtures** selected, set the latency to 2000 milliseconds, and search: `Searching...` shows with the button disabled, then three cards and `3 books found.`
Now cause the other outcomes.

1. Change `/search.json` in `requestBooks` to `/search-empty.json` and search: `No books found. Try another search.`
2. Change it to `/wrong-shape.json`: the shape check throws and the error sentence shows.
   Change the path back afterwards.
3. Choose an HTTP error such as 404: the status check throws.
4. Choose a malformed body: `response.json()` throws.
5. Choose a dropped connection: `fetch` throws.

Three of these arrive with a successful status code and still fail later, which is why a successful HTTP response is only the first of three checks.
After every failure the button is enabled again and the query stays in the field.
Press **Run checks** with the controls back at their defaults.

**If it breaks:** If the button stays disabled after an error, the `finally` block is missing or sits inside the `try`.
If `Searching...` never appears, the message is set after the `await` instead of before it.
If the page still crashes on a failure, the submit handler is still calling `requestBooks` directly instead of `searchBooks`.

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

let loading = false;
async function searchBooks(query) {
  if (loading) return;
  loading = true;
  form.querySelector("button").disabled = true;
  results.setAttribute("aria-busy", "true");
  renderBooks([]);
  message.textContent = "Searching...";
  try {
    const books = await requestBooks(query);
    renderBooks(books);
    message.textContent = books.length ? books.length + " books found." : "No books found. Try another search.";
  } catch (error) {
    console.error("Search failed:", error);
    message.textContent = "We could not load books. Check the API source or the connection, then try again.";
  } finally {
    loading = false;
    form.querySelector("button").disabled = false;
    results.setAttribute("aria-busy", "false");
  }
}

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
  searchBooks(query);
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
```

</details>
