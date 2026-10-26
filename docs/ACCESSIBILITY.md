# Accessibility pass

This file records the Phase 2 accessibility pass of the CS300 Lab as [PHASE2.md](PHASE2.md) milestone 5 asks for it: what was walked, with what, what was found, what was fixed, and what remains.
It also closes the Phase 1 keyboard-walkthrough item.
The pass was made on 2026-10-26 against the Phase 2 experience branch, with the five Week 10 topics as content.

## What was walked, and with what

The walk ran in headless Chromium through Playwright, in `tests/a11y.spec.js`, so it repeats on every `npm test`.
No screen reader was used; a VoiceOver check is left for the instructor, as the last section says.

| Page | URL | Checked |
| --- | --- | --- |
| Home | `#/` | axe; following a path by keyboard moves focus to the path heading |
| Catalog | `#/topics` | axe; the skip link moves focus to the main region |
| Path | `#/path/fall-2026` | axe |
| Unit | `#/path/fall-2026/week-10` | axe |
| Topic with a local step | `#/topic/vite-project-anatomy` | axe |
| Topic with a read step | `#/topic/react-mental-model/4` | axe |
| Edit step with the API selector and network pane | `#/topic/lists-and-keys/5` | axe; every pane is a named region; every control in `main` has a name |
| Edit step with the solution dialog open | `#/topic/jsx-rules/1` | axe on the open dialog; the dialog traps focus, closes on Escape, and returns focus to Show solution |
| Edit step, keyboard walk | `#/topic/lists-and-keys/2` | Tab through the whole page in order; Escape then Tab leaves the editor; Enter on Run runs the code |

axe runs with the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, and `best-practice` rule sets, through `@axe-core/playwright`.
Every page is checked four times: light and dark, each at a 1280 pixel desktop width and a 375 pixel phone width, so the contrast check covers both color schemes and the layout check covers the stacked panes.
A violation fails the suite like a failing step check.

The result iframe is excluded from the axe runs.
Its document is the student's own workspace, and axe otherwise reports the student's `<main>` as a second main landmark.
The site's own landmarks and controls are all outside that frame.

The keyboard walk asserts this order of Tab stops on the step page, which is the order [PHASE2.md](PHASE2.md) names.

1. Skip to content, then the site header: the brand link, Home, Topics.
2. The topic header: the Topics eyebrow link and the prerequisite links.
3. The step explanation: its links, any code block that scrolls, and any collapsed review panel.
4. The file tabs, as one Tab stop with arrow keys between files.
5. The editor.
   Tab inside it indents; Escape then Tab leaves it and lands on Run.
