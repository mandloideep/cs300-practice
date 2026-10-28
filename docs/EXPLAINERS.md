# Interactive explainers: the inventory

An explainer is a small interactive React component that sits inside a step's explanation and shows one idea moving: a value being copied, a function being called later, a request leaving and coming back.
This file is the complete list of the explainers the lab needs, for the content that exists today and for every topic in [CURRICULUM.md](CURRICULUM.md), so that writing a step is a matter of picking from the list rather than inventing a picture.
[PHASE6.md](PHASE6.md) says how explainers are built and placed; this file says which ones exist and what each shows.

## How to read the tables

- **Id** is the name used in the `demo` fence, `demo name="<id>"`, and the folder under `src/demos/`.
- **Shows** is the one idea the explainer makes visible and the control the student has over it.
- **Serves** names the topics and, where it matters, the steps that place it; a topic in italics does not exist yet.
- **Phase** is when it is built: 6 for the explainer framework and the JavaScript foundation, 7 for the project tree, Git, and deployment, 8 for tooling and libraries, 9 for production, and later for anything after that.
- **Status** is `planned`, `built`, or `in use`; a built explainer is in use once a step places it.

Every explainer honors the one contract in [PHASE6.md](PHASE6.md): it never autoplays, it has Play, Pause, Step, and Reset controls that work from the keyboard, reduced motion shows the final state with Step still working, it carries a text description for assistive technology, and it draws only with the design tokens.
Each one takes its data from the fence body where that makes sense, so the same explainer can show the step's own values rather than a canned example.

## The lab itself

| Id | Shows | Serves | Phase | Status |
| --- | --- | --- | --- | --- |
| `page-tour` | The step page in miniature with each pane labeled; selecting a pane says what it is for and when to look at it | *using-the-lab* | 6 | in use |
| `edit-run-loop` | The cycle of edit, Run, result, console, and checks as one loop the student advances a stage at a time | *using-the-lab* | 6 | in use |
| `inspector-tour` | A three-component tree with boundaries, a re-render flash, and the state panel, driven by a Click button inside the explainer | *using-the-lab*, react-mental-model | 6 | in use |
| `project-tree` | A project folder as a tree that grows a stage at a time from the fence body, after `npm create vite`, `npm install`, and `npm run build`, with each file's description when selected | *getting-started*, vite-project-anatomy, tooling-from-scratch, modules-and-imports, app-architecture, *git-basics* | 7 | planned |

## HTML

| Id | Shows | Serves | Phase | Status |
| --- | --- | --- | --- | --- |
| `nesting-and-repair` | Markup typed with tags out of order and the tree the browser repairs it into | html-structure/the-document-skeleton | 6 | in use |
| `landmarks-map` | A page with header, nav, main, aside, and footer regions lit one at a time, with the list a screen reader reads | html-structure/landmarks | 6 | in use |
| `label-for` | A label and an input; clicking the label focuses the input only when `for` and `id` match, which the student toggles | html-structure/a-form-with-labels | 6 | in use |
| `alt-text` | An image that fails to load, with and without `alt`, and what a screen reader says in each case | html-structure/links-and-images | 6 | in use |
| `structure-not-style` | The same document with default styles, no styles, and a stylesheet, switched with one control | html-structure, css-layout | 6 | in use |

## CSS

| Id | Shows | Serves | Phase | Status |
| --- | --- | --- | --- | --- |
| `selector-matcher` | A selector the student edits and the elements of a small page that light up to match it | css-layout/selectors-and-the-cascade | 6 | in use |
| `cascade-resolver` | Two rules that disagree, with specificity and source order weighed, and the winner marked as the student edits either rule | css-layout/selectors-and-the-cascade | 6 | in use |
| `box-model` | Sliders for margin, border, and padding on one box, with the measured width under `content-box` and `border-box` | css-layout/the-box-model | 6 | in use |
| `flex-axes` | A row of items with direction, justify, align, wrap, and gap as controls, and the main and cross axes drawn | css-layout/a-flex-row, a-flex-card-layout | 6 | in use |
| `grid-tracks` | A grid with editable column and row templates and items the student places by line number | css-layout/a-grid-page | 6 | in use |
| `breakpoint-slider` | A layout under a viewport width the student drags, with the active media query shown | css-layout/a-responsive-breakpoint | 6 | in use |
| `utility-classes` | One card styled by a stylesheet and by utility classes side by side, with each class mapped to the declaration it stands for | *styling-with-tailwind* | 8 | planned |

