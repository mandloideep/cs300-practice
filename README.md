# cs300-react-lab

CS300 Lab is a static, client-side learning site for CS300 at Northeastern Illinois University.
Students read a short explanation, edit code in the browser, run it, see the rendered result and the console, and check their work against stated expectations.
Content is organized by topic, with a semester path layered on top, so topics are reused across semesters.

The site is deployed to GitHub Pages at <https://mandloideep.github.io/cs300-react-lab/>.
Everything runs in the visitor's browser: there is no server, no account, no database, and no analytics.

The design of record is [docs/DESIGN.md](docs/DESIGN.md).
The Phase 1 scope is in [docs/KICKOFF.md](docs/KICKOFF.md), the plans for Phases 2 to 6 are in [docs/PHASE2.md](docs/PHASE2.md), [docs/PHASE3.md](docs/PHASE3.md), [docs/PHASE4.md](docs/PHASE4.md), [docs/PHASE5.md](docs/PHASE5.md), and [docs/PHASE6.md](docs/PHASE6.md), the explainer inventory is [docs/EXPLAINERS.md](docs/EXPLAINERS.md), the curriculum map is [docs/CURRICULUM.md](docs/CURRICULUM.md), the semester-to-semester tasks are in [docs/MAINTENANCE.md](docs/MAINTENANCE.md), and the interfaces shared by every part of the code are in [docs/CONTRACTS.md](docs/CONTRACTS.md).

## Local setup

You need Node 24 or newer and npm.
The repository pins Node 24 in `.nvmrc`, which is what CI uses.

```sh
nvm use
npm ci
npm run dev
```

`npm run dev` compiles `content/` into `public/content/` and then starts the Vite dev server.
Open the URL it prints, which ends in `/cs300-react-lab/`.

To check a production build locally:

```sh
npm run build
npm run preview
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Compiles all the content with `--all`, then starts the Vite dev server |
| `npm run build` | Compiles the content released as of today, then builds the site into `dist/`; set `LAB_BUILD_DATE` to build as of another date |
| `npm run preview` | Serves `dist/` locally |
| `npm run build:content` | Compiles `content/` into `public/content/` with `scripts/build-content.mjs`, leaving out the units that have not opened as of `LAB_BUILD_DATE` or today; `-- --all` compiles everything |
| `npm run build:runtime` | Rebuilds the vendored React runtime in `public/runtime/` with `scripts/build-runtime.mjs` |
| `npm run verify:runtime` | Loads the vendored runtime in headless Chromium and checks that it acts as one React instance |
| `npm run upgrade:runtime -- <react> <react-router>` | Pins the exact versions, rebuilds and verifies the runtime, and prints the commit message; `--dry-run` only prints the steps |
| `npm run validate` | Validates all of `content/`, whatever the `opens` dates say, without writing anything, with `scripts/validate-content.mjs` |
| `npm run new:topic -- <id> --area <area> --title "<title>"` | Scaffolds a topic with its first step from `scripts/templates/` |
| `npm run new:step -- <topic-id> "<title>"` | Adds the next numbered step to a topic, starting from the previous step's solution |
| `npm run lint` | Runs ESLint over `src`, `scripts`, and `tests` |
| `npm run format` | Formats the code with Prettier |
| `npm run format:check` | Checks the formatting with Prettier |
| `npm run test:scripts` | Runs the Node tests for the scripts, under `scripts/test/`, without a browser |
| `npm test` | Compiles all the content with `--all`, then runs the Playwright tests against the Vite dev server; set `PLAYWRIGHT_PORT` when another checkout's server already holds port 4173 |
| `npm run export:d2l -- <path-id>` | Writes a Brightspace page per open unit of a path into `dist-d2l/` |

Prettier does not touch Markdown or `content/`.
Markdown keeps one sentence per physical line, and the edit blocks in each `step.md` must match their workspace files byte for byte.

## How the site is organized

- `src/app/` holds the routes, the site header, and the pages.
- `src/demos/` holds the interactive explainers that steps place with a `demo` fence, their registry, and the frame they share.
- `src/styles/tokens.css` holds the design tokens, and `src/styles/global.css` holds the base styles.
- `content/` holds the topics, paths, areas, and API presets as plain files.
- `src/runner/` compiles a workspace with Sucrase, links its modules as blob URLs, and builds the document for the sandboxed result iframe, including the bridge script that reports console output, errors, and check results.
- `src/runner/harness/index.html` is a development-only page that runs any step from `content/` and prints every bridge message; with `npm run dev` it is at `/cs300-react-lab/src/runner/harness/index.html`.
- `public/runtime/` holds the vendored React runtime that the result iframe loads through an import map.
- `scripts/` holds the content, runtime, and export build scripts.

A step page shows the explanation, the editor with file tabs, the result, the console, the inspector (boundaries, re-render flash, tree and state, flow trace, and the DOM view for plain pages), the network pane on fetching steps, the check panel, and step navigation.
Every edit step has "Download this workspace", which writes a Vite project for a React workspace or a plain folder for an HTML, CSS, and JavaScript one, and a step whose code saves to `localStorage` gets a second "Run, keeping saved data" button that runs without clearing the result's storage.
Progress stays in the browser and can be exported and imported on the home page.

Routes use hash routing so that deep links work on GitHub Pages: `#/`, `#/topics`, `#/topic/<id>`, `#/topic/<id>/<n>`, `#/path/<pathId>`, and `#/path/<pathId>/<unit>`.

