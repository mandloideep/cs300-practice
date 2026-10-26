# Phase 3 plan: Weeks 11 to 13 topics, routing in the iframe, request rows

This document plans Phase 3 of the CS300 Lab as section 13 of [DESIGN.md](DESIGN.md) describes it.
It follows [PHASE2.md](PHASE2.md): what to build, in what order, what done means, and the decisions already made.
Read `docs/DESIGN.md`, `docs/CONTRACTS.md`, and `docs/PHASE2.md` before writing code; this document only adds scope and order.

## Where Phase 2 leaves the repository

Phase 3 starts when Phase 2 is merged to `main`: the flow trace and its `flow` view, editor-to-result linking, workspace download on every step, progress on the catalog and unit pages, the axe checks in the suite, and the `state-usestate` and `events-and-lifting-state` topics in a `week-11` unit.
`react-router` 8 is already vendored in `public/runtime/` and resolvable in the iframe through the import map, but no topic uses it yet and nothing maps a browser history onto the sandboxed document.

## What Phase 3 delivers

- The remaining Week 11 topic, `controlled-forms`, added to the `week-11` unit.
- The Week 12 topics `effects`, `refs-and-browser-apis`, `persistence`, `fetching-and-request-states`, and `routing` in a `week-12` unit.
- The Week 13 topics `route-data-and-custom-hooks` and `url-state` in a `week-13` unit.
- Routing in the iframe: student code written for the browser router runs unchanged in the sandbox, and the result pane shows the current path with back and forward.
- Request rows in the flow trace with stale and duplicate detection, so an effect that fetches without cleanup, or one that runs twice, is drawn as it happens.

## Phase 3 milestones, in order

Each milestone ends with a commit, a green `npm test`, and a short report of what was verified and how.
Milestones 1 and 2 are the runtime stream, 3 to 5 are content stream A, and 6 to 8 are content stream B; see "Work streams" below.

1. **Routing in the iframe.**
   A `public/runtime/wrap/react-router.js` wrapper re-exports the real module and substitutes `BrowserRouter` with `MemoryRouter` and `createBrowserRouter` with `createMemoryRouter`, because the sandboxed document cannot push a same-origin URL.
   The wrapper reports each location change to the bridge, which posts a `location` message (`pathname`, `search`, `hash`, `index`, `length`), and handles a parent `navigate` message (`delta` of -1 or 1, or a `to` path).
   The result pane draws a small address bar above the iframe when a run has posted a location: the current path, Back and Forward buttons, a text field to type a path and press Enter, all keyboard-operable and announced through the live region.
   `useSearchParams` and `useNavigate` work on the memory history without change.
   The downloaded workspace keeps the real router from npm.
   Verified by Playwright on a fixture workspace with two routes and a link.
2. **Request rows in the flow trace.**
   The fetch shim records each request inside the open trace as a `request` entry (`requestId`, `method`, `url`, `calledIn`), and when a response settles outside a trace it opens a trace with `event: null` whose first entry is `response` (`requestId`, `state`, `status`, `duration`).
   The shim marks a settled request `stale: true` when a newer request from the same `calledFrom` location settled before it, and `duplicateOf: "<id>"` when an identical method and URL from the same `calledFrom` was still pending when it started.
   The network pane shows a "stale" or "duplicate" badge on those rows with a one-line explanation, and the flow pane shows the same badge on the entry.
   Verified by Playwright on a fixture workspace: an effect with no cleanup that fetches on every keystroke with fixture latency produces a stale row; an effect that runs twice produces a duplicate row.
3. **`controlled-forms`.**
   From the Week 11 Session 2 notes and example: a controlled input with `value` and `onChange`; validation as the user types; several inputs with one object state and a computed `name`; submit with `preventDefault` and a reset; adding to an array without mutation, with the mutation mistake shown and the check pointing at the unchanged screen; a read step on "Thinking in React" that walks the four questions against the Week 10 product page.
   Added to the `week-11` unit as the third required topic.
4. **`effects` and `refs-and-browser-apis`.**
   `effects`: the effect runs after the render, flash on; the dependency array, with the infinite loop mistake reproduced and stopped by a check on the console; a `localStorage` sync effect; cleanup with a timer; a read step on the Strict Mode double run and why it is a feature.
   `refs-and-browser-apis`: focus an input on mount with `useRef`; a ref that does not re-render, compared in the flash view with state; reading the window size on resize with cleanup; a keyboard shortcut step.
