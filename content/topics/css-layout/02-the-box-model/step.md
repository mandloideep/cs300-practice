---
title: The box model and box-sizing
mode: edit
entry: index.html
required: [card-has-padding, border-box-everywhere, card-fits-inside-main]
---

Every element on a page is a rectangle with four layers: **content**, **padding**, **border**, and **margin**.
This step adds padding to a card that is `width: 100%`, watches it overflow, and fixes the arithmetic with one rule.
Watch the card's right edge against the dashed border of `main` after each run.

```demo name="box-model"
```

Press **Run**.
A release note sits in a card with a blue border, inside a `<main>` drawn with a dashed border so that you can see its edge.
The text touches the blue border, which is what padding is for.
Add some inside the card.

```predict
After you add `padding: 1.5rem` to the card and run, what happens to its right edge?
- It stays inside the dashed border, and the text gets narrower to make room
= It pokes out past the dashed border of `main`
- It moves left, because padding pulls the card inward
```

```css file="styles.css" action="insert-after" anchor="  width: 100%;"
  padding: 1.5rem;
```

Run the page: the text has room, and the card now pokes out past the dashed edge of `main`, even though it still says `width: 100%`.
By default `width` sizes the content layer only, and padding and border are added outside it.

Change what `width` means, for every element, with a rule at the top of the file just above `body`.

```css file="styles.css" action="insert-before" anchor="body {"
*,
*::before,
*::after {
  box-sizing: border-box;
}

```

Run again: the card fits exactly inside `main`, padding and border included, and nothing overflows.

The last layer is margin, the space outside the border.
Give the card some above and below.

```css file="styles.css" action="insert-after" anchor="  width: 100%;\n  padding: 1.5rem;"
  margin-block: 1.5rem;
```

The card moves away from the heading and the section, and the dashed edge of `main` does not move, because margin is outside the box.

## Read more

### Where the width goes

The four layers are the box model, and the one thing about it that surprises everyone is where the width goes.
After the padding went in, the card poked out past the dashed edge of `main` on the right, and probably past the edge of the result pane too, with a scrollbar to prove it.
Nothing about the width changed; the card still said `width: 100%`.

By default, `width` sets the size of the **content** layer only.
Padding and border are added on the outside of that, so a card that is `100%` wide plus `1.5rem` of padding on each side plus a `0.25rem` border on each side is `100%` plus `3.5rem` wide, which is wider than the space it sits in.
Hover the card with the browser's DevTools open and the Computed panel draws the four layers with their sizes; this site's DOM view shows the same box when you hover its row.

### `border-box` everywhere

The fix is one declaration that changes what `width` means: with `box-sizing: border-box`, the width you set is the width of the whole box, border included, and the content shrinks to make room.
We want it on every element, so the rule goes at the top of the file with a selector that matches everything.
`*` matches every element, and `::before` and `::after` cover the pseudo-elements CSS can add to one, so nothing on the page is left with the old arithmetic.
This rule opens every stylesheet we write from here on.

### Margin

Margin is outside the box, so it is not part of the card's width, and it is always transparent, so the card's background would never show through it.
`margin-block` sets the top and bottom at once; `margin-inline` would set left and right.

**If it breaks:** If the card still overflows, the `box-sizing` rule is below the `.card` rule or missing its `*` selector; it belongs at the top of the file.
If the text still touches the border, `padding` is in the `main` rule instead of `.card`.
If nothing changed at all, a semicolon is missing at the end of the line before your new one, which makes the browser drop both.

**Check:** Run the page.
The card has space inside its border, space above and below it, and its right edge lines up with the inside of the dashed border.
Press **Run checks** to confirm the padding, the box-sizing on every element, and that the card fits.

```quiz
Under `box-sizing: border-box`, how wide is a box with `width: 200px`, `padding: 20px`, and a `5px` border?
= `200px`
- `240px`
- `250px`
> With `border-box` the width you set is the whole box, border included, and the content shrinks to make room; `250px` is the answer under the default `content-box`, which adds both paddings and both borders.
```

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
