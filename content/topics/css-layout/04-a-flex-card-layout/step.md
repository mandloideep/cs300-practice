---
title: A flex card layout
mode: edit
entry: index.html
required: [cards-share-the-width, card-is-a-column, actions-at-the-bottom]
---

This step uses flexbox twice more, in two directions, on the kind of card row every site has.
The row shares its width between three cards, each card becomes a column of its own, and one `auto` margin lines up the links at the bottom.

```predict
After you add `flex: 1` to `.card` and run, how wide are the three cards?
- Each as wide as its own text, as before
- The long card takes most of the row and the short ones shrink to fit their text
= All three the same width
```

Press **Run**.
The `.cards` section is already a flex container with a gap, the row from Step 3, so its three cards sit side by side.
Each card is as wide as its text wants to be, so the three widths differ.
Make the cards share the row evenly.

```css file="styles.css" action="insert-after" anchor=".card {"
  flex: 1;
```

Run the page: the three cards are the same width, because `flex: 1` gives each one an equal share of the row.

Now the inside of a card.
Its four children should stack vertically with a gap between them, which is what a flex **column** does.

```css file="styles.css" action="insert-after" anchor="  flex: 1;"
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
```

Each card is now a flex item of the row and a flex container of its own.

The short cards end early, and their links sit in the middle of the card while the long card's links sit at the bottom.
Push every card's links to the end of its column.

```css file="styles.css" action="append"

.card-actions {
  margin-top: auto;
}
```

An `auto` margin soaks up all the free space on the main axis, so the three link rows line up across the row.

## Read more

### What the starter does

Step 3 used flexbox on a header.
In the starter, every card stretches to the height of the tallest one, because `align-items` defaults to `stretch`.
Inside a card, the eyebrow, heading, paragraph, and links stack with no space between them, and the links sit wherever the paragraph ends.

### `flex: 1`

`flex: 1` is shorthand for three item properties: `flex-grow: 1`, so the item takes a share of the leftover space; `flex-shrink: 1`, so it gives some back when the row is too narrow; and `flex-basis: 0`, so every card starts from zero and the shares come out equal.
A card with `flex: 2` would take twice the share of its neighbors.

### A flex item and a flex container at once

An element can be both a flex item and a flex container, and layouts are built by nesting the two.
With `flex-direction: column` the main axis runs top to bottom, so `justify-content` would now move things vertically and `align-items` horizontally.
The `gap` spaces the children along the column, which is why the `.card > *` rule zeroed their margins: the spacing has one owner.

### The `auto` margin

An `auto` margin on a flex item soaks up all the free space on the main axis, so the links are pushed down until they touch the bottom padding.
The three link rows now line up across the row, whatever each card's text length.
This one line replaces the "equal height columns with footers at the bottom" trick that took a page of CSS before flexbox existed.

**If it breaks:** If the cards still have different widths, `flex: 1` is in the `.cards` rule; it goes on the items, not the container.
If the parts of a card run together, `display: flex` without `flex-direction: column` laid them out in a row, or the gap is on `.cards` only.
If the links do not reach the bottom, `margin-top: auto` is on `.card-actions a` instead of `.card-actions`, the element that is the flex item.

**Check:** Run the page.
Three equal cards in one row, each with even spacing between its parts, and the Read and Practice links on the same line across all three.
Press **Run checks** to confirm.

```quiz
In a row of three items, one with `flex: 2` and two with `flex: 1`, what share of the space left after the gaps does the first item take?
- A third, the same as the others
= Half, twice the share of each neighbor
- Two thirds
> `flex: 2` asks for two shares and each `flex: 1` asks for one, so the space splits into four shares and the first item takes two of them.
```

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

main {
  max-width: 48rem;
}

.cards {
  display: flex;
  gap: 1rem;
}

.card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #8a8a8a;
  border-radius: 0.5rem;
}

.card > * {
  margin: 0;
}

.card h2 {
  font-size: 1.1rem;
}

.eyebrow {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #003da5;
}

.card-actions a {
  margin-right: 1rem;
}

.card-actions {
  margin-top: auto;
}
```

</details>
