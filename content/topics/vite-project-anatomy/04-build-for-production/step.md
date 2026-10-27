---
title: Build the project and read dist
mode: local
---

This step asks Vite to **build** the project into plain files in a `dist` folder that any static host, such as GitHub Pages, can serve.
Watch how `dist/index.html` differs from the `index.html` you edited, and why the file names in `dist/assets` carry a string of letters.

```demo name="dev-server-vs-build"
```

This step runs in your own terminal, in the project folder from Step 1.
If you followed Steps 2 and 3 only in the lab, use the workspace download on this step, which is that project with the edits from Steps 2 and 3 already made; unzip it and run `npm install` first.

## Build

Stop the development server with `Ctrl+C` if it is running, then build.

```bash
npm run build
```

```text
> my-first-react@0.0.0 build
> vite build

vite v8.2.4 building client environment for production...
transforming...
✓ 17 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.47 kB │ gzip:  0.31 kB
dist/assets/index-CjQ7w0Ld.css    0.70 kB │ gzip:  0.39 kB
dist/assets/index-Bd5MmS7H.js   190.87 kB │ gzip: 60.13 kB

✓ built in 220ms
```

Your sizes, times, and the letters in the file names will differ slightly; the shape of the output is what matters.
Each `dist/` line in the output is one file Vite wrote, with its size and its size after gzip compression.

## What dist contains

The build created a new `dist` folder:

```text
dist/
  index.html
  assets/
    index-Bd5MmS7H.js
    index-CjQ7w0Ld.css
```

Open `dist/index.html` in your editor and compare it with the `index.html` you edited.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>my-first-react</title>
    <script type="module" crossorigin src="/assets/index-Bd5MmS7H.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-CjQ7w0Ld.css">
  </head>
  <body>
    <p id="outside">This paragraph comes from index.html, outside the root.</p>
    <div id="root"></div>
  </body>
</html>
```

The paragraph and the empty root are exactly what we wrote, but the `<script>` and the stylesheet link now point at files in `assets`.
Open the `.js` file and search it for `main.jsx found`: our `console.log` text is inside.

## Preview the build

Serve `dist` locally the way a static host would.

```predict
While `npm run preview` is running, you change the heading in `src/App.jsx` and save; what does the preview page show?
- The new heading, at once, as with `npm run dev`
- An error, because the source and the build no longer match
= The old heading, until you run `npm run build` again
```

```bash
npm run preview
```

```text
  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
```

Open the address.
The page looks the same as with `npm run dev`, but it is now served from `dist`.
Stop the preview server with `Ctrl+C`.

## Read more

### Why build at all

`npm run dev` is for working: it serves our source files, compiles each one when the browser asks for it, and pushes changes as we save.
A real host cannot run that development server for every visitor, so before we deploy we build the project into plain files.

### The build output

`npm run build` runs the `build` script in `package.json`, which is `vite build`.
**Modules transformed** counts every file Vite compiled, including the React and React DOM files inside `node_modules`, not only our own files.
The size after gzip is roughly what a visitor downloads.

### The bundle and the content hash

The `<script>` in `dist/index.html` no longer points at `/src/main.jsx`; it points at one JavaScript file in `assets`, and Vite moved it into the head.
The stylesheet link now points at one CSS file in `assets` as well.

`assets/index-Bd5MmS7H.js` is a **bundle**: `main.jsx`, `App.jsx`, `Greeting.jsx`, and the production build of React joined into one file, with the JSX already turned into JavaScript and the spaces and long names squeezed out.
Open it and you will see one very long line.
The production build of React is smaller and faster than the development build, and it leaves out the development warnings that the lab and `npm run dev` show us.

The letters after `index-` are a **content hash**, a short fingerprint of the file's contents.
Change any source file and build again, and that name changes.
A browser that cached the old file therefore fetches the new one, because to the browser it is a different file.

`dist` is generated output.
We never edit it by hand, and the project's `.gitignore` lists it so that Git does not track it; we rebuild it whenever the source changes.
That is also why the preview shows the old page after a source edit: it serves `dist`, and `dist` changes only when you build.

**If it breaks:** `Missing script: "build"` means the terminal is not in the project folder, or `package.json` lost its `scripts` section.
If the build stops with an error that names a file and a line, the same mistake would break `npm run dev`; fix it in that file and build again.
If you open `dist/index.html` by double-clicking it, the page is blank, because the browser will not load the bundle from a file address; use `npm run preview` instead.

**Check:** After `npm run build`, the `dist` folder contains `index.html` and an `assets` folder with one `.js` and one `.css` file, and `npm run preview` shows **My first component** with three greetings at `http://localhost:4173/`.
Change the heading in `src/App.jsx`, run `npm run build` again, and confirm that the name of the `.js` file in `dist/assets` changed.

```quiz
Why does the name of the `.js` file in `dist/assets` change after you edit a source file and build again?
- Vite numbers each build, so every build gets a new name
- The name records the date and time of the build
= The letters are a content hash, a fingerprint of what the file contains
> A new name for new contents means a browser that cached the old bundle cannot reuse it by mistake; an unchanged file keeps its name and stays cached.
```
