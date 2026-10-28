// Exercises the release gating of docs/CONTRACTS.md section 7.5 on a small content directory:
// the opens and active fields in validation, the gated model, the real content build run as a
// command in a temporary copy of the project, and the D2L export of a gated build.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, describe, it } from "node:test";
import { exportPath } from "../export-d2l.mjs";
import { UsageError } from "../lib/cli.mjs";
import { formatProblems, loadContent, releaseContent, releaseOptions } from "../lib/content.mjs";
import { scaffoldTopic } from "../lib/scaffold.mjs";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const TOPICS = ["topic-a", "topic-b", "topic-c", "topic-d"];

let root;
let contentDir;

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

function unit(id, topics, extra = {}) {
  return {
    id,
    title: `Unit ${id}`,
    intro: "One paragraph.",
    topics: topics.map((topic) => ({ id: topic, required: true })),
    localNotes: ["Runs in the browser."],
    ...extra,
  };
}

// spring opens week-1 at once, week-3 on 2027-01-01, and week-2 on 2027-02-01. topic-d is in the
// closed week-2 and the open week-3; topic-c is only in the inactive path old.
function writePaths({ spring = {}, old = {} } = {}) {
  writeJson(path.join(contentDir, "paths", "spring.json"), {
    id: "spring",
    title: "Spring",
    units: [
      unit("week-1", ["topic-a"]),
      unit("week-2", ["topic-b", "topic-d"], { opens: "2027-02-01" }),
      unit("week-3", ["topic-d"], { opens: "2027-01-01" }),
    ],
    ...spring,
  });
  writeJson(path.join(contentDir, "paths", "old.json"), {
    id: "old",
    title: "Old",
    active: false,
    units: [unit("week-1", ["topic-c", "topic-a"])],
    ...old,
  });
}

function load() {
  const { content, problems } = loadContent(contentDir);
  assert.equal(problems.length, 0, formatProblems(problems));
  return content;
}

function problemsFor(paths) {
  writePaths(paths);
  try {
    return loadContent(contentDir).problems.map(({ file, reason }) => `${file}: ${reason}`);
  } finally {
    writePaths();
  }
}

function ids(items) {
  return items.map((item) => item.id).sort();
}

// Runs scripts/build-content.mjs from the copy of scripts/ in root, so that it writes root/public.
function build(args = [], env = {}) {
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts/build-content.mjs"), ...args],
    {
      encoding: "utf8",
      env: { ...process.env, LAB_BUILD_DATE: "", ...env },
    },
  );
  const out = path.join(root, "public", "content");
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    index:
      result.status === 0 ? JSON.parse(readFileSync(path.join(out, "index.json"), "utf8")) : null,
    files: result.status === 0 ? readdirSync(path.join(out, "topics")).sort() : null,
  };
}

before(() => {
  root = mkdtempSync(path.join(tmpdir(), "cs300-release-"));
  contentDir = path.join(root, "content");
  // The build resolves its root from its own location, so scripts/ is copied; everything else it
  // might read is linked from the project.
  cpSync(path.join(project, "scripts"), path.join(root, "scripts"), { recursive: true });
  for (const entry of readdirSync(project)) {
    if (["content", "public", "dist", "dist-d2l", "scripts", ".git"].includes(entry)) continue;
    symlinkSync(path.join(project, entry), path.join(root, entry));
  }
  writeJson(path.join(contentDir, "areas.json"), [{ id: "react", title: "React" }]);
  writeJson(path.join(contentDir, "api-presets.json"), []);
  mkdirSync(path.join(contentDir, "topics"));
  for (const id of TOPICS) {
    scaffoldTopic({ contentDir, id, area: "react", title: `Topic ${id}`, date: "2026-10-27" });
  }
  writePaths();
});

after(() => rmSync(root, { recursive: true, force: true }));

