// Step page tests. They drive the real site at #/topic/<id>/<n>, the way a student uses it:
// load the solution, run it, and read the check panel and console pane.

import { existsSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { allSteps, stepById } from "./lib/steps.js";
import { openHarness, resultFrame, runStep } from "./support/harness.js";

// Console errors a solution produces on purpose, because the step teaches them.
const EXPECTED_CONSOLE_ERRORS = {
  "lists-and-keys/01-render-with-map": [/unique "key" prop/],
};

// Solutions that import react-router run only once the Phase 3 runtime branch (PHASE3 milestone 1)
// adds public/runtime/wrap/react-router.js, which maps BrowserRouter onto a memory history inside
// the sandboxed iframe; until then BrowserRouter sees the location "srcdoc" and matches no route.
const ROUTER_WRAPPER = existsSync(
  path.join(import.meta.dirname, "..", "public", "runtime", "wrap", "react-router.js"),
);
const NEEDS_RUNTIME_ROUTER =
  "needs the Phase 3 runtime branch: public/runtime/wrap/react-router.js (PHASE3 milestone 1)";

// The toggle label of each inspector view the pane renders.
const VIEW_LABELS = {
  boundaries: "Boundaries",
  flash: "Re-render flash",
  tree: "Tree and state",
  flow: "Flow trace",
};

const steps = allSteps();

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("cs300-test:cleared")) {
      localStorage.clear();
      sessionStorage.setItem("cs300-test:cleared", "1");
    }
  });
});

async function openStep(page, step) {
  await page.goto(`#/topic/${step.topic}/${step.n}`);
  await expect(page.locator("#step-heading")).toHaveText(step.title);
  await expect(page.locator(".step-content")).not.toBeEmpty();
}

test.describe("edit steps run their solution on the step page", () => {
  for (const step of steps.filter((candidate) => candidate.mode === "edit")) {
    test(step.id, async ({ page }) => {
      test.fixme(step.usesRouter && !ROUTER_WRAPPER, NEEDS_RUNTIME_ROUTER);
      await openStep(page, step);
      const status = page.locator(".pane--result .status-pill");
      await expect(status).toHaveText("Ready", { timeout: 15_000 });

      await page.getByRole("button", { name: "Show solution" }).click();
      await page.getByRole("button", { name: "Load solution" }).click();
      await expect(page.getByRole("dialog")).toBeHidden();
      await page
        .getByRole("toolbar", { name: "Workspace actions" })
        .getByRole("button", { name: "Run", exact: true })
        .click();
      await expect(status).toHaveText("Ready", { timeout: 15_000 });
      await expect(page.locator(".check-summary")).toBeVisible({ timeout: 15_000 });

      const result = page.frameLocator(".result-frame").locator("body");
      await expect(result).not.toBeEmpty();

      const expected = EXPECTED_CONSOLE_ERRORS[step.id] ?? [];
      const errors = await page.locator(".console-entry--error pre").allInnerTexts();
      expect(
        errors.filter((text) => !expected.some((pattern) => pattern.test(text))),
        "errors in the console pane",
      ).toEqual([]);

      if (!step.hasCheck) return;
      const required = step.required ?? step.checkIds;
      for (const id of required)
        expect(step.checkIds, `${id} is a check the step returns`).toContain(id);
      await expect(page.locator(".check"), "one row per check").toHaveCount(step.checkIds.length);
      await expect(
        page.locator(".check--fail .required-badge"),
        "required checks failing",
      ).toHaveCount(0);
      await expect(
        page.locator(".check--pass .required-badge"),
        "required checks passing",
      ).toHaveCount(required.length);
      await expect(page.locator(".check-summary")).toContainText("Every required check passes");
    });
  }
});

