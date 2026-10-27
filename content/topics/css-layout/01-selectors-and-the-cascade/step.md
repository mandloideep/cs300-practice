---
title: Selectors and the cascade
mode: edit
entry: index.html
required: [warning-text-wins, no-important, links-inherit]
---

**We used this in:** [HTML structure](#/topic/html-structure) gave the page its elements, ids, and classes; this topic styles them, and every rule starts by selecting some of them.

Open `styles.css`.
A CSS rule is a **selector**, which says which elements it applies to, and a block of **declarations**, each a property, a colon, a value, and a semicolon.
The file has three kinds of selector already: `main` selects every `<main>` element, `.card` selects every element with `class="card"`, and `main article.card` selects an `<article>` with that class that sits inside a `<main>`.

Press **Run**.
Two cards have a blue border and blue text.
The first card is marked `class="card is-warning"`, two classes on one element, and it should look like a warning: a yellow border and brown text.
Add a rule for the second class at the end of the file.

```css file="styles.css" action="append"

.is-warning {
  border-color: var(--warning-border);
  color: var(--warning);
}
```

`var(--warning)` reads a **custom property** defined on `:root` at the top of the file; the colors live there once so that every rule agrees.
Run the page.
The border of the first card turns yellow, and the text stays blue.

This is the specificity mistake, and it bites every week.
When two rules set the same property on the same element, the browser does not take the later one; it takes the more **specific** selector, and only when they tie does the later one win.
Count a selector by its parts: an id counts most, then each class, then each element name.

| Selector | Ids | Classes | Elements |
| --- | --- | --- | --- |
| `main article.card` | 0 | 1 | 2 |
| `.is-warning` | 0 | 1 | 0 |

One class each, but `main article.card` adds two element names, so it is more specific, and its `color` wins over ours no matter where ours sits in the file.
The border changed because that selector never set `border-color`; there was no fight to lose.

The tempting fix is `color: var(--warning) !important;`, which beats everything.
Do not write it: the next rule that needs to beat it also needs `!important`, and in a month nothing in the file can be reasoned about.
The real fix is on the other side: `main article.card` is more specific than it needs to be.
Every card is an article inside main, so the extra names add nothing but weight.

```css file="styles.css" action="replace" anchor="main article.card {"
.card {
```

Run again.
The first card's text is brown: `.card` and `.is-warning` now tie at one class each, and the later rule wins, which is the **cascade** working as it should.
The second card stays blue, because it does not carry `is-warning`.
Two rules with the same `.card` selector are fine; the browser merges them, and the later one only matters where they disagree.

One thing still looks off: the link inside the warning card is the browser's default blue.
Text color normally **inherits** from the parent element, which is why the paragraphs turned brown without a rule of their own, but the browser's own stylesheet gives links a color, and that stops the inheritance.
Ask for it back.

```css file="styles.css" action="append"

.card a {
  color: inherit;
}
```

`.card a` is a descendant selector: any `<a>` anywhere inside a `.card`.
`inherit` means take the parent's value, whatever it is, so the link in the warning card is brown and the link in the other card is blue, from one rule.

**Check:** Run the page.
The first card is yellow and brown through and through, the second is blue through and through, and the headings outside the cards use the dark text color from `:root`.
Press **Run checks** to confirm, and to confirm that there is no `!important` in the file.

**If it breaks:** If the first card's text is still blue, the `main article.card` rule is still in the file; replace its selector with `.card`.
If both cards turned brown, the warning rule's selector is `.card` instead of `.is-warning`.
If a link stayed blue, the `.card a` rule has a typo in `inherit`, or the link is outside the card.

<details>
<summary>styles.css after this step</summary>

```css
:root {
  --accent: #003da5;
  --warning: #7a4d00;
  --warning-border: #f2a900;
  color-scheme: light;
  color: #172033;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

body {
  margin: 0;
  padding: 1.5rem;
}

main {
  max-width: 40rem;
}

.card {
  border: 0.2rem solid var(--accent);
  padding: 1rem 1.5rem;
  margin-block: 1rem;
}

.card {
  color: var(--accent);
}

.eyebrow {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.is-warning {
  border-color: var(--warning-border);
  color: var(--warning);
}

.card a {
  color: inherit;
}
```

</details>
