---
title: Create the project on your computer
mode: local
---

**We used this in:** [The React mental model](#/topic/react-mental-model) wrote React components in CS300 Practice; now we set up the same kind of project on your own computer.

This step creates a React project with **Vite** in your own terminal, installs it, and starts its development server.
Watch what each command prints: it tells you whether the command worked before you move to the next one.

```demo name="terminal"
```

This step runs in your own terminal, not on this site.
Open Visual Studio Code, open a terminal with `` Ctrl+` `` or **Terminal > New Terminal**, and move to the folder where you keep your course work.

## Check Node first

Vite runs on Node.js, so confirm Node is installed.

```bash
node -v
```

You should see a version that starts with `v24`, such as `v24.19.0`, the version our course uses.
If the command is not found, install the LTS version from [nodejs.org](https://nodejs.org/) and open a new terminal.

## Create the project

Run the command from our Week 10 Session 1 notes.

```bash
npm create vite@latest my-first-react -- --template react
```

The creator asks two questions.
For **Which linter to use?**, press Enter to keep the first choice; we do not use the linter in this topic.
For **Install with npm and start now?**, press the right arrow key to select **No** and then Enter, so that we run each command ourselves and see what each one does.

You should then see output like this, with your own folder path:

```text
◇  Scaffolding project in /Users/you/cs300/my-first-react...
│
└  Done. Now run:

  cd my-first-react
  npm install
  npm run dev
```

## Install and start

Move into the new folder.

```bash
cd my-first-react
```

Install the dependencies listed in `package.json`.

```predict
What does `npm install` add to the project folder?
- A `dist` folder with the built page
- A copy of Node.js for this project
= A `node_modules` folder and a `package-lock.json` file
```

```bash
npm install
```

It ends with a summary such as `added 19 packages, and audited 20 packages in 1s` and `found 0 vulnerabilities`; the numbers depend on the template and are larger for a freshly generated project.

Start the development server.

```bash
npm run dev
```

```text
  VITE v8.2.4  ready in 336 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

The version and the time will differ on your computer.
Open the **Local** address in your browser: you see the Vite and React welcome page with a **Count is 0** button.
Leave the server running while you work, and stop it with `Ctrl+C` in the terminal when you are done.

## The download for this step

The workspace download on this step is the project we use for the rest of this topic, already set up so that you can skip the creator if it fails on your computer.
Unzip it, open the folder in Visual Studio Code, and run `npm install` and then `npm run dev`.

## Read more

### What Vite does

So far React has run inside this site.
A real React project lives in a folder on your computer and runs with Vite, the build tool we use all semester.
Vite creates the project for us, turns JSX into JavaScript the browser understands, serves the page while we work, and updates the browser the moment we save a file.

### The commands

`npm create vite@latest` downloads the newest Vite project creator and runs it.
`my-first-react` is the folder it will create.
The `--` passes the rest of the line to the creator, and `--template react` picks the JavaScript React template.

`npm install` downloads React, Vite, and the packages they depend on into a new `node_modules` folder and records the exact versions in `package-lock.json`.

### How the download differs

The download differs from a freshly generated project in a few small, deliberate ways:

- `package.json` pins the course versions, React 19.2.8 and Vite 8.2.4, instead of the newest releases that `@latest` installs.
- The welcome page is trimmed to a heading, a paragraph, and the counter, without the logo images and links.
- The styles are one `styles.css` file linked from `index.html`, which is also how this site loads styles; a generated project instead imports `./index.css` from `src/main.jsx` and `./App.css` from `src/App.jsx`, and Vite handles both ways.
- There is no linter configuration.

Everything this topic teaches works the same in your generated project and in the download.

**If it breaks:** `node: command not found` or `npm: command not found` means Node is not installed or the terminal was opened before installing it; open a new terminal.
`Missing script: "dev"` means the terminal is not inside `my-first-react`; run `cd my-first-react` first.
If the address does not load, check that the terminal running `npm run dev` is still open and shows no error.
If port 5173 is busy, Vite picks the next free port and prints it; open the address it prints.

**Check:** `npm run dev` prints a **Local** address, the page at that address shows the welcome page, and clicking **Count is 0** counts up.
Then open `src/App.jsx` in your editor, change the text inside `<h1>`, and save: the browser updates without a reload.
That instant update is Vite's hot module replacement, the `HMR` the welcome page mentions.

```quiz
In `npm create vite@latest my-first-react -- --template react`, what does the lone `--` do?
- It comments out the rest of the line
- It tells npm to install the template globally
= It passes the rest of the line to the Vite creator instead of to npm
> Everything before `--` is for npm; `--template react` after it reaches the creator, which picks the JavaScript React template.
```
