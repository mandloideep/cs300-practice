// DOM view tests (PHASE4 milestone 2): the bridge's `dom` snapshots for the vanilla fixture
// through the runner harness (docs/CONTRACTS.md section 4.3), the `dom-highlight` box in the
// overlay (section 4.4), and the DOM view on the step page: tree contents, highlight on hover and
// focus, a flash after the button adds an item, attributes on expand, and jump-to-code.

import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { openHarness, resultFrame, run, runStep } from "./support/harness.js";
import { fileNode, openFile } from "./support/files.js";
import { TOPIC_ID, buildVanillaTopic, readVanillaFixture, serveTopic } from "./support/vanilla.js";

const fixture = readVanillaFixture();
const index = fixture.files["index.html"];

// 1-based line of the nth line in `source` that contains `text`.
function lineOf(source, text, nth = 1) {
  let seen = 0;
  return (
    source.split("\n").findIndex((line) => {
      if (!line.includes(text)) return false;
      seen += 1;
      return seen === nth;
    }) + 1
  );
}

const LINES = {
  body: lineOf(index, "<body>"),
  main: lineOf(index, "<main"),
  h1: lineOf(index, "<h1>"),
  count: lineOf(index, '<p id="count">'),
  books: lineOf(index, '<ul id="books">'),
  first: lineOf(index, '<li class="book">', 1),
  second: lineOf(index, '<li class="book">', 2),
  add: lineOf(index, '<button type="button" id="add">'),
  toggle: lineOf(index, '<button type="button" id="toggle">'),
  script: lineOf(index, "<script"),
};

const MARKUP = [
  ["body", LINES.body],
  ["main", LINES.main],
  ["h1", LINES.h1],
  ["p", LINES.count],
  ["ul", LINES.books],
  ["li", LINES.first],
  ["li", LINES.second],
  ["p", null],
  ["button", LINES.add],
  ["button", LINES.toggle],
  ["script", LINES.script],
];

const snapshots = async (page) =>
  (await page.evaluate(() => globalThis.__harness.messages()))
    .filter((message) => message.type === "dom")
    .map((message) => message.snapshot);

const send = (page, message) =>
  page.evaluate((payload) => globalThis.__harness.send(payload), message);

async function openDomView(page) {
  const before = (await snapshots(page)).length;
  await send(page, { type: "inspector-config", views: ["dom"] });
  await expect.poll(async () => (await snapshots(page)).length).toBeGreaterThan(before);
  return (await snapshots(page)).at(-1);
}

async function nextSnapshot(page, known) {
  await expect.poll(async () => (await snapshots(page)).length).toBeGreaterThan(known);
  return (await snapshots(page)).at(-1);
}

const byTag = (snapshot, tag, nth = 0) =>
  snapshot.nodes.filter((node) => node.tag === tag)[nth] ?? null;
const byId = (snapshot, id) => snapshot.nodes.find((node) => node.attributes?.id === id) ?? null;

