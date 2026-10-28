// Accessibility tests: axe on every kind of page in light and dark at desktop and phone width,
// a keyboard-only walk of the step page in the focus order docs/PHASE2.md names, the Escape then
// Tab way out of the editor, named regions for every pane, and the dialogs. The walks serve their
// own explanation HTML, so a step rewritten into the interactive-first layout cannot move them.

/* global document */

import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

const PAGES = [
  {
    name: "home",
    url: "#/",
    ready: (page) => page.getByRole("heading", { name: "CS300 Practice", exact: true }),
  },
  {
    name: "catalog",
    url: "#/topics",
    ready: (page) => page.getByRole("heading", { name: "Topics" }),
  },
  {
    name: "path",
    url: "#/path/fall-2026",
    ready: (page) => page.getByRole("heading", { name: "Fall 2026" }),
  },
  {
    name: "unit",
    url: "#/path/fall-2026/week-10",
    ready: (page) => page.getByRole("region", { name: "Required topics" }),
  },
  {
    name: "topic with a local step",
    url: "#/topic/vite-project-anatomy",
    ready: (page) => page.getByRole("button", { name: "I did this on my computer" }),
  },
  {
    name: "topic with a read step",
    url: "#/topic/react-mental-model/4",
    ready: (page) => page.getByRole("button", { name: "Mark this step as read" }),
  },
  {
    name: "edit step with the API selector",
    url: "#/topic/lists-and-keys/5",
    ready: (page) => page.locator(".pane--result .status-pill").filter({ hasText: "Ready" }),
  },
  {
    name: "edit step with the solution dialog open",
    url: "#/topic/jsx-rules/1",
    ready: async (page) => {
      await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
        timeout: 15_000,
      });
      await page.getByRole("button", { name: "Show solution" }).click();
      await expect(page.locator(".solution-diff .cm-editor").first()).toBeVisible();
      return page.getByRole("dialog", { name: "Your files and the solution" });
    },
    scope: "dialog[open]",
  },
];

const MODES = [
  { name: "light, desktop", colorScheme: "light", viewport: { width: 1280, height: 900 } },
  { name: "dark, desktop", colorScheme: "dark", viewport: { width: 1280, height: 900 } },
  { name: "light, phone", colorScheme: "light", viewport: { width: 375, height: 812 } },
  { name: "dark, phone", colorScheme: "dark", viewport: { width: 375, height: 812 } },
];

function describeViolations(violations) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .slice(0, 5)
        .map((node) => `    ${node.target.join(" ")}\n      ${node.failureSummary}`)
        .join("\n");
      return `${violation.id} (${violation.impact}): ${violation.help}\n  ${violation.helpUrl}\n${targets}`;
    })
    .join("\n\n");
}

test.describe("axe finds no violations", () => {
  for (const mode of MODES) {
    for (const target of PAGES) {
      test(`${target.name} in ${mode.name}`, async ({ page }) => {
        await page.setViewportSize(mode.viewport);
        await page.emulateMedia({ colorScheme: mode.colorScheme });
        await page.goto(target.url);
        await expect(await target.ready(page)).toBeVisible({ timeout: 15_000 });
        const builder = new AxeBuilder({ page }).withTags(TAGS).exclude(".result-frame");
        if (target.scope) builder.include(target.scope);
        const results = await builder.analyze();
        expect(describeViolations(results.violations), "axe violations").toBe("");
      });
    }
  }
});

async function focused(page) {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!element || element === document.body) return { kind: "body" };
    const role = element.getAttribute("role") ?? element.tagName.toLowerCase();
    const name =
      element.getAttribute("aria-label") ??
      (element.tagName === "IFRAME" ? element.title : element.textContent?.trim()) ??
      "";
    return {
      kind: element.classList.contains("cm-content") ? "editor" : role,
      name: name.replace(/\s+/g, " ").slice(0, 60),
      inDialog: Boolean(element.closest("dialog")),
    };
  });
}

// Presses Tab until the predicate matches or the budget runs out, returning every stop.
async function tabUntil(page, predicate, budget = 60) {
  const stops = [];
  for (let i = 0; i < budget; i += 1) {
    await page.keyboard.press("Tab");
    const stop = await focused(page);
    stops.push(stop);
    if (predicate(stop)) return stops;
  }
  throw new Error(
    `Not reached after ${budget} tabs:\n${stops.map((s) => `${s.kind} ${s.name}`).join("\n")}`,
  );
}

