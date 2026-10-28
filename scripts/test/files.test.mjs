// The Phase 7 content rules of docs/CONTRACTS.md sections 8.1 and 8.3: the `files` front-matter
// field and the compiled step's `fileNotes`, and the project-tree fence's indented listing, both
// on their own and through loadContent on a small content tree.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";
import { loadContent } from "../lib/content.mjs";
import { parseProjectTree } from "../lib/fences.mjs";
import { buildTopic } from "../lib/output.mjs";
import { scaffoldTopic } from "../lib/scaffold.mjs";

const APP = "export default function App() {\n  return <h1>Shop</h1>;\n}\n";

describe("the project-tree listing", () => {
  it("reads stages, depths, kinds, descriptions, and + entries placed under earlier folders", () => {
    const { props, error } = parseProjectTree(
      [
        "stage: After npm create vite",
        "my-first-react/",
        "  index.html          The page the browser opens",
        "  src/",
        "    main.jsx          Finds the root div and renders App into it",
        "stage: After npm install",
        "+ node_modules/       Every installed package; never edited, never committed",
        "stage: After npm run build",
        "+ dist/",
        "+   index.html        The built page",
      ].join("\n"),
    );
    assert.equal(error, undefined);
    assert.deepEqual(props, {
      stages: [
        {
          label: "After npm create vite",
          entries: [
            { path: "my-first-react", depth: 0, kind: "folder", description: null, fresh: true },
            {
              path: "my-first-react/index.html",
              depth: 1,
              kind: "file",
              description: "The page the browser opens",
              fresh: true,
            },
            {
              path: "my-first-react/src",
              depth: 1,
              kind: "folder",
              description: null,
              fresh: true,
            },
            {
              path: "my-first-react/src/main.jsx",
              depth: 2,
              kind: "file",
              description: "Finds the root div and renders App into it",
              fresh: true,
            },
          ],
        },
        {
          label: "After npm install",
          entries: [
            {
              path: "my-first-react/node_modules",
              depth: 1,
              kind: "folder",
              description: "Every installed package; never edited, never committed",
              fresh: true,
            },
          ],
        },
        {
          label: "After npm run build",
          entries: [
            {
              path: "my-first-react/dist",
              depth: 1,
              kind: "folder",
              description: null,
              fresh: true,
            },
            {
              path: "my-first-react/dist/index.html",
              depth: 2,
              kind: "file",
              description: "The built page",
              fresh: true,
            },
          ],
        },
      ],
    });
  });

  it("makes a body with no stage line one stage labeled null, and an empty body no props", () => {
    assert.deepEqual(parseProjectTree("src/\n  App.jsx  The top component\n").props.stages, [
      {
        label: null,
        entries: [
          { path: "src", depth: 0, kind: "folder", description: null, fresh: true },
          {
            path: "src/App.jsx",
            depth: 1,
            kind: "file",
            description: "The top component",
            fresh: true,
          },
        ],
      },
    ]);
    assert.deepEqual(parseProjectTree("\n  \n"), { props: {} });
  });

  it("rejects indentation that does not nest, a + line in the first stage, and a nameless entry", () => {
    const error = (body) => parseProjectTree(body).error ?? null;
    assert.match(error("a/\n   b"), /two spaces/);
    assert.match(error("a.txt\n  b"), /does not nest/);
    assert.match(error("a/\n    b"), /does not nest/);
    assert.match(error("+ a"), /\+ entry belongs only in a stage after the first/);
    assert.match(error("stage: One\n+ a"), /\+ entry belongs only in a stage after the first/);
    assert.match(error("stage: One\na\nstage: Two\nb"), /starts with "\+ "/);
    assert.match(error("a/\n  /"), /needs a name/);
    assert.match(error("a\nstage: Two\n+ b"), /stage: line must come before every entry/);
    assert.match(error("stage: One\na\nstage: Two"), /lists no entries/);
    assert.match(error("a\na"), /listed twice/);
  });
});

describe("the files field and the project-tree fence in content", () => {
  let contentDir;
  let stepDir;

  const problems = () =>
    loadContent(contentDir).problems.map(
      (problem) => `${problem.file.split("/01-first-step/")[1] ?? problem.file}: ${problem.reason}`,
    );
  const topic = () => loadContent(contentDir).content.topics[0];

  function writeStep(front, body = "Lead.\n") {
    writeFileSync(path.join(stepDir, "step.md"), `---\ntitle: T\n${front}---\n\n${body}`);
  }

  before(() => {
    contentDir = path.join(mkdtempSync(path.join(tmpdir(), "cs300-files-")), "content");
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
    stepDir = path.join(contentDir, "topics", "alpha", "01-first-step");
    for (const tree of ["workspace", "solution"]) {
      mkdirSync(path.join(stepDir, tree, "src"), { recursive: true });
      writeFileSync(
        path.join(stepDir, tree, "index.html"),
        '<!doctype html>\n<div id="root"></div>\n',
      );
      writeFileSync(path.join(stepDir, tree, "src", "App.jsx"), APP);
    }
  });

  beforeEach(() => writeStep("mode: edit\nentry: src/App.jsx\n"));

  after(() => rmSync(path.dirname(contentDir), { recursive: true, force: true }));

  it("compiles files into fileNotes, and an absent field into {}", () => {
    assert.deepEqual(problems(), []);
    assert.deepEqual(buildTopic(topic(), () => "").steps[0].fileNotes, {});
    writeStep("mode: edit\nentry: src/App.jsx\nfiles:\n  src/App.jsx: The shop's one component.\n");
    assert.deepEqual(problems(), []);
    assert.deepEqual(buildTopic(topic(), () => "").steps[0].fileNotes, {
      "src/App.jsx": "The shop's one component.",
    });
  });

  it("rejects a path outside the workspace, an empty sentence, and the field off an edit step", () => {
    writeStep("mode: edit\nentry: src/App.jsx\nfiles:\n  src/Missing.jsx: Nothing.\n");
    assert.deepEqual(problems(), [
      "step.md: files names src/Missing.jsx, which is not a workspace file",
    ]);
    writeStep('mode: edit\nentry: src/App.jsx\nfiles:\n  src/App.jsx: ""\n');
    assert.deepEqual(problems(), [
      "step.md: files gives src/App.jsx no sentence; write one non-empty sentence",
    ]);
    writeStep("mode: edit\nentry: src/App.jsx\nfiles: [src/App.jsx]\n");
    assert.deepEqual(problems(), ["step.md: files must map workspace paths to one sentence each"]);
    writeStep("mode: read\nfiles:\n  src/App.jsx: The top component.\n");
    assert.deepEqual(problems(), ["step.md: files belongs only on an edit step"]);
  });

  it("validates a project-tree fence body and keeps an empty one", () => {
    writeStep("mode: read\n", '```demo name="project-tree"\n```\n');
    assert.deepEqual(problems(), []);
    writeStep(
      "mode: read\n",
      '```demo name="project-tree"\nstage: First\nsrc/\n  App.jsx  The top component\nstage: Second\n+ dist/  The build\n```\n',
    );
    assert.deepEqual(problems(), []);
    writeStep("mode: read\n", 'Lead.\n\n```demo name="project-tree"\nsrc/\n   App.jsx\n```\n');
    assert.deepEqual(problems(), [
      "step.md: line 8: demo fence body line 2 of the listing: indent each level by two spaces",
    ]);
  });
});