test.describe("dom snapshots through the runner harness", () => {
  test.beforeEach(async ({ page }) => openHarness(page));

  test("the first snapshot lists the body subtree with lines from index.html for markup elements", async ({
    page,
  }) => {
    const result = await run(page, { files: fixture.files, entry: "index.html" });
    expect(result.diagnostics).toEqual([]);
    expect(result.messages.filter((message) => message.type === "dom")).toEqual([]);
    expect(result.srcdoc).toContain("globalThis.__LAB__?.markup.before()");
    expect(result.srcdoc).toContain("globalThis.__LAB__?.markup.after()");
    const frame = resultFrame(page);
    expect(
      await frame.evaluate(
        () =>
          [...globalThis.document.scripts].filter((script) =>
            script.textContent.includes("__LAB__?.markup"),
          ).length,
      ),
    ).toBe(0);

    const snapshot = await openDomView(page);
    expect(snapshot).toEqual({
      seq: 1,
      time: expect.any(Number),
      nodes: expect.any(Array),
    });
    expect(snapshot.nodes.map((node) => [node.tag, node.declaredAt?.line ?? null])).toEqual(MARKUP);
    expect(snapshot.nodes.every((node) => node.changed === null)).toBe(true);
    expect(snapshot.nodes.every((node) => /^n\d+$/.test(node.id))).toBe(true);
    for (const node of snapshot.nodes) {
      if (node.declaredAt) expect(node.declaredAt.file).toBe("index.html");
    }

    const body = byTag(snapshot, "body");
    const main = byTag(snapshot, "main");
    const list = byId(snapshot, "books");
    expect(body).toMatchObject({ parentId: null, attributes: {}, text: null });
    expect(main).toMatchObject({ parentId: body.id, attributes: { class: "page" }, text: null });
    expect(byTag(snapshot, "h1")).toMatchObject({ parentId: main.id, text: "Reading list" });
    expect(byId(snapshot, "count")).toMatchObject({ text: "2 books" });
    expect(list).toMatchObject({ attributes: { id: "books" }, text: null });
    expect(byTag(snapshot, "li", 0)).toMatchObject({
      parentId: list.id,
      attributes: { class: "book" },
      text: "Eloquent JavaScript",
    });
    expect(byTag(snapshot, "p", 1)).toMatchObject({
      attributes: { class: "note" },
      text: "Press Add a book to grow the list.",
      declaredAt: null,
    });
    expect(byId(snapshot, "add")).toMatchObject({
      attributes: { type: "button", id: "add" },
      text: "Add a book",
    });
    expect(byTag(snapshot, "script").attributes).toEqual({ src: "main.js" });
    expect(await frame.evaluate(() => globalThis.__LAB__.dom.latest.seq)).toBe(1);
  });

  test("a script's additions, text changes, attribute changes, and removals arrive one frame at a time", async ({
    page,
  }) => {
    await run(page, { files: fixture.files, entry: "index.html" });
    const first = await openDomView(page);
    const frame = resultFrame(page);
    const list = byId(first, "books");

    await frame.getByRole("button", { name: "Add a book" }).click();
    const added = await nextSnapshot(page, 1);
    expect(added.seq).toBe(2);
    expect(
      added.nodes.filter((node) => node.changed).map((node) => [node.tag, node.changed]),
    ).toEqual([
      ["p", "text"],
      ["li", "added"],
    ]);
    const item = byTag(added, "li", 2);
    expect(item).toMatchObject({
      parentId: list.id,
      attributes: { class: "book" },
      text: "Design Patterns",
      declaredAt: null,
      changed: "added",
    });
    expect(byId(added, "count")).toMatchObject({ text: "3 books", changed: "text" });
    expect(byId(added, "books").id).toBe(list.id);
    expect(byTag(added, "li", 0).id).toBe(byTag(first, "li", 0).id);

    await frame.getByRole("button", { name: "Toggle compact" }).click();
    const toggled = await nextSnapshot(page, 2);
    expect(toggled.nodes.filter((node) => node.changed)).toEqual([
      expect.objectContaining({
        tag: "body",
        attributes: { class: "compact" },
        changed: "attributes",
      }),
    ]);

    const removedId = byTag(first, "li", 0).id;
    await frame.evaluate(() => globalThis.document.querySelector("#books li").remove());
    const removed = await nextSnapshot(page, 3);
    const gone = removed.nodes.find((node) => node.id === removedId);
    expect(gone).toMatchObject({
      parentId: list.id,
      tag: "li",
      text: "Eloquent JavaScript",
      changed: "removed",
    });
    const position = removed.nodes.indexOf(gone);
    expect(removed.nodes[position - 1].id).toBe(list.id);
    expect(removed.nodes.filter((node) => node.changed)).toHaveLength(1);
    expect(removed.nodes.filter((node) => node.tag === "li")).toHaveLength(3);

    await frame.getByRole("button", { name: "Add a book" }).click();
    const later = await nextSnapshot(page, 4);
    expect(later.nodes.find((node) => node.id === removedId)).toBeUndefined();
    expect(later.nodes.filter((node) => node.tag === "li")).toHaveLength(3);

    await frame.evaluate(() => {
      const first = globalThis.document.querySelector("#books li");
      first.firstChild.data = "Edited";
    });
    const edited = await nextSnapshot(page, 5);
    expect(edited.nodes.filter((node) => node.changed)).toEqual([
      expect.objectContaining({ tag: "li", text: "Edited", changed: "text" }),
    ]);
  });

  test("closing the view stops the snapshots and reopening sends a fresh one", async ({ page }) => {
    await run(page, { files: fixture.files, entry: "index.html" });
    await openDomView(page);
    await send(page, { type: "inspector-config", views: [] });
    const frame = resultFrame(page);
    await frame.getByRole("button", { name: "Add a book" }).click();
    await frame.getByRole("button", { name: "Add a book" }).click();
    await page.waitForTimeout(400);
    expect(await snapshots(page)).toHaveLength(1);

    const reopened = await openDomView(page);
    expect(reopened.seq).toBe(2);
    expect(reopened.nodes.filter((node) => node.tag === "li")).toHaveLength(4);
    expect(reopened.nodes.every((node) => node.changed === null)).toBe(true);
  });

  test("dom-highlight outlines the element in the shared overlay layer", async ({ page }) => {
    await run(page, { files: fixture.files, entry: "index.html" });
    const frame = resultFrame(page);
    await expect(frame.locator("lab-inspector-overlay")).toHaveCount(0);
    const snapshot = await openDomView(page);
    const heading = byTag(snapshot, "h1");

    await send(page, { type: "dom-highlight", nodeId: heading.id });
    const overlay = frame.locator("lab-inspector-overlay");
    await expect(overlay).toHaveCount(1);
    await expect(overlay.locator(".dom-box")).toHaveCount(1);
    await expect(overlay.locator(".dom-label")).toHaveText(/^h1 \d+ × \d+$/);
    await expect(overlay.locator(".box")).toHaveCount(0);
    const box = await overlay.locator(".dom-box").boundingBox();
    const target = await frame.locator("h1").boundingBox();
    expect(Math.abs(box.x - target.x)).toBeLessThan(2);
    expect(Math.abs(box.width - target.width)).toBeLessThan(2);

    await send(page, { type: "dom-highlight", nodeId: null });
    await expect(overlay.locator(".dom-box")).toHaveCount(0);
    await send(page, { type: "dom-highlight", nodeId: "n999" });
    await expect(overlay.locator(".dom-box")).toHaveCount(0);
  });

  test("a React workspace gets commits and snapshots side by side", async ({ page }) => {
    const result = await runStep(page, "react-mental-model/03-only-the-changed-part", "solution");
    expect(result.diagnostics).toEqual([]);
    expect(result.messages.some((message) => message.type === "inspector")).toBe(true);
    await send(page, { type: "inspector-config", views: ["boundaries", "dom"] });
    const snapshot = await nextSnapshot(page, 0);
    expect(snapshot.nodes[0]).toMatchObject({ tag: "body", declaredAt: { file: "index.html" } });
    expect(byId(snapshot, "root")).toMatchObject({ declaredAt: { file: "index.html" } });
    const rendered = snapshot.nodes.filter((node) => node.parentId === byId(snapshot, "root").id);
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.every((node) => node.declaredAt === null)).toBe(true);

    const frame = resultFrame(page);
    const overlay = frame.locator("lab-inspector-overlay");
    await expect(overlay.locator(".box").first()).toBeAttached();
    await send(page, { type: "dom-highlight", nodeId: rendered[0].id });
    await expect(overlay.locator(".dom-box")).toHaveCount(1);
    await expect(overlay.locator(".box").first()).toBeAttached();
  });
});