describe("releaseOptions", () => {
  const now = new Date("2026-10-27T23:30:00.000Z");

  it("defaults to a gated build as of today in UTC", () => {
    assert.deepEqual(releaseOptions([], {}, now), { all: false, buildDate: "2026-10-27" });
    assert.deepEqual(releaseOptions([], { LAB_BUILD_DATE: "" }, now), {
      all: false,
      buildDate: "2026-10-27",
    });
  });

  it("reads --all and LAB_BUILD_DATE", () => {
    assert.deepEqual(releaseOptions(["--all"], {}, now), { all: true, buildDate: "2026-10-27" });
    assert.deepEqual(releaseOptions([], { LAB_BUILD_DATE: "2027-03-01" }, now), {
      all: false,
      buildDate: "2027-03-01",
    });
  });

  it("refuses a build date that is not a real YYYY-MM-DD date, and unknown arguments", () => {
    for (const date of ["2027-3-1", "03/01/2027", "2027-02-30", "tomorrow"]) {
      assert.throws(() => releaseOptions([], { LAB_BUILD_DATE: date }, now), UsageError, date);
    }
    assert.throws(() => releaseOptions(["--al"], {}, now), UsageError);
    assert.throws(() => releaseOptions(["--all=yes"], {}, now), UsageError);
    assert.throws(() => releaseOptions(["fall-2026"], {}, now), UsageError);
  });
});

describe("validation of the release fields", () => {
  it("accepts paths with and without opens and active", () => {
    load();
    assert.deepEqual(problemsFor({ old: { active: true } }), []);
    assert.deepEqual(problemsFor({ spring: { units: [unit("week-1", TOPICS)] } }), []);
  });

  it("rejects an opens that is not a real YYYY-MM-DD date", () => {
    const units = [
      unit("week-1", ["topic-a", "topic-b", "topic-d"], { opens: "2027-2-1" }),
      unit("week-2", [], { opens: "2027-02-29" }),
      unit("week-3", [], { opens: 20270301 }),
    ];
    assert.deepEqual(problemsFor({ spring: { units } }), [
      "content/paths/spring.json: unit week-1 opens must be a date written as YYYY-MM-DD",
      "content/paths/spring.json: unit week-2 opens must be a date written as YYYY-MM-DD",
      "content/paths/spring.json: unit week-3 opens must be a date written as YYYY-MM-DD",
    ]);
  });

  it("rejects an active that is not true or false", () => {
    assert.deepEqual(problemsFor({ old: { active: "no" } }), [
      "content/paths/old.json: active must be true or false",
    ]);
  });

  it("requires every topic to be in a path whatever the dates and active flags say", () => {
    writeJson(path.join(contentDir, "paths", "old.json"), {
      id: "old",
      title: "Old",
      active: false,
      units: [unit("week-1", ["topic-a"])],
    });
    try {
      assert.deepEqual(
        loadContent(contentDir).problems.map(({ file, reason }) => `${file}: ${reason}`),
        [
          "content/topics/topic-c/topic.json: topic is in no unit of any path under content/paths/, so students cannot reach it",
        ],
      );
    } finally {
      writePaths();
    }
    // topic-b is only in a unit that has not opened, and topic-c only in an inactive path.
    load();
  });
});

describe("releaseContent", () => {
  it("compiles a closed unit as its id, title, and date only", () => {
    const released = releaseContent(load(), { all: false, buildDate: "2027-01-15" });
    const [spring] = released.paths;
    assert.deepEqual(spring.units[1], {
      id: "week-2",
      title: "Unit week-2",
      opens: "2027-02-01",
      closed: true,
    });
  });

  it("keeps an open unit whole, with opens null when it has none", () => {
    const released = releaseContent(load(), { all: false, buildDate: "2027-01-15" });
    const [spring] = released.paths;
    assert.deepEqual(spring.units[0], {
      ...unit("week-1", ["topic-a"]),
      opens: null,
      closed: false,
    });
    assert.deepEqual(spring.units[2], {
      ...unit("week-3", ["topic-d"], { opens: "2027-01-01" }),
      closed: false,
    });
    assert.equal(spring.active, true);
  });

  it("leaves out an unpublished topic and keeps one that is also in an open unit", () => {
    const released = releaseContent(load(), { all: false, buildDate: "2027-01-15" });
    assert.deepEqual(ids(released.topics), ["topic-a", "topic-d"]);
  });

  it("opens a unit on its opens date", () => {
    const released = releaseContent(load(), { all: false, buildDate: "2027-02-01" });
    assert.equal(released.paths[0].units[1].closed, false);
    assert.deepEqual(ids(released.topics), ["topic-a", "topic-b", "topic-d"]);
  });

  it("releases nothing from an inactive path", () => {
    const released = releaseContent(load(), { all: false, buildDate: "2099-01-01" });
    assert.deepEqual(ids(released.paths), ["spring"]);
    assert.ok(!released.topics.some((topic) => topic.id === "topic-c"));
  });

  it("restores every path, unit, and topic with --all", () => {
    const content = load();
    const released = releaseContent(content, { all: true, buildDate: "2026-10-27" });
    assert.deepEqual(ids(released.paths), ["old", "spring"]);
    assert.deepEqual(ids(released.topics), TOPICS);
    const old = released.paths.find((item) => item.id === "old");
    const spring = released.paths.find((item) => item.id === "spring");
    assert.equal(old.active, false);
    assert.deepEqual(
      spring.units.map(({ id, opens, closed }) => ({ id, opens, closed })),
      [
        { id: "week-1", opens: null, closed: false },
        { id: "week-2", opens: "2027-02-01", closed: false },
        { id: "week-3", opens: "2027-01-01", closed: false },
      ],
    );
    assert.deepEqual(spring.units[1].topics, unit("week-2", ["topic-b", "topic-d"]).topics);
  });
});

