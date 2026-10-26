---
title: className, htmlFor, and closed tags
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [FindConcept]
required: [no-class-warning, no-for-warning]
---

JSX looks like HTML, but a few attribute names and one tag rule differ.
Our new `FindConcept` component was typed the way we would write HTML, and that is a mistake we will make often in our first weeks of React.
Press **Run** and look at the result first.

The search field looks right: it has its styles from `.search`, and clicking **Find a concept** puts the cursor in the field.
Now open the console pane.
React reports two problems:

```text
Invalid DOM property `for`. Did you mean `htmlFor`?
Invalid DOM property `class`. Did you mean `className`?
```

This is why the mistake survives so long: the page works, because React passes the unknown names through to the browser, and only the console tells us something is wrong.
React shows these warnings in development only, and if you never open the console, you never see them.

The names differ because JSX is JavaScript.
`class` and `for` are reserved words in JavaScript, so React uses the names of the matching DOM properties instead, the same names we used in plain JavaScript as `element.className` and `label.htmlFor`.

Fix the class first.

```jsx file="src/App.jsx" action="replace" anchor='    <div class="search">'
    <div className="search">
```

Then fix the label.

```jsx file="src/App.jsx" action="replace" anchor='      <label for="concept-search">Find a concept</label>'
      <label htmlFor="concept-search">Find a concept</label>
```

`htmlFor` does exactly what `for` does in HTML: it connects the label to the input whose `id` matches, so clicking the label focuses the field and a screen reader announces the label as the field's name.

The input has a different problem, one that does not even reach the console.
In HTML, `<input>` is a void element: it has no contents and no closing tag.
JSX has no void elements; every element must be closed.
`<input></input>` is closed, so it compiles, but it is unusual and suggests the input could have children.
The convention is a **self-closing** tag, written with `/>` at the end.

```jsx file="src/App.jsx" action="replace" anchor='      <input id="concept-search" type="search" placeholder="Try fragment"></input>'
      <input id="concept-search" type="search" placeholder="Try fragment" />
```

The same applies to `<img />`, `<br />`, `<hr />`, and any component with nothing inside, such as `<FindConcept />`.
Leave the tag open, as `<input id="concept-search">` alone, and the file does not compile at all: Vite says `Expected corresponding JSX closing tag for 'input'`, and the lab reports `Unterminated JSX contents`.

Run again and look at the console: both warnings are gone.
Other HTML-to-JSX differences follow the same idea.
Event attributes are camelCase, so `onclick` becomes `onClick`, and `style` takes a JavaScript object, so `style="color: red"` becomes `style={{ color: "red" }}`.

**Check:** The search field looks and behaves as before, clicking the label still focuses the field, and the console shows no `Invalid DOM property` warning.
Press **Run checks** to confirm.

**If it breaks:** If one warning remains, read which name it mentions; each of `class` and `for` needs its own fix.
If the compile fails at the input line, the tag lost its closing: it must end with `/>`, including the slash.
If clicking the label no longer focuses the field, the `htmlFor` value and the input's `id` must be spelled the same, `concept-search`.

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

function FindConcept() {
  return (
    <div className="search">
      <label htmlFor="concept-search">Find a concept</label>
      <input id="concept-search" type="search" placeholder="Try fragment" />
    </div>
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
      <FindConcept />
      <dl>
        <RootFacts />
      </dl>
    </main>
  );
}
```

</details>
