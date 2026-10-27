---
title: Respond to the search form
mode: edit
entry: index.html
inspector:
  views: []
required: [search-filters, empty-query-refused]
---

**We used this in:** [DOM and events](#/topic/dom-events) handled a submit with `preventDefault` and read the field with `FormData`.

The form in the HTML does what every form does on its own: pressing Enter or clicking **Search books** submits it, and the browser loads a new page.
This step takes over the submit event, reads the field, and filters the sample books.

```predict
After this edit, you run, type `css` in the field, and press Enter: what does the page show?
= One card, `CSS Layout Notebook`, and the status `1 books shown.`
- No cards, because the title spells `CSS` in capitals
- The same three cards, because the page reloads
```

Our script takes over the submit event with one listener on the `main` element.

```js file="app.js" action="append"

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
```

The listener sits on the `main` element rather than on the form, because submit events bubble up from the form and one container listener will later serve every form on the page.
`filter` keeps the books whose lowercase title contains the lowercase query, and the same display function shows the result.

## Read more

The first line ignores submits from any other form.
`preventDefault` stops the reload.
`FormData` reads every named field; `get("query")` returns the typed text and `trim` removes spaces around it.
A guard clause handles the empty case with a message and returns early, exactly like the guard clauses from Week 5.

This is the universal search flow from Session 1 with the middle missing: read the input, then render the result.
Steps 6 and 7 put the request and its states in between.

**If it breaks:** If the result pane leaves your page on submit, `preventDefault` runs after a `return` or the listener is on the wrong element.
If every search shows three cards, the `includes` comparison is not lowercasing both sides.
If the console says `Cannot read properties of null (reading 'trim')`, the input's `name` attribute is not `query`.

**Check:** Run the code, type `css`, and press Enter; one card remains and the status says `1 books shown.`
Clear the field, type spaces, and submit; the message asks for a title and the field gets the focus.
Press **Run checks**.

```quiz
What does the first line of the listener, `if (event.target !== form) return;`, do?
- It stops the page from reloading
= It ignores submit events from any other form inside `main`
- It refuses an empty search field
> A submit event bubbles from the form that was submitted up to `main`, and `event.target` is that form; `preventDefault` is what stops the reload, and the guard clause after `trim` handles an empty field.
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

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
  });
}
function bookCard(book, number) {
  return `<article class="book-card">
    <p class="book-number">${number}</p>
    <h3>${escapeHTML(book.title)}</h3>
    <p class="book-meta">${escapeHTML(book.author)}<br>${escapeHTML(book.year)}</p>
  </article>`;
}
function bookList(books) {
  return books.map(function (book, index) {
    return bookCard(book, index + 1);
  }).join("");
}

function renderBooks(books) {
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
```

</details>