test.describe("the DOM view on the step page", () => {
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

  const pane = (page) => page.locator(".pane--inspector");
  const frame = (page) => page.frameLocator('iframe[title="Result of your code"]');
  const rows = (page) => pane(page).locator(".dom-row");
  const row = (page, text) =>
    rows(page).filter({ has: page.locator(".dom-row__name", { hasText: text }) });

  async function openStep(page) {
    await page.goto(`#/topic/${TOPIC_ID}/1`);
    await expect(page.locator("#step-heading")).toHaveText("Add a third book");
    await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
      timeout: 15_000,
    });
    await expect(page.locator(".check-summary")).toBeVisible({ timeout: 15_000 });
    await expect(pane(page).locator(".pane__header .meta")).toHaveText(
      /\d+ elements · snapshot \d+/,
    );
  }

  test("shows the tree with tags, ids, classes, text, and attributes on expand", async ({
    page,
  }) => {
    await openStep(page);
    await expect(pane(page).getByRole("button", { name: "DOM" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(pane(page).locator(".dom-row__name")).toHaveText([
      `<body>, declared at index.html:${LINES.body}`,
      `<main.page>, declared at index.html:${LINES.main}`,
      `<h1>Reading list, declared at index.html:${LINES.h1}`,
      `<p#count>3 books, declared at index.html:${LINES.count}, text changed`,
      `<ul#books>, declared at index.html:${LINES.books}`,
      `<li.book>Eloquent JavaScript, declared at index.html:${LINES.first}`,
      `<li.book>The Pragmatic Programmer, declared at index.html:${LINES.second}`,
      "<li.book>Design Patterns, created by a script, added",
      "<p.note>Press Add a book to grow the list., created by a script",
      `<button#add>Add a book, declared at index.html:${LINES.add}`,
      `<button#toggle>Toggle compact, declared at index.html:${LINES.toggle}`,
      `<script>, declared at index.html:${LINES.script}`,
    ]);
    await expect(pane(page).locator(".pane__header .meta")).toHaveText("12 elements · snapshot 2");
    await expect(row(page, "<main.page>").locator(".dom-row__name")).toHaveAccessibleName(
      new RegExp(`declared at index\\.html:${LINES.main}$`),
    );
    await expect(row(page, "<p.note>").locator(".dom-row__name")).toHaveAccessibleName(
      /created by a script$/,
    );
    const nested = pane(page).locator(".dom-tree--root > .dom-node > .dom-tree > .dom-node");
    await expect(nested.first().locator(".dom-row__name").first()).toContainText("<main.page>");

    const attributes = row(page, "<button#add>").getByRole("button", { name: "2 attributes of" });
    await expect(attributes).toHaveAttribute("aria-expanded", "false");
    await attributes.click();
    await expect(attributes).toHaveAttribute("aria-expanded", "true");
    const list = pane(page).getByRole("definition").filter({ hasText: '"button"' });
    await expect(list).toHaveCount(1);
    await expect(pane(page).locator(".dom-attributes dt")).toHaveText(["type", "id"]);
    await expect(pane(page).locator(".dom-attributes dd")).toHaveText(['"button"', '"add"']);
    await attributes.click();
    await expect(pane(page).locator(".dom-attributes")).toHaveCount(0);
  });

  test("pointing at or focusing a row outlines the element in the result", async ({ page }) => {
    await openStep(page);
    const overlay = frame(page).locator("lab-inspector-overlay");
    await row(page, "<h1>").hover();
    await expect(overlay.locator(".dom-box")).toHaveCount(1);
    await expect(overlay.locator(".dom-label")).toHaveText(/^h1 \d+ × \d+$/);
    await page.mouse.move(0, 0);
    await expect(overlay.locator(".dom-box")).toHaveCount(0);

    const name = row(page, "<ul#books>").locator(".dom-row__name");
    await name.focus();
    await expect(overlay.locator(".dom-box")).toHaveCount(1);
    await expect(overlay.locator(".dom-label")).toHaveText(/^ul#books \d+ × \d+$/);
    await name.blur();
    await expect(overlay.locator(".dom-box")).toHaveCount(0);
  });

  test("rows flash when the button adds an item or a class changes, and respect reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openStep(page);
    await frame(page).getByRole("button", { name: "Add a book" }).click();
    const added = row(page, "<li.book>Refactoring");
    await expect(added).toHaveAttribute("data-changed", "added");
    await expect(added).toHaveClass(/is-changed/);
    await expect(added.locator(".dom-chip")).toHaveText("added");
    await expect(added).toHaveCSS("animation-name", /^dom-changed-[01]$/);
    await expect(row(page, "<p#count>")).toHaveAttribute("data-changed", "text");
    await expect(pane(page).locator(".dom-row__name").nth(3)).toHaveText(
      `<p#count>4 books, declared at index.html:${LINES.count}, text changed`,
    );
    await expect(pane(page).locator(".dom-row[data-changed]")).toHaveCount(2);
    await expect(pane(page).locator(".pane__header .meta")).toHaveText("13 elements · snapshot 3");

    await frame(page).getByRole("button", { name: "Toggle compact" }).click();
    await expect(row(page, "<body.compact>")).toHaveAttribute("data-changed", "attributes");
    await expect(pane(page).locator(".dom-row[data-changed]")).toHaveCount(1);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await frame(page).getByRole("button", { name: "Toggle compact" }).click();
    const body = row(page, "<body>");
    await expect(body).toHaveAttribute("data-changed", "attributes");
    await expect(body).toHaveCSS("animation-name", "none");
    await expect(body).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("selecting a row opens its line of index.html", async ({ page }) => {
    await openStep(page);
    await openFile(page, "main.js");
    await row(page, "<h1>").locator(".dom-row__name").click();
    await expect(fileNode(page, "index.html")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".cm-editor .cm-lineNumbers .cm-activeLineGutter")).toHaveText(
      String(LINES.h1),
    );

    const name = row(page, "<button#toggle>").locator(".dom-row__name");
    await name.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".cm-editor .cm-lineNumbers .cm-activeLineGutter")).toHaveText(
      String(LINES.toggle),
    );
  });

  test("the DOM toggle hides the tree and axe finds no violations with it open", async ({
    page,
  }) => {
    await openStep(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .exclude("iframe")
      .analyze();
    expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);

    await pane(page).getByRole("button", { name: "DOM" }).click();
    await expect(rows(page)).toHaveCount(0);
    await expect(pane(page).getByText("Turn on DOM to see the elements")).toBeVisible();
    await pane(page).getByRole("button", { name: "DOM" }).click();
    await expect(rows(page).first()).toBeVisible();
  });
});
