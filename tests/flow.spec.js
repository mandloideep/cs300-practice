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

// Request rows (Phase 3): the fetch shim records a `request` entry in the open trace and a
// settling response opens a trace with no event whose first entry is `response`.

const requestsDir = path.join(import.meta.dirname, "fixtures", "requests");
const requestFiles = readWorkspace(requestsDir);
const FIXTURES_BASE = "https://fixtures.local";

const requestFixtures = {
  routes: [
    { method: "GET", path: "/items/a", delay: 300, body: { query: "a" } },
    { method: "GET", path: "/items/ab", body: { query: "ab" } },
    { method: "GET", path: "/count", body: { count: 3 } },
    { method: "GET", path: "/check", delay: 120, body: { count: 3 } },
  ],
  bodies: {},
};

function runRequests(page, inspector = true) {
  return run(page, {
    files: requestFiles,
    entry: "src/main.jsx",
    inspector,
    fixtures: requestFixtures,
    env: { API_BASE: FIXTURES_BASE, API_SOURCE: "fixtures" },
  });
}

function records(page) {
  return resultFrame(page).evaluate(() => globalThis.__LAB__.network.map((r) => ({ ...r })));
}

async function settled(page, count) {
  await expect
    .poll(async () => {
      const list = await records(page);
      return list.length >= count && list.every((record) => record.state !== "pending");
    })
    .toBe(true);
  return records(page);
}

// Waits for the trace at `index` (the first one after `index` known traces) and returns it;
// unlike nextTrace it does not skip to a later trace that arrived in the meantime.
async function traceAt(page, index) {
  await expect.poll(async () => traces(await messages(page)).length).toBeGreaterThan(index);
  return traces(await messages(page))[index];
}

// The trace whose first entry is the response of `requestId`.
const responseEntry = (requestId) => (trace) =>
  trace.entries[0]?.kind === "response" && trace.entries[0].requestId === requestId;

// The response entry of `requestId` wherever it landed: a response that settles while a trace
// is still open, as two zero-latency fixtures do, joins that trace instead of opening its own.
function findResponse(list, requestId) {
  for (const trace of list) {
    const entry = trace.entries.find((e) => e.kind === "response" && e.requestId === requestId);
    if (entry) return { trace, entry };
  }
  return null;
}

