# Kickoff: build Phase 1 of cs300-react-lab

The repository was renamed `cs300-practice` in Phase 7, and the site moved to `https://mandloideep.github.io/cs300-practice/`; this brief keeps the names it was written with.

You are working in the repository `mandloideep/cs300-react-lab`, checked out at `~/Code/work/neiu/teaching/cs300/cs300-react-lab`.
It is public, on `main`, and contains only a README.
Build Phase 1 of the CS300 Lab described in `docs/DESIGN.md` in this repository.
Read that file completely before writing any code; it is the design of record and this message only adds scope, sources, and working rules.

## What this is

A static learning site for CS300 students, deployed to GitHub Pages at `https://mandloideep.github.io/cs300-react-lab/`.
Students read a short explanation, edit code in the browser, run it, see the rendered result and the console, watch an inspector that draws component boundaries and state, and check their work against stated expectations.
Content is organized by topic with a semester path layered on top, so topics are reused across semesters.

## Hard constraints

- Client side only.
  No server, no backend, no database, no accounts, no analytics, no third-party runtime service.
  GitHub Pages serves files; the browser does everything else.
- Requests to public APIs are allowed and expected.
  Every fetching workspace has an API source selector (fixtures, presets, custom base URL) and every request appears in the inspector's network panel.
  The initial presets are JSONPlaceholder, DummyJSON, Open Library search, TVMaze search, and the Art Institute of Chicago API.
- React is vendored as ES module development builds inside the site and loaded in the iframe through an import map; no CDN at runtime.
  Pin React 19.2.x, React DOM 19.2.x, and React Router 8.x in declarative mode (`react-router` package), matching the course's technical baseline.
- Code that students see (workspaces, solutions, demo components) carries no explanatory comments; explanation lives in the step Markdown.
- Markdown files put each full sentence on its own line and never use the em dash character.
- Keyboard-operable, light and dark through `prefers-color-scheme`, usable at phone width.
- Local Node is 26.x; CI uses Node 24 LTS.
  Use npm with a committed lockfile.
  Commit after each milestone with a clear message and no agent co-author line.
  Ask before the first push and before changing repository settings such as enabling Pages.

## Sources to read and reuse

All paths are on this machine.

| Purpose | Location |
| --- | --- |
| Design of record | `docs/DESIGN.md` in this repository |
| Week 10 example apps to turn into topic workspaces | `/Users/deep/Code/work/neiu/teaching/cs300/cs-300-content/terms/fall-2026/weeks/week-10/session-1/example/` and `.../session-2/example/` (each has `starter/` and `complete/`) |
| Week 10 required reading, to align step explanations and vocabulary | `/Users/deep/Code/work/neiu/teaching/cs300/cs-300-content/terms/fall-2026/weeks/week-10/session-1/student-notes/lesson-notes.md` and `.../session-2/student-notes/lesson-notes.md` |
| The step-by-step teaching style to copy | `/Users/deep/Code/work/neiu/teaching/cs300/cs-300-content/terms/fall-2026/weeks/week-08/session-2/student-notes/lesson-notes.md` (small typed edits, explanation beside each edit, a check per step, complete files only in collapsed review panels) |
| Course technical baseline and pinned versions | `/Users/deep/Code/work/neiu/teaching/cs300/cs-300-content/terms/fall-2026/operations/TECHNICAL-SOURCE-LEDGER.md` |
| Spring demo site to migrate in Phase 3, and its stepper and notes shell for reference | `https://github.com/mandloideep/cs300-react-test` (deployed at `https://mandloideep.github.io/cs300-react-test/`) |
| Brightspace page template for the D2L export | `/Users/deep/Code/work/neiu/teaching/cs300/cs-300-content/terms/fall-2026/operations/d2l-build-kit/templates/brightspace-page-template.html` |

Read the Fall repository; do not modify it.

## Phase 1 milestones, in order

Each milestone ends with a commit and a short report of what was verified and how.