## Deployment

Two workflows live in `.github/workflows/`.

`check.yml` runs on every pull request and on every push to `main`.
It installs with `npm ci`, then runs lint, the format check, content validation, the build, and the script tests.
It needs no browser and finishes in under a minute.

`deploy.yml` runs every Monday at 12:00 UTC, which is 7:00 in Chicago in summer time and 6:00 in winter, and whenever it is started by hand, from the Actions tab or with `gh workflow run deploy.yml`.
Its build job repeats the checks, runs `npm run build` as of that day, and uploads `dist/` as the Pages artifact.
Its test job restores the cached Chromium build, runs the runtime check, and runs the Playwright suite in three parallel shards.
Its deploy job publishes the artifact to GitHub Pages once the build and every shard are green.
The run takes two inputs, both on by default: `tests` skips the suite when off, and `deploy` skips publishing when off.
A scheduled run has no inputs and behaves as a manual run with both on.
Start it by hand at the end of a phase or at any milestone worth publishing.

The weekly run is how a semester opens one unit at a time.
`npm run build` compares each unit's `opens` date with the build date and compiles a unit that has not opened as its title and date only, and a topic that is in no open unit of an active path is left out of the deployed files, so its page does not exist until its week.
On the Monday a unit opens, the scheduled run builds it in, runs the suite, and publishes only when every shard is green; a failed run reaches the instructor as the usual Actions failure notification, and the site stays as it was.
`npm run dev`, `npm run validate`, and `npm test` always use `--all`, so authors and the suite see the whole site.
To see the site as students will on a given day, build as of that date and serve it:

```bash
LAB_BUILD_DATE=2027-03-01 npm run build && npm run preview
```

## Adding a topic

A topic is a folder under `content/topics/` whose name is the topic id.
The id is permanent, because links from D2L and from other topics use it.

```text
content/topics/<topic-id>/
  topic.json
  01-<slug>/
    step.md
    workspace/        edit steps only: the starter files
    solution/         edit steps only: the same file set as workspace/
    check.js          optional
    fixtures/         optional: routes.json plus body files
    local/            local steps only: a workspace students download and run with npm
  02-<slug>/
```

Start a topic from the templates under `scripts/templates/` rather than from an empty folder:

```sh
npm run new:topic -- lists-and-keys --area react --title "Lists and keys"
```

This writes `topic.json` and a first edit step, `01-first-step/`, with a `step.md` that already has one working edit block, a `workspace/`, a matching `solution/`, and a `check.js`, then prints what to fill in.
The starter workspace is a React page for most areas and a plain page with an `index.html` entry for the `html`, `css`, `javascript`, `dom`, and `fetch` areas; `--kind react` or `--kind vanilla` overrides that choice, and `--step "<title>"` names the first step.
Add the next step with its title:

```sh
npm run new:step -- lists-and-keys "Stable keys"
```

The new step is numbered after the last one, and its `workspace/` and `solution/` start as copies of the previous edit step's `solution/`, with that step's `entry`, `inspector`, `api`, and `fixtures/` carried over, so you change `solution/` and write the edit blocks that get there.
Neither command overwrites anything that exists, and neither touches `content/paths/`, so add the topic to a unit yourself.
The scaffolded files validate as they are, and `npm run test:scripts` keeps it that way.