## JavaScript: values, functions, and scope

| Id | Shows | Serves | Phase | Status |
| --- | --- | --- | --- | --- |
| `value-vs-reference` | Assigning a number makes a second box; assigning an object makes a second arrow to the same box; changing one shows which cases change both | javascript-basics/objects-and-arrays-of-objects, *objects-and-references* | 6 | in use |
| `type-coercion` | A small expression the student edits, with the coercion steps `==` and `+` perform and the result | javascript-basics/operators-and-coercion | 6 | in use |
| `truthy-falsy` | Values dropped into an `if`, with the eight falsy values marked | javascript-basics/operators-and-coercion | 6 | in use |
| `string-immutability` | A string method called on a variable, the new string it returns, and the original unchanged until the result is assigned back | javascript-basics/string-methods | 6 | in use |
| `array-index-walk` | A loop stepping an index across an array, including the step past the last index that reads `undefined` | javascript-basics/arrays-and-loops | 6 | in use |
| `map-filter-reduce` | Elements flowing one at a time through a callback into a new array or a running total | javascript-basics/map-and-filter, *arrays-in-depth* | 6 | in use |
| `object-shape` | An object as a table of keys and values, with dot and bracket access, adding, and deleting | javascript-basics/objects-and-arrays-of-objects | 6 | in use |
| `function-call` | A call binding arguments to parameters, running the body in a frame, and returning a value to the caller | *functions-and-callbacks* | 6 | in use |
| `callback` | A function handed to another function and run later, beside the version with parentheses that runs it at once | *functions-and-callbacks*, dom-events/a-click-handler, state-usestate/a-click-handler-that-logs | 6 | in use |
| `arrow-equivalence` | A function expression and its arrow form, with each part of one highlighted in the other as the student switches | *functions-and-callbacks* | 6 | in use |
| `scope-chain` | Nested scopes as nested boxes and a variable lookup walking outward until it finds the name | *scope-and-closures* | 6 | in use |
| `closure` | A function that keeps the variables around it, three counters made from one factory, and the loop-variable classic with `var` and `let` | *scope-and-closures*, *why-react-behaves-this-way* | 6 | in use |
| `call-stack` | Frames pushed and popped through nested calls, and the stack trace an error prints read from that stack | *errors-and-debugging*, *async-and-the-event-loop* | 6 | in use |
| `this-binding` | A method called on its object and the same function called detached, with what `this` is in each | *classes-and-prototypes* | 6 | in use |
| `prototype-chain` | A property lookup walking from an object to its prototype to `Object.prototype` | *classes-and-prototypes* | later | planned |

## JavaScript: objects, arrays, and data

| Id | Shows | Serves | Phase | Status |
| --- | --- | --- | --- | --- |
| `mutation-vs-copy` | `push` changing the array in place beside the spread that makes a new one, with React's equality check deciding whether to re-render | *arrays-in-depth*, controlled-forms/add-without-mutating, *why-react-behaves-this-way* | 6 | in use |
| `spread-and-destructure` | Spread copying into a new object or array and destructuring pulling names out of one | *objects-and-references* | 6 | in use |
| `json-roundtrip` | An object stringified and parsed back, with the parts JSON cannot carry marked as lost | *objects-and-references*, persistence/version-the-stored-shape | 6 | in use |
| `equality` | `===` and `==` on primitives, and two equal-looking objects that are not the same object | *objects-and-references* | 6 | in use |
| `array-methods` | `find`, `some`, `every`, `sort`, `slice`, and `splice` applied to one array, with which ones change it | *arrays-in-depth* | 6 | in use |
| `optional-chaining` | A nested path walked with `?.` and a fallback supplied by `??`, with the step where a missing value stops the walk | *objects-and-references* | 6 | in use |

