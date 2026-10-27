---
title: Request books from the API
mode: edit
entry: index.html
inspector:
  views: [network]
api:
  default: fixtures
required: [request-uses-api-base, three-cards-from-the-response, records-are-normalized]
---

**We used this in:** [Fetch basics](#/topic/fetch-basics) fetched JSON from an API source, checked `response.ok`, and built a URL with `encodeURIComponent`.

The sample books have done their job.
From here the search asks a server for data: the Open Library search service, whose answers are an object with a `docs` array, where each record uses `key`, `title`, `author_name`, and `first_publish_year`.
The step's fixtures copy that shape, so **Fixtures** answers offline with three records, and the **Open Library search** preset answers with real books.

Add a function that requests the books and reads the array out of the answer.

```js file="app.js" action="insert-before" anchor='app.addEventListener("submit", function (event) {'
async function requestBooks(query) {
  const url = `${import.meta.env.API_BASE}/search.json?q=${encodeURIComponent(query)}&fields=key,title,author_name,first_publish_year&limit=12`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!data || !Array.isArray(data.docs)) throw new Error("Expected a docs array");
  return data.docs;
}

```

`encodeURIComponent` keeps the whole query one parameter even when it contains `&` or spaces.
The `fields` parameter asks the service for only the four fields we use, and `limit` keeps the response small.
`response.ok` is `false` for a 404 or a 500, which `fetch` does not treat as an error on its own, so we throw.
The shape check throws when the parsed value is not what we expect, so a wrong answer fails here with a clear message rather than later with a confusing one.

Make the submit handler wait for the request instead of filtering the sample array.

```js file="app.js" action="replace" anchor='app.addEventListener("submit", function (event) {'
app.addEventListener("submit", async function (event) {
```

```js file="app.js" action="replace" anchor="  const matching = sampleBooks.filter(function (book) {\n    return book.title.toLowerCase().includes(query.toLowerCase());\n  });\n  renderBooks(matching);"
  const books = await requestBooks(query);
  renderBooks(books);
```

Run it and search for anything.
The Network view shows a request to `/search.json` with status 200, and three cards appear with the titles from the fixture file.
The author lines read `undefined`, because the records use `author_name` rather than `author`, and the third title appears as bold text, because the fixture's third record has a title that looks like HTML and `escapeHTML` was given `undefined` for the author but the title went through as it should; the problem is the shape.

The service names its fields differently from our cards and sometimes omits them.
Instead of teaching every component about the service's names, convert each record once into the `id`, `title`, `author`, and `year` shape the rest of the script already uses.

```js file="app.js" action="replace" anchor="  return data.docs;"
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
```

`map` builds a new array with one of our book objects per record.
A record without a usable key or title cannot become a card, so the function throws rather than passing a broken object along.
The author comes from the first entry of `author_name` when it exists; otherwise a readable fallback is used, and the same idea gives the year.
The final `filter` keeps only the first record for each id, so duplicate keys in a response cannot create two cards that fight over one bookmark.

The sample array is no longer used, so remove it and its first render.

```js file="app.js" action="delete" anchor='const sampleBooks = [\n  { id: "/works/demo-1", title: "Learning JavaScript", author: "Alex Rivera", year: "2024" },\n  { id: "/works/demo-2", title: "Accessible Interfaces", author: "Jordan Lee", year: "2023" },\n  { id: "/works/demo-3", title: "CSS Layout Notebook", author: "Sam Patel", year: "2025" }\n];\n'
```

```js file="app.js" action="delete" anchor="renderBooks(sampleBooks);"
```

**Check:** Run the code with **Fixtures** selected; the page starts with the status sentence from the HTML and no cards.
Search, and the three cards show real authors, `Unknown author` and `Year unavailable` on the third card, and the suspicious title `<strong>CSS & Layout</strong>` appears as visible text rather than bold.
Bookmark the third card and press **Run, keeping saved data** to confirm the saved book is restored after a search.
Then choose the **Open Library search** preset, search for `javascript`, and read the request in the Network view: up to twelve real books appear, some with `Unknown author` or `Year unavailable`.
Search for `mac & cheese` and confirm the request URL shows `%26` in place of the ampersand.
Press **Run checks** with **Fixtures** selected.

**If it breaks:** If the Network view shows a URL containing `undefined`, check the spelling of `import.meta.env.API_BASE`.
If the console reports `sampleBooks is not defined`, a line still refers to it; the submit handler should call `requestBooks` only.
If the live search errors, open the request in the Network view; a blocked network or a service outage shows there, and the fixtures still work.

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

app.addEventListener("submit", async function (event) {
  if (event.target !== form) return;
  event.preventDefault();
  const data = new FormData(form);
  const query = data.get("query").trim();
  if (!query) {
    message.textContent = "Enter a title or topic first.";
    document.querySelector("#query").focus();
    return;
  }
  const books = await requestBooks(query);
  renderBooks(books);
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
