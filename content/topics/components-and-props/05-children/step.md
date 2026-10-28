---
title: Children as a prop
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [Card, CourseCard]
required: [card-shell-used, five-cards, advising-card-content]
---

The catalog needs one more box under the courses, a short note about advising, that looks exactly like a course card but holds different content.
When a component should wrap *any* content, React gives us a special prop called `children`: **whatever the parent writes between the opening and closing tags.**
Watch the inspector tree as `CourseCard` starts drawing its box through the new `Card`.

```predict
After you add a `Card` component above `CourseCard` and run, what changes on the page?
= Nothing yet, because no tag uses `Card`
- Every course card gets a second border inside the first
- An empty box appears after the last course
```

Add a `Card` component above `CourseCard`.
The block ends with the first line of `CourseCard`, which is already there, so you type only the new lines above it.

```jsx file="src/App.jsx" action="replace" anchor='function CourseCard({ title, level = "all levels" }) {'
function Card({ children }) {
  return <article className="card">{children}</article>;
}

function CourseCard({ title, level = "all levels" }) {
```

`Card` reads `children` by destructuring and places `{children}` inside the `article`, so the frame wraps whatever it was given.

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

Finally, use `Card` directly for the advising note, after the last course.

```jsx file="src/App.jsx" action="insert-before" anchor="        </section>"
          <Card>
            <h2>Not sure where to start?</h2>
            <p>Meet with your advisor before registration opens.</p>
          </Card>
```

This time the children are written right in `App`.

## Read more

The advising note should look exactly like a course card, with the same border and padding, but it holds different content, a heading and a sentence rather than a title and a level.

Props such as `title` work when we know the shape of the data.
Think of `children` as a picture frame: the frame supplies the border and the padding, and it does not care which picture goes inside.

`Card` reads `children` the same way `CourseCard` reads `title`, by destructuring.
The whole return fits on one line, so it needs no parentheses.

`CourseCard` is now built *from* `Card`, which is called composition: components made of other components rather than one large function.
The same `Card` holds a course in one place and an advising note in another, and it never needs to know which.

**If it breaks:** If a box is empty, `Card` is missing `{children}` inside its `article`, or it destructures a different name such as `child`.
Make sure both tags in `CourseCard` changed.
This site's compiler reads only the opening tag, so `<Card>` closed by `</article>` may still look right here, but Vite on your own computer rejects it with an error about a missing closing tag.
If the advising note has no border, it was written with a plain `<div>` instead of `<Card>`.

**Check:** Run the code.
The page shows five boxes that all look alike, four courses and the advising note.
In the inspector tree, each `CourseCard` now has a `Card` inside it, and the advising note is a `Card` directly inside `App`.
Turn on Boundaries and hover a course: you see the `CourseCard` box and, inside it, the `Card` box around the same area.

```quiz
If `Card` returned `<article className="card"></article>` without `{children}`, what would `<Card><h2>Hi</h2></Card>` show?
- The heading Hi inside the bordered box, because React adds children automatically
= An empty bordered box
- An error saying `children` is not used
> React hands the content between the tags to `Card` as the `children` prop, and it appears only where `Card` places `{children}`.
```

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
