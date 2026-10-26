// Flow trace tests: the bridge records one trace per interaction from the owner labels the
// runtime wrappers attach, and posts it as a `flow` message (docs/CONTRACTS.md section 4.3).

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { openHarness, resultFrame, run } from "./support/harness.js";

const fixtureDir = path.join(import.meta.dirname, "fixtures", "flow");

function readWorkspace(directory, prefix = "") {
  const files = {};
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) {
      Object.assign(files, readWorkspace(path.join(directory, entry.name), `${relative}/`));
    } else {
      files[relative] = readFileSync(path.join(directory, entry.name), "utf8");
    }
  }
  return files;
}

const files = readWorkspace(fixtureDir);

async function messages(page) {
  return page.evaluate(() => globalThis.__harness.messages());
}

const traces = (list) => list.filter((m) => m.type === "flow").map((m) => m.trace);
const commits = (list) => list.filter((m) => m.type === "inspector").map((m) => m.commit);

// Waits until a flow trace beyond the first `known` ones arrives and returns the newest one.
async function nextTrace(page, known) {
  await expect.poll(async () => traces(await messages(page)).length).toBeGreaterThan(known);
  return traces(await messages(page)).at(-1);
}

const shape = {
  id: expect.stringMatching(/^t\d+$/),
  seq: expect.any(Number),
  startTime: expect.any(Number),
  duration: expect.any(Number),
};

test.describe("flow trace", () => {
  test.beforeEach(async ({ page }) => openHarness(page));

  test("a click in a child records the event, the prop call, the setter, and the render set", async ({
    page,
  }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: true });
    expect(result.diagnostics).toEqual([]);
    const before = traces(result.messages).length;

    await resultFrame(page).locator("button.add").click();
    const trace = await nextTrace(page, before);

    expect(trace).toEqual({
      ...shape,
      event: { type: "click", target: "<button.add>", handlerOwner: "BookmarkForm" },
      entries: [
        {
          kind: "prop-call",
          time: expect.any(Number),
          prop: "onAdd",
          passedBy: "App",
          calledIn: "BookmarkForm",
          args: ["Vite guide"],
        },
        {
          kind: "setter",
          time: expect.any(Number),
          component: "App",
          hook: 0,
          hookName: "useState",
          previous: ["React docs", "MDN"],
          next: ["React docs", "MDN", "Vite guide"],
        },
      ],
      rendered: ["App", "BookmarkForm", "BookmarkList"],
      commitSeq: expect.any(Number),
    });
    expect(trace.entries[0].time).toBeLessThanOrEqual(trace.entries[1].time);
    expect(trace.duration).toBeGreaterThanOrEqual(trace.entries[1].time);

    const all = await messages(page);
    const commit = commits(all).find((c) => c.seq === trace.commitSeq);
    expect(commit, "the closing commit was posted").toBeTruthy();
    expect(commit.components.filter((c) => c.rendered).map((c) => c.name)).toEqual(trace.rendered);
    expect(commit.components.find((c) => c.name === "Counter").rendered).toBe(false);
    expect(
      all.findIndex((m) => m.type === "inspector" && m.commit.seq === trace.commitSeq),
      "the commit arrives before the trace that names it",
    ).toBeLessThan(all.findIndex((m) => m.type === "flow" && m.trace.id === trace.id));

    const stored = await resultFrame(page).evaluate(() =>
      globalThis.__LAB__.inspector.traces.map((t) => t.id),
    );
    expect(stored).toContain(trace.id);
  });

  test("a setter called from an effect records a trace with no event", async ({ page }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: true });
    const initial = traces(result.messages);
    expect(initial.length).toBeGreaterThanOrEqual(1);
    const trace = initial.find((t) => t.event === null);
    expect(trace).toEqual({
      ...shape,
      event: null,
      entries: [
        {
          kind: "setter",
          time: expect.any(Number),
          component: "App",
          hook: 1,
          hookName: "useState",
          previous: false,
          next: true,
        },
      ],
      rendered: expect.arrayContaining(["App"]),
      commitSeq: commits(result.messages)[1].seq,
    });
    expect(trace.seq).toBe(1);
    await expect(resultFrame(page).locator("#status")).toHaveText("ready");
  });

  test("a handler that changes no state still records the event, with nothing rendered", async ({
    page,
  }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: true });
    const before = traces(result.messages).length;
    await resultFrame(page).locator("button.note").click();
    const trace = await nextTrace(page, before);
    expect(trace).toEqual({
      ...shape,
      event: { type: "click", target: "<button.note>", handlerOwner: "BookmarkForm" },
      entries: [],
      rendered: [],
      commitSeq: null,
    });
    expect((await messages(page)).some((m) => m.type === "console" && m.text === "noted")).toBe(
      true,
    );
  });

  test("a useReducer dispatch records the hook index, the reducer result, and only its component", async ({
    page,
  }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: true });
    const before = traces(result.messages).length;
    await resultFrame(page).locator("#count").click();
    const trace = await nextTrace(page, before);
    expect(trace).toMatchObject({
      event: { type: "click", target: "<button#count>", handlerOwner: "Counter" },
      entries: [
        {
          kind: "setter",
          component: "Counter",
          hook: 0,
          hookName: "useReducer",
          previous: 0,
          next: 1,
        },
      ],
      rendered: ["Counter"],
    });
    expect(trace.commitSeq).toEqual(expect.any(Number));
    await expect(resultFrame(page).locator("#count")).toHaveText("Count 1");
  });

  test("a setter called from a plain DOM listener records the event with no handler owner", async ({
    page,
  }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: true });
    await expect(resultFrame(page).locator("#status")).toHaveText("ready");
    const before = traces(result.messages).length;
    await resultFrame(page).locator("#status").click();
    await page.keyboard.press("r");
    const trace = await nextTrace(page, before);
    expect(trace).toMatchObject({
      event: { type: "keydown", target: "<body>", handlerOwner: null },
      entries: [
        {
          kind: "setter",
          component: "App",
          hook: 1,
          hookName: "useState",
          previous: true,
          next: false,
        },
      ],
      rendered: expect.arrayContaining(["App"]),
    });
    await expect(resultFrame(page).locator("#status")).toHaveText("loading");
  });

  test("traces are numbered in order and every labeled call lands in the open trace", async ({
    page,
  }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: true });
    const before = traces(result.messages).length;
    const frame = resultFrame(page);
    await frame.locator("button.add").click();
    await nextTrace(page, before);
    await frame.locator("#count").click();
    const after = await nextTrace(page, before + 1);
    const all = traces(await messages(page));
    expect(all.map((t) => t.seq)).toEqual(all.map((_, i) => i + 1));
    expect(all.map((t) => t.id)).toEqual(all.map((t) => `t${t.seq}`));
    expect(after.entries).toHaveLength(1);
    expect(all.every((t) => t.entries.every((e) => e.time >= 0 && e.time <= t.duration))).toBe(
      true,
    );
  });

  test("without the inspector nothing is traced", async ({ page }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: false });
    await resultFrame(page).locator("button.add").click();
    await expect(resultFrame(page).locator("li")).toHaveCount(3);
    expect(traces(await messages(page))).toEqual([]);
    expect(result.messages.filter((m) => m.type === "flow")).toEqual([]);
  });
});
