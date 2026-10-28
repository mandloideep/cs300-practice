// Vanilla workspace tests (PHASE4 milestone 1): the fixture under tests/fixtures/vanilla/ runs
// through the runner harness and on the real step page with its index.html entry, linked
// stylesheet, and classic script; its console output arrives, its check reads the DOM and a
// computed style, an uncaught error maps to the script's path and line, the edit block into
// index.html applies, the inspector shows the DOM toggle alone, the download is a plain folder,
// and a check can narrow the result pane through __LAB__.resize.

import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { strFromU8, unzipSync } from "fflate";
import { fileNode, openFile, workspaceNodes } from "./support/files.js";
import { openHarness, resultFrame, run } from "./support/harness.js";
import {
  TOPIC_ID,
  TOPIC_TITLE,
  buildVanillaTopic,
  readVanillaFixture,
  serveTopic,
} from "./support/vanilla.js";

const fixture = readVanillaFixture();
const ofType = (result, type) => result.messages.filter((message) => message.type === type);
const checkById = (result, id) =>
  ofType(result, "check-results")
    .at(-1)
    ?.results.find((check) => check.id === id);

// 1-based line of the first line in `source` that contains `text`.
function lineOf(source, text) {
  return source.split("\n").findIndex((line) => line.includes(text)) + 1;
}

test.describe("the vanilla fixture through the runner harness", () => {
  test.beforeEach(async ({ page }) => openHarness(page));

  test("runs with its stylesheet and classic script, logs, and passes the DOM and style checks", async ({
    page,
  }) => {
    const result = await run(page, {
      files: fixture.files,
      entry: "index.html",
      check: fixture.check,
    });
    expect(result.diagnostics).toEqual([]);
    expect(result.timedOut).toBe(false);
    expect(Object.keys(result.moduleUrls)).toEqual(["main.js"]);
    expect(result.srcdoc).toContain('<style data-lab-file="styles.css">');
    expect(result.srcdoc).toContain(`<script src="${result.moduleUrls["main.js"]}">`);
    expect(ofType(result, "error")).toEqual([]);
    expect(ofType(result, "inspector")).toEqual([]);

    const frame = resultFrame(page);
    await expect(frame.locator("#books li")).toHaveText([
      "Eloquent JavaScript",
      "The Pragmatic Programmer",
      "Design Patterns",
    ]);
    await expect(frame.locator("#books")).toHaveCSS("list-style-type", "none");
    await expect(frame.locator("#count")).toHaveText("3 books");

    const logs = ofType(result, "console");
    expect(logs.map((entry) => entry.text)).toEqual([
      "reading list ready",
      "added Design Patterns",
    ]);
    expect(logs[0]).toMatchObject({ level: "log", args: ["reading list ready"] });

    expect(checkById(result, "three-books")).toMatchObject({ pass: false });
    expect(checkById(result, "list-styled")).toMatchObject({ pass: true });
    expect(checkById(result, "button-adds")).toMatchObject({ pass: true });
    expect(checkById(result, "ready-logged")).toMatchObject({ pass: true });

    await frame.getByRole("button", { name: "Toggle compact" }).click();
    await expect(frame.locator("body")).toHaveClass("compact");
    await expect
      .poll(async () =>
        (await page.evaluate(() => globalThis.__harness.messages()))
          .filter((message) => message.type === "console")
          .map((message) => message.text),
      )
      .toContain("compact is now true");
  });

  test("the solution, which is the workspace with the edit block applied, passes every check", async ({
    page,
  }) => {
    expect(fixture.edits).toEqual([
      expect.objectContaining({ file: "index.html", action: "insert-after" }),
    ]);
    expect(fixture.solution["index.html"]).toContain(
      '        <li class="book">The Pragmatic Programmer</li>\n        <li class="book">Structure and Interpretation of Computer Programs</li>\n',
    );
    const result = await run(page, {
      files: fixture.solution,
      entry: "index.html",
      check: fixture.check,
    });
    expect(result.diagnostics).toEqual([]);
    const [results] = ofType(result, "check-results");
    expect(results.results.map((check) => [check.id, check.pass])).toEqual([
      ["three-books", true],
      ["list-styled", true],
      ["button-adds", true],
      ["ready-logged", true],
    ]);
  });

  test("an uncaught error in the classic script maps to main.js and its line", async ({ page }) => {
    const source = `${fixture.files["main.js"]}\nthrow new Error("boom");\n`;
    const result = await run(page, {
      files: { ...fixture.files, "main.js": source },
      entry: "index.html",
      quietMs: 500,
    });
    expect(result.diagnostics).toEqual([]);
    expect(ofType(result, "error")).toEqual([
      expect.objectContaining({
        message: expect.stringContaining("boom"),
        file: "main.js",
        line: lineOf(source, 'throw new Error("boom")'),
        column: expect.any(Number),
      }),
    ]);
    expect(ofType(result, "error")[0].stack).not.toContain("blob:");
    expect(ofType(result, "settled")).toHaveLength(1);
    await expect(resultFrame(page).locator("#books li")).toHaveCount(2);
  });

  test("__LAB__.resize posts a resize-request the result pane honors", async ({ page }) => {
    const result = await run(page, {
      files: fixture.files,
      entry: "index.html",
      check:
        "export default async function check() {\n  globalThis.__LAB__.resize(360.4);\n  globalThis.__LAB__.resize(null);\n  globalThis.__LAB__.resize(-5);\n  return [];\n}\n",
    });
    expect(result.diagnostics).toEqual([]);
    expect(ofType(result, "resize-request").map((message) => message.width)).toEqual([
      360,
      null,
      null,
    ]);
  });
});