test.describe("the inspector opens on the views the step names", () => {
  for (const step of steps.filter((candidate) => candidate.inspector?.views?.length > 0)) {
    test(step.id, async ({ page }) => {
      await openStep(page, step);
      const pane = page.locator(".pane--inspector");
      if (step.usesReact) {
        await expect(pane.getByText(/components? · commit/)).toBeVisible({ timeout: 15_000 });
      } else {
        // A vanilla workspace renders no React components, so once the run settles the pane
        // says so instead of showing a commit; its view toggles still follow the front matter.
        await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
          timeout: 15_000,
        });
        await expect(pane.getByText("No components yet")).toBeVisible();
        await expect(pane.getByText(/No React components rendered/)).toBeVisible();
      }
      for (const [view, label] of Object.entries(VIEW_LABELS)) {
        await expect(pane.getByRole("button", { name: label })).toHaveAttribute(
          "aria-pressed",
          String(step.inspector.views.includes(view)),
        );
      }
    });
  }
});

test.describe("read and local steps", () => {
  for (const step of steps.filter((candidate) => candidate.mode !== "edit")) {
    test(step.id, async ({ page }) => {
      await openStep(page, step);
      await expect(page.locator(".code-editor")).toHaveCount(0);
      if (step.mode !== "local") {
        await expect(page.getByRole("button", { name: "Mark this step as read" })).toBeVisible();
        return;
      }
      const download = page.getByRole("button", { name: "Download this workspace" });
      await expect(download).toHaveCount(step.hasLocal ? 1 : 0);
      if (!step.hasLocal) return;
      const [file] = await Promise.all([page.waitForEvent("download"), download.click()]);
      expect(file.suggestedFilename()).toBe(`${step.topic}-step-${step.n}.zip`);
    });
  }
});

// The dom-events storage step, driven through the harness because the assertion is about what a
// second run of the same workspace sees: `run({ preserveStorage: true })` (CONTRACTS 4.5) keeps
// the iframe's localStorage, which the step page offers as "Run, keeping saved data", and a plain
// run clears it. The iframe's storage is a view scoped under the sandbox prefix, so the harness
// page clears the workspace's key through that prefix.
test.describe("the dom-events list survives a run that keeps saved data", () => {
  const STEP = "dom-events/08-remember-with-localstorage";
  const KEY = "cs300-lab:sandbox:project-browser";

  test("step 8 solution: a project added before a preserving run is still listed", async ({
    page,
  }) => {
    await openHarness(page);
    await page.evaluate((key) => localStorage.removeItem(key), KEY);
    const first = await runStep(page, STEP, "solution");
    expect(first.diagnostics).toEqual([]);
    const frame = resultFrame(page);
    await expect(frame.locator("#project-list li")).toHaveCount(3);
    await frame.locator("#new-title").fill("Portfolio");
    await frame.locator("#add-form button").click();
    await expect(frame.locator("#project-list li")).toHaveCount(4);

    const second = await runStep(page, STEP, "solution", { preserveStorage: true });
    expect(second.diagnostics).toEqual([]);
    const kept = resultFrame(page);
    await expect(kept.locator("#project-list li")).toHaveCount(4);
    await expect(kept.locator("#project-list li .title").last()).toHaveText("Portfolio");

    await runStep(page, STEP, "solution");
    await expect(resultFrame(page).locator("#project-list li")).toHaveCount(3);
  });
});

// The flow trace of a lifting-state interaction, read from the bridge's `flow` messages the way
// the inspector tests read `inspector` commits (CONTRACTS 4.3).
test.describe("the flow trace of a lifting-state interaction", () => {
  const traces = async (page) =>
    (await page.evaluate(() => globalThis.__harness.messages()))
      .filter((message) => message.type === "flow")
      .map((message) => message.trace);

  test("step 4 solution: a submit in the child form traces the event, onAdd, setItems, and the render set", async ({
    page,
  }) => {
    const step = stepById("events-and-lifting-state/04-add-to-a-list-in-the-parent");
    await openHarness(page);
    const result = await runStep(page, step.id, "solution");
    expect(result.diagnostics).toEqual([]);

    const frame = resultFrame(page);
    await frame.locator('input[name="title"]').fill("Kiwi");
    await frame.locator('input[name="price"]').fill("2.49");
    const before = (await traces(page)).length;
    await frame.getByRole("button", { name: "Add product" }).click();
    await expect.poll(async () => (await traces(page)).length).toBeGreaterThan(before);

    const trace = (await traces(page)).at(-1);
    expect(trace.event).toMatchObject({ type: "submit", handlerOwner: "AddProductForm" });
    expect(trace.entries.map((entry) => entry.kind)).toEqual(["prop-call", "setter"]);
    expect(trace.entries[0]).toMatchObject({
      prop: "onAdd",
      passedBy: "App",
      calledIn: "AddProductForm",
    });
    expect(trace.entries[1]).toMatchObject({ component: "App", hookName: "useState" });
    expect(trace.rendered).toEqual(expect.arrayContaining(["App", "ProductList"]));
    expect(trace.commitSeq).toEqual(expect.any(Number));
    await expect(frame.locator(".product").last().locator("h3")).toHaveText("Kiwi");
  });
});

