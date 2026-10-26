// The persistence topic's reload checks. They drive the runner harness because the assertion
// is about what a second run of the same workspace sees in localStorage, which the in-iframe
// check.js of a step cannot observe: `run({ preserveStorage: true })` (CONTRACTS 4.5) keeps the
// iframe's storage for the next run, and a plain `run()` clears it first.

import { expect, test } from "@playwright/test";
import { openHarness, resultFrame, runStep } from "./support/harness.js";

const READ_STEP = "persistence/02-read-it-back-on-load";
const VERSIONED_STEP = "persistence/03-version-the-stored-shape";
const KEY = "saved-for-later";

const problems = (result) =>
  result.messages
    .filter((message) => message.type === "error" || message.type === "rejection")
    .map((message) => message.message);

async function saveFirstProduct(page) {
  const frame = resultFrame(page);
  await frame.locator(".save").first().click();
  await expect(frame.locator('.save[aria-pressed="true"]')).toHaveCount(1);
}

test.describe("saved products survive a reload of the iframe", () => {
  test.beforeEach(async ({ page }) => {
    await openHarness(page);
    await page.evaluate((key) => localStorage.removeItem(key), KEY);
  });

  test("step 2 solution: a run that preserves storage starts with the saved product marked", async ({
    page,
  }) => {
    const first = await runStep(page, READ_STEP, "solution");
    expect(first.diagnostics).toEqual([]);
    await saveFirstProduct(page);

    const second = await runStep(page, READ_STEP, "solution", { preserveStorage: true });
    expect(problems(second)).toEqual([]);
    const frame = resultFrame(page);
    await expect(frame.locator('.save[aria-pressed="true"]')).toHaveCount(1);
    await expect(frame.locator(".save").first()).toHaveAttribute("aria-pressed", "true");
    await expect(frame.locator(".lead")).toHaveText("1 of 6 products saved for later.");
  });

  // The runner does not clear the iframe's storage yet: `preserveStorage` on run() is pinned in
  // CONTRACTS 4.5 and lands with the Phase 3 runtime branch (PHASE3.md milestones 1 and 2).
  // Drop the fixme once that branch is merged and the harness passes the flag through.
  test.fixme("step 2 solution: a plain run starts from empty storage", async ({ page }) => {
    await runStep(page, READ_STEP, "solution");
    await saveFirstProduct(page);

    await runStep(page, READ_STEP, "solution");
    const frame = resultFrame(page);
    await expect(frame.locator('.save[aria-pressed="true"]')).toHaveCount(0);
    await expect(frame.locator(".lead")).toHaveText("0 of 6 products saved for later.");
  });

  test("step 3 solution: an old-style array in storage starts the page clean instead of crashing", async ({
    page,
  }) => {
    await page.evaluate((key) => localStorage.setItem(key, "[1,6]"), KEY);
    const result = await runStep(page, VERSIONED_STEP, "solution", { preserveStorage: true });
    expect(result.diagnostics).toEqual([]);
    expect(problems(result)).toEqual([]);

    const frame = resultFrame(page);
    await expect(frame.locator('.save[aria-pressed="true"]')).toHaveCount(0);
    await expect(frame.locator(".lead")).toHaveText("0 of 6 products saved for later.");

    await saveFirstProduct(page);
    const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY);
    expect(stored).toEqual({ version: 1, ids: [1] });

    const again = await runStep(page, VERSIONED_STEP, "solution", { preserveStorage: true });
    expect(problems(again)).toEqual([]);
    await expect(resultFrame(page).locator(".save").first()).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
