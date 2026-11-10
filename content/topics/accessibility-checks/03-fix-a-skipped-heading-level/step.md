---
title: Fix a skipped heading level
mode: edit
entry: src/main.jsx
inspector:
  views: [dom, boundaries]
  watch: [ProductsPage]
required: [headings-do-not-skip, sections-are-named]
---

**We used this in:** [HTML structure](#/topic/html-structure/2), where a page had one `h1` and its sections were `h2`, and [landmarks](#/topic/html-structure/4), where regions got names a screen reader can list.

Screen reader users move through a page by its headings the way sighted users skim it, and the heading levels are the outline they hear: an `h2` is a part of the page, an `h3` a part of that part.
The Products page goes from its `h1` straight to an `h3` for each category, probably because an `h3` looked the right size, so the outline says each category is inside a section that does not exist.
Step through the picture of a page's regions and the list a screen reader reads from them; this step makes each category one of those regions.

```demo name="landmarks-map"
```

```predict
Press **Products** and open the DOM view. Which heading levels does the page have, in order?
- h1, h2, h2
= h1, h3, h3
- h1, h1, h1
```

## The level is structure, not size

Change the category heading to the level it really is, a part of the page.

```jsx file="src/App.jsx" action="replace" anchor="          <h3>{section.title}</h3>"
          <h2 id={`${section.id}-heading`}>{section.title}</h2>
```

The stylesheet sizes every `h2`, so the heading still looks like a section title; how big a heading looks belongs in CSS, and which level it is belongs in the markup.
The `id` is for the next edit.

## Name each section by its heading

A `section` becomes a region landmark, one a screen reader lists beside the navigation and the main content, only when it has a name.
Point it at its heading with `aria-labelledby`.

```jsx file="src/App.jsx" action="replace" anchor="        <section key={section.id}>"
        <section key={section.id} aria-labelledby={`${section.id}-heading`}>
```

Run the code, press **Products**, and read the DOM view: one `h1`, then an `h2` inside each `section`, and each `section` carries the id of its own heading.

## Read more

### The outline a screen reader hears

| Before | After |
| --- | --- |
| Heading level 1, Products | Heading level 1, Products |
| Heading level 3, Beauty | Heading level 2, Beauty |
| Heading level 3, Fragrances | Heading level 2, Fragrances |

A jump from 1 to 3 is the most common heading failure an automated checker reports, and it makes a listener wonder what they missed.
Going down one level at a time and back up any number is fine; an `h4` may follow an `h2` only if an `h3` comes between them.

### One h1 per page

Each page here has exactly one `h1`, its name, which [Move focus to the heading after a route change](#/topic/accessibility-checks/2) focuses.
The site's header and navigation have no heading of their own; the `nav` landmark with `aria-label="Site"` names that region instead.

### Region landmarks in your Capstone

Name a `section` when it is a part of the page a user might want to jump to, such as a list and the form beside it.
A `section` with no name is only a box, and too many named regions are as hard to move through as none, so name the two or three that matter.

**If it breaks:** If the checks say the sections have no name, the `aria-labelledby` value and the heading's `id` differ; both are built from `section.id` with the same suffix.
If the category headings look too small or too large, that is the stylesheet's `h2` rule; change the CSS, not the level.

**Check:** Run the code, press **Products**, and confirm in the DOM view that the headings go `h1`, `h2`, `h2`, each `h2` inside a `section` whose `aria-labelledby` is the heading's `id`.
Then press **Run checks**.

```quiz
A page has an `h1`, then an `h2`, then an `h4`. What is wrong, and what is the fix?
- Nothing; any heading after the `h1` is fine
= The `h4` skips a level; make it an `h3`, and change its size in CSS if it looks too big
- There must be exactly one heading of each level
> Levels go down one at a time, so the outline has no missing parts; the look of a heading is a style, set apart from its level.
```
