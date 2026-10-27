# Phase 6 plan: interactive explainers, the JavaScript foundation, onboarding, and releases

Phases 1 to 5 built a lab that reads, edits, runs, inspects, and checks code, and a content pipeline that validates every step.
Its content is correct and complete for the weeks it covers, and it is text-heavy: every idea is explained in prose before the student touches code.
Phase 6 turns the lab interactive-first.
Each idea gets a small moving picture the student drives, each step asks "what will the console show?" before the console shows it, the long explanations fold away for those who do not need them, and JavaScript is taught from the first value up, in the order [javascript.info](https://javascript.info) uses as a map.
Phase 6 also adds what a student needs on day one, a topic that teaches the lab itself, and what the instructor needs each week, a way to open the semester one unit at a time on a static site.
The design in [DESIGN.md](DESIGN.md) does not change: the site stays static, progress stays in the browser, and content stays plain files under `content/`.

Two planning documents are part of this phase and are written before any code.
[EXPLAINERS.md](EXPLAINERS.md) is the complete inventory of interactive explainers, for the content that exists and for every topic to come, with the phase each is built in.
[CURRICULUM.md](CURRICULUM.md) is the complete map of topics, from JavaScript values through tooling, libraries, and production, with the steps and explainers each uses and the phase each is written in.
Both are kept complete: a new explainer or topic is added to its file first.

## What Phase 6 delivers

- **The explainer framework.** A `demo` code fence that places an interactive React component from `src/demos/` inside a step's explanation, a registry the validator checks names against, and one contract every explainer follows.
- **The Phase 6 explainers.** The sixty-eight explainers that [EXPLAINERS.md](EXPLAINERS.md) marks for Phase 6, built in two sets: the foundation set that the new topics and the onboarding need, then the retrofit set that the existing HTML, CSS, DOM, fetch, and React topics need.
- **Predict and quiz.** A `predict` fence that asks what the console or the page will show, records the pick, and reveals the answer after the next run; a `quiz` fence for trivia with two to four options and an explanation, used in any step and gathered on the topic page as a score.
- **The interactive-first step layout.** A step opens with a lead of two to four sentences, then its explainer or predict block, then the edit blocks with a sentence beside each; the longer explanation sits under a "Read more" control that is closed by default and that a student can set to stay open across the site.
- **Links back to the course.** A `links` list on topics and steps, each entry a lecture, a reading, or a reference with a title and an `https` URL, shown under the step title and in the D2L export; the javascript.info chapter and the MDN page for each JavaScript topic go here.
- **The JavaScript foundation.** Seven new topics in the `javascript` area, `functions-and-callbacks`, `scope-and-closures`, `objects-and-references`, `arrays-in-depth`, `errors-and-debugging`, `async-and-the-event-loop`, and `modules-and-imports`, console-first in the manner of `javascript-basics`, each with its explainers and at least one predict block per step.
- **The bridge to React.** A `why-react-behaves-this-way` topic whose steps each pair one JavaScript idea with the React behavior it explains and link to both source topics.
- **Tooling from scratch.** A `tooling-from-scratch` topic in the `tooling` area that introduces Node, npm, `package.json`, `node_modules`, the lockfile, the reason a bundler exists, and what Vite and esbuild do, ending where `vite-project-anatomy` begins.
- **Onboarding.** A `using-the-lab` topic that a student finishes in fifteen minutes, a card on the home page for new visitors, and a one-time five-stop tour of the step page that reopens from a `Tour` button in the header.
- **The retrofit.** Every existing topic rewritten into the interactive-first layout with the explainers and predict blocks [CURRICULUM.md](CURRICULUM.md) lists for it, with no change to its workspaces, solutions, or checks.
- **Releases.** An `opens` date on each unit of a path, an `active` flag on each path, a build that leaves closed units and their unpublished topics out of the deployed site, and a scheduled deploy that opens each week's unit on its own.

## Why explainers and not GIFs or videos

A GIF cannot be paused, read by a screen reader, or redrawn for dark mode, and it goes stale the moment the code in the step changes.
A video needs hosting, captions, and re-recording for every edit.
An explainer is a React component that lives next to the content, uses the design tokens, honors `prefers-reduced-motion`, works from the keyboard, takes the step's own values from the fence body, and is covered by the same tests as everything else.

Every explainer follows one contract: it never autoplays; it has Play, Pause, Step, and Reset controls that work from the keyboard; it shows its final state with Step still working when motion is reduced; it carries a text description for assistive technology; it draws only with tokens so that it follows the theme; and it fits the explanation column at phone width.

## The interactive-first step

The Week 8 pattern stays, and the order of a step changes so that the student sees before reading.

1. **Lead.** Two to four sentences that say what the step builds and what to watch for.
2. **Show.** One explainer, or a predict block when the idea is a console output, before any code.
3. **Try.** The edit blocks, each with one or two sentences beside it, as today.
4. **Read more.** The background, the comparison with what the student did in an earlier week, and the "If it breaks" paragraph, under a `<details>` control that the build closes by default.
5. **Check.** The "Check:" paragraph and, in most steps, a quiz.

The build recognizes the "Read more" section by a `## Read more` heading in `step.md` and wraps what follows it, up to the "Check:" paragraph, in the control.
A site preference, "Keep explanations open", kept in progress, opens every "Read more" for students who prefer to read first; the validator requires the lead and the "Check:" paragraph and allows "Read more" to be absent in a short step.

## Predict and quiz

A `predict` fence holds a question line, two to four option lines, and the answer marked with `=`:

````markdown
```predict
What does the console show after the click?
- Added to the cart: Essence Mascara
- Nothing until the second click
= Six messages before any click
```
````

The step page shows the options as a group of buttons, keeps the pick in progress, and reveals the answer with the marked option after the next run, so the console confirms or corrects the student rather than the page.
A `quiz` fence has the same shape plus an explanation line that starts with `>`; its answer is revealed on pick, and the topic page shows the score over the topic's quizzes.
Progress bumps its version for the predict and quiz records and the tour flag.

## The release mechanism

The site is static, so the only way to keep a unit out of a student's hands is to leave it out of the deployed files.
Each unit in a path file may carry `"opens": "YYYY-MM-DD"`, and each path file carries `"active": true` or `false`.
A unit with no `opens` is open; a path with `active` false releases nothing and is kept only for its history.
`npm run build:content` compares `opens` with the build date, which is today unless `LAB_BUILD_DATE` is set, and compiles a closed unit as its title and date only, with no intro, topics, or notes.
A topic that is in no open unit of any active path is left out of `public/content/` entirely, so its page does not exist.
`npm run build:content -- --all` compiles everything, and `dev`, `validate`, and the tests use it, so authors and CI always see the whole site.
`deploy.yml` gains a weekly schedule on Monday morning Chicago time in addition to its manual trigger; the scheduled run uses the same build and test jobs, so a unit opens only when the suite is green, and a failed run reaches the instructor through the Actions notification.
The instructor previews a future week with `LAB_BUILD_DATE=2027-03-01 npm run build && npm run preview`.

## Milestones, in order

1. **Sign-off on the inventory and the map.** The instructor reads [EXPLAINERS.md](EXPLAINERS.md) and [CURRICULUM.md](CURRICULUM.md) and edits them; no code starts until they stand.
2. **Explainer framework.** The `demo` fence in `scripts/lib/render.mjs` and `scripts/lib/content.mjs`, compiled to a placeholder element with a text fallback, mounted by `src/ui/StepExplanation.jsx` from the registry in `src/demos/index.js`; the validator rejects an unknown name or an unparsable body; a `tests/demos.spec.js` that mounts every registered explainer, presses Step, and runs axe with motion allowed and reduced; a README section "Adding an explainer".
3. **Foundation explainers.** The explainers that [EXPLAINERS.md](EXPLAINERS.md) lists for the lab itself, the JavaScript foundation, the bridge, and the tooling topic, about thirty, in the order the content stream needs them.
4. **Fences, layout, and links.** The `predict` and `quiz` fences and their progress records; the "Read more" control and the site preference; the `links` field on `topic.json` and in step front matter, validated and shown on the step page and the unit page; the D2L export printing each unit's links.
5. **Onboarding.** The tour as a sequence of five focused dialogs built on `src/ui/Dialog.jsx` (explanation, editor, Run, result, console and checks), shown once per browser and reopened from the header; the home-page card for new visitors, hidden once `using-the-lab` is complete or dismissed.
6. **Releases.** The `opens` and `active` fields, the build-date gating, the `--all` flag, the schedule in `deploy.yml`, and the paragraphs in the README and `docs/MAINTENANCE.md` that explain how a semester is opened week by week.
7. **Using the lab.** The `using-the-lab` topic as [CURRICULUM.md](CURRICULUM.md) lists it.
8. **The JavaScript foundation.** The seven new JavaScript topics, written as prose and edit blocks first against the pinned fences, with the explainer and predict fences added as milestones 3 and 4 land.
9. **The bridge and the tooling.** `why-react-behaves-this-way` and `tooling-from-scratch`, including the edit step whose plain page imports a bare specifier and fails the way a browser fails, and the local step that downloads a project to install and run.
10. **Retrofit explainers.** The remaining Phase 6 explainers, for HTML, CSS, DOM, fetch, and the existing React topics.
11. **The retrofit.** Every existing topic rewritten into the interactive-first layout with its explainers, predict blocks, and links; workspaces, solutions, and checks unchanged, so the step suite proves nothing broke.
12. **The path.** `spring-2027.json` places the new topics with `opens` dates on every unit, `using-the-lab` in the first unit, the JavaScript topics across Weeks 5 to 8, and `tooling-from-scratch` the week before `vite-project-anatomy`; `fall-2026.json` stays active with no dates.

Milestones 10 and 11 can slip into Phase 7 without blocking anything else; the rest are Phase 6.

## Definition of done for Phase 6

- A student who has never seen the lab can open the first unit, take the tour, finish `using-the-lab`, and say what each pane is for.
- Every step in the site opens with a lead and an explainer or a predict block, and every long explanation is under "Read more".
- Every Phase 6 explainer in [EXPLAINERS.md](EXPLAINERS.md) is `in use`, and every topic in [CURRICULUM.md](CURRICULUM.md) marked Phase 6 exists and validates.
- Every step's solution passes its checks in the Playwright suite, and every explainer passes axe with motion both allowed and reduced.
- A closed unit is absent from a production build and present in a `--all` build, and the scheduled workflow deploys only when the suite is green.
- The README documents the three fences, the "Read more" convention, the `links` field, and the release fields.

## Work streams

Phase 6 uses the shape of Phase 2 with four workers in worktrees, each on its own branch, merged to `main` in milestone order.

| Stream | Milestones | Owns | Must not touch |
| --- | --- | --- | --- |
| experience | 2, 3, 4, 5, 10 | `src/demos/`, `src/ui/`, `src/app/`, `src/progress/`, `src/styles/`, `scripts/lib/render.mjs`, the step rendering in `scripts/lib/content.mjs` for the three fences, "Read more", and `links`, `tests/demos.spec.js`, `tests/a11y.spec.js` | `content/`, `src/runner/`, `src/inspector/`, `.github/` |
| release | 6 | `scripts/build-content.mjs`, `loadPaths` and the unit output in `scripts/lib/content.mjs`, `scripts/export-d2l.mjs`, `.github/workflows/`, `docs/MAINTENANCE.md`, `scripts/test/` | `src/`, `content/` except the two fields in `content/paths/` |
| content-new | 7, 8, 9, 12 | the new topic folders under `content/topics/`, `content/paths/`, `tests/steps.spec.js`, `tests/lib/steps.js` | the existing topic folders, everything under `src/` and `scripts/` |
| content-retrofit | 11 | the existing topic folders under `content/topics/` | the new topic folders, `content/paths/`, everything under `src/` and `scripts/` |

Before any stream starts, the orchestrator pins in `docs/CONTRACTS.md`:

- the `demo` fence: the info string `demo name="<id>"`, an optional body for props, the placeholder element it compiles to, and the registered ids from [EXPLAINERS.md](EXPLAINERS.md);
- the `predict` and `quiz` fences as above, and the shape of their records in progress;
- the `## Read more` convention and the preference key;
- the `links` field as `[{ "kind": "lecture" | "reading" | "reference", "title": "...", "url": "https://..." }]`;
- `opens` on a unit, `active` on a path, `LAB_BUILD_DATE`, and `--all`;
- the version bump of the progress JSON.

The content streams write prose and edit blocks against the fences as pinned and add the fences once milestones 2 to 4 land, so neither is blocked on the experience stream; the retrofit stream starts after milestone 4 so that it never rewrites a topic twice.
Each worker pushes its branch after every commit; the orchestrator merges in milestone order and runs the full suite on `main` after each merge.

## What Phases 7 and 8 hold

[CURRICULUM.md](CURRICULUM.md) marks them, and this plan fixes only what they need from Phase 6.
Phase 7 is tooling and libraries: `styling-with-tailwind`, `widely-used-libraries`, `code-quality`, and `http-and-apis`.
Its one runtime change is a `styles: tailwind` front-matter field that makes the runner inject the vendored Tailwind browser build into the result document, so the Tailwind steps run in the lab; the other libraries are taught through explainers and local steps, because the runner resolves only the pinned React packages.
Phase 8 is production: `testing-client-apps`, `building-for-production`, `deploying-and-ci`, `resilience-in-production`, `security-for-client-apps`, and `how-teams-ship`, using this repository's own workflow, suite, and deployment as the worked example.

## Decisions already made

1. Explainers are interactive components, never GIFs or videos, for the reasons above.
2. An explainer never autoplays, and reduced motion shows the final state with Step still working.
3. Text stays the primary record of each idea; it moves below the explainer and folds, it is not cut.
4. javascript.info is the map, not the source: its chapter list orders the JavaScript topics, its prose is not copied, and each topic links to its chapter and the MDN page as reading.
5. Release gating happens at build time; the browser never hides anything, and nothing closed is in the deployed files.
6. Links are plain URLs the instructor maintains in `content/`; the lab does not embed or call D2L.
7. The tour is built from the existing dialog and stores one flag in progress; there is no separate tutorial engine.
8. The new JavaScript topics keep the console as their only output until `modules-and-imports`, which is the first to touch a page.
9. `why-react-behaves-this-way` is a bridge, so every step links to the JavaScript topic and the React topic it joins, and it is optional in the path.
10. The retrofit changes explanations only; workspaces, solutions, and checks stay byte for byte, so the step suite is the proof.
11. [EXPLAINERS.md](EXPLAINERS.md) and [CURRICULUM.md](CURRICULUM.md) are kept complete; nothing is built that is not listed there first.

## When to ask

Ask only when blocked on something the design and this plan do not settle and a reasonable default would make the work useless if wrong.
Otherwise choose, state the choice in the milestone report, and continue.
