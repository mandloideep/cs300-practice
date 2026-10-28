---
title: Run it on your computer
mode: local
---

This step runs the whole topic for real, on your own computer: you install a project's packages, start Vite, and build the project for production.
The project is the study timer from the earlier steps, and its one script imports the `ms` package by its bare name, which this site could not do.
Watch each command create the files the earlier steps read: `node_modules`, `package-lock.json`, and `dist`.

```demo name="terminal"
```

This step happens in a terminal, not on this site.
Open Visual Studio Code, open a terminal with `` Ctrl+` `` or **Terminal > New Terminal**, and keep this page beside it.

## Check Node

Every command in this step is a program that runs in Node.

```bash
node -v
```

You should see a version that starts with `v24`, the version our course uses.
If the command is not found, install the LTS version from [nodejs.org](https://nodejs.org/), close the terminal, and open a new one, so that it finds the new program.
Installing Node also installs `npm`; `npm -v` prints its version.

## Download and open the project

Press **Download this workspace** on this step, unzip the file, and open the unzipped folder in Visual Studio Code with **File > Open Folder**.
Open a terminal there; it starts inside the project folder.

Look at what is in the folder before anything is installed: `index.html`, `styles.css`, `src/main.js`, `package.json`, and a `.gitignore`.
There is no `node_modules` and no `package-lock.json` yet.
Open `package.json`: one dependency, `"ms": "2.1.3"`, and one development dependency, `"vite": "8.2.4"`, both pinned to exact versions with no caret.
Open `src/main.js`: its first line is `import ms from "ms";`, a bare specifier, which the browser cannot resolve on its own.

## Install

```bash
npm install
```

npm reads `package.json`, works out every package those two need, downloads them, and prints a summary such as this one:

```text
added 16 packages, and audited 17 packages in 902ms

found 0 vulnerabilities
```

```predict
`package.json` names two packages; how many folders does `node_modules` hold after `npm install`?
- Two
= About fifteen
- Forty-one, one for every package in the lockfile
```
About fifteen: the packages Vite needs and the one platform package of Rolldown and of Lightning CSS that matches your computer, which is why the count in the summary depends on your system.
`package-lock.json` now exists too; open it and search for `"node_modules/rolldown"`, and you will find the same kind of entry you read on this site, this time with the download address and the checksum.

## Start the development server

```bash
npm run dev
```

```text
  VITE v8.2.4  ready in 324 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

The time differs on every computer.
Open the **Local** address: the page shows `Planned today: 3 hours` and three sessions, `30m is 1800 seconds`, `1h is 3600 seconds`, and `1.5h is 5400 seconds`, all computed by `ms`.

Now see the bare import being solved.
Press F12 to open the browser's DevTools, choose the **Network** tab, and reload the page.
Among the requests are `main.js` and one for `ms.js` from `/node_modules/.vite/deps/`, with a `?v=` and a few letters after it.
Click `main.js` and choose **Response**: its first line is no longer `import ms from "ms"`, but an import from that address, written by Vite before the browser saw the file.
`ms` is a CommonJS package, so Vite also converted it into a module when the server started, which is the third bundler job from the "Why a bundler" step.

Edit `src/main.js` while the server runs: add `"2h"` to the end of the `sessions` array and save.
The page updates on its own, with a fourth session, `2h is 7200 seconds`, and the total `Planned today: 5 hours`.
Leave the server running, or stop it with `Ctrl+C`; the next command does not need it.

## Build for production

```bash
npm run build
```

```text
✓ 6 modules transformed.
dist/index.html                 0.47 kB │ gzip: 0.29 kB
dist/assets/index-BlHQLFJT.css  0.38 kB │ gzip: 0.24 kB
dist/assets/index-DFl-Cbvq.js   2.90 kB │ gzip: 1.37 kB
✓ built in 194ms
```

The letters in the file names are hashes of their contents, so yours differ.
Open `dist/assets/` and the `.js` file in it.
It is one line: your code and the code of `ms`, joined and shortened, with no `import` left in it, because the bundler followed the import and put the package inside.
That file and `dist/index.html` are all a web host needs; nothing in `dist` refers to `node_modules`.

Serve the build to look at it:

```bash
npm run preview
```

Open the address it prints, usually `http://localhost:4173/`, and the page looks exactly as it did under `npm run dev`, now made of the finished files.

## Read more

### Where this goes next

You have now run every tool this topic described: Node runs npm and Vite, npm turns `package.json` into `node_modules` and a lockfile, and Vite solves bare imports while you work and bundles everything when you build.
A React project is the same project with two more packages, `react` and `react-dom`, a plugin for JSX, and `.jsx` files, and [Vite project anatomy](#/topic/vite-project-anatomy) starts there, by creating one with `npm create vite`.

**If it breaks:** `node: command not found` or `npm: command not found` means Node is not installed, or the terminal was opened before installing it; open a new terminal.
`npm error enoent Could not read package.json` means the terminal is not in the project folder; open the folder itself in Visual Studio Code, not the folder above it.
`vite: command not found` after `npm run dev` means `npm install` did not finish; run it again and read the last lines it prints.
If port 5173 is busy, Vite picks the next free port and prints it; open the address it prints.
If the page is blank, open DevTools and read the red line in the **Console** tab.
`Failed to resolve module specifier "ms"` means the page was served by something other than Vite, such as Live Server, and a CORS error means `index.html` was opened straight from the folder; open the address `npm run dev` printed instead.

**Check:** `npm run dev` prints a **Local** address and the page there shows three sessions and `Planned today: 3 hours`, the Network tab shows a request for `ms.js` under `/node_modules/.vite/deps/`, and `npm run build` writes a `dist` folder with one `.js` file in `assets`.
Then press **I did this on my computer**.

```quiz
After `npm run build`, which folder do you put on a web host?
- The project folder, with `node_modules`
= `dist`
- `src`, because it holds your code
> `dist` holds the finished, bundled site; the host needs nothing else, not Node, not npm, and not `node_modules`.
```
