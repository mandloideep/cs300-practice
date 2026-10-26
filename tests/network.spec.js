// Network tests: the fetch shim in the result iframe (fixture routing, the failure controls,
// request records and their messages) driven through the runner harness, and the API source
// selector on the real step page sending set-api to the running iframe.

import { expect, test } from "@playwright/test";

const HARNESS = "src/runner/harness/index.html";
const FETCH_STEP = "lists-and-keys/05-fetch-products";
const STEP_PAGE = "#/topic/lists-and-keys/5";
const FIXTURES_BASE = "https://fixtures.local";
const CONTROLS = { latencyMs: 0, errorStatus: null, malformedBody: false, dropConnection: false };

async function openHarness(page) {
  await page.goto(HARNESS);
  await page.waitForFunction(() => globalThis.__harness?.ready === true);
}

function runStep(page, options = {}) {
  return page.evaluate(
    ([id, runOptions]) => globalThis.__harness.runStep(id, "solution", runOptions),
    [FETCH_STEP, options],
  );
}

function run(page, options) {
  return page.evaluate((runOptions) => globalThis.__harness.run(runOptions), options);
}

function resultFrame(page) {
  return page.frames().find((frame) => frame.parentFrame() === page.mainFrame());
}

// Every network message of the run, grouped by request id, in arrival order.
function requestsOf(result) {
  const byId = new Map();
  for (const message of result.messages) {
    if (message.type !== "network") continue;
    const list = byId.get(message.request.id) ?? [];
    list.push(message.request);
    byId.set(message.request.id, list);
  }
  return [...byId.values()];
}

function settledProductRequests(result) {
  return requestsOf(result).filter(
    (updates) =>
      new URL(updates[0].url).pathname === "/products" && updates.at(-1).state !== "aborted",
  );
}

function checkResults(result) {
  return result.messages.find((message) => message.type === "check-results")?.results ?? [];
}

const index = `<!doctype html>
<html lang="en">
  <head>
    <title>Network</title>
  </head>
  <body>
    <button type="button" id="go">Go</button>
    <pre id="out"></pre>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;

const fixtures = {
  routes: [
    { method: "GET", path: "/items", body: "items.json" },
    { method: "GET", path: "/items/:id", status: 200, body: { id: "one" } },
    { method: "POST", path: "/items", status: 201, body: { ok: true } },
    { method: "GET", path: "/slow", delay: 400, body: { slow: true } },
  ],
  bodies: { "items.json": '[{"id":1},{"id":2}]' },
};

// A workspace that fetches one path when it starts, and another when the button is pressed.
function fetchWorkspace(startPath, clickPath = startPath, init = "{}") {
  return {
    "index.html": index,
    "src/main.js": `const out = document.getElementById("out");
