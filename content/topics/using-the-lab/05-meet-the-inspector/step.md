---
title: Meet the inspector
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, tree]
  watch: [App, Tally]
required: [two-tallies, each-has-state, click-changes-one]
---

This step adds a second counter to the page and uses the inspector to watch what a click changes.
The inspector draws the parts of a page that the result alone does not show: which component drew each region, which ones ran again after a click, and the values each one remembers.
Keep one eye on the result and one on the inspector pane while you click.

```demo name="inspector-tour"
```

The starter has something new at the bottom of the page: a **Runs** button with `Count: 0` beside it.
In the code, `Tally` is a **component**, a function that returns a piece of the page, and `<Tally label="Runs" />` near the end of `App` places one on the page.
Each tally remembers its own count with `useState`, which the React weeks teach properly; for now it is enough to know that the number is a value the component keeps.

Add a second tally under the first.

```jsx file="src/App.jsx" action="insert-after" anchor='      <Tally label="Runs" />'
      <Tally label="Checks" />
```

Run the code.
The page has two tallies, made by the same function, each with its own label.
**Runs** reads `Count: 0` and **Checks** reads `Count: 1`, because the checks pressed the **Checks** button once to test it, as they pressed the button in the last two steps.

## Three views of one page

The inspector pane has a row of toggle buttons, and this step opens three of them.

**Boundaries** draws an outline around each component in the result pane, with its name on a small label: one `App` around everything and one `Tally` around each counter.
Click a label in the result and the editor jumps to the line of JSX that placed that component.

**Tree and state** lists the components as a tree, `App` with two `Tally` children, and pins the ones this step watches, `App` and `Tally`, under **Watching** at the top.
Under each `Tally` it shows its props, `label "Runs"` for the first, and its state, `0` for the first and `1` for the second.
Selecting a component in the tree opens the line of code that declares it.

**Re-render flash** briefly highlights each component that ran again after a change.

```predict
You press **Checks**; which parts of the page flash?
- The whole `App`, because the page changed
- Both tallies, because they come from the same function
= Only the **Checks** tally
```

Run the code once more so that the lab can reveal the answer, then press **Checks** and watch.
Only that tally flashes, its count goes up by one, and in the tree its state goes up with it while the **Runs** tally still reads `0`.
That is the first idea of the React weeks in one picture: a change runs again only the component that owns the changed value.

## Read more

The other toggles, **Flow trace** and **DOM**, are for later topics; you can turn any view on or off at any time, and the step remembers nothing about it.
The inspector works on plain pages too: there it shows the **DOM** view, the elements of the page, which the JavaScript and DOM topics use.

**If it breaks:** If only one tally shows, the new line went somewhere else or the label has a typo that leaves the tag unclosed; it needs the space and the `/>` at the end.
If the result says **Did not compile** with `Expected corresponding JSX closing tag`, the line is missing its `/`.
If the inspector pane says it has no components yet, wait for the status pill to read **Ready** and run again.

**Check:** Run the code.
The page shows two tallies, **Runs** at `Count: 0` and **Checks** at `Count: 1`, and the inspector tree shows `App` with two `Tally` components.
Press **Checks** twice: its count reads 3, the **Runs** count still reads 0, and only the **Checks** tally flashes each time.

```quiz
Which inspector view shows the values a component remembers?
- Boundaries
= Tree and state
- Re-render flash
> Boundaries outlines each component and Re-render flash marks what ran again; the values live in Tree and state, under each component.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";

console.log("App.jsx ran once, when the page loaded.");

function Tally({ label }) {
  const [count, setCount] = useState(0);

  return (
    <p className="counter">
      <button type="button" onClick={() => setCount(count + 1)}>
        {label}
      </button>
      <span>Count: {count}</span>
    </p>
  );
}

export default function App() {
  function handleClick() {
    console.log("The button was clicked.");
  }

  return (
    <main>
      <h1>My first week in the lab</h1>
      <p>This page is a small React app, and I just changed it.</p>
      <ul className="plan">
        <li>Read the explanation</li>
        <li>Type the edit</li>
        <li>Run and look</li>
        <li>Read the checks</li>
      </ul>
      <button type="button" onClick={handleClick}>Say hello to the console</button>
      <h2>Next up</h2>
      <p>The inspector, which shows the parts of this page.</p>
      <Tally label="Runs" />
      <Tally label="Checks" />
    </main>
  );
}
```

</details>
