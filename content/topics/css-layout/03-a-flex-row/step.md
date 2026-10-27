---
title: A flex row and its two axes
mode: edit
entry: index.html
required: [header-is-a-row, nav-at-the-end, nav-centered, links-spaced-with-gap]
---

By default, block elements stack: each one takes the full width and starts on a new line.
Press **Run** and look at the dark header.
The site name is on one line and the three links are on the next, because `<p>` and `<nav>` are both blocks.
A header wants its name on the left and its links on the right, on one line, and **flexbox** is the tool for arranging items in one direction.

Turn the header into a flex container.

```css file="styles.css" action="insert-after" anchor=".site-header {"
  display: flex;
```

Run the page.
The name and the links sit side by side on one line.
`display: flex` on the **container** changes how its direct children, the **items**, are laid out: they line up along the **main axis**, which runs left to right unless `flex-direction` says otherwise.
Only the direct children become items; the three links inside the `<nav>` are grandchildren of the header, and nothing about them changed.

The links sit right next to the name.
Spread the items out along the main axis.

```css file="styles.css" action="insert-after" anchor="  display: flex;"
  justify-content: space-between;
```

`justify-content` positions items along the main axis.
`space-between` puts the first item at the start, the last at the end, and shares the leftover space between them, so the name is on the left edge and the links are on the right edge.
`center` would gather them in the middle and `flex-end` would push both to the right.

Look closely at the links: they sit at the top of the header while the larger site name fills the row's height.
That is the other axis.
The **cross axis** runs across the main one, top to bottom here, and `align-items` positions items along it.

```css file="styles.css" action="insert-after" anchor="  justify-content: space-between;"
  align-items: center;
```

The links move down to the middle of the row, level with the name.
The default is `stretch`, which is why the nav had grown to the row's full height; `center` centers it instead.
The pair to remember: **justify** is the main axis and **align** is the cross axis, and `flex-direction: column` swaps which one is vertical.

One more flex container.
The links are separated by a single space, which is just the whitespace between the tags.
Lay them out as items with a real gap.

```css file="styles.css" action="append"

nav {
  display: flex;
  gap: 1rem;
}
```

`gap` puts space between items and nowhere else: no margin on the first or last link, no rule to undo it at the edges, and it works the same when the direction is a column.
Prefer `gap` over margins between flex items from now on.

**Check:** Run the page.
The site name is on the left, the three links are on the right with even space between them, and the links sit halfway down the row.
Press **Run checks** to confirm the row, the spacing on the main axis, the centering on the cross axis, and the gap.

**If it breaks:** If the links are still on their own line, `display: flex` is in the `nav` rule or the `body` rule instead of `.site-header`.
If the links hug the name, `justify-content` is misspelled or sits on the nav; it belongs on the container whose items should spread out.
If the links stay at the top, `align-items` is written as `align-content` or `justify-items`, which do different things.

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
  margin: 0;
  padding: 1.5rem;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  background: #12253a;
  color: #f7fafc;
}

.site-header a {
  color: #f7fafc;
}

.brand {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

main {
  max-width: 40rem;
}

nav {
  display: flex;
  gap: 1rem;
}
```

</details>
