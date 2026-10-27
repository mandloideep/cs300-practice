// The Phase 6 step fences of docs/CONTRACTS.md section 7: parsing on their own, the placeholder
// HTML the renderer writes, and the validator rules through loadContent on a small content tree.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { loadContent } from "../lib/content.mjs";
import { demoRegistry, fencesFromTokens } from "../lib/fences.mjs";
import { createMarkdown, createRenderer } from "../lib/render.mjs";
import { scaffoldTopic } from "../lib/scaffold.mjs";

const parse = (markdown) => fencesFromTokens(createMarkdown().parse(markdown, {}));
const fence = (info, body = "") => "```" + info + "\n" + body + (body ? "\n" : "") + "```\n";

describe("the explainer registry", () => {
  it("lists each id once with a title and a description", () => {
    const ids = demoRegistry().map((entry) => entry.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const entry of demoRegistry()) {
      assert.match(entry.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.ok(entry.title && entry.description, entry.id);
    }
  });
});

describe("demo fences", () => {
  it("reads the id and the props in body order", () => {
    const { demos } = parse(
      fence('demo name="event-loop"', '{ "timers": 2 }') +
        "\nText.\n\n" +
        fence('demo name="callback"'),
    );
    assert.deepEqual(
      demos.map(({ id, props, error }) => ({ id, props, error })),
      [
        { id: "event-loop", props: { timers: 2 }, error: undefined },
        { id: "callback", props: {}, error: undefined },
      ],
    );
  });

  it("rejects a missing name, an unknown id, and a body that is not one JSON object", () => {
    const errors = parse(
      [
        fence("demo"),
        fence('demo name="no-such-explainer"'),
        fence('demo name="callback"', "[1, 2]"),
        fence('demo name="callback"', "{ timers: 2 }"),
      ].join("\n"),
    ).demos.map((demo) => demo.error);
    assert.match(errors[0], /needs a name attribute/);
    assert.match(errors[1], /not in src\/demos\/registry.json/);
    assert.match(errors[2], /must be one JSON object/);
    assert.match(errors[3], /not valid JSON/);
  });

  it("renders the placeholder with the props and the registry's text fallback", async () => {
    const renderer = await createRenderer();
    try {
      const html = renderer.render(fence('demo name="event-loop"', '{ "timers": 2 }'));
      assert.equal(
        html,
        '<div class="demo" data-demo="event-loop" data-props="{&quot;timers&quot;:2}">' +
          '<p class="demo-fallback">Event loop: the call stack, the timer and event queues, and the order in which plain code, setTimeout, a click, and a promise reaction run.</p></div>\n',
      );
    } finally {
      renderer.dispose();
    }
  });
});

describe("loadContent with Phase 6 fences", () => {
  let contentDir;
  let stepFile;
  const problemsFor = () =>
    loadContent(contentDir).problems.filter((problem) => problem.file.endsWith("step.md"));
  const step = () => loadContent(contentDir).content.topics[0].steps[0];

  before(() => {
    contentDir = path.join(mkdtempSync(path.join(tmpdir(), "cs300-fences-")), "content");
    mkdirSync(path.join(contentDir, "paths"), { recursive: true });
    mkdirSync(path.join(contentDir, "topics"));
    writeFileSync(path.join(contentDir, "areas.json"), '[{ "id": "react", "title": "React" }]\n');
    writeFileSync(path.join(contentDir, "api-presets.json"), "[]\n");
    scaffoldTopic({ contentDir, id: "alpha", area: "react", title: "Alpha" });
    writeFileSync(
      path.join(contentDir, "paths", "p.json"),
      JSON.stringify({
        id: "p",
        title: "P",
        units: [{ id: "u", title: "U", intro: "I.", topics: [{ id: "alpha", required: true }] }],
      }),
    );
    stepFile = path.join(contentDir, "topics", "alpha", "01-first-step", "step.md");
  });

  after(() => rmSync(path.dirname(contentDir), { recursive: true, force: true }));

  function writeStep(body) {
    writeFileSync(stepFile, `---\ntitle: T\nmode: read\n---\n\n${body}`);
  }

  it("accepts a known explainer and lists it on the step", () => {
    writeStep(
      "Lead.\n\n" + fence('demo name="callback"', '{ "delay": 1 }') + "\n**Check:** Run it.\n",
    );
    assert.deepEqual(problemsFor(), []);
    assert.deepEqual(step().demos, ["callback"]);
  });

  it("names the line of an unknown explainer and of a body that is not an object", () => {
    writeStep(
      "Lead.\n\n" + fence('demo name="nope"') + "\n" + fence('demo name="callback"', '"text"'),
    );
    assert.deepEqual(
      problemsFor().map((problem) => problem.reason),
      [
        'line 8: demo fence names explainer "nope", which is not in src/demos/registry.json',
        "line 11: demo fence body must be one JSON object of props, or empty",
      ],
    );
    assert.deepEqual(step().demos, []);
  });
});