async function load(path) {
  try {
    const response = await fetch(import.meta.env.API_BASE + path, ${init});
    const text = await response.text();
    out.textContent = response.status + " " + text;
  } catch (error) {
    out.textContent = error.name + ": " + error.message;
  }
}
load(${JSON.stringify(startPath)});
document.getElementById("go").addEventListener("click", () => load(${JSON.stringify(clickPath)}));
`,
  };
}

function waitForRequests(page, count) {
  return resultFrame(page).waitForFunction(
    (n) =>
      globalThis.__LAB__.network.length >= n &&
      globalThis.__LAB__.network.every((request) => request.state !== "pending"),
    count,
  );
}

test.describe("fetch step on fixtures", () => {
  test.beforeEach(async ({ page }) => openHarness(page));

  test("the request goes pending then ok, and the checks pass", async ({ page }) => {
    const result = await runStep(page);
    expect(result.timedOut).toBe(false);
    const settled = settledProductRequests(result);
    expect(settled).toHaveLength(1);
    const updates = settled[0];
    expect(updates[0]).toMatchObject({
      method: "GET",
      url: `${FIXTURES_BASE}/products?limit=8`,
      source: "fixtures",
      state: "pending",
      status: null,
    });
    const last = updates.at(-1);
    expect(last).toMatchObject({
      state: "ok",
      status: 200,
      contentType: expect.stringContaining("application/json"),
      calledFrom: { file: "src/api.js", line: 2 },
      error: null,
    });
    expect(last.bodyPreview).toMatch(/^\{\s*"products"/);
    expect(last.bodyPreview.length).toBeLessThanOrEqual(300);
    expect(last.duration).toBeGreaterThanOrEqual(0);

    const results = checkResults(result);
    for (const id of ["one-products-request", "uses-api-base", "products-render"]) {
      const found = results.find((item) => item.id === id);
      expect(found?.pass, `check ${id}: ${found?.hint}`).toBe(true);
    }
  });

  test("errorStatus answers an HTTP error", async ({ page }) => {
    const result = await runStep(page, { fixtureControls: { ...CONTROLS, errorStatus: 500 } });
    const last = settledProductRequests(result)[0].at(-1);
    expect(last).toMatchObject({ state: "http-error", status: 500 });
    expect(last.bodyPreview).toContain("500");
    await expect(resultFrame(page).locator('[role="alert"]')).toContainText("status 500");
  });

  test("malformedBody makes response.json() a parse error", async ({ page }) => {
    const result = await runStep(page, { fixtureControls: { ...CONTROLS, malformedBody: true } });
    const updates = settledProductRequests(result)[0];
    expect(updates.map((update) => update.state)).toContain("ok");
    expect(updates.at(-1)).toMatchObject({ state: "parse-error", status: 200 });
    expect(updates.at(-1).error).toBeTruthy();
    await expect(resultFrame(page).locator('[role="alert"]')).toBeVisible();
  });

  test("dropConnection fails like a real network failure", async ({ page }) => {
    const result = await runStep(page, { fixtureControls: { ...CONTROLS, dropConnection: true } });
    const last = settledProductRequests(result)[0].at(-1);
    expect(last).toMatchObject({ state: "network-error", status: null });
    expect(last.error).toBe("TypeError: Failed to fetch");
    await expect(resultFrame(page).locator('[role="alert"]')).toContainText("Failed to fetch");
  });

  test("the development double effect aborts the first request", async ({ page }) => {
    const result = await runStep(page);
    const states = requestsOf(result).map((updates) => updates.at(-1).state);
    expect(states).toEqual(["aborted", "ok"]);
  });
});

test.describe("fixture routing", () => {
  test.beforeEach(async ({ page }) => openHarness(page));

  test("an unknown route answers 404 with the contract's error body", async ({ page }) => {
    await run(page, {
      files: fetchWorkspace("/nope?x=1"),
      entry: "src/main.js",
      fixtures,
      env: { API_BASE: FIXTURES_BASE },
    });
    await waitForRequests(page, 1);
    const frame = resultFrame(page);
    await expect(frame.locator("#out")).toHaveText(
      '404 {"error":"No fixture route for GET /nope"}',
    );
    const [record] = await frame.evaluate(() => globalThis.__LAB__.network);
    expect(record).toMatchObject({ state: "http-error", status: 404, source: "fixtures" });
  });

  test("routes match by method and path with :params, ignoring the query", async ({ page }) => {
    await run(page, {
      files: fetchWorkspace("/items?page=2", "/items/abc"),
      entry: "src/main.js",
      fixtures,
      env: { API_BASE: FIXTURES_BASE },
    });
    const frame = resultFrame(page);
    await expect(frame.locator("#out")).toHaveText('200 [{"id":1},{"id":2}]');
    await frame.locator("#go").click();
    await expect(frame.locator("#out")).toHaveText('200 {"id":"one"}');

    await run(page, {
      files: fetchWorkspace("/items", "/items", '{ method: "POST" }'),
      entry: "src/main.js",
      fixtures,
      env: { API_BASE: FIXTURES_BASE },
    });
    await expect(resultFrame(page).locator("#out")).toHaveText('201 {"ok":true}');
  });

  test("a route delay adds to the latency control", async ({ page }) => {
    await run(page, {
      files: fetchWorkspace("/slow"),
      entry: "src/main.js",
      fixtures,
      env: { API_BASE: FIXTURES_BASE },
      fixtureControls: { ...CONTROLS, latencyMs: 300 },
    });
    await waitForRequests(page, 1);
    const [record] = await resultFrame(page).evaluate(() => globalThis.__LAB__.network);
    expect(record.state).toBe("ok");
    expect(record.duration).toBeGreaterThanOrEqual(650);
  });

  test("an aborted fixture request ends as aborted", async ({ page }) => {
    await run(page, {
      files: {
        "index.html": index,
        "src/main.js": `const controller = new AbortController();