`topic.json` has every one of these fields:

```json
{
  "id": "lists-and-keys",
  "title": "Lists and keys",
  "area": "react",
  "summary": "Two sentences at most.",
  "prerequisites": ["components-and-props"],
  "minutes": 70,
  "updated": "2026-10-26",
  "changeNote": "First version."
}
```

`area` is an id from `content/areas.json`, every prerequisite is an existing topic id, and `updated` is written as `YYYY-MM-DD`.
Step folders are numbered `01`, `02`, and so on with no gaps, followed by a lowercase hyphenated slug.

Each `step.md` starts with YAML front matter:

```yaml
---
title: Load the products from an API
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, network]
  watch: [App, ProductList]
api:
  default: fixtures
required: [one-products-request, uses-api-base, products-render]
---
```

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | yes | The step heading and its name in navigation |
| `mode` | yes | `edit`, `read`, or `local` |
| `entry` | edit steps | The workspace file the runner executes, such as `src/main.jsx`, or `index.html` for a page with no module entry |
| `inspector.views` | no | Views that start open: `boundaries`, `flash`, `tree`, `flow`, `network`, `dom`; a React workspace defaults to `[boundaries, flash, tree]` and a plain HTML, CSS, and JavaScript workspace to `[dom]` |
| `inspector.watch` | no | Component names pinned at the top of the inspector tree |
| `api.default` | no | `fixtures`, `custom`, or a preset id; include it only when the workspace fetches |
| `required` | no | Check ids that must pass; the default is every check `check.js` returns |

The body follows the Week 8 pattern: a short explanation, small typed edits with an explanation beside each, a `**Check:**` paragraph, and an `**If it breaks:**` paragraph.
Put each full sentence on its own line, and never use the em dash character.
Code blocks may use the languages `jsx`, `js`, `html`, `css`, `json`, `bash`, `text`, and `diff`.
Complete files belong only in collapsed review panels written with `<details><summary>src/App.jsx after this step</summary>`, a blank line, a fenced block, a blank line, and `</details>`.
Link to another topic as `[Components and props](#/topic/components-and-props)`.

An edit block is a fenced code block whose info string names the language and then `file`, `action`, and, for most actions, `anchor`:

````markdown
```jsx file="src/App.jsx" action="insert-after" anchor="      <ul>"
        <li>One more item</li>
```
````

| `action` | Effect |
| --- | --- |
| `replace` | Replaces the anchor lines with the code |
| `insert-after` | Inserts the code after the last anchor line |
| `insert-before` | Inserts the code before the first anchor line |
| `delete` | Removes the anchor lines; the fence is empty |
| `append` | Adds the code after the last line of the file |
| `create` | Writes the file with the code as its content |

These rules decide whether a step validates:

- The code is the fence content with only its final newline removed, so a blank first or last line inside the fence is inserted too.
- An anchor is one or more complete lines, matched exactly, including indentation, at the first place they occur in the file as it stands after the earlier edit blocks of the same step.
  Write a multi-line anchor with a literal `\n` between the lines.
- Values may use double or single quotes; use single quotes when the anchor contains double quotes.
  An anchor cannot contain a backtick, because Markdown does not allow one in a code fence's info string.
- Applying every edit block of a step, in order, to `workspace/` must produce `solution/` exactly, and every file ends with one newline.
- `workspace/` and `solution/` have the same file set, so a file the student fills in starts in `workspace/` as a placeholder.

A React workspace has a complete Vite-style `index.html` with `<div id="root"></div>` and `<script type="module" src="/src/main.jsx"></script>`.
Workspace files import each other with relative paths that include the extension, and may import `react`, `react-dom`, `react-dom/client`, `react/jsx-runtime`, `react/jsx-dev-runtime`, and `react-router`.
Code that students see carries no explanatory comments; the explanation belongs in `step.md`.

`check.js` runs inside the result iframe after the code settles and again when the student presses Run checks:

```js
export default async function check({ document, console, network, inspector, wait }) {
  const items = document.querySelectorAll("li");
  return [
    {
      id: "three-items",
      title: "Three list items render",
      pass: items.length === 3,
      hint: "The list should have one li per topic in the array.",
    },
  ];
}
```

