---
title: Follow index.html to main.jsx to App.jsx
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App]
required: [outside-root, main-ran, app-inside-root]
---

The editor holds the same files as the project you created in Step 1: `index.html`, `styles.css`, `src/main.jsx`, and `src/App.jsx`.
The lab runs them in the browser without Vite, so `package.json`, `vite.config.js`, and `node_modules` are not here; they matter only on your computer.
Your generated files may use single quotes and leave out semicolons, while ours use double quotes and semicolons like the rest of our course code; JavaScript reads both the same way.

Three files hand the page to each other in a chain:

```text
index.html     has <div id="root"></div> and loads /src/main.jsx
    ↓
src/main.jsx   finds #root and renders <App /> into it
    ↓
src/App.jsx    the component that describes what appears inside #root
```

We prove each link with one small edit and watch where each edit shows up.

## index.html

Open `index.html`.
It is a complete HTML document, and its body holds only two things: an empty `<div id="root"></div>` and a `<script type="module">` that loads `/src/main.jsx`.
Everything React draws goes inside that empty div.
Anything else in the body is ordinary HTML that React never touches.
Add a paragraph above the root to see the difference.

```html file="index.html" action="insert-before" anchor='    <div id="root"></div>'
    <p id="outside">This paragraph comes from index.html, outside the root.</p>
```

Run the page.
The paragraph appears above the welcome content, and with the inspector's **Boundaries** view on, it has no component outline, because no component rendered it.

## src/main.jsx

Open `src/main.jsx`.
It imports `StrictMode` from `react`, `createRoot` from `react-dom/client`, and our `App` component from `./App.jsx`.
The last statement finds the root element, makes it a React root with `createRoot`, and renders `<App />` into it.
`StrictMode` renders nothing of its own; in development it runs extra checks that warn us about common mistakes.
Add one line just before that last statement so the console shows the moment `main.jsx` runs.

```jsx file="src/main.jsx" action="insert-before" anchor='createRoot(document.getElementById("root")).render('
console.log("main.jsx found", document.getElementById("root"));
```

Run again and open the console pane.
It prints `main.jsx found` followed by the root div, which proves two links at once: `index.html` loaded `main.jsx`, and `main.jsx` found the element that `index.html` provided.
You will rarely edit `main.jsx` again; almost all of our work happens in `App.jsx` and the components it uses.

## src/App.jsx

Open `src/App.jsx`.
`App` is a function component: it keeps a `count` in state with `useState`, and it returns the JSX for the welcome section and the counter.
`export default App;` at the bottom is what lets `main.jsx` write `import App from "./App.jsx";`.
Change the heading to name the file it comes from.

```jsx file="src/App.jsx" action="replace" anchor="        <h1>Get started</h1>"
        <h1>Hello from App.jsx</h1>
```

Run the page.
The heading changes, and it appears inside the `App` outline in the inspector, inside `#root`, below the paragraph from `index.html`.
On your computer the same edit appears the moment you save, without pressing anything, because the Vite development server sends the change to the browser.

**Check:** The result shows the paragraph from `index.html` above the heading **Hello from App.jsx**, the console shows `main.jsx found` with the root div, and the inspector tree shows `App`.
Press **Run checks** to confirm.

**If it breaks:** If the paragraph appears below the counter, it was placed after `<div id="root"></div>` instead of before it.
If the console is empty, the `console.log` line is inside the `render(` call; it must sit on its own line just above `createRoot`.
If the page is blank and the console mentions `Target container is not a DOM element`, the `id="root"` in `index.html` no longer matches `getElementById("root")` in `main.jsx`.

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
