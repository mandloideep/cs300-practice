# Phase 1 contracts

This file fixes the interfaces that Phase 1 work streams share so that they can be built in parallel.
It is subordinate to `docs/DESIGN.md`; where this file is silent, the design decides.
Where this file names a file path, a message shape, or a field, every stream uses exactly that name.
Change this file only through the orchestrator, and record every change in the "Decisions log" at the end.

## 1. Repository conventions

- Node 26 locally, Node 24 LTS in CI; `.nvmrc` holds `24`; `engines.node` is `>=24`.
- npm with a committed `package-lock.json`.
- npm scripts, all of which must exist once Phase 1 is complete:

| Script | Does |
| --- | --- |
| `dev` | `build:content` then the Vite dev server |
| `build` | `build:content` then `vite build` |
| `build:content` | `node scripts/build-content.mjs` |
| `build:runtime` | `node scripts/build-runtime.mjs` |
| `validate` | `node scripts/validate-content.mjs` |
| `lint` | ESLint over `src`, `scripts`, `tests` |
| `format` | Prettier write |
| `format:check` | Prettier check |
| `test` | Playwright |
| `export:d2l` | `node scripts/export-d2l.mjs` |

- `vite.config.js` sets `base: "/cs300-react-lab/"`.
- Plain CSS with design tokens in `src/styles/tokens.css`; light and dark through `prefers-color-scheme`; no CSS framework.
- Hash routing with `react-router` in declarative mode (`HashRouter`, `Routes`, `Route`).
- Source files are `.js` and `.jsx`; no TypeScript.
- Code that students see (workspaces, solutions, demo components) carries no explanatory comments.
- Every Markdown file puts each full sentence on its own line and never uses the em dash character.
- Commit after each milestone with a clear message and no agent co-author line.
- Generated output under `public/content/` and `dist/` is gitignored; `public/runtime/` is committed.

## 2. Content format

```text
content/
  areas.json
  api-presets.json
  paths/
    fall-2026.json
  topics/
    <topic-id>/
      topic.json
      01-<slug>/
        step.md
        workspace/        present when mode is edit
        solution/         present when mode is edit; same file set as workspace
        fixtures/         optional; routes.json plus body files
        check.js          optional
        local/            optional; a downloadable workspace for mode local
      02-<slug>/
```

### areas.json

An array in display order.

```json
[{ "id": "react", "title": "React" }, { "id": "routing", "title": "Routing" }]
```

Phase 1 ids: `html`, `css`, `javascript`, `dom`, `fetch`, `react`, `routing`, `tooling`, `enrichment`.

### topic.json

```json
{
  "id": "jsx-rules",
  "title": "JSX rules",
  "area": "react",
  "summary": "Two sentences at most.",
  "prerequisites": ["vite-project-anatomy"],
  "minutes": 35,
  "updated": "2026-10-26",
  "changeNote": "First version."
}
```

Step order comes from the numeric prefix of the step directories.
Step numbers shown to students are 1-based and contiguous.

### step.md

Front matter, then Markdown.

```yaml
---
title: Expressions in braces
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash]
  watch: [App, TopicList]
api:
  default: fixtures
required: [renders-three-items]
---
```

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | yes | Shown in navigation and as the step heading |
| `mode` | yes | `edit`, `read`, or `local` |
| `entry` | edit only | Workspace path of the module the runner executes; `index.html` for a workspace with no module entry |
| `inspector.views` | no | Inspector views that start open: any of `boundaries`, `flash`, `tree`, `network`; default `[boundaries, flash, tree]` for a React workspace and `[]` otherwise |
| `inspector.watch` | no | Component names the inspector pins at the top of the tree |
| `api.default` | no | Present when the workspace fetches; `fixtures`, a preset id, or `custom`; the toolbar shows the API source selector only when this field is present |
| `required` | no | Ids of checks that must pass for the step to count as complete; default is every check the step's `check.js` returns |

A React workspace is one whose files import `react`.

The body follows the Week 8 pattern: a short explanation, one or more edit blocks with explanation beside each, a `**Check:**` paragraph, and an `**If it breaks:**` paragraph.
Steps are small typed edits, never a whole-file paste, except that `action="create"` may introduce a new small file.
A `**We used this in:**` line at the top of a step links to a prerequisite topic as `[Topic title](#/topic/<id>)` when the step relies on it.

