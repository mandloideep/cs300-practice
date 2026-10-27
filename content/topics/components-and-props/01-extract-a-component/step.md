---
title: Extract a component from repeated markup
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, CourseCard]
required: [one-course-card, three-cards-render, cards-have-headings]
---

**We used this in:** [JSX rules](#/topic/jsx-rules) taught us how JSX describes markup, and the last step of that topic rendered one card from a data object.

The three course cards in `src/App.jsx` are the same shape written out three times, and this step moves that shape into a component.
A component is a function whose name starts with a capital letter and which returns JSX.
Watch the inspector: the page should not change at all, but a new box should appear around the first card.

```predict
With the Boundaries view on, how many component boxes does the starter draw when you run it?
= One, labeled `App`
- Three, one around each card
- Four, one for `App` and one for each card
```

Look at `src/App.jsx`: each card is an `article`, a heading, and a level line.
The inspector is open with the Boundaries and Tree views.
Run the starter first and notice that only one box appears, labeled `App`, because `App` is the only component so far.

Add the new component above `App`.
The block replaces the first line of `App` and ends with that same line, so in practice you type the new function directly above it.

```jsx file="src/App.jsx" action="replace" anchor="export default function App() {"
function CourseCard() {
  return (
    <article className="card">
      <h2>Programming II</h2>
      <p>Level: foundation</p>
    </article>
  );
}

export default function App() {
```

`CourseCard` is an ordinary function, and its capital letter tells JSX to call it rather than create an HTML element.

Now use the component in place of the first card.

```jsx file="src/App.jsx" action="replace" anchor='          <article className="card"><h2>Programming II</h2><p>Level: foundation</p></article>'
          <CourseCard />
```

When React renders `App`, it reaches this tag, calls `CourseCard`, and puts whatever `CourseCard` returns in this spot.

## Read more

When the same markup repeats, we give it a name by moving it into a component.
In Week 8 our CourseHub `bookCard` function did the same job by returning a string; a React component returns JSX instead and React turns it into DOM nodes.

The capital letter matters: in JSX, `<CourseCard />` with a capital means "call our component" and `<article>` in lower case means "create this HTML element".
The parentheses after `return` let the JSX span several lines, exactly as in the JSX rules topic.
`<CourseCard />` is a self-closing tag because it has nothing between an opening and a closing tag.

Before moving on, try one experiment and then undo it.
Replace the second card's `article` line with `<CourseCard />` as well and run again.
Both cards now say Programming II, because `CourseCard` always returns the same heading.
A component with no inputs can only draw one thing; Step 2 gives it inputs.

**If it breaks:** A blank result and an error that mentions `CourseCard is not defined` means the function name and the tag differ, often by capitalization.
If the console says `<courseCard /> is using incorrect casing`, the tag starts with a lowercase letter, so React treated it as an unknown HTML element.
If the heading text appears twice, the old `article` line is still there next to the new tag.

**Check:** Run the code.
The page looks exactly the same as before, which is the point of a refactor.
The inspector now draws a second box around the first card, labeled `CourseCard`, and the tree shows `CourseCard` inside `App`.
Click the `CourseCard` box and the editor jumps to the function you just wrote.

```quiz
Which tag makes React call the `CourseCard` function?
- `<courseCard />`
= `<CourseCard />`
- `<article className="CourseCard">`
> A tag that starts with a capital letter names a component, so React calls the function; a lowercase tag is treated as an HTML element, and a class name is only a label for CSS.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
function CourseCard() {
  return (
    <article className="card">
      <h2>Programming II</h2>
      <p>Level: foundation</p>
    </article>
  );
}

export default function App() {
  return (
    <div className="page">
      <main>
        <h1>Course catalog</h1>
        <p className="lead">Courses offered next term.</p>
        <section className="card-grid">
          <CourseCard />
          <article className="card"><h2>Client-Side Web Development</h2><p>Level: advanced</p></article>
          <article className="card"><h2>Database Systems</h2><p>Level: advanced</p></article>
        </section>
      </main>
    </div>
  );
}
```

</details>
