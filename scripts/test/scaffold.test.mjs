// Scaffolds topics and steps into a temporary content directory and validates the result with
// the same library the validator and the content build use.

import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { formatProblems, loadContent } from "../lib/content.mjs";
import { readTree } from "../lib/files.mjs";
import { fill, scaffoldStep, scaffoldTopic, ScaffoldError, slugify } from "../lib/scaffold.mjs";

let root;
let contentDir;

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

// Every scaffolded topic goes into one path, so the validator sees it as reachable.
function writePath(topicIds) {
  writeJson(path.join(contentDir, "paths", "test.json"), {
    id: "test",
    title: "Test",
    units: [
      {
        id: "unit-1",
        title: "Unit 1",
        intro: "One paragraph.",
        topics: topicIds.map((id) => ({ id, required: true })),
      },
    ],
  });
}

function validate() {
  const { content, problems } = loadContent(contentDir);
  assert.equal(problems.length, 0, formatProblems(problems));
  return content;
}

function topic(content, id) {
  return content.topics.find((item) => item.id === id);
}

before(() => {
  root = mkdtempSync(path.join(tmpdir(), "cs300-scaffold-"));
  contentDir = path.join(root, "content");
  writeJson(path.join(contentDir, "areas.json"), [
    { id: "react", title: "React" },
    { id: "dom", title: "DOM" },
  ]);
  writeJson(path.join(contentDir, "api-presets.json"), []);
  mkdirSync(path.join(contentDir, "topics"));
  writePath([]);
});

after(() => rmSync(root, { recursive: true, force: true }));

describe("helpers", () => {
  it("slugifies a title the way step directories are named", () => {
    assert.equal(slugify("Load the products from an API"), "load-the-products-from-an-api");
    assert.equal(slugify("  What's next?  "), "what-s-next");
  });

  it("fills every placeholder and refuses one without a value", () => {
    assert.equal(fill("{{a}}-{{b}}", { a: "1", b: "2" }), "1-2");
    assert.throws(() => fill("{{missing}}", {}), ScaffoldError);
  });
});