An edit block is a fenced code block whose info string names the language and then `key="value"` attributes.
Values may use single or double quotes.

````markdown
```jsx file="src/App.jsx" action="insert-after" anchor="<main>"
<p>This component renders {topics.length} concepts from data.</p>
```
````

| Attribute | Values |
| --- | --- |
| `file` | Workspace path |
| `action` | `create`, `replace`, `insert-after`, `insert-before`, `append`, `delete` |
| `anchor` | For `replace`, `insert-after`, `insert-before`, `delete`: the exact existing line or lines the edit is placed relative to |

Edit block semantics, which the validator and the content build apply identically:

- The code is the fence content with only its final newline removed, so a leading or trailing blank line in the fence is significant and is inserted verbatim.
- `anchor` is one or more complete lines, matched exactly including indentation, at the first occurrence in the file as it stands after the earlier edit blocks of the same step; a multi-line anchor is written with literal `\n` between lines.
- `insert-after` places the code on new lines after the last anchor line; `insert-before` places it before the first anchor line; `replace` replaces the anchor lines; `delete` removes them; `append` adds the code after the last line of the file; `create` writes a new file with the code as its content plus a final newline.
- Files end with exactly one newline after every action.

The content build renders an edit block as a card: file name, the placement sentence derived from `action` and `anchor`, and the highlighted code.
Ordinary fenced blocks with only a language render as plain highlighted code.
Collapsible review panels use the `<details><summary>` HTML elements directly in the Markdown.

### Workspace files

- `index.html` is always present and is a complete document, exactly as a Vite project's `index.html` would be.
- A React workspace uses `<div id="root"></div>` and `<script type="module" src="/src/main.jsx"></script>`; the runner resolves `/src/main.jsx` and `./src/main.jsx` alike to the workspace file `src/main.jsx`.
- Stylesheets are linked from `index.html` with `<link rel="stylesheet" href="/styles.css">` or `./styles.css`; the runner inlines them.
- Files can import each other with relative paths including the extension.
- Bare imports allowed: `react`, `react-dom`, `react-dom/client`, `react/jsx-runtime`, `react/jsx-dev-runtime`, `react-router`.
- `import.meta.env.API_BASE` is the base URL for requests; `import.meta.env.MODE` is `development` and `import.meta.env.DEV` is `true`.
- A `local` step's downloadable workspace lives under `local/` and is complete enough to run with `npm install` and `npm run dev`.

### fixtures/routes.json

```json
{
  "routes": [
    { "method": "GET", "path": "/products", "status": 200, "body": "products.json" },
    { "method": "GET", "path": "/products/:id", "status": 200, "body": "product.json" },
    { "method": "POST", "path": "/products", "status": 201, "body": { "ok": true } }
  ]
}
```

- `path` matches the request pathname exactly, with `:name` segments matching one path segment; the query string is ignored for matching.
- `body` is either a file name in `fixtures/` or an inline JSON value.
- `status` defaults to 200 and `delay` (milliseconds) defaults to 0.
- When no route matches, the shim answers 404 with `{ "error": "No fixture route for GET /x" }`.

### check.js

A module compiled and run inside the iframe after the workspace settles and again whenever the student presses "Run checks".
It is not shown in the editor.

```js
export default async function check({ document, console, network, inspector, wait }) {
  const items = document.querySelectorAll("li");
  return [
    {
      id: "three-items",
      title: "Three list items render",
      pass: items.length === 3,
      hint: "The list should have one li per topic in the array."
    }
  ];
}
```

| Argument | Shape |
| --- | --- |
| `document` | The iframe document |
| `console` | Array of `{ level, text, time }` captured since the run started; `text` is the formatted message |
| `network` | Array of request records (section 4.4) captured since the run started |
| `inspector` | `{ components: [...] }`, the latest commit snapshot (section 4.3), or `{ components: [] }` for a non-React workspace |
| `wait` | `(ms) => Promise<void>` |

The result is an array of `{ id, title, pass, hint }`.
`hint` is shown only when `pass` is false.
A check may interact with the page (click a button, type into an input) and wait before measuring.

### paths/<path-id>.json

