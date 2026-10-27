// The style rules on their own, and the topic rules through loadContent on a small content tree.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { loadContent } from "../lib/content.mjs";
import { scaffoldTopic } from "../lib/scaffold.mjs";
import { noCommentLines, noEmDash, oneSentencePerLine, rulesFor } from "../lib/style.mjs";

const lines = (problems) => problems.map((problem) => problem.line);

describe("oneSentencePerLine", () => {
  it("flags a prose line with two sentences", () => {
    assert.deepEqual(lines(oneSentencePerLine("Run the code. The list appears.\n")), [1]);
    assert.deepEqual(lines(oneSentencePerLine("Does it work? It does!\n")), [1]);
    assert.deepEqual(lines(oneSentencePerLine('It says "done." Then it stops.\n')), [1]);
    assert.deepEqual(lines(oneSentencePerLine("**Check:** Run it. Look at the page.\n")), [1]);
  });

  it("accepts one sentence per line, clauses, and lowercase continuations", () => {
    const text = [
      "Run the code.",
      "The list appears, and the console is empty.",
      "**Check:** Run the code.",
      "Open `src/App.jsx` and find the list.",
      "Node.js is not a sentence end here.",
      "",
    ].join("\n");
    assert.deepEqual(lines(oneSentencePerLine(text)), []);
  });

  it("skips front matter, code fences, tables, inline code, link text, and HTML tags", () => {
    const text = [
      "---",
      "title: One. Two",
      "---",
      "",
      "```js",
      "const a = 1. Then b.",
      "```",
      "",
      "    ```text",
      "    Inside. Also inside.",
      "    ```",
      "",
      "| One. Two | Three. Four |",
      "| --- | --- |",
      "",
      "Use `a. B` here.",
      "See [One. Two](#/topic/x) for more.",
      '<img src="done.png" alt="Done. Next" />',
      "A real break. Here it is.",
      "",
    ].join("\n");
    assert.deepEqual(lines(oneSentencePerLine(text)), [19]);
  });

  it("ignores list markers, numbered headings, and blockquotes", () => {
    const text = [
      "1. Choose the category.",
      "2. Press the button.",
      "- Run it.",
      "## 3. What changes?",
      "> Quoted. Twice here.",
      "",
    ].join("\n");
    assert.deepEqual(lines(oneSentencePerLine(text)), [5]);
  });
});

describe("noEmDash", () => {
  it("names each line with the character", () => {
    assert.deepEqual(lines(noEmDash("fine\nnot — fine\n—\n")), [2, 3]);
  });
});

describe("noCommentLines", () => {
  it("flags lines that start a comment and nothing else", () => {
    const text = [
      "const url = 'http://x'; // trailing text is not a comment line",
      "// a line comment",
      "  /* a block comment",
      "<!-- an HTML comment -->",
      "#root { color: #fff; }",
      '"//not-a-comment"',
      "",
    ].join("\n");
    assert.deepEqual(lines(noCommentLines(text)), [2, 3, 4]);
  });
});

describe("rulesFor", () => {
  it("applies the rules by the file's place under content/", () => {
    const names = (file) => rulesFor(file).map((rule) => rule.name);
    assert.deepEqual(names("topics/a/01-b/step.md"), ["noEmDash", "oneSentencePerLine"]);
    assert.deepEqual(names("topics/a/01-b/workspace/src/App.jsx"), ["noEmDash", "noCommentLines"]);
    assert.deepEqual(names("topics/a/01-b/solution/index.html"), ["noEmDash", "noCommentLines"]);
    assert.deepEqual(names("topics/a/01-b/local/README.md"), ["noEmDash", "noCommentLines"]);
    assert.deepEqual(names("topics/a/01-b/check.js"), ["noEmDash"]);
    assert.deepEqual(names("topics/a/01-b/fixtures/routes.json"), ["noEmDash"]);
    assert.deepEqual(names("areas.json"), ["noEmDash"]);
  });
});

describe("loadContent style rules", () => {
  let contentDir;
  const problemsFor = () => loadContent(contentDir).problems;
  const reasons = (file) =>
    problemsFor()
      .filter((problem) => problem.file === file)
      .map((problem) => problem.reason);

  before(() => {
    contentDir = path.join(mkdtempSync(path.join(tmpdir(), "cs300-style-")), "content");
    mkdirSync(path.join(contentDir, "paths"), { recursive: true });
    mkdirSync(path.join(contentDir, "topics"));
    writeFileSync(path.join(contentDir, "areas.json"), '[{ "id": "react", "title": "React" }]\n');
    writeFileSync(path.join(contentDir, "api-presets.json"), "[]\n");
    scaffoldTopic({ contentDir, id: "alpha", area: "react", title: "Alpha" });
    scaffoldTopic({ contentDir, id: "beta", area: "react", title: "Beta" });
    writeFileSync(
      path.join(contentDir, "paths", "p.json"),
      JSON.stringify({
        id: "p",
        title: "P",
        units: [{ id: "u", title: "U", intro: "I.", topics: [{ id: "alpha", required: true }] }],
      }),
    );
  });

  after(() => rmSync(path.dirname(contentDir), { recursive: true, force: true }));

  it("reports a topic that no path reaches, naming its topic.json", () => {
    assert.deepEqual(reasons("content/topics/beta/topic.json"), [
      "topic is in no unit of any path under content/paths/, so students cannot reach it",
    ]);
    assert.deepEqual(reasons("content/topics/alpha/topic.json"), []);
  });

  it("reports a missing or empty changeNote and a missing updated", () => {
    const file = path.join(contentDir, "topics", "alpha", "topic.json");
    writeFileSync(
      file,
      JSON.stringify({
        id: "alpha",
        title: "Alpha",
        area: "react",
        summary: "S.",
        changeNote: " ",
      }),
    );
    const found = reasons("content/topics/alpha/topic.json");
    assert.ok(found.includes("is missing the updated field"), found.join("; "));
    assert.ok(found.includes("changeNote must be a sentence that says what changed"));
  });

  it("names the file and line for an em dash, a second sentence, and a comment line", () => {
    const step = path.join(contentDir, "topics", "beta", "01-first-step");
    writeFileSync(path.join(step, "fixtures.json"), '{ "note": "a — b" }\n');
    writeFileSync(
      path.join(step, "workspace", "src", "App.jsx"),
      "// starter\nexport default function App() {\n  return <main />;\n}\n",
    );
    const stepFile = path.join(step, "step.md");
    writeFileSync(
      stepFile,
      "---\ntitle: T\nmode: read\n---\n\nOne sentence. Then another on the same line.\n",
    );
    const found = problemsFor();
    const has = (file, reason) =>
      found.some((problem) => problem.file === file && problem.reason === reason);
    assert.ok(
      has(
        "content/topics/beta/01-first-step/fixtures.json",
        "line 1 contains the em dash character; use a hyphen",
      ),
    );
    assert.ok(
      has(
        "content/topics/beta/01-first-step/workspace/src/App.jsx",
        "line 1 is a comment line; code that students see carries no comments, so move the explanation into step.md",
      ),
    );
    assert.ok(
      has(
        "content/topics/beta/01-first-step/step.md",
        "line 6 holds more than one sentence; put each sentence on its own line",
      ),
    );
  });
});
