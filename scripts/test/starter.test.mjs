// starterCompiles (CONTRACTS 8.8): an edit step whose starter is meant not to compile, such as
// one whose App.jsx holds conflict markers, skips the compile check on its workspace only.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";
import { loadContent } from "../lib/content.mjs";
import { scaffoldTopic } from "../lib/scaffold.mjs";

const RESOLVED = "export default function App() {\n  return <h1>Shop</h1>;\n}\n";
const CONFLICTED =
  "export default function App() {\n<<<<<<< HEAD\n  return <h1>Shop</h1>;\n=======\n  return <h1>The Shop</h1>;\n>>>>>>> rename\n}\n";
const EDIT =
  '```jsx file="src/App.jsx" action="replace" anchor=\'<<<<<<< HEAD\\n  return <h1>Shop</h1>;\\n=======\\n  return <h1>The Shop</h1>;\\n>>>>>>> rename\'\n  return <h1>Shop</h1>;\n```\n';

describe("starterCompiles", () => {
  let contentDir;
  let stepDir;

  // Problems name files relative to the repository; each is cut to its path inside the step.
  const problems = () =>
    loadContent(contentDir).problems.map(
      (problem) => `${problem.file.split("/01-first-step/")[1]}: ${problem.reason}`,
    );
  const step = () => loadContent(contentDir).content.topics[0].steps[0];

  function writeStep({ front = "", body = EDIT, workspace = CONFLICTED, solution = RESOLVED }) {
    writeFileSync(
      path.join(stepDir, "step.md"),
      `---\ntitle: T\nmode: edit\nentry: src/App.jsx\n${front}---\n\nLead.\n\n${body}`,
    );
    writeFileSync(path.join(stepDir, "workspace", "src", "App.jsx"), workspace);
    writeFileSync(path.join(stepDir, "solution", "src", "App.jsx"), solution);
  }

  before(() => {
    contentDir = path.join(mkdtempSync(path.join(tmpdir(), "cs300-starter-")), "content");
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
    }
  });

  beforeEach(() => writeStep({}));

  after(() => rmSync(path.dirname(contentDir), { recursive: true, force: true }));

  it("rejects a starter that does not compile when the field is absent", () => {
    const [problem, ...rest] = problems();
    assert.match(
      problem,
      /^workspace\/src\/App\.jsx: workspace file does not compile with Sucrase/,
    );
    assert.deepEqual(rest, []);
    assert.equal(step().starterCompiles, true);
  });

  it("accepts a starter that does not compile when the field is false and carries the field", () => {
    writeStep({ front: "starterCompiles: false\n" });
    assert.deepEqual(problems(), []);
    assert.equal(step().starterCompiles, false);
  });

  it("rejects the field when the starter compiles, so it cannot go stale", () => {
    writeStep({
      front: "starterCompiles: false\n",
      body: "",
      workspace: RESOLVED,
    });
    assert.deepEqual(problems(), [
      "step.md: starterCompiles is false, but every workspace file compiles; remove the field",
    ]);
  });

  it("still requires the solution to compile and to hold no conflict marker", () => {
    writeStep({ front: "starterCompiles: false\n", body: "", solution: CONFLICTED });
    assert.deepEqual(
      problems().map((problem) => problem.replace(/Sucrase: .*/s, "Sucrase")),
      [
        "solution/src/App.jsx: solution file does not compile with Sucrase",
        "solution/src/App.jsx: solution file holds a conflict marker line (<<<<<<<, =======, or >>>>>>>)",
      ],
    );
  });

  it("rejects a value that is not a boolean and the field on a step that is not an edit step", () => {
    writeStep({ front: "starterCompiles: no way\n" });
    assert.ok(problems().includes("step.md: starterCompiles must be true or false"));
    writeFileSync(
      path.join(stepDir, "step.md"),
      "---\ntitle: T\nmode: read\nstarterCompiles: false\n---\n\nLead.\n",
    );
    assert.ok(problems().includes("step.md: starterCompiles belongs only on an edit step"));
  });
});
