---
title: Default values for props
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [CourseCard]
required: [four-course-cards, default-level-shows, passed-levels-win]
---

We added a fourth course to `App` for you: a workshop that is open to every student, so its tag has a `title` and no `level`.
This step gives `level` a default value, so a card whose parent sends no level still says something.
Watch the last card, and its props in the inspector, before and after the edit.

```predict
The workshop's tag passes no `level`; when you run the starter, what does its card read?
- `Level: undefined`
= `Level:` with nothing after it
- Nothing: the page fails with `level is not defined`
```

Run the starter and look at the last card.
It reads `Level:` with nothing after it.
Select that card in the inspector tree: its props show `title` and nothing else.

Change the first line of `CourseCard` so that `level` falls back to a value when the parent does not send one.

```jsx file="src/App.jsx" action="replace" anchor="function CourseCard({ title, level }) {"
function CourseCard({ title, level = "all levels" }) {
```

`level = "all levels"` means "use the `level` prop if the parent passed one, otherwise use `"all levels"`".

## Read more

Inside `CourseCard` the variable `level` is `undefined`, and JSX renders `undefined` as nothing at all.
That is not an error, which is exactly why it is easy to miss.

A default value fills the gap.
This is the default value syntax for destructuring from Week 5, written inside the parameter list.
The default applies only when the prop is missing or `undefined`; a parent that passes `level="advanced"` still gets `advanced`.

Defaults also document the component.
Anyone reading the first line of `CourseCard` now knows that `title` is expected and `level` is optional.

**If it breaks:** If every card now says `all levels`, the default was written as an assignment inside the component body, such as `level = "all levels";`, which overwrites the prop every time; move it back into the parameter braces.
If the workshop card still shows an empty level, check that the equals sign and the quoted text sit inside the braces, right after `level`.

**Check:** Run the code.
The workshop card reads `Level: all levels`, and the other three cards still show the levels `App` passed to them.
In the inspector the workshop's props still list only `title`, because a default lives inside the component, not in the props the parent sent.

```quiz
With `level = "all levels"` in the parameter list, which tag shows `Level: all levels`?
- `<CourseCard title="Lab hours" level="" />`
= `<CourseCard title="Lab hours" level={undefined} />`
- `<CourseCard title="Lab hours" level="advanced" />`
> A default fills in only a missing or `undefined` value; an empty string is a value the parent chose, so it shows `Level:` with nothing after it.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
function CourseCard({ title, level = "all levels" }) {
  return (
    <article className="card">
      <h2>{title}</h2>
      <p>Level: {level}</p>
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
          <CourseCard title="Programming II" level="foundation" />
          <CourseCard title="Client-Side Web Development" level="advanced" />
          <CourseCard title="Database Systems" level="advanced" />
          <CourseCard title="Web Accessibility Workshop" />
        </section>
      </main>
    </div>
  );
}
```

</details>
