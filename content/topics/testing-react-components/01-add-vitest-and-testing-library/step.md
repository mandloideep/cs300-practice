---
title: Add Vitest and Testing Library
mode: local
---

A component test renders a component into a page that exists only in memory, finds what a user would find on it, and checks it, in a fraction of a second and without a browser window.
Three tools do that together: **Vitest** runs the test files, **jsdom** gives them a document to render into, and **Testing Library** renders components and finds elements by their role and text.
In this step you add all three to a project that has none and run a first test; your Capstone starter already has them, so for it this step is a list of what to confirm.

```demo name="terminal"
{
  "cwd": "shop-tests",
  "commands": [
    {
      "command": "npm install",
      "output": ["added 21 packages, and audited 22 packages in 903ms", "", "found 0 vulnerabilities"],
      "note": "The app's own packages: React, React Router, and Vite."
    },
    {
      "command": "npm install --save-dev --save-exact vitest@4.1.10 jsdom@30.0.1 @testing-library/react@16.3.2 @testing-library/user-event@14.6.7 @testing-library/jest-dom@7.0.0",
      "output": [
        "added 92 packages, and audited 114 packages in 2s",
        "",
        "26 packages are looking for funding",
        "  run `npm fund` for details",
        "",
        "2 moderate severity vulnerabilities"
      ],
      "note": "Five development dependencies at the versions the Capstone starter uses. --save-dev keeps them out of the built site, and --save-exact writes the versions without a caret."
    },
    {
      "command": "npm test",
      "output": [
        "> shop-tests@0.0.0 test",
        "> vitest run",
        "",
        " RUN  v4.1.10 /Users/you/cs300/shop-tests",
        "",
        " ✓ src/App.test.jsx (1 test) 47ms",
        "",
        " Test Files  1 passed (1)",
        "      Tests  1 passed (1)",
        "   Start at  10:12:31",
        "   Duration  401ms (transform 28ms, setup 46ms, import 36ms, tests 47ms, environment 213ms)"
      ],
      "note": "After the script, the config, the setup file, and the first test below: one file, one test, passed."
    }
  ]
}
```

This step happens in a terminal and in Visual Studio Code, not in this site.

## Download and install

Press **Download this workspace**, unzip it, and open the folder in Visual Studio Code.
It is the shop from [Capstone release check](#/topic/capstone-release-check), with both of its fixes, and no tests.
Run the first two commands of the session: `npm install`, then the long `npm install --save-dev` line, which you can copy from the session.

| Package | What it does |
| --- | --- |
| `vitest` | Finds every `.test.jsx` file, runs its tests, and prints which passed |
| `jsdom` | A browser document written in JavaScript, so a component can render with no browser open |
| `@testing-library/react` | `render` and `screen`: puts a component in the document and finds elements in it |
| `@testing-library/user-event` | Types and clicks the way a user does, one key and one event at a time |
| `@testing-library/jest-dom` | Matchers such as `toBeInTheDocument` and `toHaveTextContent` |

## Three settings

Add a `test` script to `package.json`, after `preview`:

```json
"preview": "vite preview",
"test": "vitest run"
```

`vitest run` runs every test once and stops, which is what a check and the grader need; `vitest` alone keeps watching for changes.

Vitest reads `vite.config.js`, so the test settings go there, inside `defineConfig`, after `plugins`:

```js
plugins: [react()],
test: {
  environment: "jsdom",
  setupFiles: "./src/test-setup.js",
},
```

`environment: "jsdom"` gives every test file a `document`, and `setupFiles` names a file that runs before each test file.
Create `src/test-setup.js` with the matchers and the cleanup:

```js
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
```

`cleanup` empties the document after every test, so that no test sees what the one before it rendered.

## A first test

Create `src/App.test.jsx`:

```jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, test } from "vitest";
import App from "./App.jsx";

test("shows the welcome heading on the home page", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { name: "Welcome to the shop" })).toBeInTheDocument();
});
```

`test` names a behavior and holds the code that checks it, `render` puts the app in the document, `screen.getByRole` finds the heading the way a screen reader names it, and `expect` fails the test when the heading is not there.
`App` holds the routes but not the router, which is in `src/main.jsx`, so the test supplies one: `MemoryRouter` keeps the address in memory and starts at `/`.
Run `npm test`, the last command of the session: one test passes.

## Read more

### Confirm it in your Capstone

The Capstone starter came with all of this, so check that it is still there rather than adding it again:

1. `package.json` lists the five packages under `devDependencies` and has `"test": "vitest run"`.
2. `vite.config.js` has the `test` block with `environment: "jsdom"` and `setupFiles`.
3. `src/test-setup.js` imports `@testing-library/jest-dom/vitest` and calls `cleanup` after each test.
4. `npm test` passes; the starter's two sample tests in `src/App.test.jsx` do not count toward your five, and the brief says to replace them once `App.jsx` changes.

Your starter's `main.jsx` puts `BrowserRouter` around `App`, as this project does, so its tests wrap `App` in `MemoryRouter` the same way.

### Why tests do not run in this site

This site runs a workspace in a page with only React and React Router, so Vitest, jsdom, and Testing Library run on your own computer, where npm installs them.
That is also where they run in a real project: on your computer before you push, and in a workflow on GitHub if you add one.

**If it breaks:** `ReferenceError: document is not defined` means `environment: "jsdom"` is missing from the `test` block, or the block is outside `defineConfig`.
`Error: Invalid Chai property: toBeInTheDocument` means the setup file did not run; check `setupFiles` and the path `./src/test-setup.js`.
`Missing script: "test"` means the script is not in `package.json`, or the terminal is in another folder.
If `npm test` prints `Waiting for file changes`, the script says `vitest` without `run`; press **q** and add `run`.

**Check:** `npm test` prints `Tests  1 passed (1)` for `src/App.test.jsx`, and `package.json`, `vite.config.js`, and `src/test-setup.js` have the settings above.
Then press **I did this on my computer**.

```quiz
Which package gives a test a `document` to render into?
- `@testing-library/react`
= `jsdom`
- `vitest`
> Vitest runs the tests in Node, which has no document; `environment: "jsdom"` gives each test file one.
```

```quiz
Why does the first test wrap `App` in `MemoryRouter`?
= `App` uses routes and links, and its `BrowserRouter` is in `main.jsx`, which the test does not load
- `MemoryRouter` makes the test run faster than `BrowserRouter`
- Testing Library cannot find headings without a router
> A test renders only what it imports; routes and links need a router above them, and `MemoryRouter` keeps its address in memory, where a test can set it.
```