```json
{
  "id": "fall-2026",
  "title": "Fall 2026",
  "units": [
    {
      "id": "week-10",
      "title": "React, Vite, JSX, components, props, and lists",
      "intro": "One paragraph in the course voice.",
      "topics": [{ "id": "react-mental-model", "required": true }],
      "localNotes": ["The Vite scaffold and build steps run on your own computer."]
    }
  ]
}
```

### api-presets.json

```json
[
  {
    "id": "jsonplaceholder",
    "title": "JSONPlaceholder",
    "baseUrl": "https://jsonplaceholder.typicode.com",
    "docsUrl": "https://jsonplaceholder.typicode.com/guide/",
    "endpoints": [{ "path": "/posts", "description": "100 posts" }],
    "responseShape": "An array of objects with userId, id, title, and body.",
    "rateLimit": "None published; be polite."
  }
]
```

Phase 1 presets: `jsonplaceholder`, `dummyjson`, `openlibrary`, `tvmaze`, `artic`.

## 3. Compiled content

`scripts/build-content.mjs` reads `content/` and writes `public/content/` (gitignored).
`scripts/validate-content.mjs` performs the same checks and writes nothing.
Both fail with a nonzero exit code and a message naming the file on: a prerequisite id that is not a topic, a path unit naming an unknown topic, an edit step without `entry` or whose entry file is missing from workspace or solution, a solution whose JavaScript or JSX does not compile with Sucrase, an edit block whose anchor is not found in the workspace file it names, a fixture route whose body file is missing, a check module that does not compile, or a step using an unknown `mode`.

Note on edit block anchors: validate the anchor against the file as it would be after the earlier edit blocks of the same step applied in order, starting from the workspace; when all edit blocks apply cleanly, the result must equal the solution file, and the validator reports a diff when it does not.

### public/content/index.json

```json
{
  "generatedAt": "2026-10-26T00:00:00.000Z",
  "areas": [{ "id": "react", "title": "React" }],
  "topics": [
    {
      "id": "jsx-rules",
      "title": "JSX rules",
      "area": "react",
      "summary": "...",
      "prerequisites": ["vite-project-anatomy"],
      "minutes": 35,
      "updated": "2026-10-26",
      "changeNote": "First version.",
      "steps": [{ "n": 1, "slug": "expressions", "title": "Expressions in braces", "mode": "edit" }]
    }
  ],
  "paths": [{ "id": "fall-2026", "title": "Fall 2026", "units": [...] }],
  "presets": [...]
}
```

### public/content/topics/<id>.json

The topic object from the index with each step expanded:

```json
{
  "n": 1,
  "slug": "expressions",
  "title": "Expressions in braces",
  "mode": "edit",
  "html": "<p>...</p>",
  "entry": "src/main.jsx",
  "inspector": { "views": ["boundaries", "flash"], "watch": ["App"] },
  "api": { "default": "fixtures" },
  "required": ["three-items"],
  "edits": [{ "file": "src/App.jsx", "action": "insert-after", "anchor": "<main>", "code": "...", "lang": "jsx" }],
  "workspace": { "index.html": "...", "src/main.jsx": "...", "src/App.jsx": "...", "styles.css": "..." },
  "solution": { "index.html": "...", "src/main.jsx": "...", "src/App.jsx": "...", "styles.css": "..." },
  "fixtures": { "routes": [...], "bodies": { "products.json": "..." } },
  "check": "export default async function check(...) {...}",
  "local": { "package.json": "...", "src/main.jsx": "..." }
}
```

`fixtures`, `check`, `local`, `inspector`, `api`, and `required` are `null` when absent.
`workspace` and `solution` are `null` for `read` and `local` steps.

Markdown rendering uses `markdown-it` and front matter uses `gray-matter`.
Syntax highlighting uses Shiki at build time with the `github-light` and `github-dark` themes as a dual theme so that colors follow `prefers-color-scheme` through CSS variables.
The site loads `index.json` once and each topic file on demand with `fetch(import.meta.env.BASE_URL + "content/...")`.

## 4. Runner

Lives in `src/runner/`.
Nothing in the runner assumes React.

### 4.1 API

```js
import { buildRun } from "../runner/index.js";

const run = buildRun({
  files,            // { "index.html": "...", "src/main.jsx": "...", ... }
  entry,            // "src/main.jsx" or "index.html"
  runtimeBase,      // import.meta.env.BASE_URL + "runtime/"
  env,              // { API_BASE: "https://..." }
  fixtures,         // { routes: [...], bodies: { "products.json": "..." } } or null
  fixtureControls,  // { latencyMs: 0, errorStatus: null, malformedBody: false, dropConnection: false }
  check,            // check.js source or null
  inspector         // true to install the inspector hook and wrappers
});
```

