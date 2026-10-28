// Inspector tests: the hook's commits for every React step, the overlay inside the result iframe,
// the runtime wrappers, the inspector pane on the step page, and the editor-to-result link.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { editSteps, openHarness, resultFrame, run, runStep, topicsDir } from "./support/harness.js";
import { fileNode } from "./support/files.js";

// A solution that imports react-router runs only once the Phase 3 runtime branch (PHASE3
// milestone 1) adds public/runtime/wrap/react-router.js, which maps BrowserRouter onto a memory
// history; on the sandboxed about:srcdoc document the real BrowserRouter throws on its URL.
const ROUTER_WRAPPER = existsSync(
  path.join(import.meta.dirname, "..", "public", "runtime", "wrap", "react-router.js"),
);
const NEEDS_RUNTIME_ROUTER =
  "needs the Phase 3 runtime branch: public/runtime/wrap/react-router.js (PHASE3 milestone 1)";

const ofType = (result, type) => result.messages.filter((message) => message.type === type);
const lastCommit = (result) => ofType(result, "inspector").at(-1)?.commit ?? null;

const isReact = (files) =>
  Object.entries(files).some(
    ([path, source]) =>
      /\.(jsx?|mjs)$/.test(path) && /from\s*["']react(?:-dom)?(?:\/\w+)?["']/.test(source),
  );

const DECLARATION =
  /^(?:export\s+(?:default\s+)?)?function\s+([A-Z][\w$]*)|^(?:export\s+)?const\s+([A-Z][\w$]*)\s*=/gm;

// Top-level capitalized functions and constants that some solution file uses as a JSX tag.
function expectedComponents(files) {
  const sources = Object.entries(files).filter(([path]) => /\.(jsx?|mjs)$/.test(path));
  const all = sources.map(([, source]) => source).join("\n");
  const names = new Set();
  for (const [, source] of sources) {
    for (const match of source.matchAll(DECLARATION)) {
      const name = match[1] ?? match[2];
      if (new RegExp(`<${name}[\\s/>]`).test(all)) names.add(name);
    }
  }
  return [...names].sort();
}

// A routed solution mounts only the page its initial route matches, so the other pages' components
// are declared and used as JSX without appearing in the commit.
const usesRouter = (files) =>
  Object.entries(files).some(
    ([path, source]) => /\.(jsx?|mjs)$/.test(path) && /from\s*["']react-router["']/.test(source),
  );

const reactSteps = editSteps().filter((step) => isReact(step.solution));

test.describe("inspector commits for every React step's solution", () => {
  for (const step of reactSteps) {
    test(step.id, async ({ page }) => {
      test.fixme(usesRouter(step.solution) && !ROUTER_WRAPPER, NEEDS_RUNTIME_ROUTER);
      await openHarness(page);
      const result = await runStep(page, step.id, "solution");
      expect(result.diagnostics).toEqual([]);

      const commit = lastCommit(result);
      expect(commit, "an inspector commit arrived").toBeTruthy();
      const names = new Set(commit.components.map((component) => component.name));
      const declared = expectedComponents(step.solution);
      const expected = usesRouter(step.solution)
        ? declared.filter((name) => name === "App" || names.has(name))
        : declared;
      for (const name of expected) {
        expect(names, `the commit lists ${name}`).toContain(name);
        const instance = commit.components.find((component) => component.name === name);
        expect(instance.declaredAt, `${name} declaredAt`).toEqual({
          file: expect.any(String),
          line: expect.any(Number),
        });
        expect(Object.keys(step.solution)).toContain(instance.declaredAt.file);
        expect(instance.usedAt, `${name} usedAt`).toEqual({
          file: expect.any(String),
          line: expect.any(Number),
        });
        expect(Object.keys(step.solution)).toContain(instance.usedAt.file);
      }
      expect(commit.components.some((component) => component.rects.length > 0)).toBe(true);

      const lab = await resultFrame(page).evaluate(() => ({
        commits: globalThis.__LAB__.inspector.commits.length,
        latestSeq: globalThis.__LAB__.inspector.latest?.seq,
      }));
      expect(lab.commits).toBeGreaterThan(0);
      expect(lab.latestSeq).toBe(commit.seq);
    });
  }
});

const index = `<!doctype html>
<html lang="en">
  <head>
    <title>Inspector test</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

const main = `import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
`;

const app = `import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

const Row = memo(function Row({ label, onPick }) {
  window.rowOnPick = onPick;
  return <li><button type="button" onClick={() => onPick(label)}>{label}</button></li>;
});

function Empty() {
  return null;
}

function Counter({ start, onChange }) {
  const [count, setCount] = useState(start);
  window.counterSetter = setCount;
  window.counterOnChange = onChange;
  return (
    <button type="button" id="increment" onClick={() => { setCount(count + 1); onChange(count + 1); }}>
      Count {count}
    </button>
  );
}

export default function App() {
  const ref = useRef(null);
  const [total, setTotal] = useState(0);
  const doubled = useMemo(() => total * 2, [total]);
  const [picked, setPicked] = useState("none");
  useEffect(() => {}, []);
  const pick = useCallback((label) => setPicked(label), []);
  return (
    <main ref={ref}>
      <p id="summary">{total} {doubled} {picked}</p>
      <Counter start={1} onChange={setTotal} />
      <Empty />
      <ul>
        <Row label="a" onPick={pick} />
      </ul>
    </main>
  );
}
`;

const files = { "index.html": index, "src/main.jsx": main, "src/App.jsx": app };

// 1-based line of the first line in `source` that contains `text`.
function lineOf(source, text) {
  return source.split("\n").findIndex((line) => line.includes(text)) + 1;
}

const lines = {
  appDeclared: lineOf(app, "export default function App"),
  appUsed: lineOf(main, "<App />"),
  counterDeclared: lineOf(app, "function Counter"),
  counterUsed: lineOf(app, "<Counter "),
  rowDeclared: lineOf(app, "const Row = memo"),
  rowUsed: lineOf(app, "<Row "),
};

async function commits(page) {
  const messages = await page.evaluate(() => globalThis.__harness.messages());
  return messages.filter((m) => m.type === "inspector").map((m) => m.commit);
}

test.describe("inspector behavior", () => {
  test.beforeEach(async ({ page }) => openHarness(page));

  test("state, render flags, ids, rects, and locations follow each commit", async ({ page }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: true });
    expect(result.diagnostics).toEqual([]);
    const first = lastCommit(result);
    const byName = (commit, name) => commit.components.find((c) => c.name === name);

    expect(first.components.map((c) => c.name)).toEqual(["App", "Counter", "Empty", "Row"]);
    expect(byName(first, "App")).toMatchObject({
      parentId: null,
      state: [
        { hook: 1, value: 0 },
        { hook: 3, value: "none" },
      ],
      rendered: true,
      declaredAt: { file: "src/App.jsx", line: lines.appDeclared },
      usedAt: { file: "src/main.jsx", line: lines.appUsed },
    });
    expect(byName(first, "Counter")).toMatchObject({
      parentId: byName(first, "App").id,
      props: { start: 1, onChange: "[Function bound dispatchSetState]" },
      state: [{ hook: 0, value: 1 }],
      declaredAt: { file: "src/App.jsx", line: lines.counterDeclared },
      usedAt: { file: "src/App.jsx", line: lines.counterUsed },
    });
    expect(byName(first, "Empty").rects).toEqual([]);
    expect(byName(first, "Row")).toMatchObject({
      declaredAt: { file: "src/App.jsx", line: lines.rowDeclared },
      usedAt: { file: "src/App.jsx", line: lines.rowUsed },
    });
    expect(byName(first, "Counter").rects).toEqual([
      {
        x: expect.any(Number),
        y: expect.any(Number),
        width: expect.any(Number),
        height: expect.any(Number),
      },
    ]);

    const before = (await commits(page)).length;
    await resultFrame(page).locator("#increment").click();
    await expect.poll(async () => (await commits(page)).length).toBeGreaterThan(before);
    const after = (await commits(page)).at(-1);

    expect(after.seq).toBeGreaterThan(first.seq);
    expect(after.components.map((c) => c.id)).toEqual(first.components.map((c) => c.id));
    expect(byName(after, "Counter").state).toEqual([{ hook: 0, value: 2 }]);
    expect(byName(after, "App").state[0]).toEqual({ hook: 1, value: 2 });
    expect(byName(after, "App").rendered).toBe(true);
    expect(byName(after, "Counter").rendered).toBe(true);
    expect(byName(after, "Row").rendered, "memo skips Row because onPick kept its identity").toBe(
      false,
    );
  });

  test("the wrappers label setters and function props with their owner", async ({ page }) => {
    await run(page, { files, entry: "src/main.jsx", inspector: true });
    const labels = await resultFrame(page).evaluate(() => ({
      setter: globalThis.counterSetter.__labOwner,
      onChange: globalThis.counterOnChange.__labOwner,
      onPick: globalThis.rowOnPick.__labOwner,
      onChangeInner: globalThis.counterOnChange.__labOriginal.__labOwner,
    }));
    expect(labels.setter).toEqual({
      kind: "setter",
      component: "Counter",
      hook: "useState",
      prop: null,
    });
    expect(labels.onChange).toEqual({
      kind: "prop",
      component: "App",
      prop: "onChange",
      to: "Counter",
    });
    expect(labels.onChangeInner).toEqual({
      kind: "setter",
      component: "App",
      hook: "useState",
      prop: null,
    });
    expect(labels.onPick).toEqual({ kind: "prop", component: "App", prop: "onPick", to: "Row" });

    const stable = await resultFrame(page).evaluate(async () => {
      const before = globalThis.rowOnPick;
      globalThis.document.getElementById("increment").click();
      await new Promise((resolve) => setTimeout(resolve, 100));
      return before === globalThis.rowOnPick;
    });
    expect(stable).toBe(true);
    await resultFrame(page).locator("li button").click();
    await expect(resultFrame(page).locator("#summary")).toHaveText("2 4 a");
  });

  test("the overlay draws boxes in its own layer and follows config and highlight", async ({
    page,
  }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: true });
    const frame = resultFrame(page);
    const overlay = frame.locator("lab-inspector-overlay");
    await expect(overlay).toHaveCount(1);
    expect(
      await frame.evaluate(
        () => globalThis.document.querySelector("lab-inspector-overlay").parentElement.tagName,
      ),
    ).toBe("HTML");
    expect(
      await frame.evaluate(() => globalThis.document.body.querySelector("lab-inspector-overlay")),
    ).toBeNull();
    await expect(overlay.locator(".label")).toHaveText(["App", /^Counter/, /^Row/]);
    await expect(overlay.locator(".box")).toHaveCount(3);

    const counter = lastCommit(result).components.find((c) => c.name === "Counter");
    await page.evaluate(
      (id) => globalThis.__harness.send({ type: "inspector-highlight", componentId: id }),
      counter.id,
    );
    await expect(overlay.locator(".box.highlight")).toHaveCount(1);

    const app = lastCommit(result).components.find((c) => c.name === "App");
    await page.evaluate(
      (ids) => globalThis.__harness.send({ type: "inspector-highlight", componentIds: ids }),
      [counter.id, app.id],
    );
    await expect(overlay.locator(".box.highlight")).toHaveCount(2);
    await page.evaluate(
      (id) =>
        globalThis.__harness.send({
          type: "inspector-highlight",
          componentId: id,
          componentIds: [],
        }),
      counter.id,
    );
    await expect(overlay.locator(".box.highlight")).toHaveCount(0);
    await page.evaluate(
      (id) => globalThis.__harness.send({ type: "inspector-highlight", componentId: id }),
      counter.id,
    );
    await expect(overlay.locator(".box.highlight")).toHaveCount(1);

    await page.evaluate(() =>
      globalThis.__harness.send({ type: "inspector-config", views: ["tree"] }),
    );
    await expect(overlay.locator(".box")).toHaveCount(1);
    await expect(overlay.locator(".box.highlight")).toHaveCount(1);
    await page.evaluate(() =>
      globalThis.__harness.send({ type: "inspector-highlight", componentId: null }),
    );
    await expect(overlay.locator(".box")).toHaveCount(0);

    await page.evaluate(() =>
      globalThis.__harness.send({ type: "inspector-config", views: ["boundaries", "flash"] }),
    );
    await frame.locator("#increment").click();
    await expect(overlay.locator(".flash").first()).toBeAttached();

    await overlay.locator(".label", { hasText: "Counter" }).click();
    await expect
      .poll(async () =>
        (await page.evaluate(() => globalThis.__harness.messages())).filter(
          (m) => m.type === "inspector-select",
        ),
      )
      .toEqual([
        expect.objectContaining({
          componentId: counter.id,
          name: "Counter",
          declaredAt: { file: "src/App.jsx", line: lines.counterDeclared },
          usedAt: { file: "src/App.jsx", line: lines.counterUsed },
        }),
      ]);
  });

  test("without the inspector there is no hook, no overlay, and no wrappers", async ({ page }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: false });
    expect(ofType(result, "inspector")).toEqual([]);
    expect(result.srcdoc).not.toContain("/runtime/wrap/react.js");
    expect(result.srcdoc).not.toContain("/runtime/wrap/react-jsx-dev-runtime.js");
    const frame = resultFrame(page);
    expect(await frame.evaluate(() => "__REACT_DEVTOOLS_GLOBAL_HOOK__" in globalThis)).toBe(false);
    await expect(frame.locator("lab-inspector-overlay")).toHaveCount(0);
    expect(await frame.evaluate(() => globalThis.counterSetter.__labOwner)).toBeUndefined();

    const withInspector = await run(page, { files, entry: "src/main.jsx", inspector: true });
    expect(withInspector.srcdoc).toContain("/runtime/wrap/react.js");
    expect(withInspector.srcdoc).toContain("/runtime/wrap/react-jsx-dev-runtime.js");
  });

  test("a plain JavaScript workspace gets no inspector commits", async ({ page }) => {
    const result = await runStep(page, "react-mental-model/01-update-by-hand", "solution");
    expect(ofType(result, "inspector")).toEqual([]);
    expect(result.srcdoc).not.toContain("/runtime/wrap/react.js");
    expect(result.srcdoc).not.toContain("/runtime/wrap/react-jsx-dev-runtime.js");
  });
});

test.describe("inspector pane on the step page", () => {
  test("shows the tree, toggles views, highlights, and jumps to code", async ({ page }) => {
    await page.goto("#/topic/react-mental-model/3");
    const pane = page.locator(".pane--inspector");
    await expect(pane.getByText(/components? · commit/)).toBeVisible({ timeout: 15_000 });
    const tree = pane.getByRole("button", { name: "Tree and state" });
    if ((await tree.getAttribute("aria-pressed")) !== "true") await tree.click();
    await expect(pane.locator(".inspector-row__name").first()).toBeVisible();
    await expect(pane.getByRole("button", { name: /^App\b/ }).first()).toBeVisible();
    await expect(pane.getByRole("button", { name: "Network" })).toBeDisabled();

    const frame = page.frameLocator('iframe[title="Result of your code"]');
    const overlay = frame.locator("lab-inspector-overlay");
    await expect(overlay.locator(".box").first()).toBeAttached();

    const boundaries = pane.getByRole("button", { name: "Boundaries" });
    const pressed = await boundaries.getAttribute("aria-pressed");
    await boundaries.click();
    await expect(boundaries).toHaveAttribute("aria-pressed", pressed === "true" ? "false" : "true");
    if (pressed === "true") await expect(overlay.locator(".box")).toHaveCount(0);
    else await expect(overlay.locator(".box").first()).toBeAttached();
    if (pressed !== "true") await boundaries.click();

    await pane.locator(".inspector-row__name").last().hover();
    await expect(overlay.locator(".box.highlight")).toHaveCount(1);

    const target = pane.locator(".inspector-row__name").last();
    const label = await target.getAttribute("aria-label");
    const [, file, line] = /declared at (.+):(\d+)/.exec(label);
    await target.focus();
    await page.keyboard.press("Enter");
    await expect(fileNode(page, file)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".cm-editor .cm-lineNumbers .cm-activeLineGutter")).toHaveText(line);
  });

  test("the flow view lists each step of the latest trace, highlights, announces, and keeps history", async ({
    page,
  }) => {
    await page.goto("#/topic/react-mental-model/3");
    const pane = page.locator(".pane--inspector");
    await expect(pane.getByText(/components? · commit/)).toBeVisible({ timeout: 15_000 });

    // The starter has no click handler, so nothing is traced until the solution is loaded.
    const flowToggle = pane.getByRole("button", { name: "Flow trace" });
    await expect(flowToggle).toHaveAttribute("aria-pressed", "false");
    await flowToggle.click();
    await expect(flowToggle).toHaveAttribute("aria-pressed", "true");
    await expect(pane.getByText("Interact with the result")).toBeVisible();

    // The step's check clicks the button once, which records trace 1; the click below is trace 2.
    await page.getByRole("button", { name: "Show solution" }).click();
    await page.getByRole("button", { name: "Load solution" }).click();
    await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
      timeout: 15_000,
    });
    const timeline = pane.getByRole("list", { name: /^Flow trace \d+$/ });
    await expect(timeline.getByRole("button").nth(1)).toHaveText(/from 0 to 1/);

    const frame = page.frameLocator('iframe[title="Result of your code"]');
    await frame.getByRole("button", { name: "Review one concept" }).click();
    await expect(timeline.getByRole("button")).toHaveText([
      /click on <button>, handled in ReviewPanel/,
      /useState setter in ReviewPanel changed state 0 from 1 to 2/,
      /ReviewPanel re-rendered in commit \d+/,
    ]);
    await expect(timeline.getByRole("button").first()).toHaveAccessibleName(
      "Event: click on <button>, handled in ReviewPanel",
    );
    await expect(pane.getByText(/Latest trace · 3 steps · [\d.]+ ms/)).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Flow trace recorded" })).toHaveText(
      "Flow trace recorded: 3 steps",
    );

    const overlay = frame.locator("lab-inspector-overlay");
    await timeline.getByRole("button").nth(1).hover();
    await expect(overlay.locator(".box.highlight")).toHaveCount(1);
    await page.mouse.move(0, 0);
    await expect(overlay.locator(".box.highlight")).toHaveCount(0);
    await timeline.getByRole("button").last().focus();
    await expect(overlay.locator(".box.highlight")).toHaveCount(1);
    await timeline.getByRole("button").last().blur();
    await expect(overlay.locator(".box.highlight")).toHaveCount(0);

    await frame.getByRole("button", { name: "Review one concept" }).click();
    await expect(timeline.getByRole("button").nth(1)).toHaveText(/from 2 to 3/);
    const history = pane.getByRole("list", { name: "Earlier traces" });
    await expect(history.getByRole("button")).toHaveText([/^Trace 3/, /^Trace 2/, /^Trace 1/]);
    await expect(history.getByRole("button").first()).toHaveAttribute("aria-current", "true");
    await history.getByRole("button").last().click();
    await expect(pane.getByRole("heading", { name: /^Trace 1/ })).toBeVisible();
    await expect(timeline.getByRole("button").nth(1)).toHaveText(/from 0 to 1/);

    await timeline.getByRole("button").first().click();
    await expect(fileNode(page, "src/App.jsx")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".cm-editor .cm-lineNumbers .cm-activeLineGutter")).toHaveText("12");
  });
});

// Viewport center of `word` on the first editor line containing `lineText`, scrolled into view.
function wordCenter(page, lineText, word) {
  return page.evaluate(
    ([lineText, word]) => {
      const line = [...globalThis.document.querySelectorAll(".cm-line")].find((candidate) =>
        candidate.textContent.includes(lineText),
      );
      if (!line) throw new Error(`No editor line contains ${lineText}`);
      line.scrollIntoView({ block: "center" });
      const walker = globalThis.document.createTreeWalker(line, globalThis.NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const index = node.data.indexOf(word);
        if (index < 0) continue;
        const range = globalThis.document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + word.length);
        const box = range.getBoundingClientRect();
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      }
      throw new Error(`The line ${lineText} does not contain ${word}`);
    },
    [lineText, word],
  );
}

test.describe("editor-to-result link on the step page", () => {
  const starterApp = readFileSync(
    path.join(
      topicsDir,
      "react-mental-model",
      "03-only-the-changed-part",
      "workspace",
      "src",
      "App.jsx",
    ),
    "utf8",
  );
  const declaredLine = lineOf(starterApp, "function ReviewPanel");
  const usedLine = lineOf(starterApp, "<ReviewPanel />");

  test("the cursor or pointer on a component name highlights its boxes, and jumps flash lines", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("#/topic/react-mental-model/3");
    const pane = page.locator(".pane--inspector");
    await expect(pane.getByText(/components? · commit/)).toBeVisible({ timeout: 15_000 });
    const frame = page.frameLocator('iframe[title="Result of your code"]');
    const overlay = frame.locator("lab-inspector-overlay");
    await expect(overlay.locator(".box").first()).toBeAttached();
    const highlighted = overlay.locator(".box.highlight");

    const declaration = await wordCenter(page, "function ReviewPanel", "ReviewPanel");
    await page.mouse.click(declaration.x, declaration.y);
    await expect(highlighted).toHaveCount(1);
    await expect(highlighted).toHaveAttribute("data-name", "ReviewPanel");

    const tag = await wordCenter(page, "<Header />", "Header");
    await page.mouse.move(tag.x, tag.y);
    await expect(highlighted).toHaveAttribute("data-name", "Header");
    await page.mouse.move(4, 4);
    await expect(highlighted).toHaveAttribute("data-name", "ReviewPanel");

    const plain = await wordCenter(page, "const total", "total");
    await page.mouse.click(plain.x, plain.y);
    await expect(highlighted).toHaveCount(0);
    const use = await wordCenter(page, "<ReviewPanel />", "ReviewPanel");
    await page.mouse.click(use.x, use.y);
    await expect(highlighted).toHaveAttribute("data-name", "ReviewPanel");
    await page.mouse.move(4, 4);
    await page.keyboard.press("Escape");
    await page.keyboard.press("Tab");
    await expect(page.locator(".cm-content")).not.toBeFocused();
    await expect(highlighted).toHaveCount(0);

    const flashed = page.locator(".cm-line.cm-lab-jump");
    await page.locator('iframe[title="Result of your code"]').scrollIntoViewIfNeeded();
    await overlay.locator(".label", { hasText: "ReviewPanel" }).click();
    await expect(page.locator(".cm-activeLineGutter")).toHaveText(String(usedLine));
    await expect(flashed).toHaveCount(2);
    const sourceLines = starterApp.split("\n");
    expect((await flashed.allTextContents()).map((text) => sourceLines.indexOf(text) + 1)).toEqual([
      declaredLine,
      usedLine,
    ]);
    await expect(flashed).toHaveCount(0, { timeout: 5_000 });

    await page.emulateMedia({ reducedMotion: "reduce" });
    const tree = pane.getByRole("button", { name: "Tree and state" });
    if ((await tree.getAttribute("aria-pressed")) !== "true") await tree.click();
    await pane
      .getByRole("button", { name: /^Header\b/ })
      .first()
      .click();
    await expect(page.locator(".cm-activeLineGutter")).toHaveText(
      String(lineOf(starterApp, "function Header")),
    );
    await expect(flashed).toHaveCount(0);
    await page.waitForTimeout(300);
    await expect(flashed).toHaveCount(0);
  });
});
