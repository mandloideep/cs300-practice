---
title: "Conditional rendering with ?: and &&"
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, tree]
  watch: [App]
required: [label-follows-state, status-only-when-open]
---

**We used this in:** [The React mental model](#/topic/react-mental-model) used `useState` to keep a value that changes on a click.

Braces hold expressions, and an `if` statement cannot go inside them, so JSX shows something only sometimes with the two operators that produce a value from a condition: the conditional operator `? :` and the logical AND operator `&&`.
This step makes a button's label follow its state and shows a paragraph only while the button is open.
Watch the button's label and the space under it as you click.

```predict
Before any edit, press Run and click the button with Flash on: what changes?
- The button's label changes to Hide build evidence
= `App` flashes in the inspector, but the page looks the same
- Nothing at all, in the page or in the inspector
```

The workspace now has the button from our Week 10 Session 1 example.
`App` keeps `showEnvironment` in state, starting at `false`, and each click flips it with `setShowEnvironment((visible) => !visible)`.
Press **Run** and click the button with **Flash** on: `App` flashes on every click, so the state is changing, but the page shows nothing different.
The JSX does not use `showEnvironment` anywhere yet.

## Choose between two values with ? :

`condition ? a : b` produces `a` when the condition is true and `b` otherwise, and it fits inside braces because it is an expression.
Make the button's label say what a click will do.

```predict
After this edit, run and click the button once: what does its label read?
- Show build evidence, because the label is set before the click
= Hide build evidence
- true build evidence
```

```jsx file="src/App.jsx" action="replace" anchor="        Show build evidence"
        {showEnvironment ? "Hide" : "Show"} build evidence
```

Run and click: the label switches between **Show build evidence** and **Hide build evidence**.

## Show or show nothing with &&

`condition && something` produces `something` when the condition is true and `false` when it is not, and React renders nothing for `false`.
Add the build evidence under the button.

```jsx file="src/App.jsx" action="insert-after" anchor="      </button>"
      {showEnvironment && <p role="status">Vite mode: {import.meta.env.MODE}</p>}
```

`import.meta.env.MODE` is a value Vite provides, and the lab runs our code the way `npm run dev` does, so it shows `development`.

## Read more

`aria-expanded={showEnvironment}` tells assistive technology whether the extra content is open.

Use `? :` whenever there are two possible results, whether two strings, as here, or two pieces of JSX.

React renders nothing for `false`, `null`, `undefined`, and `true`, so `&&` is the short way to say "show this only when".
`import.meta.env.MODE` is `development` under `npm run dev` and `production` in a build.
`role="status"` makes a screen reader announce the paragraph when it appears.
Our Week 10 example writes the same line as `{showEnvironment ? <p role="status">...</p> : null}`, which means the same thing; `&&` is shorter when the other branch is nothing.

There is one trap with `&&`.
React renders nothing for `false`, but it does render the number `0`.
So `{savedCount && <p>{savedCount} saved</p>}` shows a stray `0` on the page when `savedCount` is `0`.
When the condition is a number, compare it to make a true boolean: `{savedCount > 0 && <p>{savedCount} saved</p>}`.

**If it breaks:** If the page shows the word `false` or the paragraph never appears, check that the line uses `&&` and that the state variable is spelled `showEnvironment`.
If the label reads `Hide build evidence` before you click, the two strings in `? :` are in the wrong order; the first is used when the condition is true.
If the compile fails on the new line, check that the whole expression, including the `<p>` element, is inside one pair of braces.

**Check:** Click **Show build evidence**.
The label changes to **Hide build evidence** and **Vite mode: development** appears under the button.
Click again and the paragraph disappears.
Press **Run checks** to confirm.

```quiz
When `savedCount` is `0`, what does `{savedCount && <p>{savedCount} saved</p>}` put on the page?
- Nothing, because `0` is falsy
= A stray `0`
- The paragraph `0 saved`
> `&&` returns its left side when that side is falsy, and React renders the number `0` even though it skips `false`; write `savedCount > 0 &&` to get a true boolean.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";

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
  const [showEnvironment, setShowEnvironment] = useState(false);

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
      <button type="button" aria-expanded={showEnvironment} onClick={() => setShowEnvironment((visible) => !visible)}>
        {showEnvironment ? "Hide" : "Show"} build evidence
      </button>
      {showEnvironment && <p role="status">Vite mode: {import.meta.env.MODE}</p>}
    </main>
  );
}
```

</details>
