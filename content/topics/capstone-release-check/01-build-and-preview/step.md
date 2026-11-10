---
title: Build the release candidate and preview it
mode: local
---

**We used this in:** [Vite project anatomy](#/topic/vite-project-anatomy/4) built a project into `dist` and previewed it; this topic does the same to a whole app and then checks it the way a visitor would use it.

A **release candidate** is the version you would hand in if nothing else changed, and a **release check** is the short list of things you try on it before you do.
Everything in the check runs on the built site, not on `npm run dev`, because the built site is what GitHub Pages serves and what the grader opens.
Step through the session first; your counts, sizes, and hashes will differ.

```demo name="terminal"
{
  "cwd": "shop-release",
  "commands": [
    {
      "command": "npm install",
      "output": [
        "added 112 packages, and audited 113 packages in 2s",
        "",
        "26 packages are looking for funding",
        "  run `npm fund` for details",
        "",
        "2 moderate severity vulnerabilities",
        "",
        "To address all issues, run:",
        "  npm audit fix --force",
        "",
        "Run `npm audit` for details."
      ],
      "note": "React, React Router, Vite, Vitest, and Testing Library, at the versions the Capstone starter uses. The audit warning is about the test tools; leave it alone, as the Capstone brief says."
    },
    {
      "command": "npm run build",
      "output": [
        "> shop-release@0.0.0 build",
        "> vite build",
        "",
        "vite v8.3.5 building client environment for production...",
        "transforming...",
        "✓ 78 modules transformed.",
        "rendering chunks...",
        "computing gzip size...",
        "dist/index.html                   0.41 kB │ gzip:  0.26 kB",
        "dist/assets/index-Bin6kMC1.css    2.52 kB │ gzip:  0.90 kB",
        "dist/assets/index-BD1TTuUU.js   229.71 kB │ gzip: 73.63 kB",
        "",
        "✓ built in 66ms"
      ],
      "note": "A clean build: no error and no warning. dist also holds a data folder, copied from public/data, which the build does not list."
    },
    {
      "command": "npm run preview",
      "output": [
        "> shop-release@0.0.0 preview",
        "> vite preview",
        "",
        "  ➜  Local:   http://localhost:4173/shop-release/",
        "  ➜  Network: use --host to expose"
      ],
      "note": "The address ends in /shop-release/, the base in vite.config.js, exactly as the site will on GitHub Pages under its repository name."
    }
  ]
}
```

This step happens in a terminal and a browser on your own computer, not in this site.

## Download and build

Press **Download this workspace**, unzip it, and open the folder in Visual Studio Code.
It is a small shop built the way the Capstone starter is built: `BrowserRouter` with `basename={import.meta.env.BASE_URL}` in `src/main.jsx`, a `useFetch` hook, its data in `public/data/`, three Vitest tests, and the GitHub Pages workflow.
Keep working in this folder for the whole topic; each later step's download is the same project as that step starts, for anyone who skipped one.

Run `npm install` and then `npm run build` in the terminal, as in the session.
A release check starts with a clean build, so read the output: a warning here is a finding, even when the build finishes.

```demo name="project-tree"
stage: In the download
shop-release/         The release candidate, as the download unzips
  .github/
    workflows/
      deploy.yml      Builds, copies index.html to 404.html, and publishes dist on every push to main
  public/
    data/             products.json, empty.json, and incomplete.json, served as files
  src/                The components, the useFetch hook, api.js, and App.test.jsx
  RELEASE-CHECK.md    The record you fill in during this topic
  vite.config.js      base: "/shop-release/", and the test setup for Vitest
stage: After npm install
+ node_modules/       Every installed package; never committed
+ package-lock.json   The exact versions; committed, because the workflow runs npm ci
stage: After npm run build
+ dist/               The built site
+   index.html        The page, loading the bundle from /shop-release/assets/
+   assets/           One JavaScript and one CSS file with a content hash in each name
+   data/             The three data files, copied from public/data as they are
```

## Preview it

Run `npm run preview` and open `http://localhost:4173/shop-release/`.
The preview server sends the files in `dist`, as GitHub Pages will, so what you see is the release, not the source.

```predict
The preview is running, and you change the heading in `src/App.jsx` and save. What does a reload of the preview show?
- The new heading, because Vite watches the source
= The old heading, until you run `npm run build` again
- A blank page, because `dist` no longer matches the source
```

Open `RELEASE-CHECK.md` in Visual Studio Code and fill in the first two rows: the build and the preview, each with what you did, what you expected, and what you saw.
Write the latest commit hash at the top if the folder is a repository, and the date.

## Read more

### Why a release check runs on the build

`npm run dev` and the built site are two different programs.
The development server compiles each file when the browser asks for it, shows React's development warnings, and answers every address with `index.html`.
The build is minified, has no development warnings, takes every path from `base`, and is served by a host that knows nothing about your routes.
A bug that lives in that difference shows only in the build, which is why the Capstone's ninth verification case is "Production deployment from a clean build".

### The base in the address

`vite.config.js` sets `base: "/shop-release/"`, so every asset path in `dist/index.html` starts with `/shop-release/`, and `import.meta.env.BASE_URL` is `/shop-release/` in the code.
`src/main.jsx` passes it to `BrowserRouter` as `basename`, so the router reads `/shop-release/products/3` as the route `/products/3`, and `src/api.js` puts it in front of `data/products.json`.
The Capstone's deployment section asks for the same three things with your repository's name; [The address and the base](#/topic/deploy-with-github-pages/3) explains why.

### What preview does that Pages does not

The preview server answers an address with no file behind it, such as `/shop-release/products/3`, with `index.html`, so React starts and the router shows the page.
GitHub Pages answers the same address with `404.html`, which is why the workflow copies `index.html` to that name.
A route that refreshes well in the preview therefore also needs that copy, or `HashRouter`, once it is deployed.

**If it breaks:** `Missing script: "preview"` means the terminal is not in the project folder.
`Port 4173 is in use` means an earlier preview is still running in another terminal; stop it with **Ctrl+C**, or open the address the new one printed.
A blank page with a 404 for a file under `/assets/` means the address is missing `/shop-release/`; open the exact address the preview printed.

**Check:** `npm run build` finished with no error or warning, `dist` holds `index.html`, `assets`, and `data`, and `http://localhost:4173/shop-release/` shows **Welcome to the shop** with Home marked in the navigation.
The first two rows of `RELEASE-CHECK.md` are filled in.
Then press **I did this on my computer**.

```quiz
Why does the release check run on `npm run preview` and not on `npm run dev`?
- The preview is faster to start
= The preview serves the built `dist`, which is what visitors and the grader get
- `npm run dev` cannot open routes such as `/products/3`
> The development server compiles the source on demand; the built site is a different set of files, and only it is deployed.
```
