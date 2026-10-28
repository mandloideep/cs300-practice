---
title: Follow index.html to main.jsx to App.jsx
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App]
required: [outside-root, main-ran, app-inside-root]
---

This step follows the chain of three files that hand the page to each other: `index.html`, then `src/main.jsx`, then `src/App.jsx`.
Each file gets one small edit, and you watch where each edit shows up: in the result, in the console, or inside a component outline.

```predict
After you add a paragraph to `index.html` above the root and run with Boundaries on, how does it appear?
- Inside the `App` outline, above the heading
- It does not appear, because React controls the whole page
= Above the welcome content, with no component outline
```

The editor holds the same files as the project you created in Step 1: `index.html`, `styles.css`, `src/main.jsx`, and `src/App.jsx`.

```text
index.html     has <div id="root"></div> and loads /src/main.jsx
    ↓
src/main.jsx   finds #root and renders <App /> into it
    ↓
src/App.jsx    the component that describes what appears inside #root
```

## index.html

Open `index.html`: its body holds only an empty `<div id="root"></div>` and a `<script type="module">` that loads `/src/main.jsx`.
Add a paragraph above the root to see the difference between what React draws and what it does not.

```html file="index.html" action="insert-before" anchor='    <div id="root"></div>'
    <p id="outside">This paragraph comes from index.html, outside the root.</p>
```

Run the page with the inspector's **Boundaries** view on and find the new paragraph.

## src/main.jsx

Open `src/main.jsx`: its last statement finds the root element, makes it a React root with `createRoot`, and renders `<App />` into it.
Add one line just before that last statement so the console shows the moment `main.jsx` runs.

```jsx file="src/main.jsx" action="insert-before" anchor='createRoot(document.getElementById("root")).render('
console.log("main.jsx found", document.getElementById("root"));
```

Run again and open the console pane: `main.jsx found` followed by the root div proves that `index.html` loaded `main.jsx` and that `main.jsx` found the root.

## src/App.jsx

Open `src/App.jsx`: `App` keeps a `count` in state and returns the JSX for the welcome section and the counter.
Change the heading to name the file it comes from.

```jsx file="src/App.jsx" action="replace" anchor="        <h1>Get started</h1>"
        <h1>Hello from App.jsx</h1>
```

Run the page: the heading changes inside the `App` outline, inside `#root`, below the paragraph from `index.html`.

## Read more

### What this site leaves out

This site runs these files in the browser without Vite, so `package.json`, `vite.config.js`, and `node_modules` are not in the editor; they matter only on your computer.
Open **On your computer** at the bottom of the file tree to see them, with a line on what each one is for.
Your generated files may use single quotes and leave out semicolons, while ours use double quotes and semicolons like the rest of our course code; JavaScript reads both the same way.

### index.html

`index.html` is a complete HTML document.
Everything React draws goes inside the empty root div.
Anything else in the body is ordinary HTML that React never touches, which is why the paragraph has no component outline: no component rendered it.

### src/main.jsx

`main.jsx` imports `StrictMode` from `react`, `createRoot` from `react-dom/client`, and our `App` component from `./App.jsx`.
`StrictMode` renders nothing of its own; in development it runs extra checks that warn us about common mistakes.
You will rarely edit `main.jsx` again; almost all of our work happens in `App.jsx` and the components it uses.

### src/App.jsx

`App` is a function component that keeps its `count` with `useState`.
`export default App;` at the bottom is what lets `main.jsx` write `import App from "./App.jsx";`.
On your computer the heading edit appears the moment you save, without pressing anything, because the Vite development server sends the change to the browser.

**If it breaks:** If the paragraph appears below the counter, it was placed after `<div id="root"></div>` instead of before it.
If the console is empty, the `console.log` line is inside the `render(` call; it must sit on its own line just above `createRoot`.
If the page is blank and the console mentions `Target container is not a DOM element`, the `id="root"` in `index.html` no longer matches `getElementById("root")` in `main.jsx`.

**Check:** The result shows the paragraph from `index.html` above the heading **Hello from App.jsx**, the console shows `main.jsx found` with the root div, and the inspector tree shows `App`.
Press **Run checks** to confirm.

```quiz
Which line lets `main.jsx` write `import App from "./App.jsx";`?
- `<div id="root"></div>` in `index.html`
- `createRoot(document.getElementById("root"))` in `main.jsx`
= `export default App;` at the bottom of `App.jsx`
> A file shares a value only by exporting it; `export default` is the one value an `import` without braces receives.
```

<details>
<summary>index.html after this step</summary>

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>my-first-react</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <p id="outside">This paragraph comes from index.html, outside the root.</p>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

</details>

<details>
<summary>src/main.jsx after this step</summary>

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

console.log("main.jsx found", document.getElementById("root"));
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

</details>