test.describe("the vanilla fixture on the step page", () => {
  let topic;

  test.beforeAll(async () => {
    topic = await buildVanillaTopic();
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem("cs300-test:cleared")) {
        localStorage.clear();
        sessionStorage.setItem("cs300-test:cleared", "1");
      }
    });
    await serveTopic(page, topic);
  });

  async function openStep(page, n, title) {
    await page.goto(`#/topic/${TOPIC_ID}/${n}`);
    await expect(page.locator("#step-heading")).toHaveText(title);
    await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
      timeout: 15_000,
    });
  }

  const status = (page) => page.locator(".pane--result .status-pill");
  const frame = (page) => page.frameLocator('iframe[title="Result of your code"]');

  test("the page runs, its console arrives, and the checks read the DOM", async ({ page }) => {
    await openStep(page, 1, "Add a third book");
    await expect(page.locator("h1")).toHaveText(TOPIC_TITLE);
    await expect(workspaceNodes(page)).toHaveText(["index.html", "main.js", "styles.css"]);
    await expect(fileNode(page, "index.html")).toHaveAttribute("aria-selected", "true");

    await expect(frame(page).locator("#books li")).toHaveText([
      "Eloquent JavaScript",
      "The Pragmatic Programmer",
      "Design Patterns",
    ]);
    await expect(frame(page).locator("#books")).toHaveCSS("list-style-type", "none");
    await expect(page.locator(".console-entry--log pre")).toHaveText([
      "reading list ready",
      "added Design Patterns",
    ]);
    await expect(page.locator(".console-entry--error")).toHaveCount(0);

    await expect(page.locator(".check")).toHaveCount(4);
    await expect(page.locator(".check--pass")).toHaveCount(3);
    await expect(page.locator(".check--fail")).toHaveCount(1);
    await expect(page.locator(".check--fail")).toContainText("Three books are listed");
  });

  test("the inspector shows the DOM toggle alone and no React views", async ({ page }) => {
    await openStep(page, 1, "Add a third book");
    const pane = page.locator(".pane--inspector");
    await expect(pane.locator(".pane__header .meta")).toHaveText(/^\d+ elements · snapshot \d+$/);
    const toggles = pane.getByRole("group", { name: "Inspector views" }).getByRole("button");
    await expect(toggles).toHaveText(["DOM", "Network"]);
    await expect(pane.getByRole("button", { name: "DOM" })).toHaveAttribute("aria-pressed", "true");
    await expect(pane.getByRole("button", { name: "Network" })).toBeDisabled();
    for (const label of ["Boundaries", "Re-render flash", "Tree and state", "Flow trace"]) {
      await expect(pane.getByRole("button", { name: label })).toHaveCount(0);
    }
    await pane.getByRole("button", { name: "DOM" }).click();
    await expect(pane.getByRole("button", { name: "DOM" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(pane.getByText("Turn on DOM to see the elements")).toBeVisible();
  });

  test("the edit block into index.html renders as a card and its solution passes", async ({
    page,
  }) => {
    await openStep(page, 1, "Add a third book");
    const card = page.locator(".step-content .edit-card");
    await expect(card).toHaveCount(1);
    await expect(card.locator(".edit-file")).toHaveText("index.html");
    await expect(card.locator(".edit-placement")).toHaveText(
      'insert after the line <li class="book">The Pragmatic Programmer</li>',
    );
    await expect(card.locator("pre")).toContainText(
      '<li class="book">Structure and Interpretation of Computer Programs</li>',
    );

    await page.getByRole("button", { name: "Show solution" }).click();
    await page.getByRole("button", { name: "Load solution" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(status(page)).toHaveText("Ready", { timeout: 15_000 });
    await expect(frame(page).locator("#books li")).toHaveCount(4);
    await expect(frame(page).locator("#books li").nth(2)).toHaveText(
      "Structure and Interpretation of Computer Programs",
    );
    await expect(page.locator(".check--pass .required-badge")).toHaveCount(4);
    await expect(page.locator(".check-summary")).toContainText("Every required check passes");
  });

  test("an uncaught error in the classic script links to main.js and its line in the console pane", async ({
    page,
  }) => {
    await openStep(page, 1, "Add a third book");
    await openFile(page, "main.js");
    const source = `${fixture.files["main.js"]}\nthrow new Error("boom");\n`;
    const line = lineOf(source, 'throw new Error("boom")');
    const editor = page.locator(".cm-content");
    await editor.click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.insertText(source);
    await page
      .getByRole("toolbar", { name: "Workspace actions" })
      .getByRole("button", { name: "Run", exact: true })
      .click();
    await expect(status(page)).toHaveText("Ready", { timeout: 15_000 });

    const error = page.locator(".console-entry--error");
    await expect(error).toHaveCount(1);
    await expect(error.locator("pre")).toContainText("boom");
    await expect(error.locator("pre")).not.toContainText("blob:");
    const link = error.getByRole("button", { name: `main.js:${line}` });
    await expect(link).toBeVisible();
    await openFile(page, "index.html");
    await link.click();
    await expect(fileNode(page, "main.js")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".cm-editor .cm-lineNumbers .cm-activeLineGutter")).toHaveText(
      String(line),
    );
  });

  test("the download is the files and a README, with no package.json", async ({ page }) => {
    await openStep(page, 1, "Add a third book");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download this workspace" }).click(),
    ]);
    const folder = `${TOPIC_ID}-1`;
    expect(download.suggestedFilename()).toBe(`${folder}.zip`);
    const zip = unzipSync(new Uint8Array(readFileSync(await download.path())));
    const entries = Object.fromEntries(
      Object.entries(zip).map(([entryPath, bytes]) => [entryPath, strFromU8(bytes)]),
    );
    expect(Object.keys(entries).sort()).toEqual([
      `${folder}/README.md`,
      `${folder}/index.html`,
      `${folder}/main.js`,
      `${folder}/styles.css`,
    ]);
    expect(entries[`${folder}/index.html`]).toBe(fixture.files["index.html"]);
    expect(entries[`${folder}/main.js`]).toBe(fixture.files["main.js"]);
    expect(entries[`${folder}/styles.css`]).toBe(fixture.files["styles.css"]);
    const readme = entries[`${folder}/README.md`];
    expect(readme).toContain(`# ${TOPIC_TITLE}: step 1, Add a third book`);
    expect(readme).toContain("Open `index.html` in your browser");
    expect(readme).toContain("serve the folder");
    expect(readme).not.toContain("npm install");
    await expect(page.locator(".live-region")).toContainText("open its index.html");
  });

  test("a check narrows the result through __LAB__.resize and the pane can restore it", async ({
    page,
  }) => {
    await openStep(page, 2, "Narrow layout");
    const iframe = page.locator('iframe[title="Result of your code"]');
    await expect(iframe).toHaveCSS("width", "360px");
    await expect(page.locator(".result-width")).toHaveText(
      "Shown 360 pixels wide. Use the full width",
    );
    await expect(page.locator(".check--pass")).toHaveCount(1);
    expect(
      await frame(page)
        .locator("html")
        .evaluate((html) => html.clientWidth),
    ).toBe(360);

    await page.getByRole("button", { name: "Use the full width" }).click();
    await expect(page.locator(".result-width")).toHaveCount(0);
    expect(await iframe.evaluate((element) => element.getAttribute("style") ?? "")).toBe("");
    expect(
      await iframe.evaluate((element) => element.getBoundingClientRect().width),
    ).toBeGreaterThan(360);
  });
});
