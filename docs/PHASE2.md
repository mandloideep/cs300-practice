# Phase 2 plan: flow trace, editor linking, progress, and accessibility

This document plans Phase 2 of the CS300 Lab as the design of record describes it in section 13 of [DESIGN.md](DESIGN.md).
It follows the shape of [KICKOFF.md](KICKOFF.md): where the repository stands, what to build, in what order, what done means, and the decisions already made.
Read `docs/DESIGN.md` and `docs/CONTRACTS.md` completely before writing code; this document only adds scope and order.

## Where Phase 1 left the repository

Phase 1 is built and merged to `main` as of 2026-10-26.

- `npm run lint`, `npm run format:check`, `npm run validate`, `npm run build`, `npm run verify:runtime`, and `npm test` pass locally, and the build job passes in the workflow.
- The Playwright suite runs the solution of every step of the five Week 10 topics on the real step page, asserts its checks, and asserts the inspector and network output: 116 tests.
- `npm run export:d2l -- fall-2026` writes the Week 10 page and fragment with deep links to the unit and to each topic.
- The README documents adding a topic, adding a path, adding a preset, exporting a D2L page, and upgrading the runtime.

Three items from the Phase 1 definition of done are still open and belong to Phase 2.

1. **Deployment.** The deploy job fails with a 404 because GitHub Pages is not enabled for the repository; the build artifact is fine.
   Enable Pages with the source set to GitHub Actions at `https://github.com/mandloideep/cs300-react-lab/settings/pages`, then rerun the latest `main` workflow.
   This is a repository setting, so the instructor does it, not an agent.
2. **Keyboard walkthrough.** Nobody has yet opened the deployed site in a real browser, walked every step by keyboard, and written down what was checked.
   Milestone 6 below covers it.
3. **Remote branch cleanup.** The three Phase 1 worker branches are merged and deleted locally; delete them on GitHub with `git push origin --delete claude/foundation-a2c19b claude/topics-a-1a9de4 claude/topics-b-2040f2`.

## What already exists that Phase 2 builds on

Do not rebuild these; extend them.

| Piece | Where | State |
| --- | --- | --- |
| Owner labels on setters and function props | `public/runtime/wrap/owner.js`, `wrap/react.js`, `wrap/react-jsx-dev-runtime.js` | Every `useState` and `useReducer` setter carries `__labOwner = { kind: "setter", component, hook }`; every function prop carries `{ kind: "prop", component, prop }`; wrappers are cached per original function so identity is stable |
| Inspector hook and overlay | `src/runner/bridge/inspector-hook.js` | Walks each committed fiber root, posts an `inspector` commit, draws boundaries and flashes inside the iframe, handles `inspector-highlight` and `inspector-config`, posts `inspector-select` on a label click |
| Inspector pane | `src/inspector/InspectorPane.jsx` | Views `boundaries`, `flash`, `tree`, `network`; `step.inspector.views` and `step.inspector.watch` are honored; a tree row click sends `inspector-highlight`; `inspector-select` jumps the editor |
| Source locations | `src/runner/compile.js` | Sucrase emits `fileName` and `lineNumber` per JSX element; the compile step records `declarations` (the line of each top-level `function Name` and `const Name =`) per file |
| Progress store | `src/progress/store.js` | One `localStorage` key; completed steps, edited files per step, chosen path; `exportProgress` and `importProgress` wired to buttons on `src/app/Home.jsx` |
| Solution diff | `src/editor/SolutionDiff.jsx` | Side-by-side CodeMirror merge view |
| Workspace download | `src/ui/StepActions.jsx` | A ZIP built with fflate, shown only for `local` steps through `LocalDownload` in `src/app/TopicPage.jsx` |
| Live region | `src/ui/LiveRegion.jsx` | Polite announcements for run, check, and download results |

## Phase 2 milestones, in order

Each milestone ends with a commit, a green `npm test`, and a short report of what was verified and how.
Milestones 1 to 3 are one stream, 4 and 5 are a second, and 6 and 7 are a third; see "Work streams" below.

1. **Flow trace, iframe side.**
   The bridge records one trace per interaction: the DOM event (type and a short target description), each labeled function it invoked (the prop name, the component that passed it, the component that called it), each setter call (the owning component, the hook index, the serialized previous and next value), and the set of components that rendered in the commit that followed.
   A trace starts when a labeled function or a React event handler runs outside any trace and ends at the next inspector commit, or after one animation frame when nothing committed.
   Setter calls inside effects and timers that start no event still produce a trace whose event is `null`, so a `useEffect` fetch shows as "setter, then re-render".
   The bridge posts a `flow` message per finished trace; the record shape is pinned in CONTRACTS section 4.3 before coding starts.
   Serialization reuses the console `args` rules.
   Verified by a Playwright test on a fixture workspace that clicks a button in a child and asserts the full event, prop call, setter, re-render sequence.
