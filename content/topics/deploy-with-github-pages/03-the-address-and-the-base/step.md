---
title: The address and the base
mode: read
---

A project on GitHub Pages lives in a folder of the address, `/<repo>/`, not at the top of it, and two things break because of that.
A built page whose asset paths start with `/` looks for them at the top of the address and finds nothing, and a React Router route that is refreshed asks the host for a file that does not exist.
Step through the picture for the second one: watch what the host answers when a visitor refreshes on a route, with and without a `404.html`.

```demo name="static-deploy"
{ "repo": "study-plan-react", "route": "/topics/2", "notFoundPage": false }
```

## Paths that start with /

A Vite project's `index.html` loads its entry as `/src/main.jsx`, and by default the build writes the same kind of path into `dist/index.html`:

```html
<script type="module" crossorigin src="/assets/index-Bt2-u-hP.js"></script>
```

A path that starts with `/` is resolved from the top of the address, so on `https://you.github.io/study-plan-react/` the browser asks for `https://you.github.io/assets/index-Bt2-u-hP.js`, which is outside the project's folder.
The host answers 404, the script never runs, and the page is blank, with a red 404 for the script in the console.

## base: "./"

Vite's `base` option says where the built site will live, and the build writes every asset path to match it.
`base: "./"` makes the paths relative to the page:

```js
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react()],
});
```

```html
<script type="module" crossorigin src="./assets/index-Bt2-u-hP.js"></script>
```

`./assets/...` is resolved from the page's own folder, `/study-plan-react/`, so the page finds its files at any address: on Pages, under another repository name, or opened from `npm run preview`.
The `study-plan` page from the Git topics never had this problem because its `index.html` already used relative paths, `styles.css` and `src/main.js`.

## A route refreshed at Pages

A project that uses `BrowserRouter` has routes such as `/topics/2` that exist only inside React.
Clicking a link to one works, because React changes the address without asking the host for anything.
Refreshing on it, or opening it from a bookmark, sends the host a request for `/study-plan-react/topics/2`, and since `dist` has no file there, the host answers with its 404 page and React never starts.

There are two fixes.

- **`HashRouter`** in place of `BrowserRouter` puts the route after a `#`, as in `https://you.github.io/study-plan-react/#/topics/2`; the browser never sends the part after `#` to the host, which always serves `index.html`, and React reads the route from the address.
This site uses hash routing for exactly this reason, which is why its addresses look like `#/topic/git-basics/3`.
- **A `404.html` that copies `index.html`**: GitHub Pages answers a request for a missing file with the published folder's `404.html` when there is one, so a copy of `index.html` under that name starts React on any route, and React Router shows the right page.
It is one more line in the workflow, `- run: cp dist/index.html dist/404.html` after the build, but it also needs `base: "/<repo>/"` and `<BrowserRouter basename="/<repo>">` in place of `base: "./"`, because a relative path on a nested route such as `/study-plan-react/topics/2` would look for `./assets` under `/topics/`.

For a course project, `HashRouter` is the simpler choice: one word in `main.jsx` and nothing else to remember.

## What to change before a project deploys

This checklist is the whole topic in five lines; [Deploy a Vite project](#/topic/deploy-with-github-pages/5) repeats it.

1. `base: "./"` in `vite.config.js`, so that the built page finds its assets at any address; the project this topic downloads already has it.
2. The Pages source in the repository's **Settings > Pages**: **GitHub Actions** for a Vite project and **Deploy from a branch** for a plain page.
3. `HashRouter` in place of `BrowserRouter`, or a `404.html` that copies `index.html`, in a project that uses React Router.
4. A `.gitignore` with `node_modules` and `dist`, so that the installed packages and the built files are never committed.
5. Nothing secret in the project, since every file of a public repository and every built file is public; a `.env` may hold a public API address and nothing else.

## Read more

### This site's base

This site's `vite.config.js` sets `base: "/cs300-practice/"`, the repository name, rather than `"./"`.
An absolute base is the other correct choice when the address is known and fixed, and it is the one a `BrowserRouter` site with a `404.html` needs; `"./"` is the choice that works anywhere without knowing the repository name, which is why a student project uses it.

### Why secrets cannot hide in a build

Anything the browser runs, the visitor can read: the built JavaScript is a file at an address, and DevTools shows every request and its response.
An API key in the code is a public API key, which is why every API in this course is one that needs no secret.

**Check:** You can say why a built page with `/assets/...` paths is blank on Pages and what `base: "./"` changes, why a refresh on a `BrowserRouter` route returns 404, and the two fixes for it.
Then press **Mark this step as read**.

```quiz
A project with no React Router is blank on Pages, and the console shows a 404 for `/assets/index-Bt2-u-hP.js`. What does it need?
= `base: "./"` in `vite.config.js`
- `HashRouter` in place of `BrowserRouter`
- A `404.html` that copies `index.html`
> The assets are requested from the top of the address; a relative base makes the build point at the project's own folder.
```

```quiz
A project with `BrowserRouter` works until a visitor refreshes on `/topics/2`, which shows GitHub's 404 page. What is the simplest fix?
- `base: "./"` alone
= `HashRouter` in place of `BrowserRouter`
- Committing `dist` to the repository
> With a hash route, the host is only ever asked for `index.html`, and React reads the route after the `#`.
```

```quiz
Which project needs no change from the checklist's routing item?
= The plain `study-plan` page, which has no React Router
- A shop with a product page at `/products/:id`
- A blog whose posts are `BrowserRouter` routes
> Only a project that uses React Router has routes the host does not know about.
```
