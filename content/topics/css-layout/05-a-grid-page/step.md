---
title: A grid page
mode: edit
entry: index.html
required: [body-is-a-two-column-grid, header-and-footer-span, cards-are-a-grid]
---

Flexbox arranges items in one direction, a row or a column.
A whole page has two: a header across the top, a sidebar beside the main content, a footer across the bottom.
That is a job for **grid**, which places items in rows and columns at once.

Press **Run**.
The page has four landmarks in a row of blocks: header, sidebar, main content with four cards, footer, each stacked under the last.
The `<body>` contains exactly those four, so it is the element to turn into a grid.

```css file="styles.css" action="insert-after" anchor="body {"
  display: grid;
  grid-template-columns: 14rem 1fr;
  gap: 1rem;
```

Run the page.
`grid-template-columns` defines the columns: the first is `14rem` wide, and `1fr` means one **fraction** of whatever is left, so the second takes the rest.
The four landmarks fill the cells in order, left to right and top to bottom: the header lands in the narrow first column, the sidebar in the wide second one, the main content back in the first, and the footer in the second.
A checkerboard, which is correct and wrong at once: the grid did what it was told, and we have not yet told it which items span.

Grid counts **lines**, not columns.
Two columns have three vertical lines, numbered 1, 2, 3 from the left, and `-1` always means the last line however many there are.
Make the header and the footer run from the first line to the last.

```css file="styles.css" action="append"

.site-header,
.site-footer {
  grid-column: 1 / -1;
}
```

Run again.
The header stretches across the top, the footer across the bottom, and the sidebar and the main content share the middle row, each in its own column.
`grid-column: 1 / -1` reads as "start at line 1, end at the last line".
`grid-column: 1 / 3` would say the same thing here, but `-1` keeps working when a third column is added.
The `.sidebar` rule already had `align-self: start`, which did nothing until now; in a grid it keeps the sidebar at its own height instead of stretching to match the main content.

The main content holds four cards in a plain stack.
A grid inside a grid cell is ordinary, and this one should make as many columns as fit.

```css file="styles.css" action="append"

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 1rem;
}
```

`repeat(auto-fit, minmax(8rem, 1fr))` is the pattern worth memorizing: make columns that are at least `8rem` wide, as many as fit, and stretch them to share the leftover space.
In the result pane that is two columns of cards; in a full browser window it is three or four, with no breakpoint written anywhere.
Step 6 adds breakpoints for the cases this pattern cannot decide on its own.

**Check:** Run the page.
Header on top, sidebar on the left, cards in the middle, footer along the bottom, and the cards arranged in columns inside the main content.
Press **Run checks** to confirm the two-column grid, the spanning header and footer, and the card grid.

**If it breaks:** If the page is a checkerboard, the `grid-column` rule names the wrong classes or is missing the `/ -1`.
If everything is in one column, `grid-template-columns` is misspelled or its value lacks a space between the two sizes.
If the cards stay stacked, `.card-grid` does not match; the class is on the `<div>` around the cards, not on the cards.

<details>
<summary>styles.css after this step</summary>

```css
:root {
  color-scheme: light;
  color: #172033;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  display: grid;
  grid-template-columns: 14rem 1fr;
  gap: 1rem;
  margin: 0;
  padding: 1.5rem;
}

.site-header,
.site-footer {
  padding: 1rem;
  border-radius: 0.5rem;
  background: #12253a;
  color: #f7fafc;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.site-header a {
  color: #f7fafc;
}

.brand {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

nav {
  display: flex;
  gap: 1rem;
}

.sidebar,
.catalog {
  padding: 1rem;
  border-radius: 0.5rem;
  background: #eef2f7;
}

.sidebar {
  align-self: start;
}

.sidebar h2,
.catalog h1 {
  margin-top: 0;
}

.card {
  padding: 1rem;
  border: 1px solid #8a8a8a;
  border-radius: 0.5rem;
  background: #ffffff;
}

.card > * {
  margin: 0;
}

.card h2 {
  font-size: 1.1rem;
}

.site-footer p {
  margin: 0;
}

.site-header,
.site-footer {
  grid-column: 1 / -1;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 1rem;
}
```

</details>