5. **`persistence`.**
   Lazy initial state from `localStorage`; the write effect; versioning the stored shape so an old value does not crash; a check that reloads the iframe and asserts the value survived (the runner's `run()` with a `preserveStorage` flag, requested from the runtime stream and pinned in CONTRACTS before coding starts).
6. **`fetching-and-request-states`.**
   From the Week 9 and Week 12 notes: the four states as one `status` value; the request in an effect with a cancelled flag on cleanup; the stale-response bug reproduced with fixture latency and shown as a stale row in the network pane; a retry button; a custom `useFetch` hook extracted from the component, which is the Week 13 Session 1 opening and the bridge to the next topic.
   Every step runs on fixtures, on a preset, and on a custom base.
7. **`routing` and `route-data-and-custom-hooks`.**
   `routing`: `Routes` and `Route` with two pages and a `Link`; the active link with `NavLink`; `useParams` for a detail page; a catch-all 404; `useNavigate` after a form submit.
   `route-data-and-custom-hooks`: `useFetch` reused for a list page and a detail page keyed on `useParams`; a loading and error state per route; a `useLocalStorage` hook; a read step comparing the custom hooks to the built-in ones.
8. **`url-state`.**
   From the Week 13 Session 2 notes: a search field whose value lives in `useSearchParams`; a filter that survives reload and back; a shareable URL copied to the clipboard; the integration check step that walks the whole app from the URL bar.
   Units `week-12` ("Effects, fetching, persistence, and routing") and `week-13` ("Route data, custom hooks, and URL state") in `fall-2026`, D2L pages exported for both.

## Definition of done for Phase 3

- Everything in the Phase 2 definition of done still holds.
- A routing step runs in the iframe with the address bar showing the path, and Back returns to the previous route.
- A fetching step shows a stale response and a duplicate request as badged rows, and the Playwright suite asserts both from fixture workspaces.
- All eight topics run from their solutions in the suite, with inspector and flow assertions where the step opens those views.
- `week-11` has three topics, `week-12` five, and `week-13` two, and their D2L pages export.
- The site has been walked by keyboard on the new topics and the report says what was checked.

## Work streams

| Stream | Milestones | Owns | Must not touch |
| --- | --- | --- | --- |
| runtime | 1, 2 | `public/runtime/wrap/`, `scripts/build-runtime.mjs`, `src/runner/`, `src/network/`, `src/inspector/`, `src/ui/ResultPane.jsx`, `tests/routing.spec.js`, `tests/network.spec.js`, `tests/flow.spec.js` | `content/`, `src/app/`, `src/progress/` |
| content-a | 3, 4, 5 | `content/topics/controlled-forms`, `effects`, `refs-and-browser-apis`, `persistence`; the `week-11` entry of `content/paths/fall-2026.json` | `src/`, `public/`, other topics |
| content-b | 6, 7, 8 | `content/topics/fetching-and-request-states`, `routing`, `route-data-and-custom-hooks`, `url-state`; the `week-12` and `week-13` entries of `content/paths/fall-2026.json`; `tests/steps.spec.js` and `tests/lib/steps.js` for both content streams | `src/`, `public/`, other topics |

Before any stream starts, the orchestrator pins in `docs/CONTRACTS.md`: the `location` and `navigate` messages, the `request` and `response` trace entries, `stale` and `duplicateOf` on the network record, and `preserveStorage` on `run()`.
Content streams author against the current runtime; steps that need the address bar or the badges are written to the contract and verified once the runtime branch is merged, with the affected assertions marked `test.fixme` until then and listed in the report.
Both content streams edit `content/paths/fall-2026.json`; each adds only its own unit entries, so the merge is a trivial conflict the orchestrator resolves.

## Decisions already made

Do not reopen these; the Phase 1 and Phase 2 lists still apply.

1. The router runs on a memory history inside the iframe through a wrapper, and the result pane draws the address bar; student code keeps `BrowserRouter` so it matches what they write in Vite.
2. Stale and duplicate detection lives in the fetch shim, keyed on the request's `calledFrom` location, and is reported on the network record so both panes read one source.
3. Week 13 gets two new topics, `route-data-and-custom-hooks` and `url-state`, which have no Spring source; the Spring `Fetch` tab maps to `fetching-and-request-states`.
4. `week-12` carries five topics because the course covers that material in one week; the unit intro says which two are the core and which three are the follow-through.

## When to ask

Ask only when blocked on something the design and this plan do not settle and a reasonable default would make the work useless if wrong.
Otherwise choose, state the choice in the milestone report, and continue.
