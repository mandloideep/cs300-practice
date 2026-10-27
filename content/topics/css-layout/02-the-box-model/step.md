---
title: The box model and box-sizing
mode: edit
entry: index.html
required: [card-has-padding, border-box-everywhere, card-fits-inside-main]
---

Every element on a page is a rectangle, and every rectangle has four layers: the **content** in the middle, **padding** around it, a **border** around that, and **margin** outside the border.
That is the box model, and the one thing about it that surprises everyone is where the width goes.

Press **Run**.
A release note sits in a card with a blue border, inside a `<main>` drawn with a dashed border so that you can see its edge.
The text touches the blue border, which is what padding is for.
Add some inside the card.

```css file="styles.css" action="insert-after" anchor="  width: 100%;"
  padding: 1.5rem;
```

Run the page.
The text has room to breathe, and the card now pokes out past the dashed edge of `main` on the right, and probably past the edge of the result pane too, with a scrollbar to prove it.
Nothing about the width changed; the card still says `width: 100%`.

Here is why.
By default, `width` sets the size of the **content** layer only.
Padding and border are added on the outside of that, so a card that is `100%` wide plus `1.5rem` of padding on each side plus a `0.25rem` border on each side is `100%` plus `3.5rem` wide, which is wider than the space it sits in.
Hover the card with the browser's DevTools open and the Computed panel draws the four layers with their sizes; the lab's DOM view shows the same box when you hover its row.

The fix is one declaration that changes what `width` means: with `box-sizing: border-box`, the width you set is the width of the whole box, border included, and the content shrinks to make room.
We want it on every element, so the rule goes at the top of the file, just above the `body` rule, with a selector that matches everything.

```css file="styles.css" action="insert-before" anchor="body {"
*,
*::before,
*::after {
  box-sizing: border-box;
}

```

Run again.
The card fits exactly inside `main`, padding and border included, and the scrollbar is gone.
`*` matches every element, and `::before` and `::after` cover the pseudo-elements CSS can add to one, so nothing on the page is left with the old arithmetic.
This rule opens every stylesheet we write from here on.

The last layer is margin, the space outside the border.
Give the card some above and below.

```css file="styles.css" action="insert-after" anchor="  width: 100%;\n  padding: 1.5rem;"
  margin-block: 1.5rem;
```

The card moves away from the heading above it and the section below it, and the dashed edge of `main` does not move: margin is outside the box, so it is not part of the card's width, and it is always transparent, so the card's background would never show through it.
`margin-block` sets the top and bottom at once; `margin-inline` would set left and right.

**Check:** Run the page.
The card has space inside its border, space above and below it, and its right edge lines up with the inside of the dashed border.
Press **Run checks** to confirm the padding, the box-sizing on every element, and that the card fits.

**If it breaks:** If the card still overflows, the `box-sizing` rule is below the `.card` rule or missing its `*` selector; it belongs at the top of the file.
If the text still touches the border, `padding` is in the `main` rule instead of `.card`.
If nothing changed at all, a semicolon is missing at the end of the line before your new one, which makes the browser drop both.

<details>
<summary>styles.css after this step</summary>

```css
:root {
  --accent: #003da5;
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
  max-width: 36rem;
  padding: 1rem;
  border: 1px dashed #8a8a8a;
}

.card {
  width: 100%;
  padding: 1.5rem;
  margin-block: 1.5rem;
  border: 0.25rem solid var(--accent);
}

.eyebrow {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

</details>