## JavaScript: errors, asynchrony, and modules

| Id | Shows | Serves | Phase | Status |
| --- | --- | --- | --- | --- |
| `error-propagation` | A `throw` unwinding frames until a `catch` takes it, and what happens when none does | *errors-and-debugging* | 6 | in use |
| `error-decoder` | The common messages, `x is not defined`, `cannot read properties of undefined`, `x is not a function`, each with the line that causes it | *errors-and-debugging*, *using-the-lab* | 6 | in use |
| `event-loop` | The call stack, the timer and event queues, and the order in which plain code, `setTimeout`, a click, and a promise reaction run | *async-and-the-event-loop*, fetch-basics/synchronous-and-asynchronous | 6 | in use |
| `promise-states` | A promise moving from pending to fulfilled or rejected, with `then`, `catch`, and `finally` attached and fired | *async-and-the-event-loop*, fetch-basics/promises-then-async-and-await | 6 | in use |
| `async-await-unroll` | An `async` function and its `then` chain side by side, advanced one `await` at a time | *async-and-the-event-loop*, fetch-basics/promises-then-async-and-await | 6 | in use |
| `fetch-timeline` | A request leaving, the wait, the response arriving, `json()` parsing it, and the four request states along the way | fetch-basics/fetch-and-json, four-request-states, fetching-and-request-states/one-status-value | 6 | in use |
| `stale-response` | Two requests racing, the first answered last, and the flag that ignores it | fetching-and-request-states/ignore-a-stale-response | 6 | in use |
| `abort-controller` | A request in flight cancelled by its controller and the rejection that follows | fetching-and-request-states/abort-the-request | 6 | in use |
| `module-graph` | Files that import each other drawn as a graph, with an export followed to every import | *modules-and-imports*, *tooling-from-scratch* | 6 | in use |
| `promise-all` | Several promises started together and the single result that waits for the slowest | *async-and-the-event-loop* | 6 | in use |

## DOM, events, and the browser

| Id | Shows | Serves | Phase | Status |
| --- | --- | --- | --- | --- |
| `event-propagation` | A click on nested boxes passing through capture, target, and bubble, with `stopPropagation` as a toggle | dom-events/event-delegation, *events-in-depth* | 6 | in use |
| `delegation` | One listener on a list and `event.target` lighting the item that was clicked | dom-events/event-delegation | 6 | in use |
| `preventdefault` | A form submitted with and without `preventDefault`, showing the reload that the page would do | dom-events/the-event-object-and-preventdefault | 6 | in use |
| `storage-across-reload` | A key written to `localStorage`, the page reloaded, and the key read back, beside a variable that does not survive | dom-events/remember-with-localstorage, persistence | 6 | in use |
| `http-anatomy` | A request and a response with method, URL, headers, status, and body, each part named when selected | fetch-basics, *http-and-apis* | 6 | in use |
| `cors-check` | A browser request to another origin, the preflight, and the header that allows or blocks it | *http-and-apis*, *security-for-client-apps* | 9 | planned |
| `keyboard-events` | `keydown`, `keypress`, and `keyup` firing for one key, with the event properties read off each | *events-in-depth*, refs-and-browser-apis/a-keyboard-shortcut | later | planned |

## React

