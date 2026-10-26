# CS300 Lab: a client-side learning site for the whole course

Design plan for the public repository `mandloideep/cs300-react-lab`, prepared October 26, 2026 and updated the same day with the API and network inspector requirements.
The repository exists, is empty, and is checked out at `~/Code/work/neiu/teaching/cs300/cs300-react-lab`.
The site deploys to `https://mandloideep.github.io/cs300-react-lab/`.

## 1. What it is

A static website where students read a short explanation, edit code in the browser, run it, see the rendered result and the console, and check their work against stated expectations.
Everything runs in the visitor's browser.
There is no server, no account, no database, and no third-party runtime service.
GitHub Pages serves plain files; a browser does the rest.

The Spring `cs300-react-test` site proved the shape: a running demo beside its source, one concept at a time.
This design keeps that shape and adds three things it lacked: students can edit and run the code themselves, the content is organized by topic instead of by tab or week, and each semester overlays its own week-by-week path without changing the topics.

## 2. Organizing principle: topics first, paths second

### Topics

A topic is one self-contained skill, such as `jsx-rules` or `lists-and-keys`.
It has a stable id that never changes, a title, a two-sentence summary, prerequisites (other topic ids), an estimated time, and an ordered list of steps.
Each step is one screen: explanation on the left, a workspace of editable files, a result pane, a console pane, and a check panel.
A step can also be read-only (explanation only) or local-only (instructions to run on the student's machine; see section 7).

Topics are versioned with a date and a short change note, shown on the page.
Editing a topic improves it for every semester that uses it.

### Paths

A path is a semester overlay, such as `fall-2026`, stored as one JSON file.
It lists units (weeks) in order; each unit names its topics, an intro paragraph, and which steps are required versus optional.
A path never copies topic content, so a topic fix appears in every path.
A later semester creates a new path file and can reorder, drop, or add topics with no change to the topics themselves.

### URLs

Hash routing keeps deep links working on GitHub Pages without server rewrites.

| URL | Shows |
| --- | --- |
| `#/` | Home: current path if one is selected, otherwise the topic catalog |
| `#/topics` | Catalog grouped by area (HTML, CSS, JavaScript, DOM, Fetch, React, Routing, Tooling) with prerequisites |
| `#/topic/<id>` | The topic's first step |
| `#/topic/<id>/<n>` | Step n of the topic |
| `#/path/<pathId>` | The semester's units in order with progress |
| `#/path/<pathId>/<unit>` | One unit: intro, required topics, optional topics, local-only notes |

A D2L page links to `#/path/fall-2026/week-10` for the week view and to individual `#/topic/...` links for the required items.
Topic links stay valid next semester; the path link is the only semester-specific one.

## 3. How code runs in the browser

### Decision

A small custom runner, not a hosted sandbox.

| Option | Why not |
| --- | --- |
| Sandpack (CodeSandbox) | Its bundler runs on CodeSandbox's servers by default; self-hosting it is a large opaque dependency, and its Vite templates need a runtime that cannot be self-hosted |
| WebContainers (StackBlitz) | Needs cross-origin isolation headers that GitHub Pages does not send, carries a commercial license, and loads a full Node runtime for what is mostly JSX |
| Custom runner | About five hundred lines we own, no external service, and it handles HTML, CSS, vanilla JavaScript, and React alike |

### Pipeline

1. The student edits files in a CodeMirror 6 editor (JavaScript with JSX, HTML, CSS, JSON modes).
2. On Run (and optionally on a short debounce), each `.js` or `.jsx` file is compiled with Sucrase in the browser: JSX to JavaScript with the automatic runtime, no bundler.
3. Each compiled module becomes a blob URL; relative imports between workspace files are rewritten to those URLs in dependency order.
4. Bare imports (`react`, `react-dom/client`, `react/jsx-runtime`, `react-router`) resolve through an import map to ES module builds served from the site's own `runtime/` folder, so the site has no runtime dependency on any CDN.
5. A sandboxed `iframe` receives a generated `srcdoc` with the import map, the workspace's `index.html` and CSS, a small bridge script, and the entry module.
6. The bridge forwards `console.log`, `console.warn`, `console.error`, uncaught errors, and unhandled promise rejections to the parent through `postMessage`; the console pane shows them with the step they came from.
7. The result pane is the iframe itself, so the student sees exactly what the browser rendered.

The vendored runtime is built once by a script from pinned package versions matching the Fall technical source ledger (React 19.2.x, React Router 8.x in declarative mode) and committed under `public/runtime/`.
Upgrading React is one script run and one commit.

### Vanilla web topics

The same runner serves HTML, CSS, and DOM lessons: a workspace can be `index.html`, `styles.css`, and `app.js` with no React at all.
That lets the site cover Weeks 3 through 9 next semester with the same tool, not only React.

### Checks

Each step may ship a `check.js` module that runs inside the iframe after the code settles.
It receives the document, the captured console, and the fetch log, and returns a list of named results.
Example checks: "three list items render", "the button has aria-expanded", "a request to /api/books was made once", "no React key warning in the console".
Checks are guidance, not grades; the panel says what passed and what to look at next.

### Solutions and resets

Every step has a starter workspace and a solution workspace.
Students can reset to the starter, open the solution in a side-by-side diff against their own files, or load it into the editor.
Solutions are plain files in the repository, not hidden; the site is a learning tool, not an assessment.

## 4. Student experience

- Each step reads top to bottom: a short explanation in plain language, what to change, what to expect, and a check.
- Steps are small typed edits with the explanation beside each edit, in the Week 8 style, never a whole-file paste.
- A "What we already know" note links back to the prerequisite topic when a step relies on it.
- Progress (steps completed, checks passed, and edited files) is saved in the browser's `localStorage` only.
  Students can export it as a JSON file and import it on another device.
  Nothing is sent anywhere.
- Keyboard-first: the editor, run button, panes, and step navigation work without a mouse; results announce through a polite live region; light and dark follow the system.
- Narrow screens stack the panes; the editor stays usable on a tablet.
- Every step has "Download this workspace" (a ZIP built in the browser) so a student can continue locally in Vite.

## 5. The inspector: seeing components, state, and data flow

This is the feature that makes the site more than a code runner, so it is a first-class pane, on by default in React topics, not a hidden developer tool.
It is possible because we own three things a hosted sandbox hides: the compile step, the copy of React in the iframe, and the iframe itself.

### What students see

| View | What it shows | How it behaves |
| --- | --- | --- |
| Boundaries | A labeled outline around the rendered output of every component instance, colored per component type | Hover a box to see its name, props, and state; click it to jump the editor to the component's definition and to the JSX line that used it |
| Re-render flash | Each component that rendered in the latest commit pulses once | Shows exactly which components React re-ran after a click, and which it skipped |
| Tree and state | The live component tree with each instance's props and `useState` values | Values flash when they change; a component with no DOM of its own (one that returns `null` or a fragment) appears in the tree as a chip |
| Flow trace | A timeline of the last interaction: the event, the callback prop it invoked and which component passed it, the state setter it called and in which component, and the components that re-rendered as a result | Hovering a timeline row highlights the components involved; this is lifting state up, drawn as it happens |
| Editor link | Hovering a component or JSX tag in the editor highlights its boxes in the result; clicking a box highlights the code | Both directions, so the code and the picture are the same thing |

Each step can pin the components that matter ("watch `App` and `BookmarkForm`") and choose which views start open, so a lists-and-keys step opens with boundaries and the re-render flash while a lifting-state step opens with the flow trace.

### How it works

1. **Source locations.** Sucrase compiles JSX in development mode to `jsxDEV(type, props, key, isStatic, { fileName, lineNumber })`, verified with Sucrase 3.35.1.
   The runner also records where each component function is declared.
   That is the map from any rendered element back to the editor.
2. **Render tracking.** Before React loads, the bridge installs the global hook React looks for (`__REACT_DEVTOOLS_GLOBAL_HOOK__`) and receives every committed fiber root, the same entry point the official React DevTools uses.
   On each commit it walks the tree, reads each function component's name, props, hook state, and whether it performed work in that commit, and finds the DOM nodes it rendered.
   The overlay draws boundary boxes from those nodes' positions inside the iframe and flashes the ones that rendered.
3. **Flow tracing.** The vendored `react` and `react/jsx-dev-runtime` modules are thin wrappers around the real ones.
   The wrapper knows which component is rendering, so it can label every `useState` setter with its owner and every function passed as a prop with the component that passed it and the prop name.
   When a child invokes an `onAdd` prop, the trace records "`onAdd`, passed by `App` to `BookmarkForm`, called; `setBookmarks` in `App` changed the value; `App`, `BookmarkList` re-rendered".
   Wrappers are cached per original function so identity stays stable and `memo` still works.
4. **Development build of React.** The vendored runtime is React's development build, so component names survive, hook state is readable, and warnings such as a missing `key` appear in the console pane where a check can point at them.

### Risks and how they are handled

- The fiber fields the hook reads are not public API.
  The runtime is pinned and vendored, the fields in use (tag, type, child, sibling, return, memoizedProps, memoizedState, stateNode, flags, alternate) have been stable across React 18 and 19, and the Playwright suite asserts the inspector output for every solution, so a React upgrade that breaks it fails the build instead of the class.
- Wrapping function props and setters changes nothing students write; it is invisible in the editor and off in downloaded workspaces, which use the plain runtime.
- Boundary boxes follow DOM nodes; a component whose output is split across siblings gets one box per fragment group and one shared label.
- If the custom hook ever proves too brittle, the fallback is `react-devtools-inline`, the React team's embeddable DevTools, as an advanced inspector tab; it is heavier and shaped for debugging rather than teaching, which is why it is not the first choice.

## 6. Content format

```text
content/
  topics/
    jsx-rules/
      topic.json            id, title, area, summary, prerequisites, minutes, updated, changeNote
      01-one-root/
        step.md             explanation, with front matter: title, mode (edit | read | local), required checks
        workspace/          index.html, src/main.jsx, src/App.jsx, styles.css
        fixtures/           optional: routes.json plus JSON bodies for the Fixtures API source
        solution/           same file set
        check.js            optional
      02-expressions/
      ...
  paths/
    fall-2026.json          units: [{ id: "week-10", title, intro, topics: [{ id, required }], localNotes }]
  api-presets.json          public servers students can select
  areas.json                display order and names for catalog areas
```

A build script compiles `content/` into JSON the site loads at runtime: Markdown to HTML with syntax highlighting, workspaces inlined, checks bundled.
The script fails the build on a missing prerequisite id, a path that names an unknown topic, a workspace without an entry file, or a solution that does not compile.

## 7. When something cannot run in the browser

Some topics need Node, npm, a real API, or a deploy target.
The site never pretends otherwise; it tells students what to do instead.

| Need | How the site handles it |
| --- | --- |
| Scaffolding a Vite project, npm install, Vitest | A `local` step shows the exact commands, the expected terminal output, and a workspace download; the in-browser step that follows starts from the generated files so students still see and edit them |
| Fetching data | The API source selector in section 8: fixtures answered inside the iframe with latency and failure controls, public presets, or any custom base URL; every request shows in the network panel |
| Routing | React Router runs in the iframe with a memory or hash history; the step explains why a real app uses browser history and links to the local-only deploy topic |
| Deployment | Read-only topic with the GitHub Pages and Vercel guides migrated from the Spring site |
| Anything else | A clearly labeled "Run this on your computer" panel with commands and links, never a hidden server dependency |

## 8. APIs and the network inspector

Students must be able to make real requests from the browser, point them at a server of their choosing, and watch each request move through its states.
The site itself still hosts nothing dynamic.

### API sources

Every workspace that fetches has an API source selector in its toolbar with three kinds of entry.

| Source | What it is | Why it is there |
| --- | --- | --- |
| Fixtures | Declared routes answered inside the iframe from fixture files in the step, with controls for latency, an HTTP error status, a malformed body, and a dropped connection | Deterministic, works offline, and lets students cause every failure state on purpose, as the Week 7 practice server did |
| Presets | Public servers that allow browser requests and need no key: JSONPlaceholder, DummyJSON, Open Library search, TVMaze search, the Art Institute of Chicago API | Real network behavior with real latency and real data shapes |
| Custom | Any base URL the student types, saved in the browser for that workspace | A student can point the same code at their own server, a classmate's deployment, or a mock service; the site explains CORS when a custom server refuses the browser |

Workspace code reads the chosen base through one variable, `import.meta.env.API_BASE`, injected by the runner, so switching sources never means editing the request code.
Each preset ships a short card: base URL, the endpoints the lessons use, the response shape, rate limits, and a link to its documentation.
Presets are listed in one JSON file so adding a server is a content change.

### The network panel

The inspector gains a Network view beside Boundaries, Tree and state, and Flow trace.
The fetch shim in the iframe records every request regardless of source: method, URL, start time, state (pending, ok, HTTP error, network error, parse error, aborted), status, duration, and a preview of the parsed body.
Rows update live as a request moves from pending to settled.
Clicking a row highlights the code line that made the request and the components that re-rendered when its result was stored in state.

The flow trace already records events, callbacks, setters, and re-renders.
A request appears in that same timeline as "fetch started", "fetch settled", so a student sees the whole loop: click, request pending, loading state rendered, response, state updated, result rendered.
Duplicate in-flight requests, stale responses that arrive after a newer one, and aborted requests are shown explicitly, because those are the mistakes Assignment 6 and the Capstone grade.

### Limits stated plainly

Public presets can be slow, rate limited, or down; the panel shows the real reason, and every fetch step also works on Fixtures.
A custom server must send CORS headers for browser requests; the Custom card explains the header and links to the deployment topic.
Nothing in the site proxies, caches, or logs requests outside the student's browser.

## 9. Stack

| Piece | Choice |
| --- | --- |
| Site shell | Vite, React 19, plain CSS with design tokens, hash routing |
| Inspector | Bridge script in the iframe using the React DevTools global hook, a wrapped `react` and `react/jsx-dev-runtime`, and an overlay layer; no extra dependency |
| Network | A `fetch` wrapper installed in the iframe before workspace code runs; fixture routing, preset and custom base injection, and request logging live there |
| Editor | CodeMirror 6 with JavaScript (JSX), HTML, CSS, JSON modes |
| Transpile | Sucrase (browser build) |
| Runtime | Vendored ES module development builds of React, React DOM, the JSX dev runtime, and React Router; import map in the iframe |
| Content build | Node script: Markdown with front matter, Shiki or a lightweight highlighter, JSON output |
| Verification | Node script validates content; Playwright runs every step's solution in a headless browser and asserts its checks pass |
| Deploy | GitHub Actions on push to `main`: build, validate, test, publish to Pages |
| Code style | No explanatory comments in demo or workspace code; explanation lives in `step.md` |

## 10. Repository layout

```text
cs300-react-lab/
  content/                  topics, paths, areas (section 6)
  public/runtime/           vendored ES modules, generated by scripts/build-runtime.mjs
  src/
    app/                    routes, layout, catalog, path view, topic view
    runner/                 compile, module graph, srcdoc builder, bridge, fetch shim, checks
    editor/                 CodeMirror setup and file tabs
    progress/               localStorage store, export and import
    ui/                     panes, step navigation, diff view, live region
  scripts/
    build-content.mjs
    build-runtime.mjs
    validate-content.mjs
    export-d2l.mjs
  tests/                    Playwright: every topic solution passes its checks
  .github/workflows/deploy.yml
  README.md                 how to add a topic, add a path, upgrade the runtime
```

## 11. D2L integration

`scripts/export-d2l.mjs fall-2026` writes one HTML fragment per unit in the CS300 Brightspace page style: the unit intro, the required topics with deep links, the optional topics, and the local-only notes.
Those fragments are copied into the Fall content repository's D2L build kit and posting workspace, so the weekly posting packet links the lab exactly as it links notes and examples.
The weekly announcement names the lab unit link once.
Recordings keep working as they do now: the instructor types the step in an editor while the lab page is the reference students return to.

## 12. Migration of the Spring site

Every Spring tab becomes a topic or part of one; every TabNotes panel becomes the first step's explanation; every demo becomes an editable step with a check.

| Spring tab | Topic id | Area |
| --- | --- | --- |
| React vs JS | `react-mental-model` | React |
| Composition A to C, Home (Original) | `components-and-props` | React |
| Bookmarks App step 1 | `lists-and-keys` | React |
| useState, State Patterns | `state-usestate` | React |
| Composition D, Bookmarks steps 2 to 3 | `events-and-lifting-state` | React |
| Forms | `controlled-forms` | React |
| useEffect, Lifecycle, Mistakes | `effects` | React |
| useRef, Window, Keyboard | `refs-and-browser-apis` | React |
| localStorage, Bookmarks step 4 | `persistence` | React |
| Fetch | `fetching-and-request-states` | React |
| React Router | `routing` | Routing |
| Context API, useCallback, useMemo, Libraries | `context`, `memoization`, `choosing-libraries` | Enrichment |
| Deploy Guides | `deploying-a-vite-app` | Tooling |

New topics with no Spring source: `vite-project-anatomy`, `jsx-rules`, and the vanilla areas for a future semester (`html-structure`, `css-layout`, `dom-events`, `fetch-basics`).

## 13. Phases

| Phase | Deliverable | Done when |
| --- | --- | --- |
| 1 | Runner, editor, console, hash routes, catalog, the inspector with boundaries, re-render flash, tree and state, and click-to-code, the API source selector with fixtures, presets, and custom base, the network panel, and the five Week 10 topics: `react-mental-model`, `vite-project-anatomy`, `jsx-rules`, `components-and-props`, `lists-and-keys`; `fall-2026` path with `week-10` | Deployed; every step runs and its checks pass in Playwright; a D2L fragment for Week 10 exists |
| 2 | Flow trace and editor-to-result hover linking; progress store with export and import, solution diff, workspace download, accessibility pass | A lifting-state step shows the full event, callback, setter, re-render sequence; keyboard-only walkthrough and screen-reader check recorded |
| 3 | Weeks 11 to 13 topics migrated from Spring; request rows in the flow trace with stale and duplicate detection; routing in the iframe | Fall path units for Weeks 11 to 13 |
| 4 | Vanilla areas for Weeks 3 to 9 | A `spring-2027` path can be written without new tooling |
| 5 | Runtime upgrade script, content validation in CI, README for adding a topic | A new topic can be added by editing `content/` only |

Phase 1 is the Week 10 target.
Phases 2 and 3 follow during Weeks 10 and 11 so the lab is complete before the state and effects weeks.

## 14. Decisions to confirm

1. Repository name and URL: `cs300-react-lab` at `mandloideep.github.io/cs300-react-lab/`.
2. Topics are public, including solutions; nothing graded lives here.
3. The site covers vanilla HTML, CSS, and JavaScript as well as React, so it can replace week folders of examples in later semesters.
4. Progress stays in the browser only; no sign-in or backend now or later.
5. The Fall 2026 path begins at Week 10; earlier weeks keep their current D2L materials this term.
6. The initial preset list: JSONPlaceholder, DummyJSON, Open Library, TVMaze, Art Institute of Chicago; any can be removed or added later by editing one file.