describe("npm run build:content", () => {
  it("writes a gated build as of LAB_BUILD_DATE", () => {
    const result = build([], { LAB_BUILD_DATE: "2027-01-15" });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /as of 2027-01-15: 2 open unit\(s\), 1 closed/);
    assert.deepEqual(ids(result.index.paths), ["spring"]);
    assert.deepEqual(result.index.paths[0].units[1], {
      id: "week-2",
      title: "Unit week-2",
      opens: "2027-02-01",
      closed: true,
    });
    assert.deepEqual(ids(result.index.topics), ["topic-a", "topic-d"]);
    assert.deepEqual(result.files, ["topic-a.json", "topic-d.json"]);
  });

  it("removes a topic file left by an earlier build when its unit is closed", () => {
    assert.equal(build(["--all"]).status, 0);
    const result = build([], { LAB_BUILD_DATE: "2026-12-01" });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(result.files, ["topic-a.json"]);
  });

  it("writes everything with --all, whatever the build date", () => {
    const result = build(["--all"], { LAB_BUILD_DATE: "2026-01-01" });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /everything, with --all/);
    assert.deepEqual(ids(result.index.topics), TOPICS);
    assert.deepEqual(
      result.files,
      TOPICS.map((id) => `${id}.json`),
    );
    assert.ok(result.index.paths.flatMap((item) => item.units).every((u) => u.closed === false));
  });

  it("builds as of today in UTC when LAB_BUILD_DATE is unset", () => {
    const today = new Date().toISOString().slice(0, 10);
    const result = build();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, new RegExp(`as of ${today}`));
  });

  it("exits 2 on a malformed LAB_BUILD_DATE or an unknown option and writes nothing", () => {
    rmSync(path.join(root, "public"), { recursive: true, force: true });
    const date = build([], { LAB_BUILD_DATE: "2027-13-01" });
    assert.equal(date.status, 2);
    assert.match(date.stderr, /LAB_BUILD_DATE "2027-13-01" must be a date written as YYYY-MM-DD/);
    const option = build(["--everything"]);
    assert.equal(option.status, 2);
    assert.match(option.stderr, /unknown option --everything/);
    assert.equal(existsSync(path.join(root, "public")), false);
  });
});

describe("npm run validate", () => {
  it("accepts --all and refuses anything else", () => {
    const run = (...args) =>
      spawnSync(process.execPath, [path.join(root, "scripts/validate-content.mjs"), ...args], {
        encoding: "utf8",
      });
    assert.equal(run("--all").status, 0);
    assert.equal(run().status, 0);
    assert.equal(run("--al").status, 2);
  });
});