1. **Scaffold.** Vite plus React 19 site shell, plain CSS with design tokens, hash routing, ESLint, Prettier, `.nvmrc` or `engines`, GitHub Actions workflow that builds, validates, tests, and deploys to Pages on push to `main`, `vite.config.js` with `base: "/cs300-react-lab/"`.
2. **Runtime.** `scripts/build-runtime.mjs` bundles the pinned `react`, `react-dom/client`, `react/jsx-dev-runtime`, `react/jsx-runtime`, and `react-router` into ES modules under `public/runtime/` with shared chunks so there is one React instance; commit the output; document the upgrade procedure in the README.
3. **Runner.** Compile workspace files with Sucrase (`transforms: ["jsx"]`, `jsxRuntime: "automatic"`, `production: false`, `filePath` set), build the module graph from relative imports, emit blob URLs, generate the iframe `srcdoc` with the import map, workspace HTML and CSS, the bridge script, and the entry module; the bridge forwards console calls, uncaught errors, and unhandled rejections to the parent; plain HTML, CSS, and JavaScript workspaces must also run.
4. **Editor and layout.** CodeMirror 6 with JSX, HTML, CSS, and JSON modes, file tabs, Run, Reset to starter, Show solution as a side-by-side diff, explanation pane, result pane, console pane, check panel, step navigation, and a polite live region for results; panes stack at narrow widths.
5. **Inspector.** Install the React DevTools global hook in the iframe before React loads; on each commit walk the fiber tree to collect function components, props, `useState` values, whether each performed work, and the DOM nodes each rendered; draw boundary boxes with labels in an overlay layer, flash components that rendered, show a tree with state and props, and make a box click jump the editor to the component declaration and the JSX line that used it, using the `fileName` and `lineNumber` Sucrase emits; wrap `react` and `react/jsx-dev-runtime` so state setters and function props are labeled with their owner, cached per original function.
6. **API sources and network panel.** A `fetch` wrapper installed in the iframe before workspace code: fixture routing from the step's `fixtures/routes.json` with latency, HTTP error, malformed body, and dropped connection controls; preset and custom base injection through `import.meta.env.API_BASE`; a network panel listing each request's method, URL, state, status, duration, and body preview, updated live, with a row click highlighting the request line in the editor.
7. **Content pipeline and topics.** `scripts/build-content.mjs` compiles `content/` to JSON (Markdown with front matter, syntax highlighting, workspaces, fixtures, checks) and fails on a missing prerequisite, unknown topic in a path, missing entry file, or non-compiling solution; `scripts/validate-content.mjs` runs the same checks standalone; author the five topics below and the `fall-2026` path with its `week-10` unit.
8. **Tests, export, deploy.** Playwright runs every step's solution in a headless browser and asserts its checks pass and the inspector reports the expected components; `scripts/export-d2l.mjs fall-2026` writes one Brightspace-style HTML fragment per unit to `dist-d2l/`; build, open the site in a browser, walk every step by keyboard, and report what was verified.

## Phase 1 topics

Each step follows the Week 8 pattern: what to change, where, why, what to expect, and a check.
Steps are small typed edits, never a whole-file paste.
Starter and solution workspaces are plain files.
Suggested steps; adjust where the material demands it.

| Topic id | Area | Prerequisites | Steps |
| --- | --- | --- | --- |
| `react-mental-model` | React | none | 1 Imperative DOM update versus describing the UI from data (vanilla and React side by side); 2 A render function that returns markup from a value; 3 Change the value, watch only that part update, with the re-render flash on; 4 Read: data down, events up |
| `vite-project-anatomy` | React | `react-mental-model` | 1 Local step: create the project with the exact commands and expected terminal output; 2 Explore the generated files in the editor: `index.html`, `main.jsx`, `App.jsx`, what imports what; 3 Replace `App.jsx` with a first component; 4 Local step: `npm run build` and what `dist/` contains; workspace download provided |
| `jsx-rules` | React | `vite-project-anatomy` | 1 Expressions in braces; 2 One root and fragments; 3 `className`, `htmlFor`, self-closing tags, with the attribute-name failure reproduced and fixed; 4 Conditional rendering with `?:` and `&&`; 5 A semantic card translated from HTML to JSX and rendered from a data object (the Week 10 Session 1 example) |
| `components-and-props` | React | `jsx-rules` | 1 Extract a component from repeated markup, boundaries on; 2 Pass props and read them with destructuring; 3 Default values; 4 Props are read-only, with the mutation mistake shown in the console; 5 Children as a prop (a card shell); 6 A component map for a small page |
| `lists-and-keys` | React | `components-and-props` | 1 Render a list with `.map()`; 2 Stable keys, with the index-key failure reproduced and the React warning pointed at by a check; 3 An empty state separate from an error; 4 Refactor the Week 10 Session 2 product page into `ProductCard` and `ProductList` with two visual variations driven by props |

The `fall-2026` path has one unit, `week-10`, titled "React, Vite, JSX, components, props, and lists", with all five topics required, an intro paragraph written to students in the course voice (we learned, you will), and a local-only note that the Vite scaffold and build steps run on their own computer.

## Definition of done for Phase 1

- `npm ci`, `npm run build`, `npm run validate`, and `npm test` pass locally and in the workflow.
- Every step of every topic runs in the browser, its checks pass from the solution, and its starter does what the explanation says it does.
- The inspector shows boundaries, flashes, tree and state, and click-to-code on every React step.
- A fetch step (add one to `lists-and-keys` or a small demo topic) works on Fixtures, on at least one preset, and on a custom base URL, and all three show in the network panel.
- The D2L fragment for `week-10` exists and links to `#/path/fall-2026/week-10` and to each topic.
- The README explains how to add a topic, add a path, add a preset, and upgrade the runtime.
- The site has been opened in a real browser and walked by keyboard, and the report says what was checked.

## Decisions already made

Do not reopen these.

1. Repository `cs300-react-lab`, site at `mandloideep.github.io/cs300-react-lab/`.
2. Topics and solutions are public; nothing graded lives here.
3. The site covers vanilla HTML, CSS, and JavaScript as well as React, so the runner must not assume React.
4. Progress stays in the browser's `localStorage` with JSON export and import; no sign-in, now or later.
5. The Fall 2026 path begins at Week 10.
6. Custom runner, not Sandpack or WebContainers; the reasons are in the design.
7. Hash routing.

## When to ask

Ask only when blocked on something the design does not settle and a reasonable default would make the work useless if wrong.
Otherwise choose, state the choice in the milestone report, and continue.
