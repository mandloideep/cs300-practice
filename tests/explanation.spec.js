// The interactive-first explanation of docs/CONTRACTS.md section 7: predict and quiz blocks and
// their progress records, the Read more section and the "Keep explanations open" preference, the
// links under the step title and on the unit page, and closed units on the path and unit pages.
// The content of these topics belongs to the content streams, so each test serves the compiled
// shape the build writes for these fences through a route.

import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PROGRESS_KEY = "cs300-lab:progress";
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

const QUIZ = {
  id: "quiz-1",
  kind: "quiz",
  question: "Which component owns the `reviewed` state after this step?",
  options: ["`ReviewPanel`", "`App`", "`Header`"],
  answer: 1,
  explanation: "The state moves up to `App`, the closest parent of both children.",
};

const PREDICT = {
  id: "predict-1",
  kind: "predict",
  question: "How many list items does the page show after you run it?",
  options: ["None", "Three", "One"],
  answer: 1,
  explanation: null,
};

function placeholder({ id, kind, question, options }) {
  const label = kind === "predict" ? "Predict" : "Quiz";
  return (
    `<div class="${kind}" data-${kind}="${id}"><div class="question-fallback">` +
    `<p><strong>${label}:</strong> ${question}</p>` +
    `<ul>${options.map((option) => `<li>${option}</li>`).join("")}</ul></div></div>`
  );
}

const READ_MORE =
  '<details class="read-more"><summary>Read more</summary>\n' +
  "<p>Background that a student who wants it can open.</p>\n" +
  "<p><strong>If it breaks:</strong> Look at the console.</p>\n</details>\n" +
  "<p><strong>Check:</strong> Answer the quiz.</p>\n";

const TOPIC_LINKS = [
  { kind: "lecture", title: "Week 10 Session 1 slides", url: "https://example.edu/week-10-1" },
  { kind: "reading", title: "Thinking in React", url: "https://react.dev/learn/thinking-in-react" },
];
const STEP_LINKS = [
  { kind: "reference", title: "Sharing state between components", url: "https://react.dev/learn" },
];

async function serveQuizTopic(page) {
  await page.route("**/content/topics/react-mental-model.json", async (route) => {
    const response = await route.fetch();
    const topic = await response.json();
    topic.links = TOPIC_LINKS;
    for (const step of topic.steps) {
      step.links ??= null;
      step.questions ??= [];
    }
    const step = topic.steps[3];
    step.links = STEP_LINKS;
    step.questions = [QUIZ];
    step.html = "<p>Lead paragraph.</p>\n" + placeholder(QUIZ) + READ_MORE;
    topic.steps[2].html = "<p>Another step.</p>\n" + READ_MORE;
    await route.fulfill({ response, json: topic });
  });
}

async function servePredictTopic(page) {
  await page.route("**/content/topics/lists-and-keys.json", async (route) => {
    const response = await route.fetch();
    const topic = await response.json();
    const step = topic.steps[0];
    step.questions = [PREDICT];
    step.html = "<p>Lead paragraph.</p>\n" + placeholder(PREDICT) + step.html;
    await route.fulfill({ response, json: topic });
  });
}

function readProgress(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), PROGRESS_KEY);
}

test.describe("a quiz on a read step", () => {
  test("reveals on pick, keeps the pick, and counts toward the topic's score", async ({ page }) => {
    await serveQuizTopic(page);
    await page.goto("#/topic/react-mental-model/4");
    const quiz = page.getByRole("group", { name: /Which component owns/ });
    await expect(quiz).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".quiz > .question-fallback")).toBeHidden();
    await expect(page.locator(".quiz-score")).toHaveText("Quizzes: 0 of 1 answered");
    await expect(quiz.locator("code").first()).toHaveText("reviewed");

    await quiz.getByRole("radio", { name: "Header" }).check();
    await expect(quiz.getByRole("status")).toHaveText(
      "Not quite. The answer is App. The state moves up to App, the closest parent of both children.",
    );
    await expect(quiz.locator(".is-answer")).toContainText("App");
    await expect(quiz.locator(".is-wrong")).toContainText("Header");
    await expect(quiz.getByRole("radio", { name: "App" })).toBeDisabled();
    await expect(page.locator(".quiz-score")).toHaveText("Quizzes: 1 of 1 answered, 0 right");

    const stored = await readProgress(page);
    expect(stored.version).toBe(2);
    expect(stored.answers["react-mental-model/4/quiz-1"]).toMatchObject({ pick: 2 });
    expect(typeof stored.answers["react-mental-model/4/quiz-1"].revealedAt).toBe("string");

    await page.reload();
    await expect(quiz.getByRole("radio", { name: "Header" })).toBeChecked({ timeout: 15_000 });
    await expect(quiz.getByRole("status")).toContainText("Not quite.");

    const results = await new AxeBuilder({ page })
      .withTags(TAGS)
      .include(".pane--explanation")
      .analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });

  test("a right answer says so and the score counts it", async ({ page }) => {
    await serveQuizTopic(page);
    await page.goto("#/topic/react-mental-model/4");
    const quiz = page.getByRole("group", { name: /Which component owns/ });
    await quiz.getByRole("radio", { name: "App" }).check();
    await expect(quiz.getByRole("status")).toHaveText(
      "Right. The state moves up to App, the closest parent of both children.",
    );
    await expect(page.locator(".quiz-score")).toHaveText("Quizzes: 1 of 1 answered, 1 right");
  });
});

