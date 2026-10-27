// The explainer contract of docs/CONTRACTS.md section 7.1, for every explainer that has a
// component: it mounts on the fixture page, never plays on its own, steps from the first stage to
// the last from the keyboard, opens on the last stage under reduced motion with Back, Step, and
// Reset still working, fits a 320 pixel column, and passes axe in light and dark with motion
// allowed and reduced. The last test mounts explainers on a step page from compiled placeholders
// served in place of the step's own HTML, so it depends on no step's real text.

/* global document, requestAnimationFrame */

import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const HARNESS = "src/demos/harness/index.html";
const registry = JSON.parse(readFileSync(new URL("../src/demos/registry.json", import.meta.url)));
const built = registry.filter(({ id }) => {
  try {
    readFileSync(new URL(`../src/demos/${id}/index.jsx`, import.meta.url));
    return true;
  } catch {
    return false;
  }
});

function harness(id, extra = "") {
  return `${HARNESS}?id=${id}${extra}`;
}

async function stagePosition(frame) {
  const text = (await frame.locator(".demo-frame__position").textContent()) ?? "";
  const match = /Stage (\d+) of (\d+)/.exec(text);
  return match ? { at: Number(match[1]), total: Number(match[2]) } : { at: 1, total: 1 };
}

// Colors cross-fade between stages and after a color scheme switch; axe measures the end state,
// once a frame has passed for the switch to start its transitions.
async function settle(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.all(
      document.getAnimations().map((animation) => animation.finished.catch(() => null)),
    );
  });
}

async function expectNoViolations(page) {
  await settle(page);
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = results.violations
    .map(
      (violation) =>
        `${violation.id}: ${violation.help}\n` +
        violation.nodes.map((node) => `  ${node.target.join(" ")}`).join("\n"),
    )
    .join("\n");
  expect(summary, "axe violations").toBe("");
}

async function pressControl(frame, name) {
  const button = frame.getByRole("button", { name, exact: true });
  await button.focus();
  await button.press("Enter");
}

test("the registry lists every Phase 6 explainer once", () => {
  const ids = registry.map((entry) => entry.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids.length).toBe(68);
  for (const entry of registry) {
    expect(entry.title, entry.id).toBeTruthy();
    expect(entry.description, entry.id).toMatch(/[.!?]$/);
  }
});

for (const { id, title } of built) {
  test.describe(`${id} explainer`, () => {
    test("steps from first to last by keyboard and passes axe with motion allowed", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(harness(id));
      const frame = page.getByRole("figure", { name: title });
      await expect(frame).toBeVisible({ timeout: 15_000 });
      const { at, total } = await stagePosition(frame);
      expect(at, "starts on the first stage").toBe(1);
      await expectNoViolations(page);

      await page.waitForTimeout(2_000);
      expect((await stagePosition(frame)).at, "never plays on its own").toBe(1);

      for (let stage = 2; stage <= total; stage += 1) {
        await pressControl(frame, "Step");
        await expect(frame.locator(".demo-frame__position")).toHaveText(
          `Stage ${stage} of ${total}`,
        );
      }
      if (total > 1) {
        const step = frame.getByRole("button", { name: "Step", exact: true });
        await expect(step).toHaveAttribute("aria-disabled", "true");
        await expect(step, "focus stays on Step at the last stage").toBeFocused();
      }
      await expectNoViolations(page);
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "no-preference" });
      await expectNoViolations(page);
    });

    test("opens on the last stage under reduced motion with Back, Step, and Reset working", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(harness(id));
      const frame = page.getByRole("figure", { name: title });
      await expect(frame).toBeVisible({ timeout: 15_000 });
      const { at, total } = await stagePosition(frame);
      expect(at).toBe(total);
      await expectNoViolations(page);
      if (total > 1) {
        await pressControl(frame, "Back");
        await expect(frame.locator(".demo-frame__position")).toHaveText(
          `Stage ${total - 1} of ${total}`,
        );
        await pressControl(frame, "Reset");
        await expect(frame.locator(".demo-frame__position")).toHaveText(`Stage 1 of ${total}`);
        await pressControl(frame, "Step");
        await expect(frame.locator(".demo-frame__position")).toHaveText(`Stage 2 of ${total}`);
      }
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await expectNoViolations(page);
    });

    test("fits a 320 pixel column at every stage", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(harness(id, "&width=320"));
      const frame = page.getByRole("figure", { name: title });
      await expect(frame).toBeVisible({ timeout: 15_000 });
      const { total } = await stagePosition(frame);
      for (let stage = 1; stage <= total; stage += 1) {
        if (stage > 1) await pressControl(frame, "Step");
        const overflow = await frame.evaluate((element) => {
          const right = element.getBoundingClientRect().right + 0.5;
          return [...element.querySelectorAll("*")]
            .filter((child) => child.getBoundingClientRect().right > right)
            .map((child) => child.outerHTML.slice(0, 80));
        });
        expect(overflow, `stage ${stage} overflows the column`).toEqual([]);
        expect(await frame.evaluate((element) => element.getBoundingClientRect().width)).toBe(320);
      }
    });
  });
}

