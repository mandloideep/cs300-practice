---
title: What a static host serves
mode: read
---

**We used this in:** [Tooling from scratch](#/topic/tooling-from-scratch/7) built a project into a `dist` folder; this topic puts that folder on the web.

A **static host** is a server that sends the files of one folder, exactly as they are, to any browser that asks for them by address.
That is all a built React project needs, because `npm run build` turned it into plain HTML, CSS, and JavaScript that the browser runs on its own.
Step through the picture to see `dist/` copied to a host and the address each file gets.

```demo name="static-deploy"
{ "repo": "cs300-practice", "route": "/", "notFoundPage": false }
```

## A folder at an address

GitHub Pages is a static host built into GitHub.
For a repository named `<repo>` under the account `<user>`, it serves a folder at `https://<user>.github.io/<repo>/`, and each file in the folder gets the address of its path under that one.

This site is served that way, from this repository's `dist` folder:

| File in `dist/` | Address |
| --- | --- |
| `index.html` | `https://mandloideep.github.io/cs300-practice/` |
| `assets/index-B5ij8GPh.js` | `https://mandloideep.github.io/cs300-practice/assets/index-B5ij8GPh.js` |
| `content/index.json` | `https://mandloideep.github.io/cs300-practice/content/index.json` |
| `favicon.svg` | `https://mandloideep.github.io/cs300-practice/favicon.svg` |

The letters in the script's name are a hash of its contents, so they change with every build that changes the code.
An address that ends in `/` gets the folder's `index.html`, which is why the first row needs no file name.
An address with no file behind it gets a **404 Not Found** page instead.

## What the host does, and what it does not

| A static host does | A static host does not |
| --- | --- |
| Send each file when its address is asked for | Run Node, npm, or any JavaScript of yours on the server |
| Send `index.html` for an address ending in `/` | Build the project; it serves `dist` as it is |
| Answer 404 for an address with no file | Know about your React routes |
| Serve over HTTPS, with caching, at no cost for a public repository | Keep a database or remember anything between requests |

Everything your page does, it does in the visitor's browser: React renders there, `fetch` calls APIs from there, and `localStorage` keeps data there, which is how this site keeps your progress with no server of its own.

## Why there is no server to write

A project in this course needs no server code, because every request a page makes is either for one of its own files or to an API somebody else runs, such as DummyJSON in the fetching topics.
So deploying is only copying `dist` somewhere with an address, and GitHub Pages does that for free from a repository you already have.

## Read more

### The two ways Pages publishes

GitHub Pages gets its folder in one of two ways, which the next steps use in turn.

- **Deploy from a branch** serves the files of a branch, or of its `docs/` folder, as they are; a plain page with no build step is ready that way, and [A plain page from a branch](#/topic/deploy-with-github-pages/2) does it.
- **GitHub Actions** runs a workflow you commit, which can install, build, and upload `dist`; a Vite project needs this, because `dist` is never committed, and [A workflow on every push](#/topic/deploy-with-github-pages/4) reads that workflow.

### Other static hosts

Netlify, Vercel, Cloudflare Pages, and others serve a folder the same way and add extras such as a preview address for every pull request.
What this topic teaches, a folder of files, its address, and a build that runs on every push, carries over to all of them.

**Check:** You can say what a static host sends for a file's address, for an address ending in `/`, and for an address with no file, and name two things it does not do.
Then press **Mark this step as read**.

```quiz
What does GitHub Pages need from a built Vite project?
- The `src` folder, so it can build the project
- `node_modules`, so the page can import React
= The files in `dist`, which it serves as they are
> The build has already turned the project into plain files; the host only sends them.
```

```quiz
A visitor opens `https://you.github.io/study-plan-react/`. What does the host send?
- A page that GitHub generates from `README.md`
= The `index.html` at the top of the published folder
- A 404, because the address names no file
> An address ending in `/` gets the folder's `index.html`.
```
