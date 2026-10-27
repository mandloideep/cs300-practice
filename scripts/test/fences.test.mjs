// The Phase 6 step fences of docs/CONTRACTS.md section 7: parsing on their own, the placeholder
// HTML the renderer writes, and the validator rules through loadContent on a small content tree.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

describe("predict and quiz fences", () => {
  it("reads the question, the options, the answer index, and the explanation", () => {
    const { questions } = parse(
      fence("predict", "What does it log?\n- 1\n= 2\n- 3") +
        "\n" +
        fence(
          'quiz id="which-copy"',
          "Which one copies?\n= spread\n- push\n> Spread makes a new array.\n> push changes it.",
        ) +
        "\n" +
        fence("predict", "Again?\n= yes\n- no"),
    );
    assert.deepEqual(
      questions.map(({ line, ...question }) => question),
      [
        {
          id: "predict-1",
          kind: "predict",
          question: "What does it log?",
          options: ["1", "2", "3"],
          answer: 1,
          explanation: null,
        },
        {
          id: "which-copy",
          kind: "quiz",
          question: "Which one copies?",
          options: ["spread", "push"],
          answer: 0,
          explanation: "Spread makes a new array. push changes it.",
        },
        {
          id: "predict-2",
          kind: "predict",
          question: "Again?",
          options: ["yes", "no"],
          answer: 0,
          explanation: null,
        },
      ],
    );
  });

  it("rejects a missing answer, two answers, too few or too many options, and stray lines", () => {
    const errors = parse(
      [
        fence("predict", "Q?\n- a\n- b"),
        fence("quiz", "Q?\n= a\n= b"),
        fence("quiz", "Q?\n= a"),
        fence("quiz", "Q?\n= a\n- b\n- c\n- d\n- e"),
        fence("predict", "Q?\n= a\n- b\n> Why."),
        fence("quiz", "Q?\n= a\n> Why.\n- b"),
        fence("quiz", "Q?\n= a\nb"),
        fence('quiz id="Bad Id"', "Q?\n= a\n- b"),
      ].join("\n"),
    ).questions.map((question) => question.error);
    assert.match(errors[0], /marks no answer/);
    assert.match(errors[1], /more than one answer/);
    assert.match(errors[2], /has 1 option/);
    assert.match(errors[3], /has 5 option/);
    assert.match(errors[4], /only a quiz may have/);
    assert.match(errors[5], /must come last/);
    assert.match(errors[6], /is not an option/);
    assert.match(errors[7], /lowercase hyphenated slug/);
  });

  it("renders a placeholder whose fallback lists the options without the answer", async () => {
    const renderer = await createRenderer();
    try {
      const html = renderer.render(
        fence("predict", "What does `log` show?\n- one\n= two") +
          "\n" +
          fence("quiz", "Q?\n= a\n- b\n> Because."),
      );
      assert.equal(
        html,
        '<div class="predict" data-predict="predict-1"><div class="question-fallback">' +
          "<p><strong>Predict:</strong> What does <code>log</code> show?</p>" +
          "<ul><li>one</li><li>two</li></ul></div></div>\n" +
          '<div class="quiz" data-quiz="quiz-1"><div class="question-fallback">' +
          "<p><strong>Quiz:</strong> Q?</p><ul><li>a</li><li>b</li></ul></div></div>\n",
      );
    } finally {
      renderer.dispose();
    }
  });
});

