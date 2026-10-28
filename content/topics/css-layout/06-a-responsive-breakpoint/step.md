---
title: A responsive breakpoint
mode: edit
entry: index.html
required: [stacked-below-768, two-columns-from-768, three-columns-from-1024]
---

Every page we write adapts to the width it is given, and the tool is the **media query**: a block of rules that applies only when a condition about the screen is true.
This step starts from a layout for a narrow screen and adds a breakpoint for a tablet and one for a desktop.
Watch which layout the page uses at each width, and remember that the plain rules describe the smallest screen.

```demo name="breakpoint-slider"
```

Press **Run**.
The page is already laid out for a narrow screen: the site name stacks above the links, and the three cards sit in one column, because `.cards` is a grid with `grid-template-columns: 1fr`.
This is **mobile-first**: the plain rules describe the smallest screen, and media queries add columns as the screen grows.

Add the first breakpoint at the end of the file.

```css file="styles.css" action="append"

@media (min-width: 768px) {
  .site-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

From 768 pixels wide, the header becomes the row from Step 3 and the cards get two columns.
The result pane on this site is narrower than 768 pixels on most screens, so the page keeps its stacked layout after you run it.
Make your browser window wider and the pane grows with it; past the breakpoint the header snaps into a row and the cards into two columns.
The check does the opposite: it narrows the result pane to 480 pixels, confirms the stacked layout, and reads the breakpoint rules from the stylesheet.

Add the second breakpoint for a desktop.

```css file="styles.css" action="append"

@media (min-width: 1024px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

The cards get three columns from 1024 pixels up, and the header keeps the row from the first query, which is still true at that width.

## Read more

### Why start narrow

More than half of the visits to any page come from a phone.
A layout that looks right on a laptop and squeezes three columns onto a phone screen is broken for most of its readers.
In the starter nothing is hidden or squeezed, which is the point of starting narrow.

### How a media query wins

`@media (min-width: 768px)` wraps rules that apply when the viewport is 768 pixels wide or wider, the width of a tablet held upright.
The rules inside a media query have the same specificity as the rules outside, so they win only because they come later in the file; a media query written above the plain rules would lose to them.

### Two breakpoints

The header needs nothing new in the second query: the row from the first query still applies, because `min-width: 768px` is still true at 1024.
Two breakpoints cover most pages; add a third only when a layout actually breaks between them.

### The viewport line

One line in `index.html` makes all of this work: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` from the first HTML step.
Without it, a phone pretends to be a 980 pixel wide desktop, every media query sees that width, and the page arrives tiny and zoomed out.

**If it breaks:** If nothing changes at any width, the `@media` line is missing its parentheses or a closing `}` is missing at the end of the block.
If the wide layout shows at every width, the breakpoint uses `max-width` instead of `min-width`, which reverses the meaning.
If the cards get two columns but the header stays stacked, the `.site-header` rule is outside the `@media` block or misses `flex-direction: row`.

**Check:** Run the page.
At the result pane's width the header stacks and the cards are in one column; widen the window past 768 pixels and both change.
Press **Run checks**: the first check narrows the pane to 480 pixels and confirms the stacked layout, and the other two confirm what each breakpoint changes.

```quiz
With both breakpoints in the file, how many columns do the cards have when the result is 900 pixels wide?
- One, because 900 is below 1024
= Two
- Three, because 900 is above 768
> At 900 pixels `min-width: 768px` is true and `min-width: 1024px` is not, so only the first query applies and it sets `repeat(2, 1fr)`.
```

```quiz
Why does the 768 pixel query come after the plain `.cards` rule in the file?
- Media queries must always be the last thing in a stylesheet
= Its rules have the same specificity as the plain ones, so they win only by coming later
- The browser reads media queries before the plain rules
> A media query adds no specificity; when it matches, its rules tie with the plain rules and source order decides.
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

.site-header,
main,
footer {
  max-width: 60rem;
  margin-inline: auto;
}

.site-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  font-size: 1.5rem;
  font-weight: 700;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

h1 {
  max-width: 22ch;
  line-height: 1.2;
}

.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.card {
  padding: 1rem;
  border: 1px solid #8a8a8a;
  border-radius: 0.5rem;
}

.card > * {
  margin: 0;
}

.card h2 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

footer {
  padding: 1rem;
  color: #4a5568;
}

@media (min-width: 768px) {
  .site-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

</details>