2. **Flow trace pane.**
   A `flow` inspector view, selectable in `step.inspector.views`, shows a timeline of the last trace with one row per event, prop call, setter call, and render set, in the voice of the design: "`onAdd`, passed by `App` to `BookmarkForm`, called".
   Older traces stay reachable in a short history list.
   Hovering or focusing a row sends `inspector-highlight` for every component in that row; the message grows a `componentIds` array and keeps `componentId` for callers that send one.
   Rows are a list of buttons so the keyboard reaches them; the live region announces "Flow trace recorded: 4 steps" after each trace.
   `useRunSession` exposes `flowTraces` beside `inspectorCommits`.
3. **Editor-to-result linking in both directions.**
   Hovering or placing the cursor on a component name or JSX tag in CodeMirror highlights that component's boxes in the result, resolved through `declarations` and the `usedAt` locations of the latest commit; moving away clears it.
   Clicking a boundary label, which already jumps the editor through `inspector-select`, now also decorates the declaration line and the JSX line with a line highlight that fades after a moment and is skipped under `prefers-reduced-motion`.
   A tree row click does the same.
   Verified by Playwright: move the cursor to a tag and assert the overlay reports the highlight; click a label and assert the editor's active line.
4. **Progress and workspaces for every step.**
   "Download this workspace" appears on every `edit` step, not only `local` steps, and the ZIP is a runnable Vite project: `package.json` with the pinned React versions, `index.html`, `vite.config.js`, the workspace files, and a `README.md` naming the topic and step; the files are the student's edited files when they exist, otherwise the starter.
   Downloaded workspaces use plain React from npm, never the vendored runtime or the wrappers.
   The catalog, topic, and unit pages show per-topic completion from the progress store, and the unit page offers "Continue" to the first incomplete step.
   Import asks for confirmation in a `Dialog` before replacing existing progress and reports how many steps were restored.
   The progress JSON carries a `version` field and `importProgress` rejects a newer version with a clear message.
   Verified by Playwright: edit a file, download, assert the ZIP entries; mark steps done, reload, assert the unit page.
5. **Accessibility pass.**
   Every page and pane works by keyboard alone in a fixed, sensible focus order: site header, step explanation, file tabs, editor, Run, panes, check panel, step navigation.
   The editor binds Tab to indentation through `indentWithTab`, so it offers Escape then Tab to leave, and a visible hint beside the editor says so.
   Every control has a name; every pane is a labeled region; the overlay labels inside the iframe are reachable by the parent's "Components" list, since focus does not cross into the sandbox predictably.
   The re-render flash and the line highlight respect `prefers-reduced-motion`; contrast meets AA in light and dark at phone width, checked with the browser's tooling.
   `@axe-core/playwright` runs on the home, catalog, topic, unit, and step pages in the suite and fails the build on a violation.
   The result is recorded in `docs/ACCESSIBILITY.md`: what was walked, with which screen reader, what was found, and what was fixed.
   This closes the Phase 1 keyboard-walkthrough item as well.
6. **Week 11 Session 1 topics.**
   Author `state-usestate` and `events-and-lifting-state` from the Week 11 Session 1 lesson notes and example app, in the Week 8 style, with the lifting-state steps opening on the `flow` view.
   Add a `week-11` unit to `fall-2026` with both topics required; Phase 3 adds `controlled-forms` to the same unit.
   Export the D2L page for `week-11`.
   The Playwright step suite asserts, for the lifting-state solution, that clicking in the child produces a trace with the event, the prop call labeled with both components, the setter in `App`, and `App` plus the list in the render set.
7. **Walkthrough and report.**
   Build, open the deployed site, walk every step of every topic by keyboard, run the solution of each, and write the report.

## Phase 2 topics

| Topic id | Area | Prerequisites | Steps |
| --- | --- | --- | --- |
| `state-usestate` | React | `lists-and-keys` | 1 A click handler that logs, with the parentheses mistake reproduced and its console output pointed at by a check; 2 A counter with `useState`, tree view open, state value flashing on change; 3 What the setter does: the re-render flash shows exactly which component ran; 4 Several state variables in one component, and why each is separate; 5 Read: props versus state, and the rules of hooks |
| `events-and-lifting-state` | React | `state-usestate` | 1 Two components that need the same value, with the problem shown; 2 Move the state to the parent and pass it down, boundaries on; 3 Pass a handler down and call it from the child, flow view open: the first full trace; 4 Add an item to a list in the parent from a child form, trace shows event, `onAdd`, `setItems`, and the render set; 5 Read: data down, actions up, and why the parent owns the state |

