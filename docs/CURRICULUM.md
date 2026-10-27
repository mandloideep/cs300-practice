# Curriculum map: JavaScript, the browser, React, tooling, and production

This file is the complete list of topics the lab will teach, from the first JavaScript value to a client-side application a team can ship.
It is organized the way [javascript.info](https://javascript.info) organizes the language and the browser, because that table of contents is the most complete map of what a web developer needs, and then it adds the parts that site does not cover: React, tooling and libraries, and production.
javascript.info is the map, not the source.
Its chapter list is the checklist below, its prose is not copied, and each topic links to the matching chapter and to MDN as further reading through the `links` field that [PHASE6.md](PHASE6.md) defines.

## How to read the tables

- **Topic** is the topic id under `content/topics/`; a topic in italics does not exist yet.
- **Steps** are the planned step slugs, or the existing ones for a topic that exists.
- **Explainers** are ids from [EXPLAINERS.md](EXPLAINERS.md).
- **Phase** is when the topic is written or retrofitted; a topic that exists is retrofitted with explainers and predict blocks in the phase named.

Every step follows the interactive-first layout from [PHASE6.md](PHASE6.md): a lead of two to four sentences, an explainer or a predict block, the edit blocks with a sentence beside each, and the longer explanation collapsed under "Read more".
Every step has at least one predict block or quiz, so the student answers "what is the console output?" before the console answers it.

## Part 1: the language

| Topic | Steps | Explainers | Phase |
| --- | --- | --- | --- |
| javascript-basics | variables-and-types, string-methods, operators-and-coercion, arrays-and-loops, map-and-filter, objects-and-arrays-of-objects, the-console-as-a-tool | `type-coercion`, `truthy-falsy`, `string-immutability`, `array-index-walk`, `map-filter-reduce`, `object-shape`, `value-vs-reference` | 6 |
| *functions-and-callbacks* | declare-and-call, parameters-and-return, functions-are-values, pass-a-function, the-parentheses-mistake, arrow-functions, run-it-later | `function-call`, `callback`, `arrow-equivalence`, `event-loop` | 6 |
| *scope-and-closures* | block-scope, let-const-and-var, the-scope-chain, a-function-remembers, a-counter-factory, the-loop-variable-classic | `scope-chain`, `closure` | 6 |
| *objects-and-references* | copy-a-number-copy-an-object, equality, spread-and-destructure, nested-data-and-optional-chaining, json-in-and-out, methods-and-this | `value-vs-reference`, `equality`, `spread-and-destructure`, `optional-chaining`, `json-roundtrip`, `this-binding` | 6 |
| *arrays-in-depth* | find-some-and-every, sort-and-its-surprise, slice-versus-splice, reduce, chain-the-methods, change-or-copy | `array-methods`, `map-filter-reduce`, `mutation-vs-copy` | 6 |
| *errors-and-debugging* | read-a-stack-trace, throw-and-catch, the-common-messages, console-beyond-log, breakpoints-in-devtools, defensive-code | `call-stack`, `error-propagation`, `error-decoder` | 6 |
| *async-and-the-event-loop* | the-call-stack, timers-and-the-queue, a-promise, then-catch-and-finally, async-and-await, several-at-once, ordering-puzzles | `call-stack`, `event-loop`, `promise-states`, `async-await-unroll`, `promise-all` | 6 |
| *modules-and-imports* | one-file-per-concern, export-and-import, default-and-named, a-module-runs-once, the-browser-needs-type-module, a-bare-import-fails | `module-graph`, `bare-import-fail` | 6 |
| *classes-and-prototypes* | a-class-with-a-method, this-inside-a-method, the-prototype-chain, extends-and-super, when-you-meet-classes | `this-binding`, `prototype-chain` | later |
| *modern-syntax-reference* | template-literals, ternary-and-short-circuit, nullish-and-optional-chaining, destructuring-in-parameters, rest-and-spread, tagged-reference | `optional-chaining`, `spread-and-destructure` | later |

The javascript.info chapters this part covers: Fundamentals, Code quality in part, Objects, Data types, Advanced working with functions, Error handling, Promises and async/await, Modules, and the Classes and Prototypes chapters as a later topic.
Left out on purpose: generators and iterators, WeakMap and WeakRef, Symbol, Proxy and Reflect, Unicode and regular expressions, and binary data; a student who needs them has the map.

## Part 2: the browser

| Topic | Steps | Explainers | Phase |
| --- | --- | --- | --- |
| html-structure | the-document-skeleton, headings-paragraphs-and-lists, links-and-images, landmarks, a-form-with-labels, a-table, attributes-and-validation | `nesting-and-repair`, `alt-text`, `landmarks-map`, `label-for`, `structure-not-style` | 6 |
| css-layout | selectors-and-the-cascade, the-box-model, a-flex-row, a-flex-card-layout, a-grid-page, a-responsive-breakpoint | `selector-matcher`, `cascade-resolver`, `box-model`, `flex-axes`, `grid-tracks`, `breakpoint-slider` | 6 |
| dom-events | select-the-elements, change-text-and-classes, create-and-remove-elements, a-click-handler, the-event-object-and-preventdefault, event-delegation, data-attributes, remember-with-localstorage | `callback`, `preventdefault`, `event-propagation`, `delegation`, `storage-across-reload` | 6 |
| fetch-basics | synchronous-and-asynchronous, promises-then-async-and-await, fetch-and-json, four-request-states, a-search-form-and-query-parameters, handle-every-failure | `event-loop`, `promise-states`, `async-await-unroll`, `fetch-timeline`, `http-anatomy` | 6 |
| app-architecture | the ten existing steps | `module-graph`, `mutation-vs-copy`, `render-cycle` | 6 |
| *events-in-depth* | capture-and-bubble, keyboard-events, pointer-and-touch, custom-events, debounce-and-throttle | `event-propagation`, `keyboard-events` | later |
| *http-and-apis* | methods-and-status-codes, headers, query-strings-and-bodies, rest-shapes, cors, tokens-and-keys | `http-anatomy`, `cors-check` | 7 |
| *browser-storage* | localstorage-and-sessionstorage, cookies-in-one-page, indexeddb-exists, what-belongs-where | `storage-across-reload` | later |

The javascript.info chapters this part covers: Document, Introduction to events, UI events in part, Forms and controls in part, Network requests in part, and Storing data in the browser.

## Part 3: React

Every React topic exists and is retrofitted in Phase 6 with the explainers listed, plus one predict block per step.

| Topic | Steps | Explainers | Phase |
| --- | --- | --- | --- |
| react-mental-model | update-by-hand, render-from-a-value, only-the-changed-part, data-down-events-up | `render-cycle`, `inspector-tour`, `props-flow` | 6 |
| vite-project-anatomy | create-the-project, follow-the-chain, a-first-component, build-for-production | `terminal`, `dev-server-vs-build` | 6 |
| jsx-rules | expressions-in-braces, one-root-and-fragments, attribute-names-and-closed-tags, conditional-rendering, a-card-from-data | `jsx-to-calls` | 6 |
| components-and-props | extract-a-component, pass-props, default-values, props-are-read-only, children, component-map | `props-flow` | 6 |
| lists-and-keys | render-with-map, stable-keys, empty-and-error, product-card-and-list, fetch-products | `map-filter-reduce`, `reconcile-keys` | 6 |
| state-usestate | a-click-handler-that-logs, remember-a-quantity, what-the-setter-does, several-state-variables, props-versus-state | `callback`, `render-cycle`, `state-snapshot`, `setter-batching` | 6 |
| events-and-lifting-state | two-components-one-value, move-the-state-up, pass-a-handler-down, add-to-a-list-in-the-parent, data-down-actions-up | `lifting-state`, `props-flow`, `mutation-vs-copy` | 6 |
| controlled-forms | a-controlled-input, validate-as-you-type, one-object-for-several-fields, submit-and-reset, add-without-mutating, thinking-in-react | `controlled-input`, `mutation-vs-copy` | 6 |
| effects | the-effect-runs-after-the-render, the-dependency-array, sync-to-localstorage, cleanup-with-a-timer, strict-mode-and-computed-values | `effect-timeline`, `strict-mode-double` | 6 |
| refs-and-browser-apis | focus-an-input-on-mount, a-ref-that-does-not-re-render, the-window-size-on-resize, a-keyboard-shortcut | `ref-vs-state` | 6 |
| persistence | write-the-list-to-storage, read-it-back-on-load, version-the-stored-shape, what-belongs-in-storage | `storage-across-reload`, `json-roundtrip` | 6 |
| fetching-and-request-states | one-status-value, ignore-a-stale-response, abort-the-request, a-retry-button, extract-a-usefetch-hook | `fetch-timeline`, `stale-response`, `abort-controller` | 6 |
| routing | two-pages-with-routes-and-link, show-the-current-page-with-navlink, a-detail-page-with-useparams, a-catch-all-route, navigate-after-a-submit | `router-match` | 6 |
| route-data-and-custom-hooks | load-the-list-page-with-usefetch, a-detail-page-keyed-on-useparams, a-missing-product-and-a-failed-request, a-uselocalstorage-hook, custom-hooks-and-built-in-hooks | `custom-hook-extract` | 6 |
| url-state | a-search-field-in-the-url, a-category-filter-that-survives-back, copy-a-shareable-link, walk-the-app-from-the-address-bar | `url-as-state` | 6 |
| *why-react-behaves-this-way* | callbacks-and-onclick, closures-and-stale-state, map-and-keys, the-event-loop-and-batching, modules-and-components, identity-and-replacing-state | `callback`, `closure`, `state-snapshot`, `setter-batching`, `reconcile-keys`, `event-loop`, `module-graph`, `mutation-vs-copy` | 6 |

## Part 4: tooling and libraries

| Topic | Steps | Explainers | Phase |
| --- | --- | --- | --- |
| *tooling-from-scratch* | javascript-outside-the-browser, npm-and-package-json, node-modules-and-the-lockfile, why-a-bundler, what-vite-does, what-esbuild-does, run-it-on-your-computer | `terminal`, `package-json-explorer`, `node-modules-tree`, `bare-import-fail`, `dev-server-vs-build`, `module-graph`, `jsx-to-calls` | 6 |
| *styling-with-tailwind* | a-card-in-plain-css, the-same-card-in-utilities, why-teams-choose-utilities, responsive-and-state-variants, dark-mode, extract-a-component-not-a-class, when-not-to | `utility-classes`, `breakpoint-slider` | 7 |
| *widely-used-libraries* | what-a-library-is, how-to-judge-one, server-state-with-tanstack-query, validation-with-zod, dates-with-date-fns, class-names-with-clsx, app-state-with-zustand, components-from-radix-and-shadcn, motion-with-framer-motion | `library-fit`, `semver` | 7 |
| *code-quality* | eslint-finds-the-bug, prettier-ends-the-argument, format-on-save, naming-and-small-functions, comments-that-earn-their-place, version-control-in-one-page | `lint-and-format` | 7 |
| *tooling-choices* | vite-versus-the-rest, javascript-versus-typescript, when-a-framework-like-next-fits, what-to-read-next | none | later |

The library tour explains what problem each library solves, shows one call, and says when not to reach for it.
The Tailwind steps run inside the lab through the vendored Tailwind browser build that [PHASE6.md](PHASE6.md) specifies; the other libraries are taught through explainers and local steps, because the runner resolves only the pinned React packages.

## Part 5: production

| Topic | Steps | Explainers | Phase |
| --- | --- | --- | --- |
| *testing-client-apps* | why-tests, a-unit-test-with-vitest, a-component-test, an-end-to-end-test-with-playwright, what-to-test-and-what-not-to, tests-in-ci | `test-runner`, `test-pyramid`, `terminal` | 8 |
| *building-for-production* | vite-build-and-dist, hashed-files-and-caching, code-splitting-and-lazy-routes, environment-variables, source-maps, measure-with-lighthouse | `dev-server-vs-build`, `bundle-map`, `env-at-build`, `loading-waterfall`, `static-deploy` | 8 |
| *deploying-and-ci* | static-hosting, github-pages-netlify-and-vercel, a-pipeline-on-every-push, preview-deploys, the-lab-s-own-workflow | `ci-pipeline`, `static-deploy` | 8 |
| *resilience-in-production* | error-boundaries, loading-and-empty-states, retries-and-timeouts, accessibility-as-a-check, performance-basics, logging-and-monitoring | `error-boundary`, `accessibility-tree`, `fetch-timeline` | 8 |
| *security-for-client-apps* | nothing-secret-in-the-client, xss-and-why-react-escapes, dangerouslysetinnerhtml, cors-and-https, dependency-audits, the-supply-chain | `secrets-in-the-client`, `xss-escape`, `cors-check`, `env-at-build` | 8 |
| *how-teams-ship* | repositories-branches-and-pull-requests, code-review, issues-and-planning, semantic-versioning-and-changelogs, releases-and-rollbacks, documentation | `semver`, `ci-pipeline`, `feature-flag` | 8 |

The production topics are read steps with explainers, local steps that download a project with its tests and workflow, and a few edit steps where the lab can show the idea, such as an error boundary or escaped markup.
They use this repository as the worked example: its `check.yml` and `deploy.yml`, its Playwright suite, and its GitHub Pages deployment are the artifacts the steps read.

## Part 6: the lab itself

| Topic | Steps | Explainers | Phase |
| --- | --- | --- | --- |
| *using-the-lab* | what-a-step-page-is, your-first-edit, read-the-console, use-a-check, meet-the-inspector, progress-downloads-and-shortcuts | `page-tour`, `edit-run-loop`, `error-decoder`, `inspector-tour` | 6 |

## Counts

| Part | Topics that exist | Topics to write | Phase 6 | Phase 7 | Phase 8 | Later |
| --- | --- | --- | --- | --- | --- | --- |
| The language | 1 | 9 | 8 | 0 | 0 | 2 |
| The browser | 5 | 3 | 5 | 1 | 0 | 2 |
| React | 15 | 1 | 16 | 0 | 0 | 0 |
| Tooling and libraries | 0 | 5 | 1 | 3 | 0 | 1 |
| Production | 0 | 6 | 0 | 0 | 6 | 0 |
| The lab itself | 0 | 1 | 1 | 0 | 0 | 0 |

Phase 6 writes ten topics and retrofits twenty-one, Phase 7 writes four, Phase 8 writes six, and five wait for a later phase.
A topic that is added later goes into this file first, with its steps, its explainers, and its phase, so the file stays the complete map.