6. Run, Run checks, Show solution, Reset to starter when it is enabled, Download this workspace, and then the API source controls when the step has them.
7. The panes in order: the result iframe (focus enters the student's page and comes back out), the console's Clear button, the inspector view toggles and component rows, and the network rows when the step has them.
8. The check panel, which has no controls of its own.
9. The step navigation: previous step, next step, and the list of steps.

## What was found

1. The toolbar came before the file tabs and the editor in the DOM, so Run was reached before the code it runs, against the order the plan names.
2. The check panel came before the inspector and network panes, so the panes were split around it in the Tab order.
3. The keyboard hint about leaving the editor was rendered inside the editor component, which the inspector stream owns, and would have appeared twice once the hint moved to the step layout.
4. The read-only editors in the solution diff had no accessible name, so they announced as unnamed text boxes, and their scroll regions could not be reached by keyboard because a non-editable CodeMirror view has no tab stop.
5. axe reported the main editor's scroll region as having no focusable content whenever the editor actually scrolled, because axe does not treat a `contenteditable` element as focusable content.
6. The Shiki `github-light` theme colors one token class orange (`#e36209`), which is 3.5:1 on the white code block background, under the 4.5:1 AA minimum.
   It appears in the read step of the React mental model topic and anywhere a number or constant is highlighted.
7. The unit page's Required topics and Optional topics sections had headings but no accessible name, so they were not navigable as regions.
8. The import flow replaced progress without asking, named nothing about the incoming file, and accepted any `version`.
9. Under React StrictMode in development, the navigation focus reset ran on the first load as well, so the first Tab on a freshly loaded page landed inside the main region instead of on the skip link.
10. Chromium makes any scrollable code block in the explanation a Tab stop when it has no focusable content of its own.
    This is the browser's keyboard-focusable-scrollers behavior and is correct, but it means a long explanation has a few more stops than its links alone.
11. Tabbing into the result iframe moves focus through the student's page before coming back out, and the overlay labels drawn inside it are not a reliable keyboard target.
    The parent's inspector tree is the keyboard route to the same components, as the plan intends.

## What was fixed

- The editor pane now reads: file tabs, editor, keyboard hint, toolbar, API source controls.
  The hint is rendered from `src/ui/EditStep.jsx`, outside the editor files, and the duplicate inside `src/editor/CodeEditor.jsx` is removed.
- The check panel now follows the result, console, inspector, and network panes, so the Tab order is header, explanation, tabs, editor, Run, panes, checks, step navigation.
- The read-only editors in the solution diff carry `aria-label` ("Your file src/App.jsx", "Solution src/App.jsx") and an explicit `tabindex="0"`, through `readOnlyExtensions(path, label)` in `src/editor/setup.js`.
- The editable editor's content element carries an explicit `tabindex="0"` beside its existing label, so tools recognize the tab stop that `contenteditable` already gives it.
- The orange Shiki token is overridden to GitHub's own accessible orange (`#bc4c00`, 5:1 on white) in light mode, in `src/styles/content.css`.
  Dark mode keeps the theme's `#ffab70`, which passes.
- The unit page sections are labeled by their headings, and the new Your progress block is a labeled region with a `progressbar` whose `aria-valuetext` reads the same words as the visible label.
- The import flow confirms in a dialog that names the incoming file, how many completed steps and edited steps it holds, and what it replaces.
  A file from a newer version is refused with "This file was exported by a newer version of the lab."
- The navigation focus reset skips the router's initial location, so a full page load keeps focus at the top and the skip link is the first Tab stop in development as well as in production.
- Every progress indicator on the catalog, topic, and unit pages is a `progressbar` with a name, a value, and value text, and the checkmark glyph is hidden from assistive technology in favor of the word Complete.

## Contrast

The design tokens were checked against each other by hand and then by axe in both schemes.
Body text, muted text, links, buttons, status pills, console badges, check icons, and the file tabs all meet 4.5:1 on the surfaces they sit on, in light and in dark.
The only failure found was the Shiki token above.
The editor's own syntax colors in `src/styles/tokens.css` pass on both editor backgrounds.

## Motion

`src/styles/global.css` shortens every animation and transition to effectively zero under `prefers-reduced-motion: reduce`.
The re-render flash is drawn inside the result iframe by `src/runner/bridge/inspector-hook.js`, which carries its own `prefers-reduced-motion` rule that replaces the pulse with a static dashed outline; the changed-value pulse in `src/inspector/inspector.css` does the same.
Both belong to the inspector stream and were read, not changed.

## What remains

- A screen reader check is not done.
  The instructor should open the deployed site in Safari with VoiceOver, walk one edit step from the skip link to the step navigation, run the code, and listen for the live region announcements ("Running your code.", "The result is ready.", the check summary) and for the names of the file tabs, the editor, the panes, and the dialog.
  Record the result in this file.
- The result iframe is a sequence of Tab stops whose length depends on the student's page.
  The inspector's component tree remains the predictable keyboard route to the rendered components.
- Code blocks that scroll horizontally are Tab stops only in Chromium.
  Firefox and Safari do not expose keyboard-focusable scrollers, so a long line in an explanation can only be scrolled there with a pointer.
  Wrapping long lines in step content, or keeping them short in `content/`, avoids the difference.
- The inspector flow trace view and the editor line highlight from milestones 2 and 3 were not on this branch when the pass ran.
  Once merged, the step page axe runs in `tests/a11y.spec.js` cover them automatically; the line highlight's `prefers-reduced-motion` handling should be confirmed by reading `src/editor/`.
