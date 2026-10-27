---
title: A component map for a small page
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, SiteHeader, SiteFooter]
required: [header-and-footer, tree-matches-map, landmarks-in-order]
---

Before writing a larger page, React developers sketch it as boxes and give each box a name, and nesting the boxes gives the component tree.
This step adds a site header and a footer around the catalog, each in its own file, until the inspector's tree matches the map below.
Watch the Tree view: a file on its own adds nothing until `App` imports it and uses its tag.

```predict
`src/SiteHeader.jsx` and `src/SiteFooter.jsx` already exist; when you run the starter, does the Tree view list `SiteHeader` and `SiteFooter`?
- Yes, because every file in `src/` is part of the page
= No, because `App` does not import or use them yet
- Only `SiteHeader`, because it comes first in the file list
```

Press **Run** and open the inspector's Tree view before you change anything.
Our catalog page needs a site header and a footer around what we already have.
Here is the map we are building, with `App` at the root:

```text
App
├── SiteHeader
├── main (HTML)
│   ├── CourseCard × 4
│   │   └── Card
│   └── Card (advising note)
└── SiteFooter
```

Read it top to bottom as "App contains a SiteHeader, then the main region, then a SiteFooter".
Lines marked HTML are elements, not components, so the inspector does not show them as boxes.

We created the two files for you, each holding a one-line placeholder component that draws nothing.
Open the `src/SiteHeader.jsx` tab and replace the placeholder with the header.

```jsx file="src/SiteHeader.jsx" action="replace" anchor="export default function SiteHeader() {}"
export default function SiteHeader({ siteName }) {
  return (
    <header className="site-header">
      <p className="brand">{siteName}</p>
      <p>Plan your next term</p>
    </header>
  );
}
```

The header takes the site name as a prop, so the same header could serve another department's catalog.

Open the `src/SiteFooter.jsx` tab and replace its placeholder with the footer.

```jsx file="src/SiteFooter.jsx" action="replace" anchor="export default function SiteFooter() {}"
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>Practice data for CS300. Check the official schedule before you register.</p>
    </footer>
  );
}
```

Now import both at the top of `src/App.jsx`.
The block ends with the first line of `Card`, which is already there, so the two imports and a blank line go directly above it.

```jsx file="src/App.jsx" action="replace" anchor="function Card({ children }) {"
import SiteHeader from "./SiteHeader.jsx";
import SiteFooter from "./SiteFooter.jsx";

function Card({ children }) {
```

A default export is imported without braces, and we can choose the local name.

Place the header before the main region.

```jsx file="src/App.jsx" action="insert-before" anchor="      <main>"
      <SiteHeader siteName="NEIU Computer Science" />
```

Place the footer after it.

```jsx file="src/App.jsx" action="insert-after" anchor="      </main>"
      <SiteFooter />
```

`App` now reads like the table of contents of the page: header, main content, footer.

## Read more

The process from our Week 10 reading:

1. Sketch the page and draw a box around every distinct part.
2. A part that repeats, such as a card, becomes a reusable component.
3. A part with its own job, such as a header or a footer, becomes its own component.
4. Nesting the boxes gives the component tree.

The header and footer each get their own file, the way a real Vite project keeps one component per file.
`export default` makes the function the one thing this file offers to other files, exactly like the modules we wrote in Week 8.
The import path starts with `./` because the file sits in the same folder, and it includes the extension, which the lab requires.

Each piece can change on its own; editing `SiteFooter` cannot break a `CourseCard`.

To practice the habit, move `Card` and `CourseCard` into files of their own in the same way and run again.
The page and the tree should not change at all; only the file tabs do.

**If it breaks:** A diagnostic that says a file cannot be found means the import path and the file name differ; names are case sensitive, so `./siteHeader.jsx` does not find `SiteHeader.jsx`.
If the console says `does not provide an export named 'default'`, the new file is missing `export default` before `function`.
If the header shows no site name, the `siteName` attribute in `App` and the destructured name in `SiteHeader` differ.

**Check:** Run the code.
The page has a header with the site name at the top and a footer at the bottom.
Open the inspector's Tree view and compare it with the map above: `SiteHeader`, four `CourseCard` components each with a `Card` inside, the advising `Card`, and `SiteFooter`, all inside `App`.
Turn on Boundaries and click the footer's box; the editor opens `src/SiteFooter.jsx`.

```quiz
Which line imports the component that `SiteHeader.jsx` exports with `export default`?
= `import SiteHeader from "./SiteHeader.jsx";`
- `import { SiteHeader } from "./SiteHeader.jsx";`
- `import SiteHeader from "SiteHeader";`
> A default export is imported without braces under a name you choose, and a file of your own is found by a path that starts with `./`; braces ask for a named export, which this file does not have.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import SiteHeader from "./SiteHeader.jsx";
import SiteFooter from "./SiteFooter.jsx";

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
      <SiteHeader siteName="NEIU Computer Science" />
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
      <SiteFooter />
    </div>
  );
}
```

</details>

We used components and props throughout this topic; the next topic, [Lists and keys](#/topic/lists-and-keys), stops writing one tag per course and renders the cards from an array.
