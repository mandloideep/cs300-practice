---
title: Pass props and read them with destructuring
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, CourseCard]
required: [three-course-cards, titles-in-order, props-reach-cards]
---

A component with no inputs always draws the same card, and props are the inputs.
**Components are functions, and props are their arguments.**
This step gives `CourseCard` a `title` and a `level`, and the inspector shows each card receiving its own.

```demo name="props-flow"
```

Start with the component.
Replace its first line so that it reads two props out of the props object.

```jsx file="src/App.jsx" action="replace" anchor="function CourseCard() {"
function CourseCard({ title, level }) {
```

`{ title, level }` means "take the `title` and `level` properties out of the props object and give me two local variables with those names".

Now show those values instead of the fixed text.

```jsx file="src/App.jsx" action="replace" anchor="      <h2>Programming II</h2>"
      <h2>{title}</h2>
```

```jsx file="src/App.jsx" action="replace" anchor="      <p>Level: foundation</p>"
      <p>Level: {level}</p>
```

The braces switch from markup back to JavaScript, exactly as in the JSX rules topic, so each card shows whatever value it was given.

```predict
Run now, before any tag has attributes: what does the first card show?
- Programming II and `Level: foundation`, as before
= An empty heading and `Level:` with nothing after it
- The words `{title}` and `Level: {level}`
```

Run the code, then give every card its own data.
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

A string prop is written in quotes, like an HTML attribute, and the data now lives in one place, `App`, and flows down into each card.

## Read more

In Step 1 we saw that a component with no inputs always draws the same card.
The parent writes props as attributes on the tag, React collects them into one object, and passes that object to the component function as its first parameter.

The curly braces inside the parentheses are object destructuring, the same syntax we used for objects in Week 5.
Writing `function CourseCard(props)` and then `props.title` works too; destructuring is the usual React style because the first line of the component then lists every prop it expects.

Until a tag passes a `title`, the variable `title` is `undefined`, and JSX renders `undefined` as nothing, which is why the first card went blank for a moment.

Any value other than a string goes in braces, for example `credits={3}`, `online={true}`, or `tags={["web", "react"]}`.

**If it breaks:** If a card shows `Level:` with nothing after it, the attribute name on the tag and the name inside the destructuring braces differ, for example `levels` in one place and `level` in the other.
If every card shows the literal text `{title}`, the braces are inside quotes, as in `"{title}"`; remove the quotes.
If the console reports `title is not defined`, the destructuring braces are missing from the parameter list.

**Check:** Run the code.
The page shows the same three cards as before, but the inspector now draws three `CourseCard` boxes.
Select each `CourseCard` in the tree and read its props: each one received its own `title` and `level`.
Change one `level` value in `App`, run again, and only that card's text changes.

```quiz
How does a parent pass the number 3 as a `credits` prop?
- `credits="3"`
= `credits={3}`
- `credits=3`
> Quotes always make a string, so `"3"` arrives as text; a number, a boolean, an array, or any other value goes in braces, and a bare `3` is not valid JSX.
```

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
