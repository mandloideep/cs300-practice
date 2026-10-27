---
title: Remember bookmarks safely
mode: edit
entry: index.html
inspector:
  views: []
required: [save-on-change, warning-hidden-after-save, load-on-start]
---

**We used this in:** [DOM and events](#/topic/dom-events) saved a list with `localStorage` and loaded it back with the safe pattern.

Run the code, save a book, and press **Run** again: the bookmark is gone, because it lived in a variable.
`localStorage` keeps a string for this page until it is removed, so we convert the array to JSON on save and back on load.
Put the two storage functions right after the element selections.

```js file="app.js" action="insert-after" anchor='const message = document.querySelector("#message");'

const STORAGE_KEY = "coursehub-bookmarks";
function loadBookmarks() {
  const text = localStorage.getItem(STORAGE_KEY);
  return text === null ? [] : JSON.parse(text);
}
function saveBookmarks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}
```

`getItem` returns `null` on the first visit, so `loadBookmarks` returns an empty array in that case rather than parsing `null`.
Start from whatever was saved last time instead of an empty array.

```js file="app.js" action="replace" anchor="let bookmarks = [];"
let bookmarks = loadBookmarks();
```

And save after every change.

```js file="app.js" action="insert-before" anchor="  renderBooks(shownBooks);"
  saveBookmarks(bookmarks);
```

Run the code, save a book, and press **Run, keeping saved data**, which runs the code again without clearing the result's storage, the way a real reload keeps it.
The same button is still pressed.

Now the part Week 7 warned about.
Anyone can edit the stored text, a privacy mode can block storage entirely, and a full disk can refuse a save.
The application should keep working in every one of those cases and tell the person what happened.
First, give the page a place for that message.

```html file="index.html" action="insert-after" anchor="      </form>"
      <p id="storage-warning" class="warning" role="status" hidden></p>
```

Then replace the two storage functions with versions that check the data and catch failures.

```js file="app.js" action="replace" anchor='const STORAGE_KEY = "coursehub-bookmarks";\nfunction loadBookmarks() {\n  const text = localStorage.getItem(STORAGE_KEY);\n  return text === null ? [] : JSON.parse(text);\n}\nfunction saveBookmarks(books) {\n  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));\n}'
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
```

`validBooks` checks that the parsed value is an array of complete books with unique ids; `every` returns `false` as soon as one item fails.
`JSON.parse` throws on text that is not JSON, and a blocked storage throws on `getItem`, so both paths land in `catch`, which records the problem in the console and shows a warning instead of crashing.
The `hidden` attribute on the warning paragraph is removed only when there is text to show.
A successful save clears the warning.

**Check:** Run the code, save a book, and press **Run, keeping saved data**; the book is still saved and no warning shows.
Press **Run** and the bookmark is gone, because a plain run clears the result's storage.
Press **Run checks**; the checks save a book, read the stored JSON, and remove it again.
The lab's own test also seeds broken text into the storage and confirms the warning appears while the page keeps working.

**If it breaks:** If bookmarks vanish after a kept run, `saveBookmarks` is not called in the click handler, or the two functions spell the key differently.
If the console says `Cannot set properties of null (setting 'textContent')`, the warning paragraph is missing from `index.html` or its id differs.
If the warning never clears, `showStorageWarning("")` is missing from the successful save.

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
```

</details>
