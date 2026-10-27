---
title: Bookmark buttons and one click listener
mode: edit
entry: index.html
inspector:
  views: []
required: [every-card-has-a-button, click-toggles-saved, focus-stays-on-the-card]
---

**We used this in:** [DOM and events](#/topic/dom-events) carried an id on each element with a data attribute and handled every button with one delegated listener.

A card needs to show whether its book is saved.
That is a second piece of data for the component, so the component gets a second parameter; Session 1 called these parameters **props**.
First, give the script a place to keep saved books and a record of what is on screen.

```js file="app.js" action="insert-after" anchor="];"

let bookmarks = [];
let shownBooks = [];
```

Then teach the component about the saved flag.

```js file="app.js" action="replace" anchor="function bookCard(book, number) {"
function bookCard(book, saved, number) {
```

```js file="app.js" action="insert-after" anchor='    <p class="book-meta">${escapeHTML(book.author)}<br>${escapeHTML(book.year)}</p>'
    <button type="button" data-action="bookmark" data-id="${escapeHTML(book.id)}"
      aria-pressed="${saved}"><span>${saved ? "Saved - remove" : "Bookmark"}</span></button>
```

`type="button"` stops the button from submitting the form it might sit near.
`data-action` names what the button does and `data-id` carries the book's identity, so one click handler can tell the buttons apart.
`aria-pressed` tells assistive technology this is a toggle and whether it is on, and the stylesheet styles the pressed state.

Work out the flag for each book in the list.

```js file="app.js" action="replace" anchor="    return bookCard(book, index + 1);"
    const saved = bookmarks.some(item => item.id === book.id);
    return bookCard(book, saved, index + 1);
```

`some` returns `true` when at least one saved book has the same id.
The handler needs to know which books are currently on screen, so remember them when rendering.

```js file="app.js" action="replace" anchor="  results.innerHTML = bookList(books);"
  shownBooks = books;
  results.innerHTML = bookList(books);
```

The bookmark buttons are created by `renderBooks`, so they did not exist when the script started, and any listener attached to them would be lost on the next render.
Instead, one listener on the permanent `main` element handles every bookmark click, now and later.

```js file="app.js" action="append"

app.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action='bookmark']");
  if (!button || !app.contains(button)) return;
  const id = button.dataset.id;
  const book = shownBooks.find(item => item.id === id);
  if (!book) return;
  const saved = bookmarks.some(item => item.id === id);
  bookmarks = saved ? bookmarks.filter(item => item.id !== id) : [...bookmarks, book];
  renderBooks(shownBooks);
  const replacement = [...results.querySelectorAll("button")].find(item => item.dataset.id === id);
  if (replacement) replacement.focus();
});
```

A click on the span inside the button starts at the span, so `closest` walks up to the nearest bookmark button; clicks anywhere else return early.
`dataset.id` reads the `data-id` attribute, and `find` locates the matching book object.
If the book is already saved, `filter` builds a new array without it; otherwise the spread operator builds a new array with it added.
We never push into the old array, so every change is a fresh array we can save and compare.
Re-rendering replaces the clicked button, so the last two lines move keyboard focus to its replacement.

**Check:** Run the code and click **Bookmark** on a card; it changes to **Saved - remove** with the pale pressed style.
Click again and it returns to **Bookmark**.
Press Tab to a button and press Enter; focus stays on that card's button after the change.
Press **Run checks**; the checks click a button and put it back.

**If it breaks:** If every button reads `undefined`, the order of the parameters in `bookCard` and in the call do not match.
If clicks do nothing, compare the selector string with the `data-action` value in `bookCard`.
If the page reloads when a button is clicked, `type="button"` is missing from the markup.

<details>
<summary>app.js after this step</summary>

```js
const app = document.querySelector("#app");
const form = document.querySelector("#search-form");
const results = document.querySelector("#results");
const message = document.querySelector("#message");

const sampleBooks = [
  { id: "/works/demo-1", title: "Learning JavaScript", author: "Alex Rivera", year: "2024" },
  { id: "/works/demo-2", title: "Accessible Interfaces", author: "Jordan Lee", year: "2023" },
  { id: "/works/demo-3", title: "CSS Layout Notebook", author: "Sam Patel", year: "2025" }
];

let bookmarks = [];
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
  renderBooks(shownBooks);
  const replacement = [...results.querySelectorAll("button")].find(item => item.dataset.id === id);
  if (replacement) replacement.focus();
});
```

</details>
