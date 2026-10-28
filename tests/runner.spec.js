// Runner tests. They drive the dev-only harness at src/runner/harness/index.html, which builds runs
// with buildRun from src/runner/ and mounts them in the sandboxed result iframe.

import { existsSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { editSteps, openHarness, resultFrame, run, runStep } from "./support/harness.js";

const ofType = (result, type) => result.messages.filter((message) => message.type === type);

// A workspace that imports react-router runs only once the Phase 3 runtime branch (PHASE3
// milestone 1) adds public/runtime/wrap/react-router.js, which maps BrowserRouter onto a memory
// history; on the sandboxed about:srcdoc document the real BrowserRouter throws on its URL.
const ROUTER_WRAPPER = existsSync(
  path.join(import.meta.dirname, "..", "public", "runtime", "wrap", "react-router.js"),
);
const NEEDS_RUNTIME_ROUTER =
  "needs the Phase 3 runtime branch: public/runtime/wrap/react-router.js (PHASE3 milestone 1)";
const usesRouter = (files) =>
  Object.entries(files).some(
    ([file, source]) => /\.(jsx?|mjs)$/.test(file) && /from\s*["']react-router["']/.test(source),
  );

// Console errors a solution produces on purpose, because the step teaches them.
const EXPECTED_CONSOLE_ERRORS = {
  // Step 1 renders the list without keys and its text points at React's key warning; step 2 adds keys.
  "lists-and-keys/01-render-with-map": [/unique "key" prop/],
  // The step teaches console.error by reporting an impossible score at the error level.
  "errors-and-debugging/04-console-beyond-log": [/^Diana has an impossible score: 140$/],
};

function describeProblems(result, stepId) {
  const expected = EXPECTED_CONSOLE_ERRORS[stepId] ?? [];
  return [
    ...ofType(result, "error").map((m) => `error: ${m.message} at ${m.file}:${m.line}`),
    ...ofType(result, "rejection").map((m) => `rejection: ${m.message}`),
    ...ofType(result, "console")
      .filter((m) => m.level === "error" && !expected.some((pattern) => pattern.test(m.text)))
      .map((m) => `console.error: ${m.text}`),
  ];
}

const steps = editSteps();

test.describe("solution of every edit step", () => {
  for (const step of steps) {
    test(step.id, async ({ page }) => {
      test.fixme(usesRouter(step.solution) && !ROUTER_WRAPPER, NEEDS_RUNTIME_ROUTER);
      await openHarness(page);
      const result = await runStep(page, step.id, "solution");

      expect(result.diagnostics, "compile and import diagnostics").toEqual([]);
      expect(result.timedOut, "settled in time").toBe(false);
      const types = result.messages.map((message) => message.type);
      expect(types).toContain("ready");
      expect(types).toContain("settled");
      expect(describeProblems(result, step.id), "errors, rejections, and console errors").toEqual(
        [],
      );

      if (!step.hasCheck) return;
      expect(ofType(result, "check-error"), "check.js ran without throwing").toEqual([]);
      const [checkResults] = ofType(result, "check-results");
      expect(checkResults, "check-results arrived").toBeTruthy();

      const required = step.required ?? checkResults.results.map((r) => r.id);
      for (const id of required) {
        const found = checkResults.results.find((r) => r.id === id);
        expect(found, `check ${id} exists`).toBeTruthy();
        expect(found.pass, `check ${id}: ${found.hint}`).toBe(true);
      }
    });
  }
});

// A step with starterCompiles: false (CONTRACTS 8.8) starts from a file that does not compile,
// such as one holding conflict markers, so its starter must stop at a compile diagnostic.
test.describe("starter of every edit step", () => {
  for (const step of steps) {
    test(step.id, async ({ page }) => {
      test.fixme(usesRouter(step.solution) && !ROUTER_WRAPPER, NEEDS_RUNTIME_ROUTER);
      await openHarness(page);
      const result = await runStep(page, step.id, "workspace");
      if (!step.starterCompiles) {
        expect(result.diagnostics.length).toBeGreaterThan(0);
        return;
      }
      expect(result.diagnostics).toEqual([]);
      expect(result.timedOut).toBe(false);
      expect(result.messages.map((message) => message.type)).toContain("settled");
    });
  }
});

const reactIndex = `<!doctype html>
<html lang="en">
  <head>
    <title>Test</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

test.describe("runner behavior", () => {
  test.beforeEach(async ({ page }) => openHarness(page));

  test("a plain JavaScript workspace runs and forwards console calls", async ({ page }) => {
    const result = await runStep(page, "react-mental-model/01-update-by-hand", "solution");
    expect(Object.keys(result.moduleUrls)).toEqual(["app.js"]);
    await resultFrame(page).locator("#review").click();
    await expect
      .poll(async () =>
        (await page.evaluate(() => globalThis.__harness.messages()))
          .filter((m) => m.type === "console")
          .map((m) => m.text),
      )
      .toContain("reviewed is now 2");
    const messages = await page.evaluate(() => globalThis.__harness.messages());
    const log = messages.find((m) => m.type === "console" && m.text === "reviewed is now 2");
    expect(log.level).toBe("log");
    expect(log.args).toEqual(["reviewed is now", 2]);
    expect(typeof log.time).toBe("number");
  });

  test("an index.html entry rewrites script sources and inlines stylesheets", async ({ page }) => {
    const result = await run(page, {
      entry: "index.html",
      files: {
        "index.html": `<!doctype html>
<html lang="en">
  <head>
    <link rel="stylesheet" href="styles.css" />
    <script src="./classic.js"></script>
  </head>
  <body class="page">
    <p id="out"></p>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`,
        "styles.css": "#out { color: rgb(1, 2, 3); }\n",
        "classic.js": "window.classicRan = true;\n",
        "src/main.js":
          'import { label } from "./util.js";\ndocument.getElementById("out").textContent = label + (window.classicRan ? " after classic" : "");\n',
        "src/util.js": 'export const label = "from util";\n',
      },
    });
    expect(result.diagnostics).toEqual([]);
    expect(Object.keys(result.moduleUrls).sort()).toEqual([
      "classic.js",
      "src/main.js",
      "src/util.js",
    ]);
    const frame = resultFrame(page);
    await expect(frame.locator("#out")).toHaveText("from util after classic");
    await expect(frame.locator("#out")).toHaveCSS("color", "rgb(1, 2, 3)");
    expect(await frame.evaluate(() => globalThis.document.body.className)).toBe("page");
    expect(
      await frame.evaluate(() => globalThis.document.querySelector('link[rel="stylesheet"]')),
    ).toBeNull();
  });

  test("the srcdoc follows the contract order", async ({ page }) => {
    const result = await run(page, {
      entry: "src/main.jsx",
      files: {
        "index.html": reactIndex.replace(
          "<title>Test</title>",
          '<title>Test</title>\n    <link rel="stylesheet" href="/styles.css" />',
        ),
        "styles.css": "body { margin: 0; }\n",
        "src/main.jsx":
          'import { createRoot } from "react-dom/client";\ncreateRoot(document.getElementById("root")).render(<p id="hello">Hello</p>);\n',
      },
    });
    expect(result.diagnostics).toEqual([]);
    const { srcdoc } = result;
    expect(srcdoc.startsWith("<!doctype html>")).toBe(true);
    const order = [
      "<title>Test</title>",
      '<style data-lab-file="styles.css">',
      "<script>\n",
      '<script type="importmap">',
      "</head>",
      '<div id="root">',
      `<script type="module">import "${result.moduleUrls["src/main.jsx"]}"`,
    ].map((needle) => srcdoc.indexOf(needle));
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(srcdoc).not.toContain('src="/src/main.jsx"');
    await expect(resultFrame(page).locator("#hello")).toHaveText("Hello");

    const importMap = JSON.parse(/<script type="importmap">(.*?)<\/script>/.exec(srcdoc)[1]);
    expect(Object.keys(importMap.imports)).toEqual([
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-router",
    ]);
    expect(importMap.imports["react-dom/client"]).toMatch(
      /^http:\/\/localhost:\d+\/cs300-react-lab\/runtime\/react-dom-client\.js$/,
    );
  });

  test("a syntax error is a diagnostic with file, line, and column", async ({ page }) => {
    const result = await run(page, {
      entry: "src/main.jsx",
      files: {
        "index.html": reactIndex,
        "src/main.jsx": 'import App from "./App.jsx";\nconsole.log(App);\n',
        "src/App.jsx": "export default function App() {\n  const = 1;\n  return <div />;\n}\n",
      },
    });
    expect(result.srcdoc).toBeNull();
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({ file: "src/App.jsx", line: 2 });
    expect(result.diagnostics[0].column).toBeGreaterThan(0);
    expect(result.diagnostics[0].message).not.toMatch(/Error transforming/);
  });

  test("a missing file, an unknown package, and a cycle are diagnostics", async ({ page }) => {
    const missing = await run(page, {
      entry: "src/main.js",
      files: {
        "index.html": reactIndex,
        "src/main.js": 'import "react";\nimport { a } from "./missing.js";\n',
      },
    });
    expect(missing.diagnostics).toEqual([
      expect.objectContaining({
        file: "src/main.js",
        line: 2,
        message: expect.stringContaining("./missing.js"),
      }),
    ]);

    const unknown = await run(page, {
      entry: "src/main.js",
      files: { "index.html": reactIndex, "src/main.js": '\n\nimport _ from "lodash";\n' },
    });
    expect(unknown.diagnostics).toEqual([
      expect.objectContaining({
        file: "src/main.js",
        line: 3,
        message: expect.stringContaining("lodash"),
      }),
    ]);

    const cycle = await run(page, {
      entry: "src/main.js",
      files: {
        "index.html": reactIndex,
        "src/main.js": 'import "./a.js";\n',
        "src/a.js": 'import "./b.js";\nexport const a = 1;\n',
        "src/b.js": '\nimport { a } from "./a.js";\n',
      },
    });
    expect(cycle.diagnostics).toEqual([
      expect.objectContaining({
        file: "src/b.js",
        line: 2,
        message: expect.stringContaining("src/a.js → src/b.js → src/a.js"),
      }),
    ]);

    const stylesheet = await run(page, {
      entry: "src/main.js",
      files: {
        "index.html": reactIndex.replace(
          "<title>Test</title>",
          '<link rel="stylesheet" href="/nope.css" />',
        ),
        "src/main.js": "",
      },
    });
    expect(stylesheet.diagnostics).toEqual([
      expect.objectContaining({
        file: "index.html",
        line: 4,
        message: expect.stringContaining("nope.css"),
      }),
    ]);
  });

  test("uncaught errors and rejections map to workspace files", async ({ page }) => {
    const result = await run(page, {
      entry: "src/main.js",
      files: {
        "index.html": reactIndex,
        "src/main.js":
          'import { explode } from "./util.js";\nsetTimeout(explode, 0);\nPromise.reject(new RangeError("nope"));\nthrow new Error("boom");\n',
        "src/util.js": 'export function explode() {\n  throw new TypeError("later");\n}\n',
      },
      quietMs: 500,
    });
    expect(result.diagnostics).toEqual([]);
    const errors = ofType(result, "error");
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("boom"),
          file: "src/main.js",
          line: 4,
        }),
        expect.objectContaining({
          message: expect.stringContaining("later"),
          file: "src/util.js",
          line: 2,
        }),
      ]),
    );
    for (const error of errors) expect(error.stack).not.toContain("blob:");
    expect(ofType(result, "rejection")).toEqual([
      expect.objectContaining({
        message: "RangeError: nope",
        stack: expect.stringContaining("src/main.js"),
      }),
    ]);
    expect(ofType(result, "settled")).toHaveLength(1);
  });

  test("console arguments are serialized as the contract says", async ({ page }) => {
    const result = await run(page, {
      entry: "src/main.js",
      files: {
        "index.html": reactIndex,
        "src/main.js": `const cyclic = { name: "a" };
cyclic.self = cyclic;
console.log("values %s and %d", "x", 4.7, cyclic, function named() {}, document.getElementById("root"), new TypeError("bad"), { a: { b: { c: { d: 1 } } } }, [1, [2, [3, [4]]]]);
console.info("i");
console.warn("w");
console.error("e");
console.debug("d");
`,
      },
    });
    const logs = ofType(result, "console");
    expect(logs.map((m) => m.level)).toEqual(["log", "info", "warn", "error", "debug"]);
    const [first] = logs;
    expect(first.text.startsWith("values x and 4 ")).toBe(true);
    expect(first.args).toEqual([
      "values %s and %d",
      "x",
      4.7,
      { name: "a", self: "[Circular]" },
      "[Function named]",
      "<div#root>",
      { name: "TypeError", message: "bad", stack: expect.stringContaining("src/main.js") },
      { a: { b: { c: "[Object]" } } },
      [1, [2, [3, "[Array(1)]"]]],
    ]);
    const lab = await resultFrame(page).evaluate(() => ({
      console: globalThis.__LAB__.console.map(({ level, text }) => ({ level, text })),
      keys: Object.keys(globalThis.__LAB__),
      inspector: globalThis.__LAB__.inspector,
      network: globalThis.__LAB__.network,
    }));
    expect(lab.console.slice(1)).toEqual([
      { level: "info", text: "i" },
      { level: "warn", text: "w" },
      { level: "error", text: "e" },
      { level: "debug", text: "d" },
    ]);
    expect(lab.keys).toEqual(
      expect.arrayContaining([
        "runId",
        "env",
        "declarations",
        "console",
        "network",
        "inspector",
        "post",
      ]),
    );
    expect(lab.inspector).toEqual({ commits: [], latest: null });
    expect(lab.network).toEqual([]);
  });

  test("NaN, Infinity, and undefined survive serialization as words, as a browser prints them", async ({
    page,
  }) => {
    const result = await run(page, {
      entry: "src/main.js",
      files: {
        "index.html": reactIndex,
        "src/main.js": `console.log(Number("abc"));
console.log(1 / 0, -1 / 0, undefined);
console.log([NaN, undefined, Infinity], { missing: undefined, nothing: null, ratio: -Infinity });
console.log("%d items", NaN);
`,
      },
    });
    expect(result.diagnostics).toEqual([]);
    const logs = ofType(result, "console");
    expect(logs.map((m) => m.text)).toEqual([
      "NaN",
      "Infinity -Infinity undefined",
      '[NaN,undefined,Infinity] {"missing":undefined,"nothing":null,"ratio":-Infinity}',
      "NaN items",
    ]);
    expect(logs.map((m) => m.args)).toEqual([
      ["NaN"],
      ["Infinity", "-Infinity", "undefined"],
      [
        ["NaN", "undefined", "Infinity"],
        { missing: "undefined", nothing: null, ratio: "-Infinity" },
      ],
      ["%d items", "NaN"],
    ]);
    const captured = await resultFrame(page).evaluate(() =>
      globalThis.__LAB__.console.map((entry) => entry.text),
    );
    expect(captured).toEqual(logs.map((m) => m.text));
  });

  test("import.meta.env reads the run's env and set-api updates it", async ({ page }) => {
    const result = await run(page, {
      entry: "src/main.js",
      env: { API_BASE: "https://one.test" },
      files: {
        "index.html": reactIndex,
        "src/main.js":
          'document.getElementById("root").textContent = [import.meta.env.API_BASE, import.meta.env.MODE, import.meta.env.DEV, import.meta.env.BASE_URL].join("|");\n',
      },
    });
    expect(result.diagnostics).toEqual([]);
    const frame = resultFrame(page);
    await expect(frame.locator("#root")).toHaveText("https://one.test|development|true|/");
    await page.evaluate(() =>
      globalThis.__harness.send({
        type: "set-api",
        env: { API_BASE: "https://two.test" },
        fixtureControls: {
          latencyMs: 300,
          errorStatus: 500,
          malformedBody: false,
          dropConnection: false,
        },
      }),
    );
    await expect
      .poll(() => frame.evaluate(() => globalThis.__LAB_ENV__.API_BASE))
      .toBe("https://two.test");
    expect(await frame.evaluate(() => globalThis.__LAB__.fixtureControls.errorStatus)).toBe(500);
    expect(await frame.evaluate(() => globalThis.__LAB_ENV__.MODE)).toBe("development");
  });

  test("declarations list top-level functions and constants per file", async ({ page }) => {
    const result = await run(page, {
      entry: "src/main.jsx",
      files: {
        "index.html": reactIndex,
        "src/main.jsx": 'import App from "./App.jsx";\nconsole.log(typeof App);\n',
        "src/App.jsx": `import { useState } from "react";

const TITLE = "Shop";

function Card({ title }) {
  function handleClick() {}
  return <button onClick={handleClick}>{title}</button>;
}

export const List = ({ items }) => items.map((item) => <Card key={item} title={item} />);

export default function App() {
  return <List items={[TITLE]} />;
}
`,
      },
    });
    expect(result.declarations["src/App.jsx"]).toEqual({ TITLE: 3, Card: 5, List: 10, App: 12 });
    expect(result.declarations["src/main.jsx"]).toEqual({});
  });

  test("CSS and JSON files can be imported from modules", async ({ page }) => {
    const result = await run(page, {
      entry: "src/main.js",
      files: {
        "index.html": reactIndex,
        "src/main.js":
          'import "./theme.css";\nimport data from "./data.json";\ndocument.getElementById("root").textContent = data.title;\n',
        "src/theme.css": "#root { color: rgb(4, 5, 6); }\n",
        "src/data.json": '{ "title": "From JSON" }\n',
      },
    });
    expect(result.diagnostics).toEqual([]);
    const root = resultFrame(page).locator("#root");
    await expect(root).toHaveText("From JSON");
    await expect(root).toHaveCSS("color", "rgb(4, 5, 6)");
  });

  test("checks run after settled, on run-checks, and report a throwing check", async ({ page }) => {
    const passing = await run(page, {
      entry: "src/main.js",
      files: { "index.html": reactIndex, "src/main.js": 'console.log("hi");\n' },
      check:
        'export default async function check({ document, console, network, inspector, wait }) {\n  await wait(10);\n  return [{ id: "logged", title: "Logged", pass: console.some((e) => e.text === "hi"), hint: "Log hi" }, { id: "shape", title: "Shape", pass: Array.isArray(network) && Array.isArray(inspector.components) && document.title === "Test" }];\n}\n',
    });
    expect(ofType(passing, "check-results")).toEqual([
      expect.objectContaining({
        results: [
          { id: "logged", title: "Logged", pass: true, hint: "Log hi" },
          { id: "shape", title: "Shape", pass: true, hint: "" },
        ],
      }),
    ]);
    await page.evaluate(() => globalThis.__harness.send({ type: "run-checks" }));
    await expect
      .poll(
        async () =>
          (await page.evaluate(() => globalThis.__harness.messages())).filter(
            (m) => m.type === "check-results",
          ).length,
      )
      .toBe(2);

    const throwing = await run(page, {
      entry: "src/main.js",
      files: { "index.html": reactIndex, "src/main.js": "" },
      check: 'export default function check() {\n  throw new Error("check broke");\n}\n',
    });
    expect(ofType(throwing, "check-error")).toEqual([
      expect.objectContaining({
        message: "check broke",
        stack: expect.stringContaining("check.js"),
      }),
    ]);
  });

  test("a new run revokes the previous run's blob URLs", async ({ page }) => {
    const first = await runStep(page, "jsx-rules/01-expressions-in-braces", "solution");
    const url = first.moduleUrls["src/App.jsx"];
    expect(await page.evaluate((u) => fetch(u).then((r) => r.ok), url)).toBe(true);
    await runStep(page, "jsx-rules/02-one-root-and-fragments", "solution");
    expect(
      await page.evaluate(
        (u) =>
          fetch(u).then(
            () => "loaded",
            () => "revoked",
          ),
        url,
      ),
    ).toBe("revoked");
  });
});
