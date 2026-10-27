---
title: Select the page and draw cards from data
mode: edit
entry: index.html
inspector:
  views: [dom]
required: [three-cards, cards-have-parts, message-counts]
---

**We used this in:** [DOM and events](#/topic/dom-events) selected elements, created them from data, and rendered a list again after every change.

CourseHub searches for books and remembers the ones you save, and this step draws its first cards from an array of data.
Watch the status line under the search form: the script writes it at the end of every render.

```predict
After the three edits of this step, you press Run: what does the status line under the form read?
- `Search for books to get started.`
= `3 books shown.`
- Nothing, because `replaceChildren` empties it
```

In Week 8 we built CourseHub from empty files in five parts: structure, style, behavior, data, and architecture.
The structure and the style are finished in this workspace, so read `index.html` and `styles.css` once before you type anything: every id the script selects below is in the HTML, and every class the script writes is in the stylesheet.
This topic is the behavior, the data, and the architecture, in the same small steps.

Our script needs four elements again and again, so select them once at the top and give them names.

```js file="app.js" action="replace" anchor='console.log("CourseHub starter");'
const app = document.querySelector("#app");
const form = document.querySelector("#search-form");
const results = document.querySelector("#results");
const message = document.querySelector("#message");
```

These four elements never get replaced, which is why they can be selected once; the cards inside `results` will come and go.

Before we talk to the network, we need predictable data to display.
Three fictional books with the same four properties are enough.

```js file="app.js" action="append"

const sampleBooks = [
  { id: "/works/demo-1", title: "Learning JavaScript", author: "Alex Rivera", year: "2024" },
  { id: "/works/demo-2", title: "Accessible Interfaces", author: "Jordan Lee", year: "2023" },
  { id: "/works/demo-3", title: "CSS Layout Notebook", author: "Sam Patel", year: "2025" }
];
```

This array is scaffolding; Step 6 replaces it with real responses.

A function that accepts an array of books and draws one card per book is the heart of the display.

```js file="app.js" action="append"

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
```

The last line calls the function with our sample data so something appears immediately.

## Read more

One difference from the Week 8 files: the page loads `app.js` as a module script instead of a script with `defer`.
A module script is deferred by default, so it still runs after the whole document exists, and it is what lets a later step read the API source from `import.meta.env`.

`app` is the `main` element, and it matters later because one listener on it will serve every form and every button inside it.

The `id` gives every book a stable identity that does not change when its title is edited, which the bookmark feature depends on in Step 4.
The year is a string on purpose, because a year is a label here rather than a number we calculate with.

`replaceChildren` with no arguments empties the results region, so calling the function twice does not duplicate cards.
`createElement` makes a node that exists only in memory until `append` connects it to the document, and `textContent` treats the title as plain text even if it contains angle brackets.

**If it breaks:** If the cards have no styling, the class name on the article differs from `.book-card` in `styles.css`.
If the console reports that `results` is `null`, the id in the selector and the id in the HTML differ.
If nothing appears and there is no error, the `renderBooks(sampleBooks)` call at the end is missing.

**Check:** Run the code.
Three cards appear in the grid with a title and an author line, and the status line says `3 books shown.`
Press **Run checks**.

```quiz
What does the page show if `renderBooks(sampleBooks)` is called twice?
- Six cards, because each call appends three more
= Three cards, because `replaceChildren` empties the region first
- An error, because the cards already exist
> `results.replaceChildren()` with no arguments removes every child before the loop appends the new cards, so each render starts from an empty region.
```

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
```

</details>
