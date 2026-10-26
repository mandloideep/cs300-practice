# Phase 5 plan: maintenance tooling

This document plans Phase 5 of the CS300 Lab as section 13 of [DESIGN.md](DESIGN.md) describes it: the runtime upgrade script, content validation in CI, and the README for adding a topic, so that a new topic is added by editing `content/` only.
Two of the three were delivered early: content validation runs in the workflow since Phase 1, and the README already explains adding a topic, a path, and a preset.
Phase 5 therefore finishes the runtime script, adds scaffolding and style checks, and closes the loose ends the earlier phases left open.

## What Phase 5 delivers

- `npm run upgrade:runtime -- <react-version> <react-router-version>`: bumps the exact pins, rebuilds `public/runtime/`, runs `verify:runtime`, and prints the commit message to use; it refuses to run with a dirty working tree.
- `npm run new:topic -- <id> --area <area> --title "<title>"`: scaffolds `topic.json`, a first step folder with `step.md`, `starter/`, `solution/`, and `check.js` from templates under `scripts/templates/`, and prints what to fill in; `npm run new:step -- <topic-id> "<title>"` adds the next numbered step.
- Style checks in `scripts/validate-content.mjs`: one sentence per physical line in `step.md`, no em dash anywhere under `content/`, no comment lines in workspace, solution, or local files, `updated` and `changeNote` present in `topic.json`, every topic reachable from at least one path or listed in `areas.json` as standalone.
- A `docs/MAINTENANCE.md` that lists the yearly tasks: upgrade the runtime, review the presets, copy a path for the next semester, re-export D2L pages, and run the accessibility walkthrough again.
- The loose ends: whatever the Phase 2 to 4 reports left open and the instructor has not taken, each fixed or written up with the reason it stays open.

## Milestones, in order

1. **Runtime upgrade script.** `scripts/upgrade-runtime.mjs`, documented in the README section "Upgrading the runtime", replacing the manual steps there with the one command plus the browser check.
2. **Scaffolding.** `scripts/new-topic.mjs` and `scripts/new-step.mjs` with templates, a Playwright-free unit test that scaffolds into a temporary directory and validates the result with `validate-content.mjs`.
3. **Style checks.** The rules above in `validate-content.mjs`, with each rule's message naming the file and line; the existing content must pass, so fix any content the rules catch in the same commit.
4. **Maintenance guide and loose ends.** `docs/MAINTENANCE.md`; the open items from the earlier reports.

## Definition of done for Phase 5

- A new topic can be scaffolded, filled in, validated, built, and tested without touching anything outside `content/`.
- The runtime can be upgraded with one command and the documented browser check.
- The suite, the validator, and the workflow are green, and the README matches the scripts that exist.

## Work streams

Phase 5 is one stream; the milestones are small and touch `scripts/`, `docs/`, and the README.

## Decisions already made

1. Scaffolding writes files; it does not interview the author.
2. Style rules fail validation rather than warn, so CI holds the line.

## When to ask

Ask only when blocked on something the design and this plan do not settle and a reasonable default would make the work useless if wrong.
Otherwise choose, state the choice in the milestone report, and continue.