`run` is `{ runId, srcdoc, diagnostics, moduleUrls, declarations, dispose }`.

- `runId` is a unique string carried by every message of the run.
- `srcdoc` is the complete HTML document for the iframe, or `null` when `diagnostics` is non-empty.
- `diagnostics` is an array of `{ file, line, column, message }` from compile or import resolution errors.
- `moduleUrls` maps each workspace JavaScript path to the blob URL it was given, so that stack traces and inspector locations can be mapped back.
- `declarations` maps each workspace JavaScript path to `{ [ComponentName]: line }` for every top-level `function Name` and `const Name =` the compile step found; the bridge receives it as `globalThis.__LAB__.declarations` so the inspector hook can fill `declaredAt`.
- `dispose()` revokes the blob URLs.

The iframe is created by the UI as `<iframe sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups" srcdoc={srcdoc}>`.
Blob URLs are created in the parent document; `allow-same-origin` is required for the iframe to load them and the runtime modules in development, and is accepted because the code is the student's own, running in the student's own browser on a static site.

### 4.2 Compilation and srcdoc

- `.js` and `.jsx` files compile with Sucrase: `transforms: ["jsx"]`, `jsxRuntime: "automatic"`, `production: false`, `filePath` set to the workspace path, so that `jsxDEV` calls carry `fileName` and `lineNumber`.
- `import.meta.env` is rewritten to `__LAB_ENV__` before compilation; the bridge defines `globalThis.__LAB_ENV__ = { API_BASE, MODE: "development", DEV: true, BASE_URL: "/" }`.
- Relative imports between workspace files are rewritten to blob URLs in dependency order; a cycle or a missing file is a diagnostic.
- Bare imports resolve through the import map:

| Specifier | File |
| --- | --- |
| `react` | `runtime/react.js` |
| `react-dom` | `runtime/react-dom.js` |
| `react-dom/client` | `runtime/react-dom-client.js` |
| `react/jsx-runtime` | `runtime/react-jsx-runtime.js` |
| `react/jsx-dev-runtime` | `runtime/react-jsx-dev-runtime.js` |
| `react-router` | `runtime/react-router.js` |

The inspector stream may point `react` and `react/jsx-dev-runtime` at wrapper modules under `runtime/wrap/` that import the files above; the import map is the only place that changes.

- The `srcdoc` document order is: `<!doctype html>`, `<head>` contents from the workspace `index.html` with workspace `<link rel="stylesheet">` tags replaced by inline `<style>` and workspace `<script>` tags removed, then the bridge as an inline classic script, then the import map, then `<body>` contents from the workspace `index.html`, then `<script type="module">import "<entry blob url>"</script>`.
- When `entry` is `index.html`, the entry module script is omitted and workspace `<script src>` tags are rewritten to blob URLs in place instead of removed.
- The bridge is assembled from `src/runner/bridge/core.js`, `src/runner/bridge/inspector-hook.js`, and `src/runner/bridge/fetch-shim.js`, each imported with Vite's `?raw` suffix and concatenated in that order; the second and third start as empty files that later streams fill.
- The bridge runs before the import map and before React loads.
- `core.js` defines one global the other bridge parts and the check runner use: `globalThis.__LAB__ = { runId, env, declarations, console: [], network: [], inspector: { commits: [], latest: null }, post(message) }`; `post` adds `source` and `runId` and calls `window.parent.postMessage`; `console` holds `{ level, text, time }`; the fetch shim pushes request records into `network` and the inspector hook pushes commits into `inspector.commits` and sets `latest`, so that `check.js` receives `__LAB__.console`, `__LAB__.network`, and `__LAB__.inspector.latest` without the parts knowing each other.
- The runner stream verifies `buildRun` through a dev-only harness page at `src/runner/harness/index.html` (served by the Vite dev server, not part of the production build) and a Playwright spec `tests/runner.spec.js` with a `playwright.config.js` whose `webServer` starts `npm run dev`.

### 4.3 Messages from the iframe to the parent

Every message is posted with `window.parent.postMessage(message, "*")` and has `source: "cs300-lab"` and `runId`.