fetch(import.meta.env.API_BASE + "/slow", { signal: controller.signal }).catch((error) => {
  document.getElementById("out").textContent = error.name;
});
setTimeout(() => controller.abort(), 50);
`,
      },
      entry: "src/main.js",
      fixtures,
      env: { API_BASE: FIXTURES_BASE },
    });
    await waitForRequests(page, 1);
    const frame = resultFrame(page);
    await expect(frame.locator("#out")).toHaveText("AbortError");
    const [record] = await frame.evaluate(() => globalThis.__LAB__.network);
    expect(record.state).toBe("aborted");
  });

  test("set-api changes the base and the controls for the next request", async ({ page }) => {
    await run(page, {
      files: fetchWorkspace("/items"),
      entry: "src/main.js",
      fixtures,
      env: { API_BASE: FIXTURES_BASE },
    });
    const frame = resultFrame(page);
    await expect(frame.locator("#out")).toHaveText('200 [{"id":1},{"id":2}]');
    await page.evaluate(
      (controls) =>
        globalThis.__harness.send({
          type: "set-api",
          env: { API_BASE: "https://fixtures.local", API_SOURCE: "fixtures" },
          fixtureControls: controls,
        }),
      { ...CONTROLS, errorStatus: 503 },
    );
    await frame.locator("#go").click();
    await expect(frame.locator("#out")).toContainText("503");
    await waitForRequests(page, 2);
    const records = await frame.evaluate(() => globalThis.__LAB__.network);
    expect(records.map((record) => record.state)).toEqual(["ok", "http-error"]);
  });

  test("requests outside the chosen base are marked other", async ({ page }) => {
    await run(page, {
      files: {
        "index.html": index,
        "src/main.js": `fetch("https://elsewhere.invalid/data").catch(() => {});\n`,
      },
      entry: "src/main.js",
      env: { API_BASE: "https://api.example.test", API_SOURCE: "preset" },
    });
    await waitForRequests(page, 1);
    const [record] = await resultFrame(page).evaluate(() => globalThis.__LAB__.network);
    expect(record).toMatchObject({ source: "other", state: "network-error" });
  });
});

test.describe("API source selector on the step page", () => {
  test("changing the source or a control sends set-api to the running iframe", async ({ page }) => {
    await page.goto(STEP_PAGE);
    const result = page.frameLocator("iframe.result-frame");
    await expect(result.locator("body")).toContainText("Product list");
    const frame = page.frames().find((candidate) => candidate.url().startsWith("about:srcdoc"));
    await frame.evaluate(() => {
      globalThis.__received = [];
      globalThis.addEventListener("message", (event) => {
        if (event.data?.type === "set-api") globalThis.__received.push(event.data);
      });
    });

    await page.getByLabel("HTTP error").selectOption("500");
    await expect
      .poll(() => frame.evaluate(() => globalThis.__received.at(-1)?.fixtureControls?.errorStatus))
      .toBe(500);
    expect(await frame.evaluate(() => globalThis.__LAB__.fixtureControls.errorStatus)).toBe(500);

    await page.getByLabel("Requests go to").selectOption("preset:dummyjson");
    await expect
      .poll(() => frame.evaluate(() => globalThis.__received.at(-1)?.env))
      .toMatchObject({ API_BASE: "https://dummyjson.com", API_SOURCE: "preset" });
    expect(await frame.evaluate(() => globalThis.__LAB_ENV__.API_BASE)).toBe(
      "https://dummyjson.com",
    );

    await expect(page.getByRole("heading", { name: "Network" })).toBeVisible();
    await expect(page.locator(".network-source")).toContainText("DummyJSON");
    await expect(page.getByText("About DummyJSON")).toBeVisible();
  });

  test("the network pane lists the request and jumps to its line", async ({ page }) => {
    await page.goto(STEP_PAGE);
    await page.getByRole("button", { name: "Show solution" }).click();
    await page.getByRole("button", { name: "Load solution" }).click();
    const row = page.locator(".network-row--ok");
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("/products?limit=8");
    await expect(row).toContainText("200");
    await row.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".cm-activeLine")).toContainText("await fetch(");
    await page.getByRole("button", { name: "Clear" }).last().click();
    await expect(page.locator(".network-row")).toHaveCount(0);
    await expect(page.locator(".network-empty")).toContainText("Fixtures");
  });
});
