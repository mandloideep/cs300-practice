---
title: Translate a semantic card to JSX
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, ConceptCard]
required: [card-from-data, link-from-data, card-component]
---

The last step puts every rule of this topic together, as the adaptation in our Week 10 Session 1 example does: we translate a semantic HTML card into JSX and fill it from a data object.
Here is the card as we would write it in plain HTML, the way we learned semantic structure in Week 3.

```html
<article class="concept-card">
  <header>
    <p class="eyebrow">Week 10, Session 1</p>
    <h2>Root rendering</h2>
  </header>
  <p>createRoot owns the application container.</p>
  <footer>
    <a href="https://react.dev/reference/react-dom/client/createRoot">Read the reference</a>
  </footer>
</article>
```

`<article>` marks content that makes sense on its own, such as one concept.
The `<header>` and `<footer>` inside it belong to the article, not to the page.
The card has one heading, an `<h2>`, because the page's `<h1>` is already in `App`.

Open `src/ConceptCard.jsx`.
We started the file with the data: a `concept` object holding each value the card shows.
`ConceptCard` currently returns `null`, which is how a component renders nothing; that is why the page looks the same as in Step 4.

Replace `return null;` with the translated card.
Type it rather than pasting the HTML, and make three changes as you go: `class` becomes `className`, each piece of text that is data becomes an expression, and the link's `href` reads the object too.

```jsx file="src/ConceptCard.jsx" action="replace" anchor="  return null;"
  return (
    <article className="concept-card">
      <header>
        <p className="eyebrow">Week {concept.week}, Session {concept.session}</p>
        <h2>{concept.name}</h2>
      </header>
      <p>{concept.summary}</p>
      <footer>
        <a href={concept.reference}>Read the reference</a>
      </footer>
    </article>
  );
```

The whole card is one root, the `<article>`, so the one-root rule from Step 2 holds without a fragment.
`className` comes from Step 3.
The parentheses let the JSX start on its own line after `return`; without them, JavaScript would end the statement at the line break and return nothing.

`href={concept.reference}` has braces and no quotes.
Quotes make an attribute a fixed string, and braces make it an expression.
`href="{concept.reference}"` would send the browser to a page literally named `{concept.reference}`.

Now render the card from `App`.
Open `src/App.jsx` and import the component under the existing import.

```jsx file="src/App.jsx" action="insert-after" anchor='import { useState } from "react";'
import ConceptCard from "./ConceptCard.jsx";
```

Then use it at the end of `<main>`, after the build evidence.

```jsx file="src/App.jsx" action="insert-after" anchor='      {showEnvironment && <p role="status">Vite mode: {import.meta.env.MODE}</p>}'
      <ConceptCard />
```

Run the page.
The card appears at the bottom with a border, its small uppercase eyebrow, the heading, the summary, and the link.
With **Boundaries** on, `ConceptCard` has its own outline inside `App`.

Change one value in the `concept` object, such as `name`, and run again.
The heading changes, and nothing else in the card needed editing.
In [Components and props](#/topic/components-and-props) we take the next step: instead of one object inside the file, `App` passes each concept to the card as props, so one component can show any concept.

**Check:** The card shows **Week 10, Session 1**, the heading **Root rendering**, the summary, and a **Read the reference** link to the React `createRoot` page.
The console shows no `Invalid DOM property` warning, and the inspector shows `ConceptCard` inside `App`.
Press **Run checks** to confirm.

**If it breaks:** If nothing new appears, check that `App.jsx` imports `ConceptCard` and uses `<ConceptCard />`, and that `return null;` is gone from the card.
If the console warns `Invalid DOM property class`, one of the two `class` attributes was not renamed.
If the link goes to a strange address, its `href` is in quotes; it must be `href={concept.reference}`.
If the result pane says `concept is not defined`, the object at the top of `ConceptCard.jsx` was deleted or renamed.

<details>
<summary>src/ConceptCard.jsx after this step</summary>

```jsx
const concept = {
  name: "Root rendering",
  week: 10,
  session: 1,
  summary: "createRoot owns the application container.",
  reference: "https://react.dev/reference/react-dom/client/createRoot"
};

export default function ConceptCard() {
  return (
    <article className="concept-card">
      <header>
        <p className="eyebrow">Week {concept.week}, Session {concept.session}</p>
        <h2>{concept.name}</h2>
      </header>
      <p>{concept.summary}</p>
      <footer>
        <a href={concept.reference}>Read the reference</a>
      </footer>
    </article>
  );
}
```

</details>

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";
import ConceptCard from "./ConceptCard.jsx";

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
      <ConceptCard />
    </main>
  );
}
```

</details>