test.describe("request rows in the flow trace", () => {
  test.beforeEach(async ({ page }) => openHarness(page));

  test("a fetch in a click handler is a request entry of the click's trace, and its response opens a trace with no event", async ({
    page,
  }) => {
    const result = await runRequests(page);
    expect(result.diagnostics).toEqual([]);
    const before = traces(result.messages).length;
    const frame = resultFrame(page);

    await frame.locator("#check").click();
    const clickTrace = await traceAt(page, before);
    expect(clickTrace).toEqual({
      ...shape,
      event: { type: "click", target: "<button#check>", handlerOwner: "App" },
      entries: [
        {
          kind: "request",
          time: expect.any(Number),
          requestId: expect.stringMatching(/^r\d+$/),
          method: "GET",
          url: `${FIXTURES_BASE}/check`,
          calledIn: null,
        },
      ],
      rendered: [],
      commitSeq: null,
    });
    const { requestId } = clickTrace.entries[0];

    await expect(frame.locator("#note")).toHaveText("Checked 3");
    await expect
      .poll(async () => traces(await messages(page)).some(responseEntry(requestId)))
      .toBe(true);
    const responseTrace = traces(await messages(page)).find(responseEntry(requestId));
    expect(responseTrace).toEqual({
      ...shape,
      event: null,
      entries: [
        {
          kind: "response",
          time: expect.any(Number),
          requestId,
          state: "ok",
          status: 200,
          duration: expect.any(Number),
          stale: false,
          duplicateOf: null,
        },
        {
          kind: "setter",
          time: expect.any(Number),
          component: "App",
          hook: 0,
          hookName: "useState",
          previous: "",
          next: "Checked 3",
        },
      ],
      rendered: expect.arrayContaining(["App"]),
      commitSeq: expect.any(Number),
    });
    expect(responseTrace.entries[0].duration).toBeGreaterThanOrEqual(100);
    expect(responseTrace.seq).toBeGreaterThan(clickTrace.seq);
  });

  test("an effect that runs twice under Strict Mode produces a duplicate request", async ({
    page,
  }) => {
    await runRequests(page);
    await expect(resultFrame(page).locator("#count")).toHaveText("3 items");
    const list = await settled(page, 2);
    const counts = list.filter((record) => record.url === `${FIXTURES_BASE}/count`);
    expect(counts).toHaveLength(2);
    expect(counts[0]).toMatchObject({ state: "ok", stale: false, duplicateOf: null });
    expect(counts[1]).toMatchObject({ state: "ok", stale: false, duplicateOf: counts[0].id });
    expect(counts[0].calledFrom).toEqual(counts[1].calledFrom);
    expect(counts[0].calledFrom).toEqual({ file: "src/App.jsx", line: expect.any(Number) });

    const all = traces(await messages(page));
    const first = findResponse(all, counts[0].id);
    const second = findResponse(all, counts[1].id);
    expect(first.trace.event).toBeNull();
    expect(first.trace.entries[0]).toBe(first.entry);
    expect(first.entry).toMatchObject({
      state: "ok",
      status: 200,
      stale: false,
      duplicateOf: null,
    });
    expect(second.trace.event).toBeNull();
    expect(second.entry).toMatchObject({
      kind: "response",
      state: "ok",
      status: 200,
      duplicateOf: counts[0].id,
      stale: false,
    });
  });

  test("an effect with no cleanup that fetches on every keystroke produces a stale response", async ({
    page,
  }) => {
    await runRequests(page);
    const frame = resultFrame(page);
    await settled(page, 2);
    const known = (await records(page)).length;

    await frame.locator("#query").fill("a");
    await frame.locator("#query").fill("ab");
    await expect(frame.locator("#result")).toHaveText("Results for ab");
    await expect(frame.locator("#result")).toHaveText("Results for a");

    const list = (await settled(page, known + 2)).slice(known);
    expect(list.map((record) => record.url)).toEqual([
      `${FIXTURES_BASE}/items/a`,
      `${FIXTURES_BASE}/items/ab`,
    ]);
    const [slow, fast] = list;
    expect(slow).toMatchObject({ state: "ok", stale: true, duplicateOf: null });
    expect(fast).toMatchObject({ state: "ok", stale: false, duplicateOf: null });
    expect(slow.calledFrom).toEqual(fast.calledFrom);
    expect(slow.duration).toBeGreaterThan(fast.duration);

    // The stale response opens its own trace; the setter it leads to lands in that trace, or in
    // a trace of its own when reading the body took longer than the frame that closes a trace.
    const all = traces(await messages(page));
    const staleTrace = all.find(responseEntry(slow.id));
    expect(staleTrace.event).toBeNull();
    expect(staleTrace.entries[0]).toMatchObject({
      kind: "response",
      requestId: slow.id,
      state: "ok",
      status: 200,
      stale: true,
      duplicateOf: null,
    });
    expect(staleTrace.entries[0].duration).toBeGreaterThanOrEqual(300);
    const overwrite = all
      .slice(all.indexOf(staleTrace))
      .flatMap((trace) => trace.entries)
      .find((entry) => entry.kind === "setter" && entry.next === "a");
    expect(overwrite).toMatchObject({ component: "Search", hook: 1, previous: "ab", next: "a" });
    expect(findResponse(all, fast.id).entry.stale).toBe(false);
  });

  test("a fetch from an effect runs after the keystroke's trace closed, so only its response is traced", async ({
    page,
  }) => {
    const result = await runRequests(page);
    await settled(page, 2);
    const before = traces(result.messages).length;
    const frame = resultFrame(page);
    await frame.locator("#query").fill("ab");
    const keystroke = await traceAt(page, before);
    expect(keystroke).toMatchObject({
      event: { type: "change", target: "<input#query>", handlerOwner: "Search" },
      entries: [{ kind: "setter", component: "Search", hook: 0, previous: "", next: "ab" }],
      rendered: ["Search"],
    });
    expect(keystroke.entries.some((entry) => entry.kind === "request")).toBe(false);

    await expect(frame.locator("#result")).toHaveText("Results for ab");
    const [record] = (await records(page)).slice(2);
    expect(record).toMatchObject({ url: `${FIXTURES_BASE}/items/ab`, state: "ok" });
    await expect
      .poll(async () => traces(await messages(page)).some(responseEntry(record.id)))
      .toBe(true);
    const response = traces(await messages(page)).find(responseEntry(record.id));
    expect(response.event).toBeNull();
    expect(response.seq).toBeGreaterThan(keystroke.seq);
    expect(response.entries[0]).toMatchObject({ kind: "response", state: "ok", status: 200 });
  });

  test("without the inspector the records still carry stale and duplicateOf", async ({ page }) => {
    await runRequests(page, false);
    const list = await settled(page, 2);
    expect(list[1].duplicateOf).toBe(list[0].id);
    expect(traces(await messages(page))).toEqual([]);
  });
});