test.describe("a predict on an edit step", () => {
  test("keeps the pick and reveals the answer only when the next run is ready", async ({
    page,
  }) => {
    await servePredictTopic(page);
    await page.goto("#/topic/lists-and-keys/1");
    await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
      timeout: 15_000,
    });
    const predict = page.getByRole("group", { name: /How many list items/ });
    await predict.getByRole("radio", { name: "One", exact: true }).check();
    await expect(predict.getByRole("status")).toHaveText(
      "Run the code, then compare the console with your pick.",
    );
    await page.waitForTimeout(500);
    await expect(predict.locator(".is-answer")).toHaveCount(0);
    await predict.getByRole("radio", { name: "Three" }).check();
    expect((await readProgress(page)).answers["lists-and-keys/1/predict-1"]).toEqual({
      pick: 1,
      revealedAt: null,
    });

    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(predict.getByRole("status")).toHaveText("Right.", { timeout: 15_000 });
    await expect(predict.locator(".is-answer")).toContainText("Three");
    const record = (await readProgress(page)).answers["lists-and-keys/1/predict-1"];
    expect(record.pick).toBe(1);
    expect(typeof record.revealedAt).toBe("string");
  });
});

test.describe("Read more and the Keep explanations open preference", () => {
  test("Read more starts closed, and the preference opens it on every step", async ({ page }) => {
    await serveQuizTopic(page);
    await page.goto("#/topic/react-mental-model/4");
    const details = page.locator("details.read-more");
    await expect(details).toHaveCount(1, { timeout: 15_000 });
    await expect(details).not.toHaveAttribute("open");
    await expect(page.getByText("Background that a student")).toBeHidden();
    await expect(page.getByText("Answer the quiz.")).toBeVisible();

    const keepOpen = page.getByRole("checkbox", { name: "Keep explanations open" });
    await keepOpen.check();
    await expect(details).toHaveAttribute("open", "");
    await expect(page.getByText("Background that a student")).toBeVisible();
    expect((await readProgress(page)).preferences).toEqual({ explanationsOpen: true });

    await page
      .getByRole("link", { name: /Step 3/ })
      .first()
      .click();
    await expect(page.locator("#step-heading")).toHaveText(
      "Change the value, watch only that part update",
    );
    await expect(page.locator("details.read-more")).toHaveAttribute("open", "");
    await page.getByRole("checkbox", { name: "Keep explanations open" }).uncheck();
    await expect(page.locator("details.read-more")).not.toHaveAttribute("open");
  });

  test("a step without Read more has no preference control", async ({ page }) => {
    await page.goto("#/topic/react-mental-model/1");
    await expect(page.locator("#step-heading")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("checkbox", { name: "Keep explanations open" })).toHaveCount(0);
  });
});

test.describe("links back to the course", () => {
  test("the step lists the topic's links and then its own, with the kind as the label", async ({
    page,
  }) => {
    await serveQuizTopic(page);
    await page.goto("#/topic/react-mental-model/4");
    const list = page.getByRole("list", { name: "Lectures and readings" });
    await expect(list.getByRole("listitem")).toHaveText([
      "Lecture Week 10 Session 1 slides (opens in a new tab)",
      "Reading Thinking in React (opens in a new tab)",
      "Reference Sharing state between components (opens in a new tab)",
    ]);
    await expect(list.getByRole("link").first()).toHaveAttribute(
      "href",
      "https://example.edu/week-10-1",
    );
    await expect(list.getByRole("link").first()).toHaveAttribute("target", "_blank");
  });

  test("the unit page lists each topic's lecture links only", async ({ page }) => {
    await page.route("**/content/index.json", async (route) => {
      const response = await route.fetch();
      const index = await response.json();
      index.topics.find((topic) => topic.id === "react-mental-model").links = TOPIC_LINKS;
      await route.fulfill({ response, json: index });
    });
    await page.goto("#/path/fall-2026/week-10");
    const lectures = page.getByRole("list", { name: "Lectures for The React mental model" });
    await expect(lectures.getByRole("link")).toHaveText([
      "Week 10 Session 1 slides (lecture, opens in a new tab)",
    ]);
    await expect(page.getByRole("link", { name: /Thinking in React/ })).toHaveCount(0);
  });
});

test.describe("closed units", () => {
  async function closeWeek11(page) {
    await page.route("**/content/index.json", async (route) => {
      const response = await route.fetch();
      const index = await response.json();
      const path = index.paths.find((candidate) => candidate.id === "fall-2026");
      path.units = path.units.map((unit) =>
        unit.id === "week-11"
          ? { id: unit.id, title: unit.title, opens: "2027-03-01", closed: true }
          : unit,
      );
      await route.fulfill({ response, json: index });
    });
  }

  test("the path page lists a closed unit last with its date and no link", async ({ page }) => {
    await closeWeek11(page);
    await page.goto("#/path/fall-2026");
    const cards = page.locator(".card-list > li");
    await expect(cards.last()).toContainText("State, events, and component communication");
    await expect(cards.last()).toContainText("Opens March 1, 2027");
    await expect(cards.last().getByRole("link")).toHaveCount(0);
    await expect(cards.first().getByRole("link")).toHaveCount(1);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });

  test("the unit page of a closed unit shows its title and date only", async ({ page }) => {
    await closeWeek11(page);
    await page.goto("#/path/fall-2026/week-11");
    await expect(
      page.getByRole("heading", { name: "State, events, and component communication" }),
    ).toBeVisible();
    await expect(page.locator("main")).toContainText("This unit opens on March 1, 2027.");
    await expect(page.getByRole("region", { name: "Required topics" })).toHaveCount(0);
    await expect(page.locator("main a[href*='#/topic/']")).toHaveCount(0);
  });
});
