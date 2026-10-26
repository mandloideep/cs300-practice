---
title: Props are read-only
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [CourseCard]
required: [cards-render, no-read-only-error, headings-uppercase]
---

A teammate wants every course title shown in capital letters, and they changed `CourseCard` to do it.
Read the first three lines of the component in `src/App.jsx`, then run the starter.

The result pane is empty and the console shows two messages.
The first is the real error, and its wording depends on the browser: Chrome says `Cannot assign to read only property 'title' of object`, Firefox says `"title" is read-only`, and Safari says `Attempted to assign to readonly property`.
The second, from React, says `An error occurred in the <CourseCard> component`.

Here is what happened.
`props.title = props.title.toUpperCase()` tries to change the object the parent handed in.
In development, React freezes every props object so that this mistake fails loudly instead of quietly.
The error stopped `CourseCard` in the middle of rendering, and with no error boundary to catch it, React removed the whole tree, which is why the page is blank.

The rule behind it: **a component must never change its own props.**
Props belong to the parent.
The child reads them and decides what to draw, the same way a function should not rewrite the arguments it was called with.
When a value needs to change over time, that is state, which we meet in Week 11.

Here the fix is to leave the prop alone and compute a new value from it.
First, go back to destructuring in the parameter list.

```jsx file="src/App.jsx" action="replace" anchor="function CourseCard(props) {"
function CourseCard({ title, level = "all levels" }) {
```

Replace the assignment with a new local variable.

```jsx file="src/App.jsx" action="replace" anchor="  props.title = props.title.toUpperCase();"
  const heading = title.toUpperCase();
```

The destructuring line is now repeated in the parameter list, so delete it.

```jsx file="src/App.jsx" action="delete" anchor='  const { title, level = "all levels" } = props;'
```

Finally, render the new variable.

```jsx file="src/App.jsx" action="replace" anchor="      <h2>{title}</h2>"
      <h2>{heading}</h2>
```

`heading` is a brand new string that belongs to this one render of `CourseCard`.
`title` is untouched, so the parent's data stays exactly as the parent wrote it.
For a purely visual change like capitals, the CSS `text-transform: uppercase` property would also work; the point of this step is where a changed value should live.

**Check:** Run the code.
The four cards are back, every heading is in capitals, and the console is clear.
Select a `CourseCard` in the inspector tree: its `title` prop is still written in normal case, because only the rendered heading changed.

**If it breaks:** If the page is still blank, look for any remaining line that assigns to `props.` or to a destructured prop inside the component.
If the console says `props is not defined`, a line still reads from `props` after the parameter changed to destructuring.
If the headings are in normal case, the `h2` still renders `{title}` instead of `{heading}`.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
function CourseCard({ title, level = "all levels" }) {
  const heading = title.toUpperCase();
  return (
    <article className="card">
      <h2>{heading}</h2>
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