| Argument | What it holds |
| --- | --- |
| `document` | The result iframe's document |
| `console` | Every console entry since the run started, as `{ level, text, time }` |
| `network` | Every request record since the run started, with `method`, `url`, `source`, `state`, and `status` |
| `inspector` | `{ components }`, the latest React commit: each component's `name`, `props`, `state`, and `rendered` |
| `wait` | `(ms) => Promise<void>` |

Return two to four results, give every result a `hint` that says what to look at, and prefer what the student can see: the DOM, a console message, a request, or a named component.
A check may click and type, but it should put the page back the way it found it.

A fetching step adds `fixtures/routes.json` and the body files it names:

```json
{
  "routes": [
    { "method": "GET", "path": "/products", "status": 200, "body": "products.json" },
    { "method": "GET", "path": "/products/:id", "body": "product.json" }
  ]
}
```

Paths match the request pathname exactly, `:name` matches one segment, the query string is ignored, `status` defaults to 200, and `body` is a file in `fixtures/` or an inline JSON value.
The workspace builds every URL from `import.meta.env.API_BASE`, so the API source selector can switch between fixtures, presets, and a custom server.

Check your work before committing:

```sh
npm run validate
```

The validator names the file and the rule for every problem, and prints a unified diff when the edit blocks do not reproduce the solution.
Besides the format rules above, it holds `content/` to these style rules, and each message names the file and the line:

- Every `.md` file outside `local/` keeps one sentence per physical line.
  The check is a heuristic: a line of prose with a sentence end followed by a space and a capital letter, read outside code fences, front matter, tables, inline code, link text, and HTML tags and after any list, heading, or blockquote marker.
  Rephrase a line that trips it on an abbreviation.
- No file under `content/` contains the em dash character.
- No file under `workspace/`, `solution/`, or `local/` has a line that starts a comment with `//`, `/*`, or `<!--`; a `#` in CSS is a color or a selector and is fine.
- `topic.json` has `updated` as a date and `changeNote` as a sentence.
- Every topic is in a unit of at least one path under `content/paths/`.

`npm run build:content` runs the same checks and then writes `public/content/`.
Finally, run `npm run dev` and walk the new topic in the browser.

## Predict, quiz, Read more, and links

A step opens with a lead of two to four sentences, then an explainer or a predict block, then the edit blocks, then the longer explanation under "Read more", then the `**Check:**` paragraph.
[docs/PHASE6.md](docs/PHASE6.md) explains the order; the fences and fields below are how a step says it.

A `predict` fence asks what the console or the page will show before the student runs the code.
Its first line is the question, then two to four options that each start with `- `, except the one answer, which starts with `= `:

````markdown
```predict
What does the console show after one click on Add to cart?
- Nothing until the second click
= Rendering Essence Mascara with quantity 1
- Six lines, one per card
```
````

The step page shows the options as a radio group and keeps the pick in progress.
On an edit step the answer is revealed when the student next runs the code, so the console confirms or corrects the guess; on a read or local step it is revealed on the pick.

A `quiz` fence has the same shape and may end with one or more explanation lines that start with `> `.
Its answer is revealed on the pick, with the explanation, and the topic page shows how many of the topic's quizzes are answered and how many are right.

````markdown
```quiz
Which call adds three?
- setCount(count + 1), three times
= setCount((c) => c + 1), three times
> The updater form reads the latest pending value each time.
```
````

Each block gets the id `predict-1`, `predict-2`, `quiz-1`, and so on in body order, which names its record in progress; give one a fixed name with `id="<slug>"` in the info string if it might move.
Options and explanations may use inline code in backticks.
The validator names the line of a block with no answer, more than one answer, fewer than two or more than four options, or an explanation in a predict.

A level-two heading whose text is exactly `Read more` starts the folded part of a step.
Everything from that heading to the `**Check:**` paragraph is closed by default; put the background, the comparison with an earlier week, and the `**If it breaks:**` paragraph there.
A step has at most one such heading, the `**Check:**` paragraph must follow it, and a step without it validates as before.
A student who prefers to read first can tick "Keep explanations open", which opens every Read more on every step.

`topic.json` and a step's front matter may carry `links`, each a lecture, a reading, or a reference with a title and an `https` URL:

