---
title: Pass props and read them with destructuring
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, CourseCard]
required: [three-course-cards, titles-in-order, props-reach-cards]
---

In Step 1 we saw that a component with no inputs always draws the same card.
Props are the inputs.
**Components are functions, and props are their arguments.**
The parent writes them as attributes on the tag, React collects them into one object, and passes that object to the component function as its first parameter.

Start with the component.
Replace its first line so that it reads two props out of that object.

```jsx file="src/App.jsx" action="replace" anchor="function CourseCard() {"
function CourseCard({ title, level }) {
```

The curly braces inside the parentheses are object destructuring, the same syntax we used for objects in Week 5.
`{ title, level }` means "take the `title` and `level` properties out of the props object and give me two local variables with those names".
Writing `function CourseCard(props)` and then `props.title` works too; destructuring is the usual React style because the first line of the component then lists every prop it expects.

Now show those values instead of the fixed text.

```jsx file="src/App.jsx" action="replace" anchor="      <h2>Programming II</h2>"
      <h2>{title}</h2>
```

```jsx file="src/App.jsx" action="replace" anchor="      <p>Level: foundation</p>"
      <p>Level: {level}</p>
```

The braces switch from markup back to JavaScript, exactly as in the JSX rules topic, so each card shows whatever value it was given.

Finally, give every card its own data.
The first card already uses the component, so add the attributes to its tag.

```jsx file="src/App.jsx" action="replace" anchor="          <CourseCard />"
          <CourseCard title="Programming II" level="foundation" />
```

Then replace the other two `article` lines with tags of their own.

```jsx file="src/App.jsx" action="replace" anchor='          <article className="card"><h2>Client-Side Web Development</h2><p>Level: advanced</p></article>'
          <CourseCard title="Client-Side Web Development" level="advanced" />
```

```jsx file="src/App.jsx" action="replace" anchor='          <article className="card"><h2>Database Systems</h2><p>Level: advanced</p></article>'
          <CourseCard title="Database Systems" level="advanced" />
```

A string prop is written in quotes, like an HTML attribute.
Any other value goes in braces, for example `credits={3}`, `online={true}`, or `tags={["web", "react"]}`.
The data now lives in one place, `App`, and flows down into each card.

**Check:** Run the code.
The page shows the same three cards as before, but the inspector now draws three `CourseCard` boxes.
Select each `CourseCard` in the tree and read its props: each one received its own `title` and `level`.
Change one `level` value in `App`, run again, and only that card's text changes.

**If it breaks:** If a card shows `Level:` with nothing after it, the attribute name on the tag and the name inside the destructuring braces differ, for example `levels` in one place and `level` in the other.
If every card shows the literal text `{title}`, the braces are inside quotes, as in `"{title}"`; remove the quotes.
If the console reports `title is not defined`, the destructuring braces are missing from the parameter list.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
function CourseCard({ title, level }) {
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
        </section>
      </main>
    </div>
  );
}
```

</details>
