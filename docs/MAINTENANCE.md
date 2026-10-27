# Maintenance guide

This guide lists what keeps the CS300 Lab healthy from one semester to the next.
Everything here is a content edit or one command; nothing needs a server or an account.
The design of record is [DESIGN.md](DESIGN.md), the shared interfaces are in [CONTRACTS.md](CONTRACTS.md), and the phase plans are in PHASE2.md to PHASE5.md.

## Before each semester

1. **Copy the path.**
   Duplicate `content/paths/<last-term>.json` as `content/paths/<term>.json`, rename the id and title, and move topics between units to match the new schedule.
   Every topic must appear in at least one path, or validation fails and names it.
2. **Review the presets.**
   Open each entry of `content/api-presets.json` in a browser and confirm the base URL still answers and the documented endpoints still return the described shape.
   Remove or replace a preset that has gone away; the fetching steps run on Fixtures regardless.
3. **Upgrade the runtime** if the course baseline moved:

   ```sh
   npm run upgrade:runtime -- <react-version> <react-router-version>
   ```

   Then open a React step with the inspector on and check boundaries, the tree, and the flow view, as the README's "Upgrading the runtime" section says.
4. **Export the D2L pages** and copy them into the course's posting kit:

   ```sh
   npm run export:d2l -- <term>
   ```

5. **Walk the site by keyboard** on the deployed address, following `docs/ACCESSIBILITY.md`, and run a screen reader over one step page.
   Record the date and what was found at the end of that file.

## When a topic changes

- Edit the step files under `content/topics/<id>/`, bump `updated` and `changeNote` in `topic.json`, and run `npm run validate`.
- `npm run new:step -- <topic-id> "<title>"` adds a step whose starter is the previous solution.
- `npm run new:topic -- <id> --area <area> --title "<title>"` scaffolds a new topic; add it to a path before validating.
- The style rules in `scripts/lib/style.mjs` fail validation on an em dash, two sentences on one line, or a comment in a workspace file; rephrase rather than disable them.

## Every few months

- Run `npm ci && npm run build && npm test` on a clean checkout; the Playwright suite runs every step's solution and the accessibility checks.
- Start the `Test and deploy` workflow at GitHub Actions; the deploy job needs GitHub Pages enabled with the source set to GitHub Actions.
- Run `npm outdated` and update devDependencies in a single commit, keeping `react`, `react-dom`, and `react-router` on the pinned versions unless the runtime is being upgraded.

## Known limits

- The result iframe is `about:srcdoc`, so hash links and plain form submits inside a workspace navigate the result pane away; the routing topics use the memory-history router and the CourseHub topic uses buttons for its views.
- A check can narrow the result with `__LAB__.resize(width)`; a step cannot ask for a width through its front matter.
- The flow view names a setter by its hook index ("state 0") because the runtime cannot see the destructured variable name.
- Boundary labels in the overlay sit just above each component and can intercept a click on the line above; turn Boundaries off when clicking links in a dense list.
- Progress lives in the browser's `localStorage`; export and import on the home page are the only way to move it.
