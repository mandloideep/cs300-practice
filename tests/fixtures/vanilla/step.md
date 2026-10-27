---
title: Add a third book
mode: edit
entry: index.html
required: [three-books, list-styled, button-adds, ready-logged]
---

The page lists two books from the markup.
Add a third one after the last `li`.

```html file="index.html" action="insert-after" anchor='        <li class="book">The Pragmatic Programmer</li>'
        <li class="book">Structure and Interpretation of Computer Programs</li>
```

**Check:** Run the page and press **Run checks**.

**If it breaks:** The new `li` must sit inside the `ul` with the id `books`.
