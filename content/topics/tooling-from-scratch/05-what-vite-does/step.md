---
title: What Vite does
mode: read
---

This step says what Vite, the tool every React project in this course runs on, does with the files you write, first while you work and then when you finish.
It has two commands, and each answers the problem from the last step in its own way.
Read it with the last step's bare import in mind: every job below exists because the browser follows only addresses and reads only JavaScript.

```demo name="dev-server-vs-build"
```

## Two commands

A Vite project's `package.json` has the three scripts you added two steps ago.

| Script | Command | What it is for |
| --- | --- | --- |
| `npm run dev` | `vite` | A development server on your computer while you write code |
| `npm run build` | `vite build` | The finished site, as plain files in a `dist` folder |
| `npm run preview` | `vite preview` | A server for `dist`, so you can look at the build before you put it online |

## The development server

`npm run dev` starts a small web server, usually at `http://localhost:5173/`, and leaves it running in the terminal.
When the browser asks it for `index.html`, it sends the file nearly as it is, and the page's `<script type="module" src="/src/main.jsx">` asks for `main.jsx`.

That is where Vite works, one file at a time, at the moment the browser asks:

- It **transforms** the file: JSX becomes plain function calls, which the next step shows you, because no browser reads JSX.
- It **rewrites bare imports** into addresses: `from "react"` becomes a path to a copy of React that Vite prepared when the server started, under `node_modules/.vite/deps/`, which solves the last step's problem without your writing a single path.
- It **sends a native module**, which the browser runs as it would any `<script type="module">`, and the browser then asks for the files that one imports, and so on down the graph.

Vite does not bundle your own files while you work.
Each file is transformed only when the browser asks for it, so the server starts in well under a second however large the project grows, and only the packages in `node_modules` are prepared ahead of time, once, because there are many of them and they rarely change.

When you save a file, Vite notices, transforms just that file again, and tells the open page over a live connection to swap in the new version.
This is **hot module replacement**, the `HMR` on the Vite welcome page: with the React plugin, the component on the screen changes and keeps its state, with no reload.

```predict
You change one line of `App.jsx` and save while `npm run dev` is running; what does Vite do?
- It rebuilds the whole project into `dist/` and reloads the page
= It transforms only `App.jsx` again and sends the page the new version
- Nothing, until you reload the page yourself
```

Vite sends only the new `App.jsx`, which is why the change appears almost before your hand leaves the keyboard.

## The build

The development server is not a way to put a site online: it needs your computer, it transforms on every request, and a real page with hundreds of modules would make hundreds of requests.

`npm run build` does the other job, once.
It starts at `index.html`, follows every import through your files and through the packages they use, the **module graph** in the picture below, transforms them, joins them into a few files, removes the spaces and shortens the names, and writes the result to `dist/`.

```demo name="module-graph"
```

```text
dist/
  index.html
  assets/
    index-B7xq3cTz.js
    index-D4pQ1mWa.css
```

The odd letters in each name are a **hash** of the file's contents, so a changed file gets a new name and a browser that cached the old one cannot show it by mistake.
`dist/` is plain HTML, CSS, and JavaScript with no JSX, no bare imports, and no `node_modules`; any static host, such as GitHub Pages, which hosts this lab, can serve it.

## Read more

### The tools inside Vite

Vite is a coordinator, and the work is done by tools it installs as its own dependencies, the ones you counted in the lockfile.
In Vite 8, the version this course uses, **Rolldown** bundles, both for the build and for preparing the packages in `node_modules/.vite/deps/`, and **Oxc** transforms JSX and TypeScript; both are written in Rust, which is why they arrive as the platform packages you found in the lockfile.
Earlier versions of Vite used **esbuild** for the transforms and the preparation and another bundler, Rollup, for the build, and you will meet both names in tutorials; the next step says what esbuild does, because it set the standard these tools follow.
A project's `vite.config.js` chooses plugins, such as `@vitejs/plugin-react`, which adds the React parts of the transform and the state-keeping hot replacement.

### The lab does the development job too

This lab is a development server that runs inside your browser instead of on your computer.
When you press **Run**, it transforms each file of the workspace with a small transformer called Sucrase, gives each module an address of its own, maps the bare names `react`, `react-dom`, and `react-router` to copies of React it ships with, and loads the result into the result pane.
That is why the lab can import `react` but not `study-format`: it plays Vite's part, with a fixed list of packages instead of a `node_modules` folder.

**If it breaks:** If `npm run dev` on your computer prints `vite: command not found`, the packages are not installed in that folder; run `npm install` there first.
If the page at the printed address is blank, open the browser's console with F12; a red error names the file and line, as in the lab.
If a change does not appear after you save, check that the terminal running `npm run dev` is still open and shows no error.

**Check:** You can say, in one sentence each, what `npm run dev` does when the browser asks for a `.jsx` file, and what `npm run build` writes into `dist/`.
Then press **Mark this step as read**.

```quiz
Why does `npm run dev` start fast even in a large project?
- It skips the transform and sends JSX to the browser
= It transforms each file only when the browser asks for it, and prepares only the packages ahead of time
- It reuses the `dist/` folder from the last build
> The development server works on demand, one module per request, so its start time does not grow with the number of files you wrote.
```

```quiz
What is in `dist/` after `npm run build`?
- Your source files with JSX, ready for a server to transform
= Plain HTML, CSS, and JavaScript in a few files with hashed names
- A copy of `node_modules` for the server to use
> The build follows the module graph, transforms and joins everything, and writes files any static host can serve without Node or npm.
```