| `type` | Fields | When |
| --- | --- | --- |
| `ready` | | The bridge finished installing |
| `console` | `level` (`log`, `info`, `warn`, `error`, `debug`), `args` (serialized values), `text`, `time` | Any console call |
| `error` | `message`, `stack`, `file`, `line`, `column` | `window.onerror` |
| `rejection` | `message`, `stack` | `unhandledrejection` |
| `settled` | | The entry module finished evaluating and one animation frame passed |
| `check-results` | `results: [{ id, title, pass, hint }]` | After `check.js` ran |
| `check-error` | `message`, `stack` | `check.js` threw |
| `inspector` | `commit` (below) | After each React commit |
| `network` | `request` (below) | On each state change of a request |

`args` are serialized to plain JSON: primitives as is, functions as `"[Function name]"`, DOM nodes as `"<tag#id.class>"`, objects and arrays to depth 3 with cycles cut as `"[Circular]"`, errors as `{ name, message, stack }`.
`file` in `error` is the workspace path, mapped from the blob URL through `moduleUrls`.

An inspector commit:

```json
{
  "seq": 12,
  "time": 1234.5,
  "components": [
    {
      "id": "c3",
      "name": "TopicList",
      "parentId": "c1",
      "props": { "items": "[Array(2)]" },
      "state": [{ "hook": 0, "value": false }],
      "rendered": true,
      "rects": [{ "x": 10, "y": 40, "width": 300, "height": 80 }],
      "declaredAt": { "file": "src/App.jsx", "line": 8 },
      "usedAt": { "file": "src/App.jsx", "line": 19 }
    }
  ]
}
```

- `components` lists function components in tree order; host elements and the root are omitted.
- `props` and `state` values are serialized as console `args` are.
- `rendered` is true when the fiber performed work in this commit.
- `rects` are relative to the iframe viewport; a component with no DOM has an empty array.
- `declaredAt` comes from the compile step, which records the line of every top-level `function Name` and `const Name =` in each file; `usedAt` comes from the `jsxDEV` source of the element that produced the fiber.

A network request record:

```json
{
  "id": "r7",
  "method": "GET",
  "url": "https://jsonplaceholder.typicode.com/posts",
  "source": "preset",
  "state": "ok",
  "status": 200,
  "startTime": 1234.5,
  "duration": 182,
  "bodyPreview": "[{\"userId\":1,...",
  "contentType": "application/json",
  "calledFrom": { "file": "src/App.jsx", "line": 12 },
  "error": null
}
```

`state` is one of `pending`, `ok`, `http-error`, `network-error`, `parse-error`, `aborted`.
`source` is `fixtures`, `preset`, `custom`, or `other` for a URL outside the chosen base.
`calledFrom` is read from the stack at call time and mapped through `moduleUrls`; it is `null` when unknown.

### 4.4 Messages from the parent to the iframe

Posted with `iframe.contentWindow.postMessage(message, "*")`, with `source: "cs300-lab"` and `runId`.

| `type` | Fields | Effect |
| --- | --- | --- |
| `run-checks` | | Run `check.js` and reply with `check-results` |
| `set-api` | `env`, `fixtureControls` | Update the base URL and fixture controls without re-running |
| `inspector-highlight` | `componentId` or `null` | Highlight the component's rects in the overlay |
| `inspector-config` | `views: [...]` | Which views are open; the overlay draws only when `boundaries` or `flash` is open |

### 4.5 Run session hook

`src/runner/useRunSession.js` exports `useRunSession({ step, files, apiSource, fixtureControls })` and returns:

```js
{
  iframeRef,          // attach to the result iframe
  run(),              // builds and loads a new run
  runChecks(),
  status,             // "idle" | "compiling" | "running" | "settled" | "compile-error"
  diagnostics,
  consoleEntries,     // [{ level, text, args, time }]
  errors,             // [{ message, stack, file, line, column }]
  checkResults,       // [{ id, title, pass, hint }] or null
  inspectorCommits,   // array of commits for the current run, newest last
  latestCommit,       // the last inspector commit or null
  networkRequests,    // [{...}] keyed by id, updated in place as states change
  send(message),      // post a parent-to-iframe message with runId filled in
  runId
}
```

The inspector and network panes read from this hook; they do not talk to the iframe directly except through `send`.

