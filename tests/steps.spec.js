// Step page tests. They drive the real site at #/topic/<id>/<n>, the way a student uses it:
// load the solution, run it, and read the check panel and console pane.

import { expect, test } from "@playwright/test";
import { allSteps, stepById } from "./lib/steps.js";
import { openHarness, resultFrame, runStep } from "./support/harness.js";

// Console errors a solution produces on purpose, because the step teaches them.
const EXPECTED_CONSOLE_ERRORS = {
  "lists-and-keys/01-render-with-map": [/unique "key" prop/],
};

// The toggle label of each inspector view the pane renders. `flow` is pinned in CONTRACTS 4.3 and
// arrives with the inspector stream of Phase 2; until its toggle exists, a step that opens on it
// is checked for its other views only.
const VIEW_LABELS = {
  boundaries: "Boundaries",
  flash: "Re-render flash",
  tree: "Tree and state",
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
      await expect(pane.getByText(/components? · commit/)).toBeVisible({ timeout: 15_000 });
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

// The flow trace of a lifting-state interaction, read from the bridge's `flow` messages the way
// the inspector tests read `inspector` commits (CONTRACTS 4.3).
test.describe("the flow trace of a lifting-state interaction", () => {
  const traces = async (page) =>
    (await page.evaluate(() => globalThis.__harness.messages()))
      .filter((message) => message.type === "flow")
      .map((message) => message.trace);

  // The bridge does not post `flow` messages yet: the trace is built on the inspector branch of
  // Phase 2 (milestones 1 and 2). Drop the fixme once that branch is merged.
  test.fixme("step 4 solution: a submit in the child form traces the event, onAdd, setItems, and the render set", async ({
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
