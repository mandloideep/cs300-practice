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

- `vite.config.js` sets `base: "/cs300-practice/"`; it was `"/cs300-react-lab/"` until the repository was renamed in Phase 7.
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
| `inspector.views` | no | Inspector views that start open: any of `boundaries`, `flash`, `tree`, `flow`, `network`, `dom` (Phase 4); default `[boundaries, flash, tree]` for a React workspace and `[dom]` otherwise |
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
  env,              // { API_BASE: "https://...", API_SOURCE: "fixtures" | "preset" | "custom" }
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
| `react-router` | `runtime/wrap/react-router.js`, always; the wrapper imports `runtime/react-router.js` and runs `BrowserRouter` and `createBrowserRouter` on a memory history (Phase 3) |

The inspector stream may point `react` and `react/jsx-dev-runtime` at wrapper modules under `runtime/wrap/` that import the files above; the import map is the only place that changes.

- The `srcdoc` document order is: `<!doctype html>`, `<head>` contents from the workspace `index.html` with workspace `<link rel="stylesheet">` tags replaced by inline `<style>` and workspace `<script>` tags removed, then the bridge as an inline classic script, then the import map, then `<body>` contents from the workspace `index.html`, then `<script type="module">import "<entry blob url>"</script>`.
- When `entry` is `index.html`, the entry module script is omitted and workspace `<script src>` tags are rewritten to blob URLs in place instead of removed.
- The bridge is assembled from `src/runner/bridge/core.js`, `src/runner/bridge/inspector-hook.js`, `src/runner/bridge/fetch-shim.js`, and `src/runner/bridge/dom.js` (Phase 4), each imported with Vite's `?raw` suffix and concatenated in that order.
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
| `inspector-select` | `componentId`, `name`, `declaredAt`, `usedAt` | The student clicked a boundary label in the overlay |
| `flow` | `trace` (below) | After each finished flow trace (Phase 2) |
| `location` | `pathname`, `search`, `hash`, `index`, `length` | On each change of the router's memory history, and once when the first router mounts (Phase 3) |
| `dom` | `snapshot` (below) | Once after `settled` and then once per animation frame in which the body's subtree changed, when the `dom` view is open (Phase 4) |
| `resize-request` | `width` (CSS pixels, rounded; `null` or a non-positive value restores) | Posted by `__LAB__.resize(width)` from a check or workspace code; the parent's result pane applies it exactly as its own `resize` and forwards nothing (Phase 4) |

