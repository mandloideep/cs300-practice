---
title: One root and fragments
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [RootFacts]
required: [terms-in-the-list]
---

A component returns **one** value, and in JSX that means one root element.
This step replaces a wrapper `<div>` with a **fragment**, which groups elements for the one-root rule without putting any element on the page.
Watch the definitions at the bottom of the page: their layout shows whether the wrapper is still there.

```predict
`RootFacts` wraps its terms and definitions in a `<div>` inside the `<dl>`; when you run, how do they lay out?
- Terms in a left column with each definition beside it
= Every term and definition stacked in one column
- Nothing shows, because a `<div>` is not allowed in a `<dl>`
```

The usual first fix for two roots is to wrap the siblings in a `<div>`, and that is what our new `RootFacts` component does.
`styles.css` lays out a `<dl>` as a two-column grid, terms on the left and definitions on the right.

Press **Run** and look at the definitions at the bottom of the page.
Every term and definition is stacked in one column, because the `<dl>` has a single child, the `<div>`, so the grid has one cell and everything sits inside it.

A fragment's short form is a pair of empty tags, `<>` and `</>`.
Replace the opening `<div>` with an empty opening tag.

```jsx file="src/App.jsx" action="replace" anchor="    <div>"
    <>
```

Then replace the closing `</div>` with an empty closing tag.

```jsx file="src/App.jsx" action="replace" anchor="    </div>"
    </>
```

Run again.
The terms move into the left column and the definitions into the right, because the four elements are now direct children of the `<dl>`.
The inspector still lists `RootFacts` in the tree, even though the component no longer adds an element of its own to the page.

## Read more

Each tag becomes a function call, and a function cannot return two calls side by side, just as `return 1 2;` is not JavaScript.
So this does not compile:

```jsx
function RootFacts() {
  return (
    <dt>One root</dt>
    <dd>A component returns one element.</dd>
  );
}
```

On your computer, Vite stops with `Adjacent JSX elements must be wrapped in an enclosing tag` and suggests `Did you want a JSX fragment <>...</>?`.
This site's compiler is less helpful: it reports a general syntax error such as `Unexpected token` or `Unterminated regular expression` at the second tag.
Whenever a compile error points at the start of a JSX tag, look for two roots first.

The wrapper `<div>` satisfied the one-root rule, but it is a real element on the page, and the page did not want it.

Use a `<div>` when you want a box you can style or that means something on the page.
Use a fragment when you only need to satisfy the one-root rule.

**If it breaks:** If only one of the two tags changed, this site may still run the page, but Vite on your computer refuses with `Expected corresponding closing tag for JSX fragment`; make both tags empty.
If the layout did not change, run again after saving both edits; the result shows the last run, not the last keystroke.

**Check:** The bottom of the page shows **One root** and **Fragment** in a left column with their definitions beside them, and the `<dl>` has no `<div>` inside it.
Press **Run checks** to confirm.

```quiz
Which wrapper satisfies the one-root rule without adding an element to the page?
- `<div>` and `</div>`
= `<>` and `</>`
- `<dl>` and `</dl>`
> A fragment groups its children for the one-root rule and leaves them as direct children of whatever contains the component; a `<div>` or a second `<dl>` is a real element in between.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
function RootFacts() {
  return (
    <>
      <dt>One root</dt>
      <dd>A component returns one element, and that element may hold many others.</dd>
      <dt>Fragment</dt>
      <dd>Empty tags group elements without adding an element to the page.</dd>
    </>
  );
}

export default function App() {
  const course = "CS300";
  const topics = ["JSX expressions", "Root rendering"];

  return (
    <main>
      <h1>React, Vite, JSX, and Rendering</h1>
      <p>{course} renders {topics.length} concepts from data.</p>
      <p><strong>{topics[0]}:</strong> Values render inside braces.</p>
      <p>Week {9 + 1} covers {topics.join(" and ")}.</p>
      <dl>
        <RootFacts />
      </dl>
    </main>
  );
}
```

</details>