describe("the Read more section", () => {
  it("folds from the heading to the Check paragraph, which stays outside", async () => {
    const renderer = await createRenderer();
    try {
      const html = renderer.render(
        "Lead.\n\n## Read more\n\nBackground.\n\n**If it breaks:** Look.\n\n**Check:** Run it.\n",
      );
      assert.equal(
        html,
        "<p>Lead.</p>\n" +
          '<details class="read-more"><summary>Read more</summary>\n' +
          "<p>Background.</p>\n<p><strong>If it breaks:</strong> Look.</p>\n</details>\n" +
          "<p><strong>Check:</strong> Run it.</p>\n",
      );
    } finally {
      renderer.dispose();
    }
  });

  it("leaves a step without the heading unchanged", async () => {
    const renderer = await createRenderer();
    try {
      assert.equal(
        renderer.render("Lead.\n\n## More\n\n**Check:** Run it.\n"),
        "<p>Lead.</p>\n<h2>More</h2>\n<p><strong>Check:</strong> Run it.</p>\n",
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

  it("lists the questions and the links on the step", () => {
    writeFileSync(
      stepFile,
      "---\ntitle: T\nmode: read\nlinks:\n  - kind: reading\n    title: Functions\n    url: https://javascript.info/function-basics\n---\n\n" +
        "Lead.\n\n" +
        fence("quiz", "Q?\n= a\n- b\n> Because.") +
        "\n## Read more\n\nMore.\n\n**Check:** Run it.\n",
    );
    assert.deepEqual(problemsFor(), []);
    assert.deepEqual(step().links, [
      { kind: "reading", title: "Functions", url: "https://javascript.info/function-basics" },
    ]);
    assert.deepEqual(step().questions, [
      {
        id: "quiz-1",
        kind: "quiz",
        question: "Q?",
        options: ["a", "b"],
        answer: 0,
        explanation: "Because.",
      },
    ]);
  });

  it("names the line of a bad question, a duplicate id, and a Read more without Check", () => {
    writeStep(
      "Lead.\n\n" +
        fence('predict id="same"', "Q?\n= a\n- b") +
        "\n" +
        fence('quiz id="same"', "Q?\n= a\n- b") +
        "\n" +
        fence("quiz", "Q?\n- a\n- b") +
        "\n## Read more\n\nMore.\n",
    );
    assert.deepEqual(
      problemsFor().map((problem) => problem.reason),
      [
        "line 14: quiz fence uses the id same twice in this step",
        'line 20: quiz fence marks no answer; start exactly one option with "= "',
        "line 26: ## Read more needs a **Check:** paragraph after it, which stays outside the folded part",
      ],
    );
  });

  it("rejects a second Read more heading and an If it breaks paragraph after Check", () => {
    writeStep("Lead.\n\n## Read more\n\nA.\n\n## Read more\n\n**Check:** Run it.\n");
    assert.deepEqual(
      problemsFor().map((problem) => problem.reason),
      ["line 12: a step has at most one ## Read more heading"],
    );
    writeStep("Lead.\n\n## Read more\n\nA.\n\n**Check:** Run it.\n\n**If it breaks:** Look.\n");
    assert.deepEqual(
      problemsFor().map((problem) => problem.reason),
      ["line 14: the **If it breaks:** paragraph belongs inside Read more, before **Check:**"],
    );
  });

  it("checks links on the topic and on the step", () => {
    const topicFile = path.join(contentDir, "topics", "alpha", "topic.json");
    const topic = JSON.parse(readFileSync(topicFile, "utf8"));
    writeFileSync(
      topicFile,
      JSON.stringify({
        ...topic,
        links: [
          { kind: "lecture", title: "Week 5 slides", url: "https://d2l.neiu.edu/x" },
          { kind: "video", title: "", url: "http://example.com", extra: 1 },
        ],
      }),
    );
    writeFileSync(stepFile, "---\ntitle: T\nmode: read\nlinks: nope\n---\n\nLead.\n");
    const reasons = loadContent(contentDir).problems.map((problem) => problem.reason);
    assert.deepEqual(reasons, [
      'link 2 has kind "video"; expected one of lecture, reading, reference',
      "link 2 needs a title",
      "link 2 needs a url that starts with https://",
      "link 2 has unknown field(s) extra",
      "front matter links must be a list of { kind, title, url }",
    ]);
    writeFileSync(topicFile, JSON.stringify(topic));
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