```json
"links": [
  { "kind": "lecture", "title": "Week 5 Session 1 slides", "url": "https://..." },
  { "kind": "reading", "title": "javascript.info: Functions", "url": "https://javascript.info/function-basics" }
]
```

```yaml
links:
  - kind: reference
    title: "MDN: Array.prototype.map"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
```

The step page lists the topic's links and then the step's under the step title, labeled by kind, and the unit page lists each topic's lecture links.

## Adding an explainer

An explainer is a small React component that shows one idea moving inside a step's explanation.
[docs/EXPLAINERS.md](docs/EXPLAINERS.md) lists every explainer the lab plans, and a new one goes there first.
Every id in that file also has an entry in `src/demos/registry.json` with its title and a one-sentence description:

```json
{ "id": "event-loop", "title": "Event loop", "description": "The call stack, ..." }
```

A step places an explainer with a `demo` fence whose body is empty or one JSON object of props:

````markdown
```demo name="event-loop"
{ "timers": 2 }
```
````

The validator rejects an id that is not in the registry and a body that is not a JSON object.
The build turns the fence into a placeholder that holds the title and the description as text, and the step page mounts the component into it.
A registered id with no component yet keeps that text, so a step can place an explainer before it is built.

The component lives in `src/demos/<id>/index.jsx`, with any styles of its own in `src/demos/<id>/styles.css`, and exports three things:

```jsx
export const id = "event-loop";

export function stepCount(props) {
  return 7;
}

export default function EventLoop({ props, step }) {
  return <Caption>Stage {step + 1}</Caption>;
}
```

`src/demos/DemoFrame.jsx` draws the title, the description, and the Play, Pause, Back, Step, and Reset controls, and passes the component the stage to draw as `step`, from `0` to `stepCount(props) - 1`.
The component only draws that stage; it never starts a timer of its own.
It also receives `reducedMotion` and `goTo(stage)` for an explainer that moves itself when the student clicks inside it.
Build it from the pieces in `src/demos/kit.jsx`, such as `Caption`, `CodeView`, `ConsoleView`, `Panel`, `Chip`, and `Choice`, so that every explainer reads the same.

Every explainer keeps the contract in [docs/CONTRACTS.md](docs/CONTRACTS.md) section 7.1:

- It never plays on its own, and the frame's controls work from the keyboard.
- Under `prefers-reduced-motion` the frame opens on the last stage, and Back, Step, and Reset still work.
- Each stage ends with a `Caption` that says in words what the picture shows.
- It draws only with the tokens in `src/styles/tokens.css` and fits a 320 pixel column.
- It takes the step's own values from its props where that makes sense, and works with no props.
- The code it shows carries no explanatory comments; the caption explains.

With `npm run dev` running, `/cs300-react-lab/src/demos/harness/index.html` lists every explainer, and `?id=<id>&width=320` shows one at phone width with optional `&props=<json>`.
`tests/demos.spec.js` mounts every built explainer on that page, steps it from the first stage to the last from the keyboard, checks the 320 pixel column, and runs axe in light and dark with motion allowed and reduced.
When an explainer is built, set its Status in [docs/EXPLAINERS.md](docs/EXPLAINERS.md) to `built`.

## Adding a path

A path is one JSON file in `content/paths/`, named after its id, that orders existing topics into units for one semester.
It never copies topic content, so improving a topic improves every path that uses it.

```json
{
  "id": "spring-2027",
  "title": "Spring 2027",
  "active": true,
  "units": [
    {
      "id": "week-10",
      "title": "React, Vite, JSX, components, props, and lists",
      "intro": "One paragraph to students in the course voice.",
      "topics": [
        { "id": "react-mental-model", "required": true },
        { "id": "lists-and-keys", "required": false }
      ],
      "localNotes": ["What students run on their own computer this week."],
      "opens": "2027-01-25"
    }
  ]
}
```

Every topic id must exist under `content/topics/`, every `required` is `true` or `false`, and `localNotes` is a list of sentences.
Two optional fields control when students see the path, as the "Deployment" section explains.
`opens` on a unit is the date it is released, written as `YYYY-MM-DD`; set it to the Monday of the unit's week so the scheduled deploy opens it that morning, and leave it out for a unit that is open from the start.
`active` on the path is `true` by default; set it to `false` when a semester is over and the path is kept only for its history, and the deployed site leaves it out along with every topic that no active path releases.
Validation still requires every topic to be in some path, whatever the dates and `active` say.
The unit page is `#/path/<path-id>/<unit-id>`, which is the link to post in D2L.
Run `npm run validate` after editing.