## 5. Site shell

Routes, as in the design:

| Route | Component |
| --- | --- |
| `#/` | `Home` |
| `#/topics` | `Catalog` |
| `#/topic/:id` | `TopicPage` showing step 1 |
| `#/topic/:id/:n` | `TopicPage` showing step n |
| `#/path/:pathId` | `PathPage` |
| `#/path/:pathId/:unit` | `UnitPage` |

Step page layout: explanation pane, editor pane with file tabs and a toolbar (Run, Reset to starter, Show solution, Run checks, API source selector when the step has `api`), result pane, console pane, check panel, inspector pane, step navigation, and a visually hidden polite live region.
At widths under 900 pixels the panes stack in that order.

Directory ownership:

| Directory | Stream |
| --- | --- |
| `src/app/` | Editor and layout |
| `src/editor/` | Editor and layout |
| `src/ui/` | Editor and layout |
| `src/styles/` | Scaffold, then editor and layout |
| `src/runner/` except `useRunSession.js` and the two bridge parts below | Runner |
| `src/runner/useRunSession.js` | Editor and layout |
| `src/styles/content.css` (styles for rendered step HTML, edit cards, and Shiki dual-theme colors) | Content pipeline; editor and layout imports it |
| `src/runner/bridge/inspector-hook.js`, `src/inspector/`, `public/runtime/wrap/` | Inspector |
| `src/runner/bridge/fetch-shim.js`, `src/network/` | API sources and network panel |
| `src/progress/` | Editor and layout (minimal in Phase 1: completed steps and edited files in `localStorage`) |
| `scripts/build-content.mjs`, `scripts/validate-content.mjs`, `scripts/lib/` | Content pipeline |
| `scripts/build-runtime.mjs`, `public/runtime/` | Runtime |
| `scripts/export-d2l.mjs`, `tests/` | Tests, export, deploy |
| `content/` | Content authors |

The editor and layout stream creates `src/inspector/InspectorPane.jsx`, `src/network/NetworkPane.jsx`, and `src/network/ApiSourceSelector.jsx` as stubs that render a placeholder, with the props below, so that later streams replace the files without touching the layout.

```jsx
<InspectorPane session={session} step={step} onJumpToCode={({ file, line }) => ...} />
<NetworkPane session={session} onJumpToCode={({ file, line }) => ...} />
<ApiSourceSelector presets={presets} value={apiSource} onChange={setApiSource} fixturesAvailable={Boolean(step.fixtures)} fixtureControls={fixtureControls} onFixtureControlsChange={setFixtureControls} />
```

`apiSource` is `{ kind: "fixtures" }`, `{ kind: "preset", id }`, or `{ kind: "custom", baseUrl }`.
The resolved `API_BASE` is `https://fixtures.local` for fixtures, the preset's `baseUrl`, or the custom URL with a trailing slash removed.
The custom base URL is saved in `localStorage` under `cs300-lab:custom-base:<topic>/<n>`.

`onJumpToCode` opens the named file tab and moves the editor cursor to the line.

## 6. Session working rules

- Work on your own branch in your own worktree; commit after each milestone with a clear message and no co-author line; push the branch with `git push -u origin <branch>` after every commit.
- Do not touch files owned by another stream except the stubs this file says you replace; when you must, say so in your report.
- Read `docs/DESIGN.md`, `docs/KICKOFF.md`, and this file before writing code.
- Never modify the Fall content repository under `cs-300-content`.
- End with a report: what was built, what was verified and how, decisions made, and anything left open.

## Decisions log

- 2026-10-26: Generated content lives in `public/content/` and is gitignored; `public/runtime/` is committed.
- 2026-10-26: The result iframe uses `allow-same-origin` so that blob URLs made in the parent and the runtime modules load in development as well as on Pages.
- 2026-10-26: `import.meta.env` is rewritten to a bridge global rather than emulated per module.
- 2026-10-26: Edit blocks are fenced code blocks with attributes in the info string rather than shortcodes.
- 2026-10-26: Edit block semantics pinned (fence content minus final newline, exact anchor lines, first occurrence, `\n` for multi-line anchors) at the request of the topics-b author.
- 2026-10-26: `useRunSession.js` belongs to the editor and layout stream; the runner delivers `buildRun`, the bridge parts, and a `__LAB__` global; `declarations` travel in the run result.
