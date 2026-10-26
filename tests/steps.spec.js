// Step page tests. They drive the real site at #/topic/<id>/<n>, the way a student uses it:
// load the solution, run it, and read the check panel and console pane.

import { expect, test } from "@playwright/test";
import { allSteps } from "./lib/steps.js";

// Console errors a solution produces on purpose, because the step teaches them.
const EXPECTED_CONSOLE_ERRORS = {
  "lists-and-keys/01-render-with-map": [/unique "key" prop/],
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
      if (step.checkDependsOn.length > 0) {
        test.info().annotations.push({
          type: "checks not asserted",
          description: `check.js reads ${step.checkDependsOn.join(" and ")}, which is not delivered yet`,
        });
        return;
      }
      await expect(
        page.locator(".check--fail .required-badge"),
        "required checks failing",
      ).toHaveCount(0);
      await expect(page.locator(".check-summary")).toContainText("Every required check passes");
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
