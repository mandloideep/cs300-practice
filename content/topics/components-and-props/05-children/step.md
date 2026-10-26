---
title: Children as a prop
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [Card, CourseCard]
required: [card-shell-used, five-cards, advising-card-content]
---

The catalog needs one more box under the courses: a short note about advising.
It should look exactly like a course card, with the same border and padding, but it holds different content, a heading and a sentence rather than a title and a level.

Props such as `title` work when we know the shape of the data.
When a component should wrap *any* content, React gives us a special prop called `children`.
**`children` is whatever the parent writes between the opening and closing tags.**
Think of a picture frame: the frame supplies the border and the padding, and it does not care which picture goes inside.

Add a `Card` component above `CourseCard`.
The block ends with the first line of `CourseCard`, which is already there, so you type only the new lines above it.

```jsx file="src/App.jsx" action="replace" anchor='function CourseCard({ title, level = "all levels" }) {'
function Card({ children }) {
  return <article className="card">{children}</article>;
}

function CourseCard({ title, level = "all levels" }) {
```

`Card` reads `children` the same way `CourseCard` reads `title`, by destructuring.
It places `{children}` inside the `article`, so the frame wraps whatever it was given.
The whole return fits on one line, so it needs no parentheses.

Now let `CourseCard` use the frame instead of writing its own `article`.
Change the opening tag.

```jsx file="src/App.jsx" action="replace" anchor='    <article className="card">'
    <Card>
```

Then the closing tag.

```jsx file="src/App.jsx" action="replace" anchor="    </article>"
    </Card>
```

The `h2` and the level line between those tags become the `children` of `Card`.
`CourseCard` is now built *from* `Card`, which is called composition: components made of other components rather than one large function.

Finally, use `Card` directly for the advising note, after the last course.

```jsx file="src/App.jsx" action="insert-before" anchor="        </section>"
          <Card>
            <h2>Not sure where to start?</h2>
            <p>Meet with your advisor before registration opens.</p>
          </Card>
```

This time the children are written right in `App`.
The same `Card` holds a course in one place and an advising note in another, and it never needs to know which.

**Check:** Run the code.
The page shows five boxes that all look alike, four courses and the advising note.
In the inspector tree, each `CourseCard` now has a `Card` inside it, and the advising note is a `Card` directly inside `App`.
Turn on Boundaries and hover a course: you see the `CourseCard` box and, inside it, the `Card` box around the same area.

**If it breaks:** If a box is empty, `Card` is missing `{children}` inside its `article`, or it destructures a different name such as `child`.
Make sure both tags in `CourseCard` changed.
The lab's compiler reads only the opening tag, so `<Card>` closed by `</article>` may still look right here, but Vite on your own computer rejects it with an error about a missing closing tag.
If the advising note has no border, it was written with a plain `<div>` instead of `<Card>`.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
function Card({ children }) {
  return <article className="card">{children}</article>;
}

function CourseCard({ title, level = "all levels" }) {
  const heading = title.toUpperCase();
  return (
    <Card>
      <h2>{heading}</h2>
      <p>Level: {level}</p>
    </Card>
  );
}

export default function App() {
  return (
    <div className="page">
      <main>
        <h1>Course catalog</h1>
        <p className="lead">Courses offered next term.</p>
        <section className="card-grid">
          <CourseCard title="Programming II" level="foundation" />
          <CourseCard title="Client-Side Web Development" level="advanced" />
          <CourseCard title="Database Systems" level="advanced" />
          <CourseCard title="Web Accessibility Workshop" />
          <Card>
            <h2>Not sure where to start?</h2>
            <p>Meet with your advisor before registration opens.</p>
          </Card>
        </section>
      </main>
    </div>
  );
}
```

</details>