`args` are serialized to plain JSON: primitives as is (`NaN`, `Infinity`, `-Infinity`, and `undefined` become the strings `"NaN"`, `"Infinity"`, `"-Infinity"`, and `"undefined"` at any depth, and print bare in `text` as a browser console does), functions as `"[Function name]"`, DOM nodes as `"<tag#id.class>"`, objects and arrays to depth 3 with cycles cut as `"[Circular]"`, errors as `{ name, message, stack }`.
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
- The overlay (boundary boxes, labels, and re-render flashes) is drawn inside the iframe document by the inspector hook, in a fixed-position layer that ignores pointer events except on labels, so that it follows scrolling and needs no coordinate mapping; the parent's inspector pane shows the tree and state and handles jump-to-code.
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
  "error": null,
  "stale": false,
  "duplicateOf": null
}
```

`state` is one of `pending`, `ok`, `http-error`, `network-error`, `parse-error`, `aborted`.
`source` is `fixtures`, `preset`, `custom`, or `other` for a URL outside the chosen base.
`calledFrom` is read from the stack at call time and mapped through `moduleUrls`; it is `null` when unknown.
`stale` (Phase 3) becomes true when the request settles after a newer request from the same `calledFrom` has already settled; `duplicateOf` (Phase 3) names the id of an identical method and URL from the same `calledFrom` that was still pending when this one started, else `null`.
Both are `false` and `null` while `calledFrom` is `null`.

A flow trace (Phase 2):

```json
{
  "id": "t4",
  "seq": 4,
  "startTime": 1234.5,
  "duration": 6.2,
  "event": { "type": "click", "target": "<button.add>", "handlerOwner": "BookmarkForm" },
  "entries": [
    { "kind": "prop-call", "time": 0.1, "prop": "onAdd", "passedBy": "App", "calledIn": "BookmarkForm", "args": ["\"React docs\""] },
    { "kind": "setter", "time": 0.3, "component": "App", "hook": 0, "hookName": "useState", "previous": "[Array(2)]", "next": "[Array(3)]" }
  ],
  "rendered": ["App", "BookmarkList"],
  "commitSeq": 13
}
```

- A trace starts when a labeled function (one carrying `__labOwner`) or a React event handler runs while no trace is open, and ends at the next inspector commit, or after one animation frame when nothing committed; then `rendered` is `[]` and `commitSeq` is `null`.
- `event` is `null` when the trace started outside a DOM event, as in a setter called from an effect or a timer; `handlerOwner` is the component whose JSX attached the handler, or `null`.
- `entries` are in call order; `args`, `previous`, and `next` use the console `args` serialization.
- `rendered` lists the names of the components whose fiber performed work in the closing commit, in tree order; `commitSeq` is that commit's `seq`.
- Nested labeled calls inside one event produce one trace with several entries, never nested traces.
- Phase 3 adds two entry kinds: `{ "kind": "request", "time", "requestId", "method", "url", "calledIn" }` when the fetch shim is called while a trace is open, and `{ "kind": "response", "time", "requestId", "state", "status", "duration", "stale", "duplicateOf" }` as the first entry of a trace that a settling response opens with `event: null`; `calledIn` is the component rendering when the request was made, or `null`.

A DOM snapshot (Phase 4):

```json
{
  "seq": 3,
  "time": 1234.5,
  "nodes": [
    { "id": "n1", "parentId": null, "tag": "main", "attributes": { "class": "page" }, "text": null, "declaredAt": { "file": "index.html", "line": 9 }, "changed": "attributes" }
  ]
}
```

- `nodes` lists `body` itself (with `parentId` `null`) and the element nodes of its subtree in document order; `text` carries the first 60 characters of an element's own whitespace-collapsed text content when it has no element children, else `null`; a `src` attribute that is a blob URL is reported as the workspace path.
- `declaredAt` is the line in `index.html` the element came from, taken from a map the compile step builds from the parsed markup, or `null` for a node a script created.
- `changed` is `added`, `removed`, `attributes`, `text`, or `null`, from a `MutationObserver` batched per animation frame; a removed node appears in the snapshot in which it was removed with its last known fields, then disappears.
- Hovering a row in the DOM view sends `dom-highlight` with the node id; the overlay draws the box through the existing layer.
- The `dom` view is available for every workspace; it is the only inspector view a vanilla workspace shows beside `network`.

### 4.4 Messages from the parent to the iframe

Posted with `iframe.contentWindow.postMessage(message, "*")`, with `source: "cs300-lab"` and `runId`.

| `type` | Fields | Effect |
| --- | --- | --- |
| `run-checks` | | Run `check.js` and reply with `check-results` |
| `set-api` | `env`, `fixtureControls` | Update the base URL and fixture controls without re-running |
| `inspector-highlight` | `componentId` or `null`; or `componentIds: [...]` (Phase 2) | Highlight the component's rects in the overlay; `componentIds` highlights several at once and an empty array clears, and a message carrying both honors `componentIds` |
| `inspector-config` | `views: [...]` | Which views are open; the overlay draws only when `boundaries` or `flash` is open |
| `navigate` | `delta` (-1 or 1) or `to` (a path) | Move the router's memory history, as the result pane's Back, Forward, and path field do (Phase 3) |
| `dom-highlight` | `nodeId` or `null` | Highlight the element's box in the overlay (Phase 4) |
| `resize` | `width` (CSS pixels) or `null` | Set the result iframe's width, so a check or a step can show a narrow layout; `null` restores the pane's width (Phase 4). Handled by the parent's result pane, which forwards nothing to the iframe |

### 4.5 Run session hook

`src/runner/useRunSession.js` exports `useRunSession({ step, files, apiSource, fixtureControls })` and returns:

```js
{
  iframeRef,          // attach to the result iframe
  run({ preserveStorage } = {}),  // builds and loads a new run; preserveStorage keeps the iframe's localStorage (Phase 3), otherwise it is cleared first
  runChecks(),
  status,             // "idle" | "compiling" | "running" | "settled" | "compile-error"
  diagnostics,
  consoleEntries,     // [{ level, text, args, time }]
  errors,             // [{ message, stack, file, line, column }]
  checkResults,       // [{ id, title, pass, hint }] or null
  inspectorCommits,   // array of commits for the current run, newest last
  latestCommit,       // the last inspector commit or null
  networkRequests,    // [{...}] keyed by id, updated in place as states change
  flowTraces,         // array of flow traces for the current run, newest last (Phase 2)
  location,           // the last location message or null (Phase 3)
  ready,              // true once the bridge posted ready for this run (Phase 4)
  frameWidth,         // the result iframe's requested width in CSS pixels or null (Phase 4)
  domSnapshot,        // the latest dom snapshot or null (Phase 4)
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

Phase 2 streams and their ownership are in `docs/PHASE2.md`; where the two tables differ, `docs/PHASE2.md` wins for Phase 2 work.
| `scripts/build-content.mjs`, `scripts/validate-content.mjs`, `scripts/lib/` | Content pipeline |
| `scripts/build-runtime.mjs`, `public/runtime/` | Runtime |
| `scripts/export-d2l.mjs`, `tests/` | Tests, export, deploy |
| `content/` | Content authors |

The editor and layout stream creates `src/inspector/InspectorPane.jsx`, `src/network/NetworkPane.jsx`, and `src/network/ApiSourceSelector.jsx` as stubs that render a placeholder, with the props below, so that later streams replace the files without touching the layout.

```jsx
<InspectorPane session={session} step={step} onJumpToCode={({ file, line }) => ...} />
<NetworkPane session={session} apiSource={apiSource} presets={presets} onJumpToCode={({ file, line }) => ...} />
<ApiSourceSelector presets={presets} value={apiSource} onChange={setApiSource} fixturesAvailable={Boolean(step.fixtures)} fixtureControls={fixtureControls} onFixtureControlsChange={setFixtureControls} />
```

`apiSource` is `{ kind: "fixtures" }`, `{ kind: "preset", id }`, or `{ kind: "custom", baseUrl }`.
The resolved `API_BASE` is `https://fixtures.local` for fixtures, the preset's `baseUrl`, or the custom URL with a trailing slash removed.
The custom base URL is saved in `localStorage` under `cs300-lab:custom-base:<topic>/<n>`.

`onJumpToCode` opens the named file tab and moves the editor cursor to the line.

### 5.1 Progress JSON (Phase 2)

The `localStorage` key `cs300-lab:progress` and the exported file share one shape:

```json
{
  "version": 1,
  "completed": { "lists-and-keys/2": "2026-10-26T18:00:00.000Z" },
  "files": { "lists-and-keys/2": { "src/App.jsx": "..." } },
  "pathId": "fall-2026",
  "exportedAt": "2026-10-26T18:05:00.000Z"
}
```

- `version` is an integer; `importProgress` accepts the current version and every lower one it can upgrade, and rejects a higher one with "This file was exported by a newer version of the lab."
- `exportedAt` appears only in exported files and is dropped on import.
- Import replaces the whole snapshot after the student confirms in a dialog; the dialog names how many completed steps the file holds.

### 5.2 Downloaded workspace (Phase 2)

"Download this workspace" on an `edit` step writes `<topic-id>-<n>.zip` with one top-level folder `<topic-id>-<n>/` containing:

| Entry | Content |
| --- | --- |
| `package.json` | `name` is the folder name, `private: true`, `type: "module"`, scripts `dev`, `build`, `preview`, dependencies `react` and `react-dom` at the runtime's pinned versions, `react-router` when the workspace imports it, devDependencies `vite` and `@vitejs/plugin-react` at the versions in this repository's `package.json` |
| `vite.config.js` | `defineConfig({ plugins: [react()] })`; when a workspace module reads `import.meta.env.API_BASE`, `envPrefix: ["VITE_", "API_"]` is added; Phase 7 adds `base: "./"` and the entries in 8.5 |
| `.env` | Only when a workspace module reads `import.meta.env.API_BASE`: `API_BASE=<base>` for the preset or custom base selected in the lab, or the first preset's base when the lab was on Fixtures, which exist only inside the lab; the README says which and why |
| `index.html` | The workspace `index.html` when the workspace has one; otherwise a minimal page with `<div id="root"></div>` and `<script type="module" src="/<entry>"></script>` |
| `README.md` | The topic title, step title, and the three commands to run |
| workspace files | The student's edited files for the step when they exist, otherwise the starter, at their workspace paths |

The ZIP never includes the vendored runtime, the wrappers, `check.js`, fixtures, or the solution.
A `local` step keeps its existing download, whose content is the step's `local` files.
A vanilla workspace (entry `index.html`, no React import) downloads as the workspace files plus a `README.md` that says to open `index.html` or serve the folder, with no `package.json` or `vite.config.js` (Phase 4).

## 6. Session working rules

- Work on your own branch in your own worktree; commit after each milestone with a clear message and no co-author line; push the branch with `git push -u origin <branch>` after every commit.
- Do not touch files owned by another stream except the stubs this file says you replace; when you must, say so in your report.
- Read `docs/DESIGN.md`, `docs/KICKOFF.md`, and this file before writing code.
- Never modify the Fall content repository under `cs-300-content`.
- End with a report: what was built, what was verified and how, decisions made, and anything left open.

## 7. Phase 6 contracts

Phase 6 is planned in `docs/PHASE6.md`, with its explainer inventory in `docs/EXPLAINERS.md` and its topic map in `docs/CURRICULUM.md`; ownership per stream is the table in `docs/PHASE6.md`.
These contracts are pinned before any Phase 6 stream starts and change only through the orchestrator.

### 7.1 The `demo` fence and the explainer registry

An explainer is placed in `step.md` with a fenced block whose info string is `demo name="<id>"`.
The body is empty or one JSON object, the explainer's props; the validator parses it and rejects a body that is not a JSON object.
`<id>` must be an id listed in `src/demos/registry.json`, an array of `{ "id", "title", "description" }` that the validator and the content build read and that `docs/EXPLAINERS.md` mirrors.

The content build compiles the fence to a placeholder with a text fallback:

```html
<div class="demo" data-demo="event-loop" data-props="{&quot;timers&quot;:2}">
  <p class="demo-fallback">Event loop: the call stack, the timer and event queues, and the order in which code runs.</p>
</div>
```

The compiled step gains `"demos": ["event-loop"]`, the ids in body order, `[]` when none.
`src/ui/StepExplanation.jsx` finds every `[data-demo]` after the HTML renders and mounts the registered component into it with a portal, replacing the fallback.

Every explainer lives in `src/demos/<id>/index.jsx` and exports:

```js
export const id = "event-loop";
export function stepCount(props) { return 7; }
export default function EventLoop({ props, step, reducedMotion }) { ... }
```

The shared frame in `src/demos/DemoFrame.jsx` owns the title, the description, the Play, Pause, Step, and Reset buttons, the timer that advances `step` while playing, and `aria-describedby` from the description; the explainer only draws the state for `step`, from `0` to `stepCount(props) - 1`.
The frame never autoplays, stops at the last step, and under `prefers-reduced-motion` starts at the last step with Step and Reset still working.
Explainers draw with the tokens in `src/styles/tokens.css` only and fit a 320 pixel wide column.
`tests/demos.spec.js` mounts every registered explainer on a fixture page, steps from the first to the last state, and runs axe with motion allowed and reduced.

### 7.2 The `predict` and `quiz` fences

A `predict` fence asks what the console or the page will show; a `quiz` fence asks a question with an explanation.
Both have the same body: a question line, then two to four option lines, each starting with `- ` except exactly one that starts with `= ` and is the answer; a `quiz` may end with one or more lines starting with `> `, the explanation.
An optional `id="<slug>"` attribute names the block; the default is `predict-<k>` or `quiz-<k>` with `k` counting from 1 in body order.

````markdown
```predict
What does the console show after one click?
- Added to the cart: Essence Mascara
- Nothing until the second click
= Six messages before any click
```
````

The content build compiles each to `<div class="predict" data-predict="<id>"></div>` with a fallback that lists the question and the options without the answer, and the compiled step gains `"questions": [{ "id", "kind", "question", "options", "answer", "explanation" }]`, where `answer` is the index into `options` and `explanation` is `null` for a predict.
The step page renders the options as a radio group.
A `predict` keeps the pick and reveals the answer when the next run of this step reaches `ready`; a `quiz` reveals on pick.
The topic page shows the quiz score for the topic as answered over total.

### 7.3 The "Read more" section

A level-two heading whose text is exactly `Read more` starts the folded part of a step.
The content build wraps everything from that heading to the line before the `**Check:**` paragraph in `<details class="read-more"><summary>Read more</summary>...</details>`, dropping the heading.
When a step has `## Read more`, the validator requires a `**Check:**` paragraph after it and allows at most one such heading; the `**If it breaks:**` paragraph belongs inside the folded part, before `**Check:**`.
A step without the heading validates as today, so the retrofit can land topic by topic.
The step page opens every `details.read-more` when `preferences.explanationsOpen` is true in progress; a control under the step title toggles that preference.

### 7.4 The `links` field

`topic.json` and step front matter may carry `links`, an array of `{ "kind", "title", "url" }` where `kind` is `lecture`, `reading`, or `reference`, `title` is a sentence fragment, and `url` starts with `https://`.
The compiled topic carries `links` and each compiled step carries `links`, `null` when absent.
The step page lists a step's links under the title, with the kind as the label, after the topic's links; the unit page lists each topic's `lecture` links; `scripts/export-d2l.mjs` prints the `lecture` links of each topic in the unit.

### 7.5 Releases

A path file may carry `"active": false`; the default is `true`.
A unit may carry `"opens": "YYYY-MM-DD"`; a unit without it is open.
`scripts/build-content.mjs` takes `--all` and reads `LAB_BUILD_DATE`, a `YYYY-MM-DD` date that defaults to today in UTC.
Without `--all`, a unit whose `opens` is after the build date is compiled as `{ "id", "title", "opens", "closed": true }` and nothing else, and a topic that appears in no open unit of any active path is left out of `index.json` and has no topic file written.
With `--all`, every unit is compiled in full with `"closed": false` and `opens` passed through, and every topic is written.
The `dev`, `validate`, and `test` scripts pass `--all`; `build` does not.
The unit page shows a closed unit's title and date with no links; the path page lists closed units after the open ones.
`deploy.yml` adds `schedule: [{ cron: "0 12 * * 1" }]`, Monday at 12:00 UTC, and the scheduled run behaves as a manual run with both inputs on.

### 7.6 Onboarding

The step-page tour is `src/ui/Tour.jsx`, five dialogs built on `src/ui/Dialog.jsx` that focus the explanation, the editor, Run, the result, and the console and check panel in that order, with Next, Back, and Skip.
It opens once per browser, on the first step page visited while `tour.stepPage` is null in progress, and from a `Tour` button in the site header on step pages; finishing or skipping stores the date.
The home page shows a card that links to `#/topic/using-the-lab` until every step of that topic is complete or `tour.homeCard` holds a dismissal date.

### 7.7 Progress JSON version 2

Version 2 adds three fields to the shape in 5.1, each present and empty on upgrade from version 1:

```json
{
  "version": 2,
  "answers": { "state-usestate/1/predict-1": { "pick": 2, "revealedAt": "2027-02-01T18:00:00.000Z" } },
  "preferences": { "explanationsOpen": false },
  "tour": { "stepPage": null, "homeCard": null }
}
```

`revealedAt` is `null` until a predict is revealed by a run or a quiz by a pick.

## 8. Phase 7 contracts

Phase 7 ownership is in `docs/PHASE7.md`; the names it fixes are in 8.7.

### 8.1 The `files` field and `fileNotes`

An `edit` step's front matter may carry `files`, a map from a workspace path to one sentence that replaces the dictionary's sentence for that file in that step:

```yaml
files:
  src/data/products.json: The twelve products the list renders, as the API would return them.
```

The validator rejects `files` on a `read` or `local` step, a key that is not a workspace path, and a value that is not a non-empty string.
The compiled step gains `"fileNotes": { "<path>": "<sentence>" }`, `{}` when the field is absent.

### 8.2 The project layout and the file tree

`projectLayout(step, files, api)` in `src/ui/workspaceProject.js` is a pure function that returns the ordered entries of the project a step's download writes:

```json
[
  { "path": "src", "name": "src", "depth": 0, "kind": "folder", "source": "workspace", "description": null, "createdBy": null },
  { "path": "src/App.jsx", "name": "App.jsx", "depth": 1, "kind": "file", "source": "workspace", "description": "The top component; what appears inside the root div.", "createdBy": null },
  { "path": "node_modules", "name": "node_modules", "depth": 0, "kind": "folder", "source": "download", "description": "Every installed package; never edited, never committed.", "createdBy": "npm install" }
]
```

- Entries are in tree order: at each level folders first, then files, each sorted by name; a folder's entries follow it with `depth` one greater.
- `source` is `workspace` for a file the editor holds and `download` for a file or folder only the download has; every `download` entry comes after every `workspace` entry.
- `createdBy` is `null` or the command that creates the entry on the student's computer: `npm install` for `node_modules` and `package-lock.json`, `npm run build` for `dist`.
- `description` is `fileNotes[path]` when the step has one, else the match in `src/editor/fileRoles.js`, else "A file of this step's project."; a folder's is `null` unless the dictionary names it.
- The zip builder writes exactly the `workspace` files and the `download` entries of `kind: "file"`, so the tree and the download cannot differ; `node_modules` and `dist` are listed and never written.

`src/editor/FileTree.jsx` takes `{ layout, activeFile, onSelect, modifiedFiles, showDownload, idPrefix }`, renders `role="tree"` with `role="treeitem"` nodes and `aria-expanded` on folders, follows the WAI-ARIA tree keyboard pattern (Up, Down, Left, Right, Home, End, Enter, Space, and type-ahead), marks the active file with `aria-selected`, and shows the selected entry's description in an element the tree's `aria-describedby` names.
The `download` entries sit under one collapsed node, **On your computer**, that `showDownload: false` leaves out.
It replaces `src/editor/FileTabs.jsx` in `CodeEditor.jsx` and `SolutionDiff.jsx`, and `FileTabs.jsx` is deleted.
The editor's `jumpTo` and every console and inspector link keep their behavior.

Progress gains `preferences.filesOpen`, a boolean that the Files toggle in the editor header writes; an absent key means `true`, and the progress version does not change.

### 8.3 The `project-tree` fence body

`project-tree` is the one explainer whose fence body is not JSON.
Its body is an indented listing: one entry per line, a folder name ending in `/`, two spaces per level, and a description after two or more spaces; a line `stage: <label>` starts a stage; in a stage after the first, a line starting with `+ ` is an entry that appears at that stage, and other lines are rejected.

````markdown
```demo name="project-tree"
stage: After npm create vite
my-first-react/
  index.html          The page the browser opens
  src/
    main.jsx          Finds the root div and renders App into it
stage: After npm install
+ node_modules/       Every installed package; never edited, never committed
```
````

`scripts/lib/fences.mjs` parses the body into the props the component receives, and the validator rejects an indentation that does not nest, a `+ ` line in the first stage, or an entry without a name:

```json
{
  "stages": [
    { "label": "After npm create vite", "entries": [
      { "path": "my-first-react", "depth": 0, "kind": "folder", "description": null, "fresh": true },
      { "path": "my-first-react/index.html", "depth": 1, "kind": "file", "description": "The page the browser opens", "fresh": true }
    ] },
    { "label": "After npm install", "entries": [ { "path": "my-first-react/node_modules", "depth": 1, "kind": "folder", "description": "Every installed package; never edited, never committed", "fresh": true } ] }
  ]
}
```

A `+ ` entry is placed by its indentation under the nearest folder of the stages before it, and `fresh` is `true` on the entries a stage adds.
With no `stage:` line the body is one stage labeled `null`, and `stepCount` is the number of entries.
With stages, `stepCount` is the number of stages, and stage `k` shows the entries of stages `0` to `k`.
An empty body uses the component's `defaults`, the Vite project of `vite-project-anatomy`.

### 8.4 The Git and deployment explainers

The eight explainers take JSON props as 7.1 says; each has `defaults` that stand alone, and a step passes any subset.

| Id | Props |
| --- | --- |
| `three-trees` | `{ "file": "App.jsx" }`: the file that is edited, added, and committed |
| `commit-graph` | `{ "commits": [{ "hash": "a1b2c3d", "message": "Add the product list", "files": ["src/App.jsx"] }] }`, oldest first; `hash` is seven hex characters |
| `branch-and-merge` | `{ "main": ["Initial page", "Add styles"], "branch": { "name": "cart", "commits": ["Add the cart"] }, "mainMovesAfterBranch": false }`: `false` draws a fast-forward, `true` a merge commit |
| `merge-conflict` | `{ "file": "src/App.jsx", "base": ["<h1>Shop</h1>"], "ours": ["<h1>The Shop</h1>"], "theirs": ["<h1>Shop</h1>", "<p>Open daily</p>"] }`: three versions of the same lines |
| `remote-sync` | `{ "scenario": "push" }`: one of `push`, `pull`, `rejected`, drawing a local and a remote history |
| `pull-request-flow` | `{ "branch": "cart", "title": "Add the cart", "checks": ["lint", "test", "build"] }` |
| `static-deploy` | `{ "repo": "my-first-react", "route": "/products/3", "notFoundPage": false }`: the address each file gets under `/<repo>/` and what a refresh at `route` returns |
| `ci-pipeline` | `{ "stages": ["install", "build", "deploy"], "failAt": null }`: `failAt` is a stage index or `null` |

### 8.5 The deployable download

Section 5.2 changes for every React workspace download:

| Entry | Content |
| --- | --- |
| `vite.config.js` | `defineConfig({ base: "./", plugins: [react()] })`, with `envPrefix` as before when the workspace reads `API_BASE` |
| `.gitignore` | `node_modules` and `dist`, one per line |
| `.github/workflows/deploy.yml` | The workflow in `docs/PHASE7.md` under "deploy-with-github-pages", byte for byte |
| `README.md` | Gains a "Deploy to GitHub Pages" section with the five-item checklist from `docs/PHASE7.md`; a routing workspace's section says to use `HashRouter` or add a `404.html` |

A vanilla download's `README.md` gains one sentence that says to set the Pages source to the branch.
`projectLayout` lists `.gitignore`, `.github/workflows/deploy.yml`, `package.json`, `package-lock.json`, `vite.config.js`, `node_modules`, `dist`, and `.env` when written, as `download` entries, and `README.md` alone for a vanilla workspace.

### 8.6 The Fall 2026 units

`content/paths/fall-2026.json` gains a unit `git-and-github` after `foundations` with no `opens`, titled "Git and GitHub: version control, pull requests, and deployment", holding `git-basics`, `git-collaboration`, and `deploy-with-github-pages` with `required: false`; `week-11`, `week-12`, and `week-13` gain `opens` of `2026-11-02`, `2026-11-09`, and `2026-11-16`.
`content/paths/spring-2027.json` gains `"active": false`.

### 8.7 The names

| Name | Value |
| --- | --- |
| The site | CS300 Practice |
| A week's set of topics | Guided Practice |
| The repository and the Pages base | `cs300-practice`, `base: "/cs300-practice/"` |
| The onboarding topic | id `getting-started`, title "Using CS300 Practice" |
| Kept as they are | the `cs300-lab` message source, the `cs300-lab:progress` and `cs300-lab:custom-base` storage keys, the `cs300-lab:sandbox:` storage scope, `__LAB__`, `LAB_BUILD_DATE` |

Student-facing prose says "CS300 Practice" where it names the site and "this site" or "the browser" where it means the place the code runs; it never says "lab".

## Decisions log

- 2026-10-26: Generated content lives in `public/content/` and is gitignored; `public/runtime/` is committed.
- 2026-10-26: The result iframe uses `allow-same-origin` so that blob URLs made in the parent and the runtime modules load in development as well as on Pages.
- 2026-10-26: `import.meta.env` is rewritten to a bridge global rather than emulated per module.
- 2026-10-26: Edit blocks are fenced code blocks with attributes in the info string rather than shortcodes.
- 2026-10-26: Edit block semantics pinned (fence content minus final newline, exact anchor lines, first occurrence, `\n` for multi-line anchors) at the request of the topics-b author.
- 2026-10-26: `useRunSession.js` belongs to the editor and layout stream; the runner delivers `buildRun`, the bridge parts, and a `__LAB__` global; `declarations` travel in the run result.
- 2026-10-26: The inspector overlay lives inside the iframe; the iframe posts `inspector-select` when a label is clicked.
- 2026-10-26: `env` carries `API_SOURCE` beside `API_BASE` (in `buildRun` and `set-api`) so the fetch shim can label a request's `source`; `NetworkPane` also receives `apiSource` and `presets`. Requested by the network stream.
- 2026-10-26: Phase 2 contracts pinned: the `flow` message and trace record (4.3), `componentIds` on `inspector-highlight` (4.4), `flowTraces` on `useRunSession` (4.5), `flow` as an `inspector.views` value, the progress JSON shape (5.1), and the downloaded workspace layout (5.2). Phase 2 ownership is in `docs/PHASE2.md`.
- 2026-10-26: Phase 3 contracts pinned: the `location` message and `navigate` message, the `request` and `response` flow entries, `stale` and `duplicateOf` on the network record, `preserveStorage` on `run()`, and `location` on `useRunSession`. The router runs on a memory history in the iframe through a `react-router` wrapper. Phase 3 ownership is in `docs/PHASE3.md`.
- 2026-10-26: `react-router` always resolves to `runtime/wrap/react-router.js`, inspector on or off. The iframe's `localStorage` and `sessionStorage` are Proxy views scoped under `cs300-lab:sandbox:` so student code cannot touch the site's progress, and `run()` clears that scope before each run unless `preserveStorage: true`. Decided by the Phase 3 runtime stream.
- 2026-10-26: Phase 4 contracts pinned: the `dom` snapshot message, `dom-highlight` and `resize` parent messages, `dom` as an `inspector.views` value and the default for a vanilla workspace, and the vanilla download layout. The DOM view is the vanilla counterpart of boundaries and flash. Phase 4 ownership is in `docs/PHASE4.md`.
- 2026-10-26: The bridge has a fourth part, `src/runner/bridge/dom.js`, concatenated after `fetch-shim.js`; it owns the `dom` snapshots and `dom-highlight`, and the overlay host is shared with the inspector hook. A content build defaults `inspector.views` to `[dom]` for a vanilla step. Decided by the Phase 4 runtime stream.
- 2026-10-28: Phase 7 contracts pinned in section 8: the `files` field and `fileNotes`, the project layout and the file tree, the `project-tree` fence body, the Git and deployment explainer props, the deployable download, the Fall 2026 units, and the names. Phase 7 ownership is in `docs/PHASE7.md`.
- 2026-10-27: Phase 6 contracts pinned in section 7: the `demo` fence and registry, the `predict` and `quiz` fences, the "Read more" section, the `links` field, the release fields and `--all`, the tour, and progress JSON version 2. Phase 6 ownership is in `docs/PHASE6.md`.