function expectOrder(stops, expected) {
  let from = 0;
  for (const [kind, name] of expected) {
    const index = stops.findIndex(
      (stop, i) => i >= from && stop.kind === kind && stop.name.startsWith(name),
    );
    expect(
      index,
      `${kind} "${name}" after stop ${from} in:\n${stops.map((s, i) => `${i} ${s.kind} ${s.name}`).join("\n")}`,
    ).toBeGreaterThanOrEqual(from);
    from = index + 1;
  }
}

// Serves lists-and-keys with the given HTML, questions, and links in place of step 2's own, so the
// keyboard walk depends on no step's real text. The workspace, the checks, and the titles stay.
async function serveStepTwo(page, { html, questions = [], links = null }) {
  await page.route("**/content/topics/lists-and-keys.json", async (route) => {
    const response = await route.fetch();
    const topic = await response.json();
    topic.links = null;
    const step = topic.steps[1];
    step.html = html;
    step.questions = questions;
    step.links = links;
    await route.fulfill({ response, json: topic });
  });
}

const PLAIN_EXPLANATION =
  '<p>Each item needs a key; <a href="#/topic/components-and-props">Components and props</a> passed props the same way.</p>\n' +
  "<pre><code>items.map((item) => &lt;li key={item.id}&gt;{item.title}&lt;/li&gt;)</code></pre>\n";

