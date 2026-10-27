---
title: Selectors and the cascade
mode: edit
entry: index.html
required: [warning-text-wins, no-important, links-inherit]
---

**We used this in:** [HTML structure](#/topic/html-structure) gave the page its elements, ids, and classes; this topic styles them, and every rule starts by selecting some of them.
This step gives one card a warning style, and the first try loses to a rule that is more specific than it needs to be.
Watch which declarations change after each run and which ones stay put.

```demo name="selector-matcher"
```

Open `styles.css`.
A CSS rule is a **selector**, which says which elements it applies to, and a block of **declarations**, each a property, a colon, a value, and a semicolon.
The file has three kinds of selector already: `main` selects every `<main>` element, `.card` selects every element with `class="card"`, and `main article.card` selects an `<article>` with that class that sits inside a `<main>`.

Press **Run**.
Two cards have a blue border and blue text.
The first card is marked `class="card is-warning"`, two classes on one element, and it should look like a warning: a yellow border and brown text.
Add a rule for the second class at the end of the file.

```predict
After you add the `.is-warning` rule and run, what does the first card look like?
- A yellow border and brown text, because the later rule wins
= A yellow border and blue text
- Unchanged, because a card can only take one class
```

```css file="styles.css" action="append"

.is-warning {
  border-color: var(--warning-border);
  color: var(--warning);
}
```

`var(--warning)` reads a **custom property** defined on `:root` at the top of the file, so every rule agrees on the colors.
Run the page: the border turns yellow and the text stays blue.

```demo name="cascade-resolver"
```

The two rules disagree about `color`, and the more **specific** selector wins wherever it sits in the file.
`main article.card` outweighs `.is-warning`, and it is heavier than it needs to be, so simplify it instead of reaching for `!important`.

```css file="styles.css" action="replace" anchor="main article.card {"
.card {
```

Run again: the first card's text is brown, because `.card` and `.is-warning` now tie and the later rule wins.

The link inside the warning card is still the browser's default blue.
Ask for the card's color back.

```css file="styles.css" action="append"

.card a {
  color: inherit;
}
```

`.card a` selects any `<a>` inside a `.card`, and `inherit` takes the parent's value, so each link matches its own card.

## Read more

### Counting specificity

This is the specificity mistake, and it bites every week.
When two rules set the same property on the same element, the browser does not take the later one; it takes the more **specific** selector, and only when they tie does the later one win.
Count a selector by its parts: an id counts most, then each class, then each element name.

| Selector | Ids | Classes | Elements |
| --- | --- | --- | --- |
| `main article.card` | 0 | 1 | 2 |
| `.is-warning` | 0 | 1 | 0 |

One class each, but `main article.card` adds two element names, so it is more specific, and its `color` wins over ours no matter where ours sits in the file.
The border changed because that selector never set `border-color`; there was no fight to lose.

### Why not `!important`

The tempting fix is `color: var(--warning) !important;`, which beats everything.
Do not write it: the next rule that needs to beat it also needs `!important`, and in a month nothing in the file can be reasoned about.
The real fix is on the other side: `main article.card` is more specific than it needs to be.
Every card is an article inside main, so the extra names add nothing but weight.

After the fix, the first card's text is brown: `.card` and `.is-warning` tie at one class each, and the later rule wins, which is the **cascade** working as it should.
The second card stays blue, because it does not carry `is-warning`.
Two rules with the same `.card` selector are fine; the browser merges them, and the later one only matters where they disagree.

### Inheritance

Text color normally **inherits** from the parent element, which is why the paragraphs turned brown without a rule of their own, but the browser's own stylesheet gives links a color, and that stops the inheritance.
`.card a` is a descendant selector: any `<a>` anywhere inside a `.card`.
`inherit` means take the parent's value, whatever it is, so the link in the warning card is brown and the link in the other card is blue, from one rule.

**If it breaks:** If the first card's text is still blue, the `main article.card` rule is still in the file; replace its selector with `.card`.
If both cards turned brown, the warning rule's selector is `.card` instead of `.is-warning`.
If a link stayed blue, the `.card a` rule has a typo in `inherit`, or the link is outside the card.

**Check:** Run the page.
The first card is yellow and brown through and through, the second is blue through and through, and the headings outside the cards use the dark text color from `:root`.
Press **Run checks** to confirm, and to confirm that there is no `!important` in the file.

```quiz
Which selector is more specific than `.is-warning`?
- `.notice`, because it comes later in the file
= `article.card`, because it adds an element name to one class
- `main`, because it matches a larger part of the page
> Specificity counts the parts of a selector: ids, then classes, then element names; `article.card` has one class and one element, which beats one class alone, while source order only breaks a tie.
```

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
