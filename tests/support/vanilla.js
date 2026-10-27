// The vanilla workspace fixture under tests/fixtures/vanilla/: a plain HTML, CSS, and JavaScript
// page with no React. `readVanillaFixture` gives the workspace files, the step wrapper, and the
// check; `buildVanillaTopic` runs them through the real content pipeline (scripts/lib/) as a
// temporary topic, so the step page can serve the compiled topic through page.route the way
// public/content/topics/<id>.json would.

import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";
import { applyEdits, editsFromTokens } from "../../scripts/lib/edits.mjs";
import { formatProblems, loadContent } from "../../scripts/lib/content.mjs";
import { buildTopic } from "../../scripts/lib/output.mjs";
import { createMarkdown, createRenderer } from "../../scripts/lib/render.mjs";

export const fixtureDir = path.join(import.meta.dirname, "..", "fixtures", "vanilla");
const contentDir = path.join(import.meta.dirname, "..", "..", "content");

export const TOPIC_ID = "vanilla-fixture";
export const TOPIC_TITLE = "Vanilla fixture";

const STEP_FILES = new Set(["step.md", "check.js"]);

export function readVanillaFixture() {
  const files = {};
  for (const name of readdirSync(fixtureDir).sort()) {
    if (!STEP_FILES.has(name)) files[name] = readFileSync(path.join(fixtureDir, name), "utf8");
  }
  const step = readFileSync(path.join(fixtureDir, "step.md"), "utf8");
  const check = readFileSync(path.join(fixtureDir, "check.js"), "utf8");
  const edits = editsFromTokens(createMarkdown().parse(matter(step).content, {}));
  const { files: solution, failures } = applyEdits(files, edits);
  if (failures.length > 0) {
    throw new Error(`The fixture's edit blocks do not apply: ${JSON.stringify(failures)}`);
  }
  return { files, solution, edits, step, check };
}

function writeTree(directory, files) {
  for (const [relative, source] of Object.entries(files)) {
    const target = path.join(directory, relative);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, source);
  }
}

const NARROW_CHECK = `export default async function check({ document, wait }) {
  globalThis.__LAB__.resize(360);
  let width = document.documentElement.clientWidth;
  for (let tries = 0; tries < 40 && width > 360; tries += 1) {
    await wait(25);
    width = document.documentElement.clientWidth;
  }
  return [
    {
      id: "narrow",
      title: "The page is shown 360 pixels wide",
      pass: width <= 360,
      hint: "The result pane should follow the resize request.",
    },
  ];
}
`;

const NARROW_STEP = `---
title: Narrow layout
mode: edit
entry: index.html
---

The check asks the result pane for a width of 360 pixels before it measures the page.
`;

// Compiles the fixture into a topic with two edit steps: step 1 is the fixture's own step, and
// step 2 runs the same workspace with a check that narrows the result through __LAB__.resize.
// Returns the topic JSON the site would load from public/content/topics/vanilla-fixture.json.
export async function buildVanillaTopic() {
  const fixture = readVanillaFixture();
  const root = mkdtempSync(path.join(os.tmpdir(), "cs300-vanilla-"));
  const content = path.join(root, "content");
  const topicDir = path.join(content, "topics", TOPIC_ID);
  try {
    mkdirSync(topicDir, { recursive: true });
    for (const name of ["areas.json", "api-presets.json"]) {
      cpSync(path.join(contentDir, name), path.join(content, name));
    }
    writeFileSync(
      path.join(topicDir, "topic.json"),
      JSON.stringify({
        id: TOPIC_ID,
        title: TOPIC_TITLE,
        area: "dom",
        summary: "A plain page for the test suite.",
        prerequisites: [],
        minutes: 5,
        updated: "2026-10-26",
        changeNote: "Test fixture.",
      }),
    );
    const steps = [
      {
        dir: "01-add-a-third-book",
        step: fixture.step,
        check: fixture.check,
        solution: fixture.solution,
      },
      { dir: "02-narrow-layout", step: NARROW_STEP, check: NARROW_CHECK, solution: fixture.files },
    ];
    for (const { dir, step, check, solution } of steps) {
      const stepDir = path.join(topicDir, dir);
      mkdirSync(stepDir, { recursive: true });
      writeFileSync(path.join(stepDir, "step.md"), step);
      writeFileSync(path.join(stepDir, "check.js"), check);
      writeTree(path.join(stepDir, "workspace"), fixture.files);
      writeTree(path.join(stepDir, "solution"), solution);
    }

    // Validation requires every topic to be reachable from a path, so the fixture gets one.
    const pathsDir = path.join(content, "paths");
    mkdirSync(pathsDir, { recursive: true });
    writeFileSync(
      path.join(pathsDir, "test-fixtures.json"),
      JSON.stringify({
        id: "test-fixtures",
        title: "Test fixtures",
        units: [
          {
            id: "vanilla",
            title: TOPIC_TITLE,
            intro: "A unit that exists only so the fixture topic validates.",
            topics: [{ id: TOPIC_ID, required: true }],
            localNotes: [],
          },
        ],
      }),
    );

    const loaded = loadContent(content);
    if (loaded.problems.length > 0) {
      throw new Error(`The vanilla fixture does not validate:\n${formatProblems(loaded.problems)}`);
    }
    const renderer = await createRenderer();
    try {
      const topic = loaded.content.topics.find((candidate) => candidate.id === TOPIC_ID);
      return buildTopic(topic, renderer.render);
    } finally {
      renderer.dispose();
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// Serves `topic` to the step page in place of public/content/topics/<id>.json.
export async function serveTopic(page, topic) {
  await page.route(`**/content/topics/${topic.id}.json`, (route) => route.fulfill({ json: topic }));
}