test.describe("keyboard-only operation of the step page", () => {
  test("Tab walks header, explanation, tabs, editor, Run, panes, checks, step navigation", async ({
    page,
  }) => {
    await serveStepTwo(page, { html: PLAIN_EXPLANATION });
    await page.goto("#/topic/lists-and-keys/2");
    await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
      timeout: 15_000,
    });

    const toEditor = await tabUntil(page, (stop) => stop.kind === "editor");
    expectOrder(toEditor, [
      ["a", "Skip to content"],
      ["a", "CS300 Practice"],
      ["a", "Home"],
      ["a", "Topics"],
      ["button", "Tour"],
      ["a", "Topics"],
      ["a", "Components and props"],
      ["tab", "src/App.jsx"],
      ["editor", "Code editor for src/App.jsx"],
    ]);
    expect(
      toEditor.filter((stop) => stop.kind === "button").map((stop) => stop.name),
      "the header's Tour button is the only button before the editor",
    ).toEqual(["Tour"]);

    await page.keyboard.press("Tab");
    expect((await focused(page)).kind, "Tab inside the editor indents instead of leaving").toBe(
      "editor",
    );
    await page.keyboard.press("Escape");
    await page.keyboard.press("Tab");
    expect(await focused(page)).toMatchObject({ kind: "button", name: "Run" });

    const toNav = await tabUntil(
      page,
      (stop) => stop.kind === "a" && stop.name.startsWith("Step 3"),
    );
    expectOrder(toNav, [
      ["button", "Run checks"],
      ["button", "Show solution"],
      ["button", "Download this workspace"],
      ["iframe", "Result of your code"],
      ["button", "Clear"],
      ["button", "Boundaries"],
      ["button", "Re-render flash"],
      ["button", "Tree and state"],
      ["a", "← Step 1"],
      ["a", "Step 3"],
    ]);
    const names = toNav.map((stop) => stop.name);
    expect(names.indexOf("Clear"), "panes come before the step navigation").toBeLessThan(
      names.findIndex((name) => name.startsWith("← Step 1")),
    );

    await tabUntil(page, (stop) => stop.kind === "a" && stop.name === "Stable keys");
    expect(await focused(page)).toMatchObject({ kind: "a", name: "Stable keys" });
  });

  test("the interactive-first explanation's controls come between the topic header and the files", async ({
    page,
  }) => {
    await serveStepTwo(page, {
      links: [
        {
          kind: "reading",
          title: "Rendering lists",
          url: "https://react.dev/learn/rendering-lists",
        },
      ],
      questions: [
        {
          id: "predict-1",
          kind: "predict",
          question: "What does the list show after the reorder?",
          options: ["The same order", "The new order"],
          answer: 1,
          explanation: null,
        },
      ],
      html:
        "<p>Lead paragraph.</p>\n" +
        '<div class="demo" data-demo="callback" data-props="{}"><p class="demo-fallback">Callbacks.</p></div>\n' +
        '<div class="predict" data-predict="predict-1"><div class="question-fallback"><p>Q</p></div></div>\n' +
        '<details class="read-more"><summary>Read more</summary>\n<p>Background.</p>\n</details>\n' +
        "<p><strong>Check:</strong> Run it.</p>\n",
    });
    await page.goto("#/topic/lists-and-keys/2");
    await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
      timeout: 15_000,
    });
    await expect(page.locator(".pane--explanation .demo-frame")).toBeVisible();

    const toEditor = await tabUntil(page, (stop) => stop.kind === "editor");
    expectOrder(toEditor, [
      ["a", "Components and props"],
      ["a", "Rendering lists"],
      ["input", ""],
      ["button", "Play"],
      ["button", "Back"],
      ["button", "Step"],
      ["button", "Reset"],
      ["input", ""],
      ["summary", "Read more"],
      ["tab", "src/App.jsx"],
      ["editor", "Code editor for src/App.jsx"],
    ]);
  });

  test("Enter runs the code and the solution dialog traps focus and closes on Escape", async ({
    page,
  }) => {
    await page.goto("#/topic/jsx-rules/1");
    const status = page.locator(".pane--result .status-pill");
    await expect(status).toHaveText("Ready", { timeout: 15_000 });

    await page.getByRole("button", { name: "Show solution" }).focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Your files and the solution" });
    await expect(dialog).toBeVisible();
    expect((await focused(page)).inDialog).toBe(true);
    await page.keyboard.press("Tab");
    expect((await focused(page)).inDialog).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    expect(await focused(page)).toMatchObject({ kind: "button", name: "Show solution" });

    await page.getByRole("button", { name: "Run", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(status).toHaveText("Ready", { timeout: 15_000 });
    await expect(page.locator(".check-summary")).toBeVisible({ timeout: 15_000 });
  });

  test("every pane is a named region and every control has a name", async ({ page }) => {
    await page.route("**/content/topics/lists-and-keys.json", async (route) => {
      const response = await route.fetch();
      const topic = await response.json();
      const step = topic.steps[4];
      step.questions = [
        ...(step.questions ?? []),
        {
          id: "a11y-check",
          kind: "predict",
          question: "How many requests does the page make?",
          options: ["None", "One", "Two"],
          answer: 1,
          explanation: null,
        },
      ];
      step.html =
        '<div class="demo" data-demo="reconcile-keys" data-props="{}"><p class="demo-fallback">Keys.</p></div>\n' +
        '<div class="predict" data-predict="a11y-check"><div class="question-fallback"><p>Q</p></div></div>\n' +
        step.html;
      await route.fulfill({ response, json: topic });
    });
    await page.goto("#/topic/lists-and-keys/5");
    await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
      timeout: 15_000,
    });
    await expect(page.locator('[data-predict="a11y-check"] input[type="radio"]')).toHaveCount(3);
    await expect(page.locator('[data-demo="reconcile-keys"] input').first()).toBeVisible();
    for (const name of [
      "Load the products from an API",
      "Editor",
      "Result",
      "Console",
      "Inspector",
      "Network",
      "Checks",
    ]) {
      await expect(page.getByRole("region", { name, exact: true })).toHaveCount(1);
    }
    await expect(page.getByRole("tablist", { name: "Files" })).toHaveCount(1);
    await expect(page.getByRole("toolbar", { name: "Workspace actions" })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Steps in this topic" })).toHaveCount(1);
    await expect(page.getByRole("group", { name: "API source" })).toHaveCount(1);

    const unnamed = await page.evaluate(() => {
      const controls = document.querySelectorAll(
        "main :is(button, a[href], input, select, textarea, [role=button], [role=tab])",
      );
      return [...controls]
        .filter((element) => !element.closest("dialog") && !element.hasAttribute("aria-hidden"))
        .filter((element) => {
          const label = element.getAttribute("aria-label");
          const labelledBy = element.getAttribute("aria-labelledby");
          const byFor = element.id && document.querySelector(`label[for="${element.id}"]`);
          const text = element.textContent?.trim();
          const wrapped = element.labels?.length > 0 || element.closest("label");
          return !(label || labelledBy || byFor || wrapped || text || element.title);
        })
        .map((element) => element.outerHTML.slice(0, 80));
    });
    expect(unnamed, "controls without an accessible name").toEqual([]);
  });

  test("the home page follows a path and moves focus by keyboard", async ({ page }) => {
    await page.goto("#/");
    await page.getByRole("button", { name: "Follow Fall 2026" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Fall 2026" })).toBeFocused();
    await page.keyboard.press("Tab");
    expect(await focused(page)).toMatchObject({ kind: "a", name: "Fall 2026" });
  });

  test("the skip link moves focus to the main content", async ({ page }) => {
    await page.goto("#/topics");
    await page.keyboard.press("Tab");
    expect(await focused(page)).toMatchObject({ kind: "a", name: "Skip to content" });
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });
});