The `week-11` unit is titled "State, events, and component communication", with an intro in the course voice that names the Week 10 product page as the starting point and says the flow view draws the sequence the session explains on the board.

## Definition of done for Phase 2

- Everything in the Phase 1 definition of done still holds, and the site is deployed because Pages is enabled.
- A lifting-state step shows the full event, callback, setter, re-render sequence in the flow view, and a Playwright test asserts that trace from the solution.
- Hovering a component in the editor highlights it in the result, and clicking a box highlights the code.
- Every `edit` step has a downloadable Vite workspace that runs with `npm install` and `npm run dev` on a student's computer; one was tried by hand and the report says which.
- Progress export and import round-trip across two browsers; the unit page shows completion and offers Continue.
- `docs/ACCESSIBILITY.md` records a keyboard-only walkthrough and a screen-reader check, and the axe checks run in the suite.
- `week-11` exists in `fall-2026` with `state-usestate` and `events-and-lifting-state`, and its D2L page exports.

## Work streams

Phase 1 ran as one orchestrating session and three worker sessions in worktrees, each on its own branch, merging to `main` after each milestone.
That worked, and Phase 2 uses the same shape with three workers.

| Stream | Milestones | Owns | Must not touch |
| --- | --- | --- | --- |
| inspector | 1, 2, 3 | `src/runner/bridge/`, `public/runtime/wrap/`, `src/inspector/`, `src/editor/`, `tests/inspector.spec.js`, a new `tests/flow.spec.js` | `content/`, `src/progress/`, `src/app/` |
| experience | 4, 5 | `src/progress/`, `src/ui/`, `src/app/`, `src/styles/`, `docs/ACCESSIBILITY.md`, a new `tests/a11y.spec.js` | `src/runner/`, `src/inspector/`, `content/` |
| content | 6, 7 | `content/`, `tests/steps.spec.js`, `tests/lib/steps.js`, `scripts/` only where validation must learn `flow` | everything under `src/` |

Before any stream starts, the orchestrator pins in `docs/CONTRACTS.md`:

- the `flow` message and trace record shape, and the `flowTraces` field of `useRunSession`;
- `componentIds` on `inspector-highlight`;
- `flow` as a value of `inspector.views`, accepted by `scripts/build-content.mjs` and `scripts/validate-content.mjs`;
- the `version` field of the progress JSON and the ZIP layout of a downloaded workspace.

The content stream can author both topics against the current inspector and switch the lifting-state steps to `views: [flow, boundaries]` once the inspector stream lands; its trace assertion is the last test it adds.
Each worker pushes its branch after every commit; the orchestrator merges in milestone order and runs the full suite on `main` after each merge.

## Decisions already made

Do not reopen these; the Phase 1 list in `KICKOFF.md` still applies.

1. The flow trace is recorded in the iframe by the bridge, from the existing owner labels, and sent to the parent as finished traces; the parent never reconstructs a trace from commits.
2. The two Week 11 Session 1 topics move from Phase 3 into Phase 2, because the flow trace needs a lifting-state step to prove itself and Week 11 begins on 2026-11-02.
   Phase 3 keeps `controlled-forms`, `effects`, `refs-and-browser-apis`, `persistence`, `fetching-and-request-states`, and `routing`.
3. Downloaded workspaces are plain Vite projects on npm React, with no lab runtime, as the design states.
4. Accessibility checks run in the Playwright suite with axe; a violation fails the build like a failing step.
5. Progress stays in `localStorage` with JSON export and import; no sign-in.

## What comes after

| Phase | Deliverable | Target |
| --- | --- | --- |
| 3 | Weeks 11 to 13 topics: `controlled-forms`, `effects`, `refs-and-browser-apis`, `persistence`, `fetching-and-request-states`, `routing` in the iframe; request rows in the flow trace with stale and duplicate detection; `week-12` and `week-13` units | Before Week 12 begins on 2026-11-09 for `controlled-forms` and `effects`; the rest before Week 13 |
| 4 | Vanilla areas for Weeks 3 to 9: `html-structure`, `css-layout`, `dom-events`, `fetch-basics` | A `spring-2027` path can be written without new tooling |
| 5 | Runtime upgrade script, content validation already in CI, README for adding a topic already written; remaining: a topic template and a `npm run new:topic` scaffold | A new topic is added by editing `content/` only |

## When to ask

Ask only when blocked on something the design and this plan do not settle and a reasonable default would make the work useless if wrong.
Otherwise choose, state the choice in the milestone report, and continue.