test.describe("the frame", () => {
  const sample = built[0];

  test("Play advances, Pause stops, and Play from the last stage starts over", async ({ page }) => {
    test.skip(!sample, "no explainer is built yet");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(harness(sample.id));
    const frame = page.getByRole("figure", { name: sample.title });
    const position = frame.locator(".demo-frame__position");
    await expect(frame).toBeVisible({ timeout: 15_000 });
    const { total } = await stagePosition(frame);

    await pressControl(frame, "Play");
    await expect(position).toHaveText(`Stage 2 of ${total}`, { timeout: 5_000 });
    await pressControl(frame, "Pause");
    const paused = (await stagePosition(frame)).at;
    await page.waitForTimeout(2_000);
    expect((await stagePosition(frame)).at).toBe(paused);

    await frame.getByRole("button", { name: "Play", exact: true }).click();
    await expect(position).toHaveText(`Stage ${total} of ${total}`, {
      timeout: 2_000 * total,
    });
    await expect(frame.getByRole("button", { name: "Play", exact: true })).toBeVisible();
    await frame.getByRole("button", { name: "Play", exact: true }).click();
    await expect(position).toHaveText(`Stage 1 of ${total}`);
  });
});

test.describe("explainers on the step page", () => {
  const sample = built[0];
  const unbuilt = { id: "no-component-yet", title: "Not built" };

  test("the placeholder mounts its explainer and one without a component keeps its fallback", async ({
    page,
  }) => {
    test.skip(!sample, "no explainer is built yet");
    await page.route("**/content/topics/react-mental-model.json", async (route) => {
      const response = await route.fetch();
      const topic = await response.json();
      const placeholder = (entry) =>
        `<div class="demo" data-demo="${entry.id}" data-props="{}">` +
        `<p class="demo-fallback">${entry.title}: fallback text.</p></div>`;
      const step = topic.steps[3];
      step.html = "<p>Lead paragraph.</p>" + placeholder(sample) + placeholder(unbuilt);
      step.questions = [];
      step.links = null;
      step.demos = [sample.id, unbuilt.id];
      topic.links = null;
      await route.fulfill({ response, json: topic });
    });
    await page.goto("#/topic/react-mental-model/4");
    const explanation = page.locator(".pane--explanation");
    const frame = explanation.getByRole("figure", { name: sample.title });
    await expect(frame).toBeVisible({ timeout: 15_000 });
    await expect(
      explanation.locator(`[data-demo="${sample.id}"] > .demo-fallback`),
      "the mounted explainer replaces its fallback",
    ).toBeHidden();
    await expect(explanation.locator(`[data-demo="${unbuilt.id}"] > .demo-fallback`)).toBeVisible();
    await expect(explanation.locator(`[data-demo="${unbuilt.id}"] .demo-frame`)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Mark this step as read" })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(TAGS)
      .include(".pane--explanation")
      .analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
    await expect(explanation.locator(".demo-frame"), "one frame per built placeholder").toHaveCount(
      1,
    );
  });
});