describe("scaffoldTopic", () => {
  it("writes a React topic whose first step validates and applies its edit block", () => {
    const result = scaffoldTopic({
      contentDir,
      id: "hello-react",
      area: "react",
      title: "Hello React",
      date: "2026-10-26",
    });
    writePath(["hello-react"]);
    assert.equal(result.topicDir, path.join(contentDir, "topics", "hello-react"));
    assert.ok(result.files.includes("topic.json"));
    assert.ok(result.files.includes("01-first-step/step.md"));
    assert.ok(result.files.includes("01-first-step/check.js"));
    assert.ok(result.files.includes("01-first-step/workspace/src/App.jsx"));
    assert.ok(result.files.includes("01-first-step/solution/src/App.jsx"));
    for (const [file, text] of Object.entries(readTree(result.topicDir))) {
      assert.doesNotMatch(text, /\{\{/, `${file} still has a placeholder`);
    }

    const content = validate();
    const created = topic(content, "hello-react");
    assert.equal(created.title, "Hello React");
    assert.equal(created.area, "react");
    assert.equal(created.updated, "2026-10-26");
    assert.equal(created.steps.length, 1);
    const [step] = created.steps;
    assert.equal(step.mode, "edit");
    assert.equal(step.entry, "src/main.jsx");
    assert.equal(step.edits.length, 1);
    assert.deepEqual(step.inspector, { views: ["boundaries", "flash", "tree"], watch: ["App"] });
    assert.match(step.workspace["index.html"], /<title>Hello React<\/title>/);
    assert.match(step.solution["src/App.jsx"], /<h1>Hello React<\/h1>/);
    assert.ok(step.check.includes("paragraph-renders"));
  });

  it("writes a vanilla topic for a DOM area with an index.html entry", () => {
    const result = scaffoldTopic({
      contentDir,
      id: "hello-dom",
      area: "dom",
      title: "Hello DOM",
      stepTitle: "Select the main element",
    });
    writePath(["hello-react", "hello-dom"]);
    assert.ok(result.files.includes("01-select-the-main-element/workspace/src/main.js"));

    const content = validate();
    const [step] = topic(content, "hello-dom").steps;
    assert.equal(step.entry, "index.html");
    assert.equal(step.inspector, null);
    assert.equal(step.edits.length, 1);
    assert.equal(step.edits[0].action, "append");
  });

  it("refuses an existing topic, a bad id, an unknown area, and an unknown kind", () => {
    const base = { contentDir, title: "Again" };
    assert.throws(
      () => scaffoldTopic({ ...base, id: "hello-react", area: "react" }),
      /already exists/,
    );
    assert.throws(() => scaffoldTopic({ ...base, id: "Hello React", area: "react" }), /lowercase/);
    assert.throws(() => scaffoldTopic({ ...base, id: "x", area: "css" }), /not one of react, dom/);
    assert.throws(() => scaffoldTopic({ ...base, id: "x", area: "react", kind: "svelte" }), /kind/);
    assert.equal(existsSync(path.join(contentDir, "topics", "x")), false);
  });
});

describe("scaffoldStep", () => {
  it("adds step 02 whose workspace is step 01's solution and keeps the front matter settings", () => {
    const result = scaffoldStep({ contentDir, topicId: "hello-react", title: "Show a list" });
    assert.equal(result.stepDir, path.join(contentDir, "topics", "hello-react", "02-show-a-list"));
    assert.ok(result.files.includes("step.md"));
    assert.ok(result.files.includes("check.js"));

    const content = validate();
    const [first, second] = topic(content, "hello-react").steps;
    assert.equal(second.n, 2);
    assert.equal(second.slug, "show-a-list");
    assert.equal(second.title, "Show a list");
    assert.equal(second.mode, "edit");
    assert.equal(second.entry, first.entry);
    assert.deepEqual(second.inspector, first.inspector);
    assert.deepEqual(second.workspace, first.solution);
    assert.deepEqual(second.solution, first.solution);
    assert.equal(second.edits.length, 0);
  });

  it("copies fixtures and the api setting from the previous edit step", () => {
    const stepDir = path.join(contentDir, "topics", "hello-react", "02-show-a-list");
    writeJson(path.join(stepDir, "fixtures", "routes.json"), {
      routes: [{ method: "GET", path: "/items", body: "items.json" }],
    });
    writeJson(path.join(stepDir, "fixtures", "items.json"), [1, 2, 3]);
    const stepFile = path.join(stepDir, "step.md");
    writeFileSync(
      stepFile,
      readFileSync(stepFile, "utf8").replace(
        "mode: edit\n",
        "mode: edit\napi:\n  default: fixtures\n",
      ),
    );

    const result = scaffoldStep({ contentDir, topicId: "hello-react", title: "Load the items" });
    assert.ok(result.files.includes("fixtures/routes.json"));
    assert.ok(result.files.includes("fixtures/items.json"));
    const content = validate();
    const third = topic(content, "hello-react").steps[2];
    assert.deepEqual(third.api, { default: "fixtures" });
    assert.equal(third.fixtures.routes.length, 1);
  });

  it("writes a read step when no earlier step has a solution", () => {
    scaffoldTopic({ contentDir, id: "reading", area: "react", title: "Reading" });
    rmSync(path.join(contentDir, "topics", "reading", "01-first-step"), { recursive: true });
    mkdirSync(path.join(contentDir, "topics", "reading", "01-intro"));
    writeFileSync(
      path.join(contentDir, "topics", "reading", "01-intro", "step.md"),
      "---\ntitle: Intro\nmode: read\n---\n\nOne line.\n",
    );
    writePath(["hello-react", "hello-dom", "reading"]);

    const result = scaffoldStep({ contentDir, topicId: "reading", title: "More reading" });
    assert.deepEqual(result.files, ["check.js", "step.md"]);
    const content = validate();
    assert.equal(topic(content, "reading").steps[1].mode, "read");
  });

  it("refuses an unknown topic and an empty title", () => {
    assert.throws(() => scaffoldStep({ contentDir, topicId: "nope", title: "x" }), /not a topic/);
    assert.throws(() => scaffoldStep({ contentDir, topicId: "hello-react", title: "  " }), /title/);
  });
});