// The routing topics' solutions, driven through the harness: what a Link click renders is read
// from the DOM, because the result pane's address bar and the `location` message (CONTRACTS 4.3)
// arrive with the Phase 3 runtime branch.
test.describe("routing solutions in the iframe", () => {
  const locations = async (page) =>
    (await page.evaluate(() => globalThis.__harness.messages())).filter(
      (message) => message.type === "location",
    );

  test("routing step 1 solution: clicking the Products link renders the other route's content", async ({
    page,
  }) => {
    test.fixme(!ROUTER_WRAPPER, NEEDS_RUNTIME_ROUTER);
    const step = stepById("routing/01-two-pages-with-routes-and-link");
    await openHarness(page);
    const result = await runStep(page, step.id, "solution");
    expect(result.diagnostics).toEqual([]);

    const frame = resultFrame(page);
    await expect(frame.locator("main h1")).toHaveText("Welcome to the shop");
    await frame.getByRole("link", { name: "Products" }).click();
    await expect(frame.locator("main h1")).toHaveText("Products");
    await expect(frame.locator(".product-list li")).toHaveCount(6);
    await frame.getByRole("link", { name: "Home" }).click();
    await expect(frame.locator("main h1")).toHaveText("Welcome to the shop");
  });

  test("routing step 4 solution: an address that matches no route renders NotFoundPage", async ({
    page,
  }) => {
    test.fixme(!ROUTER_WRAPPER, NEEDS_RUNTIME_ROUTER);
    const step = stepById("routing/04-a-catch-all-route");
    await openHarness(page);
    const result = await runStep(page, step.id, "solution");
    expect(result.diagnostics).toEqual([]);

    const frame = resultFrame(page);
    await frame.getByRole("link", { name: "Deals" }).click();
    await expect(frame.locator("main h1")).toHaveText("Page not found");
    await frame.getByRole("link", { name: "Go to the home page" }).click();
    await expect(frame.locator("main h1")).toHaveText("Welcome to the shop");
  });

  test("routing step 1 solution: the Link click posts a location message for /products", async ({
    page,
  }) => {
    const step = stepById("routing/01-two-pages-with-routes-and-link");
    await openHarness(page);
    const result = await runStep(page, step.id, "solution");
    expect(result.diagnostics).toEqual([]);
    const before = (await locations(page)).length;
    await resultFrame(page).getByRole("link", { name: "Products" }).click();
    await expect.poll(async () => (await locations(page)).length).toBeGreaterThan(before);
    expect((await locations(page)).at(-1)).toMatchObject({ pathname: "/products", search: "" });
  });

  // Same dependency on the runtime branch's `location` message.
  test("url-state step 2 solution: the search and the category are written to the location", async ({
    page,
  }) => {
    const step = stepById("url-state/02-a-category-filter-that-survives-back");
    await openHarness(page);
    const result = await runStep(page, step.id, "solution");
    expect(result.diagnostics).toEqual([]);
    const frame = resultFrame(page);
    await frame.getByRole("link", { name: "Products" }).click();
    await expect(frame.locator(".product-list li")).toHaveCount(8);
    await frame.getByRole("combobox").selectOption("fragrances");
    await frame.getByRole("searchbox").fill("coco");
    await expect(frame.locator(".product-list li")).toHaveCount(1);
    await expect
      .poll(async () => (await locations(page)).at(-1)?.search)
      .toBe("?category=fragrances&q=coco");
  });
});
