# Phase 4 plan: vanilla areas for Weeks 3 to 9

This document plans Phase 4 of the CS300 Lab as section 13 of [DESIGN.md](DESIGN.md) describes it: the HTML, CSS, JavaScript, DOM, and Fetch areas, so that a `spring-2027` path covering the first half of the course can be written without new tooling.
Read `docs/DESIGN.md`, `docs/CONTRACTS.md`, and the Phase 2 and 3 plans before writing code.

## Where Phase 3 leaves the repository

Every topic so far is a React topic.
The runner accepts a workspace whose `entry` is `index.html` with plain scripts and stylesheets (CONTRACTS 4.2), and `check.js` runs inside the iframe with access to the DOM, but no topic has used either, so the first milestone proves them before any content is written.
The inspector's React views do nothing for a vanilla workspace; `inspector.views` defaults to `[]` there and the network view still works.

## What Phase 4 delivers

- A proven vanilla workspace path: `index.html` entry, linked CSS and scripts, `check.js` against the DOM, console, and network, with a test fixture in the suite.
- A DOM view in the inspector for vanilla workspaces: the live element tree with attributes, a highlight on hover, and a flash on the nodes a script changed, so the DOM topics have the same "watch it happen" quality as the React ones.
- Six topics: `html-structure`, `css-layout`, `javascript-basics`, `dom-events`, `fetch-basics`, and `app-architecture`.
- A `spring-2027` path with units for Weeks 3 to 9 built from those topics, so the next semester's path is a content edit.

## Phase 4 milestones, in order

Each milestone ends with a commit, a green `npm test`, and a short report of what was verified and how.
Milestones 1 and 2 are the runtime stream, 3 and 4 are content stream A, and 5 and 6 are content stream B.

1. **Vanilla workspace proof.**
   A fixture workspace under `tests/` with `index.html`, `styles.css`, and `main.js` runs on the step page, its console output arrives, a `check.js` reads the DOM and the computed style of an element and passes, and an edit step with an `insert-after` into `index.html` applies cleanly.
   The runner maps an uncaught error in a classic script to its workspace path and line.
   The toolbar hides the inspector views that need React and shows the DOM view instead.
   Downloaded vanilla workspaces are a folder with the files and a README that says to open `index.html` or serve the folder, with no `package.json`.
2. **DOM view.**
   A `dom` inspector view, allowed in `inspector.views` for any workspace: the live element tree of the iframe body with tag, id, and classes, attributes on expand, text nodes shortened; hovering a row highlights the element in the result through the existing overlay layer; nodes that a script inserted, removed, or changed attributes on since the last interaction flash, driven by a `MutationObserver` in the bridge that posts a `dom` message (`seq`, `mutations: [{ kind, path, tag, attribute }]`) batched per animation frame.
   Clicking a row jumps the editor to the line in `index.html` that declared the element when it came from the markup, using a source map built at compile time from the parsed HTML.
   Pinned in CONTRACTS before coding starts.
3. **`html-structure` and `css-layout`.**
   `html-structure` (Week 3): the document skeleton; headings, paragraphs, and lists; links and images with `alt`; semantic landmarks with the DOM view open; a form with labels; a table; a read step on attributes and validation.
   `css-layout` (Weeks 3 to 5): selectors and the cascade with the specificity mistake reproduced; the box model with `box-sizing`; a flex row and the axes; a flex card layout; a grid page; a responsive breakpoint checked at a narrow iframe width, which the check sets by resizing the result pane through a `resize` parent message.
4. **`javascript-basics`.**
   Weeks 5 and 6 Session 1: variables and types in the console; string methods; operators and coercion with the `baNaNa` example; arrays and loops with a boundary trace; `map` and `filter` with a named and an inline callback; objects and arrays of objects; a read step on the console as a tool.
   Every step is a module workspace with no HTML of its own beyond a console target, so the console pane is the result.
5. **`dom-events` and `fetch-basics`.**
   `dom-events` (Weeks 6 Session 2 and 7 Session 1): selecting elements; modifying text and classes with the DOM view flashing; creating and removing elements; a click handler with the parentheses mistake; event order and `preventDefault`; event delegation on a list; data attributes; `localStorage` with the `preserveStorage` check.
   `fetch-basics` (Weeks 7 Session 2 and 9): synchronous versus asynchronous with a traced output; promises then `async` and `await`; `fetch` and JSON on fixtures; the four request states rendered to the DOM; a search form with URL construction and query parameters; error handling with the fixture controls; every fetching step runs on fixtures, a preset, and a custom base.
6. **`app-architecture` and the `spring-2027` path.**
   `app-architecture` (Week 8): the CourseHub build as a sequence of typed edits, which is the source of the step style the whole site copies; component functions, state in one object, render from state, a search pattern, and the status line; the final step compares the finished page with the React version from `react-mental-model`.
   A `spring-2027` path with units for Weeks 3 to 9 drawn from the six topics, with intros in the course voice, and a D2L page per unit.

## Definition of done for Phase 4

- Everything in the Phase 3 definition of done still holds.
- A vanilla workspace fixture runs in the suite with console, DOM check, and an edit block into `index.html`.
- The DOM view shows the tree, highlights on hover, and flashes mutations on a `dom-events` step, with a Playwright assertion.
- All six topics run from their solutions in the suite.
- `spring-2027` exists with seven units and exports D2L pages, and nothing under `src/` or `scripts/` had to change to write it.

## Work streams

| Stream | Milestones | Owns | Must not touch |
| --- | --- | --- | --- |
| runtime | 1, 2 | `src/runner/`, `src/inspector/`, `src/ui/ResultPane.jsx`, `src/ui/StepActions.jsx`, `tests/vanilla.spec.js`, `tests/dom.spec.js` | `content/`, `src/app/` |
| content-a | 3, 4 | `content/topics/html-structure`, `css-layout`, `javascript-basics` | `src/`, `public/`, other topics, `content/paths/` |
| content-b | 5, 6 | `content/topics/dom-events`, `fetch-basics`, `app-architecture`, `content/paths/spring-2027.json`, `tests/steps.spec.js`, `tests/lib/steps.js` | `src/`, `public/`, other topics |

Content streams write against the contracts and mark assertions that need the DOM view `test.fixme` until the runtime branch is merged.

## Decisions already made

1. Vanilla topics live in the same site, same runner, and same step format; there is no second runner.
2. The DOM view is the vanilla counterpart of boundaries and flash, not a second inspector.
3. `javascript-basics` and `app-architecture` are added beside the four areas the design names, because Weeks 5, 6, and 8 have no home otherwise.
4. The `spring-2027` path is a draft the instructor revises; its purpose here is to prove the tooling.

## When to ask

Ask only when blocked on something the design and this plan do not settle and a reasonable default would make the work useless if wrong.
Otherwise choose, state the choice in the milestone report, and continue.