## Exporting a D2L page

The export writes one Brightspace page per unit of a path, built from the compiled content rather than from the Markdown.

```bash
npm run build:content
npm run export:d2l -- fall-2026
```

For each unit, `dist-d2l/<path-id>/<unit-id>.html` is a complete page in the CS300 Brightspace template, ready to upload to Content as an HTML file.
`dist-d2l/<path-id>/<unit-id>.fragment.html` holds only the page content, for pasting into an existing D2L page that already uses the template.
Each page has the unit intro, a link to the unit in the lab, the required topics with links to each topic, the optional topics, and the notes about work on your own computer.
Links point at `https://mandloideep.github.io/cs300-react-lab/`.
The template is copied into `scripts/export-d2l.mjs` from the Fall course repository's D2L build kit; update the copy there if the build kit's template changes.
`dist-d2l/` is generated and not committed.

## Adding an API preset

Presets are the public servers in the API source selector, listed in `content/api-presets.json`.
Add an object to the array:

```json
{
  "id": "tvmaze",
  "title": "TVMaze search",
  "baseUrl": "https://api.tvmaze.com",
  "docsUrl": "https://www.tvmaze.com/api",
  "endpoints": [{ "path": "/search/shows", "description": "Shows matching ?q=office" }],
  "responseShape": "A top-level array of { score, show }.",
  "rateLimit": "At least 20 calls every 10 seconds per address."
}
```

`baseUrl` starts with `https://` and has no trailing slash, because workspaces append paths that start with `/`.
Before adding a server, confirm that it needs no key and answers browser requests: `curl -s -D - -H "Origin: https://mandloideep.github.io" "<baseUrl><endpoint>"` should return 200 with an `access-control-allow-origin` header of `*` or that origin.
Record the response shape and the published rate limit from its documentation.
A step can start on the new preset with `api: { default: <id> }`, but fixtures remain the better default because they work offline.
Run `npm run validate` after editing.

## Upgrading the runtime

The result iframe does not load React from a CDN.
It loads development builds of `react`, `react-dom`, `react-dom/client`, `react/jsx-runtime`, `react/jsx-dev-runtime`, and `react-router` from `public/runtime/` through an import map.
Those files are generated by `scripts/build-runtime.mjs` from the exact versions pinned in `package.json`, and they are committed.
The script bundles every entry in one esbuild run with code splitting, so the package code lives in shared `chunk-*.js` files and a page that imports several entries gets exactly one copy of React.
`public/runtime/manifest.json` records the package versions, the esbuild version, the import map, the file list, and the build time.
The script replaces only the files it generates, so `public/runtime/wrap/` is left alone.

The versions follow the course technical baseline in the Fall operations ledger.
To upgrade, start from a clean working tree and run one command with the exact versions, keeping `react` and `react-dom` on the same version:

```sh
npm run upgrade:runtime -- 19.2.8 8.3.0
```

The script refuses to run while a tracked file has uncommitted changes, so that the upgrade is the only change in the working tree and is easy to undo.
It then runs `npm install --save-exact` for `react`, `react-dom`, and `react-router`, rebuilds the runtime with `npm run build:runtime`, and verifies it with `npm run verify:runtime`.
The verification serves `public/runtime/` behind the same import map the runner uses and loads it in headless Chromium.
It renders a `MemoryRouter` tree built with `jsxDEV` and `jsx` through `createRoot`, calls `useState` and `useLocation`, clicks a button to update state, and fails on any console warning, console error, or page error.
If an entry carried its own copy of React, this fails with "Invalid hook call".
Run `npx playwright install chromium` once if Playwright has no browser yet.

When every step passes, the script prints the commit message to use and the one check it cannot make for you: run `npm run dev` and look at a React step with the inspector open, then run `npm run lint`, `npm run build`, and `npm test`.
Commit `package.json`, `package-lock.json`, and everything under `public/runtime/` in one commit with the printed message.

`npm run upgrade:runtime -- 19.2.8 8.3.0 --dry-run` makes the same checks and prints the commands and the commit message without running them.