describe("export:d2l on a gated build", () => {
  function index(buildDate) {
    const content = releaseContent(load(), { all: false, buildDate });
    return {
      paths: content.paths,
      topics: content.topics.map(({ id, title, summary, minutes, steps }) => ({
        id,
        title,
        summary,
        minutes,
        steps,
      })),
    };
  }

  it("skips a closed unit and reports it", () => {
    const { pages, closed } = exportPath(index("2027-01-15"), "spring", () => ({ links: null }));
    assert.deepEqual(
      pages.map(({ unit: { id } }) => id),
      ["week-1", "week-3"],
    );
    assert.deepEqual(
      closed.map(({ id, opens }) => ({ id, opens })),
      [{ id: "week-2", opens: "2027-02-01" }],
    );
  });

  it("prints each topic's lecture links from the compiled topic file", () => {
    const links = [
      { kind: "lecture", title: "Week 1 slides & notes", url: "https://example.edu/w1" },
      { kind: "reading", title: "A reading", url: "https://example.edu/reading" },
      { kind: "lecture", title: "Week 1 recording", url: "https://example.edu/w1-video" },
    ];
    const { pages } = exportPath(index("2027-01-15"), "spring", (id) => ({
      links: id === "topic-a" ? links : null,
    }));
    const [week1, week3] = pages.map(({ fragment }) => fragment);
    assert.match(
      week1,
      /<li>Lecture: <a href="https:\/\/example\.edu\/w1">Week 1 slides &amp; notes<\/a><\/li>\n\s+<li>Lecture: <a href="https:\/\/example\.edu\/w1-video">Week 1 recording<\/a><\/li>/,
    );
    assert.doesNotMatch(week1, /A reading/);
    assert.doesNotMatch(week3, /Lecture:/);
  });

  it("heads the topics Guided Practice and Optional practice and says nothing is graded", () => {
    const content = index("2027-01-15");
    content.paths[0].units[2].topics[0].required = false;
    const { pages } = exportPath(content, "spring", () => ({ links: null }));
    const [week1, week3] = pages.map(({ fragment }) => fragment);
    assert.match(
      week1,
      /<h2>Guided Practice<\/h2>\n<ol>\n {2}<li><a href="[^"]+#\/topic\/topic-a">/,
    );
    assert.doesNotMatch(week1, /Optional practice/);
    assert.match(week1, / minutes, 1 step\.</);
    assert.match(
      week3,
      /<h2>Optional practice<\/h2>\n<ol>\n {2}<li><a href="[^"]+#\/topic\/topic-d">/,
    );
    assert.doesNotMatch(week3, /Guided Practice/);
    for (const { fragment } of pages) {
      assert.match(
        fragment,
        /<p>One paragraph\.<\/p>\n<p>This is practice: nothing here is graded, and there is nothing to submit\.<\/p>\n<div class="notice cs300-download">/,
      );
      assert.match(fragment, /in CS300 Practice<\/a><\/p>/);
    }
    assert.match(pages[0].page, /<title>Unit week-1 \| CS300 Practice<\/title>/);
  });

  it("puts Before you start on the first unit with Guided Practice only, with the tour", () => {
    const content = index("2027-01-15");
    content.paths[0].units[0].topics[0].required = false;
    content.topics.push({
      id: "getting-started",
      title: "Using CS300 Practice",
      summary: "A tour.",
      minutes: 15,
      steps: [],
    });
    const { pages } = exportPath(content, "spring", () => ({ links: null }));
    const [week1, week3] = pages.map(({ fragment }) => fragment);
    assert.doesNotMatch(week1, /Before you start/);
    assert.match(
      week3,
      /<\/div>\n<h2>Before you start<\/h2>\n<ul>\n {2}<li>Your progress stays in the browser you use, so use your own laptop, or export your progress from the <a href="https:\/\/mandloideep\.github\.io\/cs300-practice\/">home page<\/a> and import it on the next computer\.<\/li>\n {2}<li>A private or incognito window forgets everything when you close it\.<\/li>\n {2}<li>Take the 15-minute tour first: <a href="https:\/\/mandloideep\.github\.io\/cs300-practice\/#\/topic\/getting-started">Using CS300 Practice<\/a>\.<\/li>\n<\/ul>\n<h2>Guided Practice<\/h2>/,
    );
  });

  it("leaves the tour out of Before you start when the build has no tour topic", () => {
    const { pages } = exportPath(index("2027-01-15"), "spring", () => ({ links: null }));
    assert.match(pages[0].fragment, /<h2>Before you start<\/h2>/);
    assert.doesNotMatch(pages[0].fragment, /minute tour/);
    assert.doesNotMatch(pages[1].fragment, /Before you start/);
  });

  it("names the --all build when a path is inactive", () => {
    assert.throws(
      () => exportPath(index("2027-01-15"), "old", () => null),
      /no path "old"\. Paths: spring\. An inactive path is compiled only by npm run build:content -- --all\./,
    );
  });
});

describe("the project's own content", () => {
  it("compiles every path, unit, and topic in a --all build", () => {
    const { content, problems } = loadContent(path.join(project, "content"));
    assert.equal(problems.length, 0, formatProblems(problems));
    const released = releaseContent(content, { all: true, buildDate: "2026-10-27" });
    assert.equal(released.paths.length, content.paths.length);
    assert.equal(released.topics.length, content.topics.length);
    assert.ok(released.paths.flatMap((item) => item.units).every((u) => u.closed === false));
  });
});
