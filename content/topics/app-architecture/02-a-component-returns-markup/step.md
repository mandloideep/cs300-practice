---
title: A component is a function that returns markup
mode: edit
entry: index.html
inspector:
  views: [dom]
required: [three-numbered-cards, titles-are-text, message-counts]
---

Building cards node by node works, but it hides the shape of the card.
This step writes a **component**: a function that takes the data for one card and returns its markup as a string.
Watch the DOM view after the run: the markup in the string is exactly the tree each card gets.

```predict
After the two edits of this step, you press Run: what does each card show above its title?
= A large gray number: 1, 2, and 3
- Nothing new, because the three new functions are never called
- The text `<p class="book-number">1</p>`, tags and all
```

This is the first of the six patterns from Week 8 Session 1, and it is the one React is built on.
Add three functions above the display function.

```js file="app.js" action="insert-before" anchor="function renderBooks(books) {"
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

```

`bookCard` is the component: data in, a string of markup out.
Every value from the data passes through `escapeHTML` before it goes into the string.

Now the display function only needs one line to put that string on the page.

```js file="app.js" action="replace" anchor='  results.replaceChildren();\n  for (const book of books) {\n    const card = document.createElement("article");\n    card.className = "book-card";\n    const title = document.createElement("h3");\n    title.textContent = book.title;\n    const meta = document.createElement("p");\n    meta.className = "book-meta";\n    meta.textContent = book.author + ", " + book.year;\n    card.append(title, meta);\n    results.append(card);\n  }'
  results.innerHTML = bookList(books);
```

Setting `innerHTML` replaces everything inside `results` with the new markup, so the old cards disappear at the same time.

## Read more

Returning the markup from a function keeps the HTML structure of a card visible in the code and reusable anywhere.

Because the string will be placed into the page as HTML, `escapeHTML` turns characters such as `<` into harmless text first.
That keeps the same safety `textContent` gave us in Step 1.
`bookList` maps the array of books to an array of strings and joins them into one string; without `join("")` the array would be converted with commas between the cards.

`innerHTML` is safe here only because every piece of data went through `escapeHTML`; Week 6 warned against handing it anything a user typed, and that rule still holds.

**If it breaks:** If the page shows nothing and the console has a syntax error, a backtick string is not closed with the same backtick character.
If the cards run together with commas between them, `join("")` is missing from `bookList`.
If the numbers all read `1`, `index + 1` is written outside the `map` callback.

**Check:** Run the code.
The three cards look the same as before, with a large gray number above each title.
Press **Run checks**.

```quiz
Why does `bookList` end with `join("")`?
- To escape the markup before it reaches the page
= To join the card strings into one string with nothing between them
- To turn the array of books into an array of strings
> `map` already returns an array of strings; assigning that array to `innerHTML` would convert it with commas between the cards, so `join("")` makes one string first.
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
```

</details>