| Id | Shows | Serves | Phase | Status |
| --- | --- | --- | --- | --- |
| `render-cycle` | A state change, React calling the component function again, the diff, and the commit to the DOM | react-mental-model, state-usestate/what-the-setter-does, *why-react-behaves-this-way* | 6 | in use |
| `jsx-to-calls` | JSX and the function calls it compiles to, switched with one control | jsx-rules/expressions-in-braces, *tooling-from-scratch* | 6 | in use |
| `props-flow` | Data flowing down a three-level tree and an event flowing up, animated from the student's click | react-mental-model/data-down-events-up, events-and-lifting-state/data-down-actions-up | 6 | in use |
| `lifting-state` | Two siblings that cannot share a value until the state moves to their parent | events-and-lifting-state/move-the-state-up | 6 | in use |
| `state-snapshot` | Each render as a snapshot of state, and a `setTimeout` inside an old render reading the old value | state-usestate/what-the-setter-does, *why-react-behaves-this-way* | 6 | in use |
| `setter-batching` | Three `setCount(count + 1)` calls in one handler adding one, and the updater form adding three | state-usestate/what-the-setter-does, *why-react-behaves-this-way* | 6 | in use |
| `reconcile-keys` | A list rendered with index keys and with stable keys, reordered, with inputs keeping the wrong values in one case | lists-and-keys/stable-keys | 6 | in use |
| `controlled-input` | The loop between an input's value and the state that owns it, with the keystroke that the state rejects | controlled-forms/a-controlled-input | 6 | in use |
| `effect-timeline` | Render, commit, effect, cleanup, and re-run laid on a timeline as dependencies change | effects/the-effect-runs-after-the-render, the-dependency-array, cleanup-with-a-timer | 6 | in use |
| `strict-mode-double` | A component rendered twice in development with the second render discarded | effects/strict-mode-and-computed-values | 6 | in use |
| `ref-vs-state` | A ref changed without a render beside state changed with one | refs-and-browser-apis/a-ref-that-does-not-re-render | 6 | in use |
| `router-match` | A URL matched against routes top to bottom, with the parameters pulled out of the winning one | routing/two-pages-with-routes-and-link, a-detail-page-with-useparams | 6 | in use |
| `url-as-state` | Search parameters and the UI that reads them, changed from either side | url-state/a-search-field-in-the-url | 6 | in use |
| `custom-hook-extract` | Stateful code inside a component folded into a hook, with the same calls shown in both places | route-data-and-custom-hooks/custom-hooks-and-built-in-hooks | 6 | in use |
| `error-boundary` | A component that throws, the boundary that catches it, and the fallback that renders | *resilience-in-production* | 9 | planned |

## Tooling and libraries

| Id | Shows | Serves | Phase | Status |
| --- | --- | --- | --- | --- |
| `terminal` | A scripted command session the student advances one command at a time, with each command's output | *tooling-from-scratch*, vite-project-anatomy/create-the-project, *testing-client-apps* | 6 | in use |
| `bare-import-fail` | A browser trying to load `import "react"` with nothing to resolve it, and the bundler that fills the gap | *tooling-from-scratch*, *modules-and-imports* | 6 | in use |
| `dev-server-vs-build` | A request served by the dev server, transformed on demand, beside the same page served from `dist/` | *tooling-from-scratch*, vite-project-anatomy/build-for-production | 6 | in use |
| `package-json-explorer` | A `package.json` with each field named when selected, and the script that `npm run dev` expands to | *tooling-from-scratch* | 6 | in use |
| `node-modules-tree` | A dependency pulling in its own dependencies, the tree that results, and the lockfile that pins it | *tooling-from-scratch* | 6 | in use |
| `hot-module-replacement` | A file saved and only its module swapped in the running page, with state preserved | *tooling-from-scratch* | 8 | planned |
| `env-at-build` | `import.meta.env` replaced by its value at build time, and why a secret in it ends up in the bundle | *building-for-production*, *security-for-client-apps* | 9 | planned |
| `library-fit` | A problem, the hand-written solution, and the library call that replaces it, for each library the tour covers | *widely-used-libraries* | 8 | planned |
| `semver` | A version range in `package.json` and which releases it accepts | *how-teams-ship* | 9 | planned |
| `lint-and-format` | Code with a lint error and a format difference, fixed by the tools one at a time | *code-quality* | 8 | planned |

