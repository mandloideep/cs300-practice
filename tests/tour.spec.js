// Onboarding (docs/CONTRACTS.md section 7.6): the five-stop tour of the step page, opened once per
// browser and again from the header, and the home-page card for new visitors. The tour does not
// open on its own in an automated browser, so the tests that need it pretend not to be one.

/* global document */

import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PROGRESS_KEY = "cs300-lab:progress";
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const EDIT_STEP = "#/topic/jsx-rules/1";

function asAPerson(page) {
  return page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false });
  });
}

function readProgress(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), PROGRESS_KEY);
}

async function outlined(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll(".tour-target")].map(
      (element) =>
        [...element.classList].find((name) => name.startsWith("pane--")) ?? element.textContent,
    ),
  );
}

test.describe("the step-page tour", () => {
  test("opens once on the first edit step and walks the five stops", async ({ page }) => {
    await asAPerson(page);
    await page.goto(EDIT_STEP);
    const tour = page.getByRole("dialog", { name: "Tour of the step page" });
    await expect(tour).toBeVisible({ timeout: 15_000 });
    await expect(tour).toContainText("Stop 1 of 5");
    await expect(tour.getByRole("heading", { name: "The explanation" })).toBeVisible();
    await expect(tour.getByRole("button", { name: "Next" })).toBeFocused();
    expect(await outlined(page)).toEqual(["pane--explanation"]);
    await expect(tour.getByRole("button", { name: "Back" })).toHaveCount(0);

    const expected = [
      ["The editor", ["pane--editor"]],
      ["Run", ["Run"]],
      ["The result", ["pane--result"]],
      ["The console and the checks", ["pane--console", "pane--checks"]],
    ];
    for (const [index, [title, targets]] of expected.entries()) {
      await page.keyboard.press("Enter");
      await expect(tour).toContainText(`Stop ${index + 2} of 5`);
      await expect(tour.getByRole("heading", { name: title })).toBeVisible();
      expect(await outlined(page)).toEqual(targets);
    }
    await expect(tour.getByRole("button", { name: "Skip the tour" })).toHaveCount(0);
    await tour.getByRole("button", { name: "Back" }).click();
    await expect(tour).toContainText("Stop 4 of 5");
    await tour.getByRole("button", { name: "Next" }).click();

    const results = await new AxeBuilder({ page }).withTags(TAGS).include("dialog[open]").analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);

    await tour.getByRole("button", { name: "Finish" }).click();
    await expect(tour).toBeHidden();
    expect(await outlined(page)).toEqual([]);
    expect(typeof (await readProgress(page)).tour.stepPage).toBe("string");

    await page.reload();
    await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
      timeout: 15_000,
    });
    await page.waitForTimeout(500);
    await expect(tour).toBeHidden();
  });

  test("Skip and Escape end it, and the header's Tour button opens it again", async ({ page }) => {
    await asAPerson(page);
    await page.goto(EDIT_STEP);
    const tour = page.getByRole("dialog", { name: "Tour of the step page" });
    await expect(tour).toBeVisible({ timeout: 15_000 });
    await tour.getByRole("button", { name: "Next" }).click();
    await tour.getByRole("button", { name: "Skip the tour" }).click();
    await expect(tour).toBeHidden();
    expect(typeof (await readProgress(page)).tour.stepPage).toBe("string");

    const button = page.getByRole("banner").getByRole("button", { name: "Tour" });
    await button.click();
    await expect(tour).toContainText("Stop 1 of 5");
    await page.keyboard.press("Escape");
    await expect(tour).toBeHidden();
    await expect(button).toBeFocused();
  });

  test("the Tour button appears only on edit steps, and automation is not interrupted", async ({
    page,
  }) => {
    await page.goto(EDIT_STEP);
    await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
      timeout: 15_000,
    });
    await expect(page.getByRole("dialog", { name: "Tour of the step page" })).toBeHidden();
    await expect(page.getByRole("banner").getByRole("button", { name: "Tour" })).toBeVisible();

    await page.goto("#/topic/react-mental-model/4");
    await expect(page.getByRole("button", { name: "Mark this step as read" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("button", { name: "Tour" })).toHaveCount(0);
    await page.goto("#/");
    await expect(page.getByRole("banner").getByRole("button", { name: "Tour" })).toHaveCount(0);
  });
});

test.describe("the home-page card", () => {
  async function serveWelcomeTopic(page) {
    await page.route("**/content/index.json", async (route) => {
      const response = await route.fetch();
      const index = await response.json();
      index.topics.unshift({
        id: "using-the-lab",
        title: "Using the lab",
        area: "tooling",
        summary: "How a step page works.",
        prerequisites: [],
        minutes: 15,
        updated: "2026-10-27",
        changeNote: "First version.",
        links: null,
        steps: [
          { n: 1, slug: "what-a-step-page-is", title: "What a step page is", mode: "read" },
          { n: 2, slug: "your-first-edit", title: "Your first edit", mode: "edit" },
        ],
      });
      await route.fulfill({ response, json: index });
    });
  }

  test("links to Using the lab until it is hidden", async ({ page }) => {
    await serveWelcomeTopic(page);
    await page.goto("#/");
    const card = page.getByRole("region", { name: "New to the lab?" });
    await expect(card).toBeVisible();
    await expect(card.getByRole("link", { name: "Start Using the lab" })).toHaveAttribute(
      "href",
      "#/topic/using-the-lab",
    );
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);

    await card.getByRole("button", { name: "Hide this card" }).click();
    await expect(card).toHaveCount(0);
    await expect(page.locator("#main-content")).toBeFocused();
    expect(typeof (await readProgress(page)).tour.homeCard).toBe("string");
    await page.reload();
    await expect(page.getByRole("heading", { name: "CS300 Lab" })).toBeVisible();
    await expect(card).toHaveCount(0);
  });

  test("is gone once every step of Using the lab is complete", async ({ page }) => {
    await serveWelcomeTopic(page);
    await page.addInitScript((key) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 2,
          completed: {
            "using-the-lab/1": "2026-10-27T00:00:00Z",
            "using-the-lab/2": "2026-10-27T00:00:00Z",
          },
          files: {},
          pathId: null,
        }),
      );
    }, PROGRESS_KEY);
    await page.goto("#/");
    await expect(page.getByRole("heading", { name: "CS300 Lab" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "All topics" })).toBeVisible();
    await expect(page.getByRole("region", { name: "New to the lab?" })).toHaveCount(0);
  });

  test("is absent while the build has no Using the lab topic", async ({ page }) => {
    await page.route("**/content/index.json", async (route) => {
      const response = await route.fetch();
      const index = await response.json();
      index.topics = index.topics.filter((topic) => topic.id !== "using-the-lab");
      await route.fulfill({ response, json: index });
    });
    await page.goto("#/");
    await expect(page.getByRole("heading", { name: "All topics" })).toBeVisible();
    await expect(page.getByRole("region", { name: "New to the lab?" })).toHaveCount(0);
  });
});