## Git and deployment

| Id | Shows | Serves | Phase | Status |
| --- | --- | --- | --- | --- |
| `three-trees` | The working tree, the staging area, and the repository as three columns; a file edited, added, and committed moves across them with the `git status` output for each state | *git-basics*/the-three-places, undo-safely | 7 | planned |
| `commit-graph` | Commits as a chain from the fence body, each with a short hash, a message, and a parent arrow; selecting one shows the snapshot it holds and the diff from its parent | *git-basics*/why-keep-history, read-the-history | 7 | planned |
| `branch-and-merge` | A `main` and a feature branch; Step commits on either, `HEAD` follows the switch, and the merge draws a fast-forward or a merge commit depending on whether `main` moved | *git-basics*/a-branch-is-a-pointer, merge-a-branch | 7 | planned |
| `merge-conflict` | Two branches that change the same line, the merge that stops, the file with conflict markers, and the resolved file after a choice the student makes | *git-collaboration*/what-a-conflict-is, resolve-a-conflict | 7 | planned |
| `remote-sync` | A local and a remote history side by side; `push`, `fetch`, and `pull` move commits between them, with ahead and behind counts and a rejected push when the remote has moved | *git-collaboration*/a-remote-on-github, the-daily-loop, when-things-go-wrong | 7 | planned |
| `pull-request-flow` | A branch pushed, a pull request opened, review comments, the checks running, the merge, and the branch deleted, one stage at a time | *git-collaboration*/a-pull-request, code-review, the-daily-loop | 7 | planned |
| `static-deploy` | `dist/` copied to a host, the address each file gets under `/<repo>/`, a route refreshed, and what the host answers with and without a `404.html` | *deploy-with-github-pages*/what-a-static-host-serves, the-address-and-the-base, *deploying-and-ci* | 7 | planned |
| `ci-pipeline` | Push, install, build, and deploy as stages with the log of each, a failing build that stops the rest, and the site unchanged until a run is green | *deploy-with-github-pages*/a-workflow-on-every-push, update-and-roll-back, *deploying-and-ci* | 7 | planned |

## Production

| Id | Shows | Serves | Phase | Status |
| --- | --- | --- | --- | --- |
| `test-runner` | A failing unit test, the fix, and the passing run, in the output shape of a real runner | *testing-client-apps* | 9 | planned |
| `test-pyramid` | Unit, component, and end-to-end tests placed by what they cover and what they cost | *testing-client-apps* | 9 | planned |
| `bundle-map` | A bundle as a treemap, with a route split into its own chunk that loads on demand | *building-for-production* | 9 | planned |
| `loading-waterfall` | The requests a page makes drawn in time, and what moving a script or splitting a chunk changes | *building-for-production* | 9 | planned |
| `accessibility-tree` | The tree a screen reader reads for a small page, with a missing label or role shown as a gap | *resilience-in-production* | 9 | planned |
| `xss-escape` | A string with markup rendered by React as text, and the same string injected as HTML | *security-for-client-apps* | 9 | planned |
| `secrets-in-the-client` | A key placed in client code, found in the shipped bundle, and the server-side proxy that keeps it out | *security-for-client-apps* | 9 | planned |
| `feature-flag` | One flag switching a feature for some users, with the rollout widened a step at a time | *how-teams-ship* | later | planned |

## Counts

| Phase | Explainers |
| --- | --- |
| 6 | 68 |
| 7 | 9 |
| 8 | 4 |
| 9 | 11 |
| later | 3 |

Phase 6 builds its explainers in the order the content needs them, as [PHASE6.md](PHASE6.md) lists: the lab and the JavaScript foundation first, then React, then HTML and CSS.
A step that needs an explainer not in this file adds it here first, with its Phase and `planned`, so the file stays the complete list.
