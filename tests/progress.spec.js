// Progress and workspace tests: the Vite project ZIP of an edit step, completion on the unit
// page with its Continue link, and export and import of the progress file.

import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { strFromU8, unzipSync } from "fflate";
import repository from "../package.json" with { type: "json" };

const PROGRESS_KEY = "cs300-lab:progress";
const STEP = { topic: "lists-and-keys", n: 2, title: "Stable keys", topicTitle: "Lists and keys" };
const UNIT = "#/path/fall-2026/week-10";

function seedProgress(page, snapshot) {
  return page.addInitScript(
    ([key, value]) => {
      if (!sessionStorage.getItem("cs300-test:seeded")) {
        localStorage.setItem(key, JSON.stringify(value));
        sessionStorage.setItem("cs300-test:seeded", "1");
      }
    },
    [PROGRESS_KEY, snapshot],
  );
}

function readProgress(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), PROGRESS_KEY);
}

async function openStep(page, { topic, n, title }) {
  await page.goto(`#/topic/${topic}/${n}`);
  await expect(page.locator("#step-heading")).toHaveText(title);
  await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
    timeout: 15_000,
  });
}

async function downloadZip(page) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download this workspace" }).click(),
  ]);
  const zip = unzipSync(new Uint8Array(readFileSync(await download.path())));
  const entries = Object.fromEntries(
    Object.entries(zip).map(([path, bytes]) => [path, strFromU8(bytes)]),
  );
  return { fileName: download.suggestedFilename(), entries };
}

test.describe("workspace download on an edit step", () => {
  test("the starter workspace becomes a plain Vite project", async ({ page }) => {
    await openStep(page, STEP);
    const folder = `${STEP.topic}-${STEP.n}`;
    const { fileName, entries } = await downloadZip(page);
    expect(fileName).toBe(`${folder}.zip`);

    const paths = Object.keys(entries);
    expect(paths.every((path) => path.startsWith(`${folder}/`))).toBe(true);
    for (const required of ["package.json", "vite.config.js", "index.html", "README.md"]) {
      expect(paths).toContain(`${folder}/${required}`);
    }
    expect(paths).toContain(`${folder}/src/main.jsx`);
    expect(paths).toContain(`${folder}/src/App.jsx`);
    expect(paths.filter((path) => /runtime|wrap|check\.js|fixtures|solution/.test(path))).toEqual(
      [],
    );

    const manifest = JSON.parse(entries[`${folder}/package.json`]);
    expect(manifest).toEqual({
      name: folder,
      private: true,
      type: "module",
      scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
      dependencies: {
        react: repository.dependencies.react,
        "react-dom": repository.dependencies["react-dom"],
      },
      devDependencies: {
        "@vitejs/plugin-react": repository.devDependencies["@vitejs/plugin-react"],
        vite: repository.devDependencies.vite,
      },
    });
    expect(entries[`${folder}/vite.config.js`]).toContain("@vitejs/plugin-react");
    expect(entries[`${folder}/vite.config.js`]).toContain("plugins: [react()]");
    expect(entries[`${folder}/index.html`]).toContain('<script type="module" src="/src/main.jsx">');
    expect(entries[`${folder}/README.md`]).toContain(STEP.topicTitle);
    expect(entries[`${folder}/README.md`]).toContain(STEP.title);
    expect(entries[`${folder}/README.md`]).toContain("npm install");
    expect(entries[`${folder}/README.md`]).toContain("npm run dev");
    expect(entries[`${folder}/README.md`]).toContain("npm run build");
    expect(entries[`${folder}/src/main.jsx`]).toContain('from "react-dom/client"');
  });

  test("an edited file is downloaded in place of the starter", async ({ page }) => {
    await openStep(page, STEP);
    const tab = page.getByRole("tab", { name: "src/App.jsx" });
    await expect(tab).toHaveAttribute("aria-selected", "true");

    const editor = page.locator(".cm-content");
    await editor.click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.insertText("const edited = true;\n");
    await expect(tab).toContainText("•");
    await expect(page.locator(".pane--editor .pane__header .meta")).toHaveText("1 file edited");
    await expect
      .poll(async () => (await readProgress(page))?.files?.[`${STEP.topic}/${STEP.n}`])
      .toEqual({ "src/App.jsx": "const edited = true;\n" });

    const folder = `${STEP.topic}-${STEP.n}`;
    const { entries } = await downloadZip(page);
    expect(entries[`${folder}/src/App.jsx`]).toBe("const edited = true;\n");
    expect(entries[`${folder}/src/main.jsx`]).toContain("App");
  });
});

test.describe("completion on the unit page", () => {
  test("a step marked done survives a reload and moves Continue forward", async ({ page }) => {
    await page.goto("#/topic/vite-project-anatomy/1");
    await page.getByRole("button", { name: "I did this on my computer" }).click();
    await expect(page.locator(".mark-done .status-pill")).toHaveText("Step complete");
    await page.reload();
    await expect(page.locator(".mark-done .status-pill")).toHaveText("Step complete");

    await page.goto(UNIT);
    const summary = page.getByRole("region", { name: "Your progress" });
    await expect(summary).toContainText("1 of ");
    await expect(summary).toContainText("required steps complete");
    await expect(summary.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    const next = summary.getByRole("link", { name: /^Continue:/ });
    await expect(next).toHaveText("Continue: The React mental model, step 1");
    await expect(next).toHaveAttribute("href", "#/topic/react-mental-model/1");
    const card = page.getByRole("article").filter({ hasText: "Vite project anatomy" });
    await expect(card).toContainText("1 of 4 steps complete");
  });

  test("Continue skips completed steps and disappears when the unit is done", async ({ page }) => {
    const completed = {};
    for (let n = 1; n <= 4; n += 1) completed[`react-mental-model/${n}`] = "2026-10-26T00:00:00Z";
    completed["vite-project-anatomy/1"] = "2026-10-26T00:00:00Z";
    completed["vite-project-anatomy/2"] = "2026-10-26T00:00:00Z";
    await seedProgress(page, { version: 1, completed, files: {}, pathId: "fall-2026" });

    await page.goto(UNIT);
    const summary = page.getByRole("region", { name: "Your progress" });
    await expect(summary).toContainText("6 of ");
    await expect(summary.getByRole("link", { name: /^Continue:/ })).toHaveAttribute(
      "href",
      "#/topic/vite-project-anatomy/3",
    );
    const bar = { name: "The React mental model progress" };
    await expect(page.getByRole("progressbar", bar)).toHaveAttribute("aria-valuetext", "Complete");
    await expect(
      page.getByRole("progressbar", { name: "Vite project anatomy progress" }),
    ).toHaveAttribute("aria-valuetext", "2 of 4 steps complete");

    await page.goto("#/topics");
    await expect(page.getByRole("progressbar", bar)).toHaveAttribute("aria-valuetext", "Complete");

    await page.goto("#/topic/react-mental-model/1");
    await expect(page.locator(".topic-header .progress-note")).toContainText("Complete");

    const allSteps = await page.evaluate(async () => {
      const index = await (await fetch("content/index.json")).json();
      const path = index.paths.find((candidate) => candidate.id === "fall-2026");
      const unit = path.units.find((candidate) => candidate.id === "week-10");
      return unit.topics
        .filter((entry) => entry.required)
        .flatMap((entry) =>
          index.topics
            .find((topic) => topic.id === entry.id)
            .steps.map((step) => `${entry.id}/${step.n}`),
        );
    });
    await page.evaluate(
      ([key, keys]) => {
        const snapshot = JSON.parse(localStorage.getItem(key));
        for (const stepKey of keys) snapshot.completed[stepKey] = "2026-10-26T00:00:00Z";
        localStorage.setItem(key, JSON.stringify(snapshot));
      },
      [PROGRESS_KEY, allSteps],
    );
    await page.reload();
    await page.goto(UNIT);
    await expect(summary).toContainText("Every required step complete");
    await expect(summary.getByRole("link", { name: /^Continue:/ })).toHaveCount(0);
  });
});

test.describe("export and import", () => {
  test("export writes the versioned file and import confirms before replacing", async ({
    page,
  }) => {
    await seedProgress(page, {
      version: 1,
      completed: { "jsx-rules/1": "2026-10-26T00:00:00Z" },
      files: { "jsx-rules/1": { "src/App.jsx": "edited" } },
      pathId: null,
    });
    await page.goto("#/");
    const transfer = page.getByRole("region", { name: "Your progress" });
    await expect(transfer).toContainText("1 completed step");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      transfer.getByRole("button", { name: "Export progress" }).click(),
    ]);
    const exported = JSON.parse(readFileSync(await download.path(), "utf8"));
    expect(exported.version, "a stored version 1 snapshot is upgraded").toBe(2);
    expect(exported.answers).toEqual({});
    expect(exported.preferences).toEqual({ explanationsOpen: false });
    expect(exported.tour).toEqual({ stepPage: null, homeCard: null });
    expect(exported.completed).toEqual({ "jsx-rules/1": "2026-10-26T00:00:00Z" });
    expect(exported.files).toEqual({ "jsx-rules/1": { "src/App.jsx": "edited" } });
    expect(typeof exported.exportedAt).toBe("string");

    const incoming = {
      version: 1,
      completed: {
        "lists-and-keys/1": "2026-10-20T00:00:00Z",
        "lists-and-keys/2": "2026-10-21T00:00:00Z",
        "lists-and-keys/3": "2026-10-22T00:00:00Z",
      },
      files: { "lists-and-keys/2": { "src/App.jsx": "incoming" } },
      pathId: "fall-2026",
      exportedAt: "2026-10-22T00:00:00Z",
    };
    const input = page.locator('input[type="file"]');
    await input.setInputFiles({
      name: "progress.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(incoming)),
    });
    const dialog = page.getByRole("dialog", { name: "Replace your progress?" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("progress.json holds 3 completed steps");
    await expect(dialog).toContainText("edited files for 1 step.");
    await expect(dialog).toContainText("1 completed step and edited files for 1 step");

    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    await expect(transfer.getByRole("status")).toHaveText(
      "Nothing was imported. Your progress is unchanged.",
    );
    expect((await readProgress(page)).completed).toEqual({
      "jsx-rules/1": "2026-10-26T00:00:00Z",
    });

    await input.setInputFiles({
      name: "progress.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(incoming)),
    });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Replace progress" }).click();
    await expect(dialog).toBeHidden();
    await expect(transfer.getByRole("status")).toHaveText(
      "Imported progress with 3 completed steps.",
    );
    const stored = await readProgress(page);
    expect(stored, "a version 1 file is upgraded to version 2 on import").toEqual({
      version: 2,
      completed: incoming.completed,
      files: incoming.files,
      pathId: "fall-2026",
      answers: {},
      preferences: { explanationsOpen: false },
      tour: { stepPage: null, homeCard: null },
    });
    await expect(page.getByRole("heading", { name: "Fall 2026" })).toBeVisible();
  });

  test("a file from a newer version is rejected with the pinned message", async ({ page }) => {
    await page.goto("#/");
    const transfer = page.getByRole("region", { name: "Your progress" });
    const input = page.locator('input[type="file"]');
    await input.setInputFiles({
      name: "future.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ version: 3, completed: {}, files: {} })),
    });
    await expect(transfer.getByRole("status")).toHaveText(
      "This file was exported by a newer version of CS300 Practice.",
    );
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await input.setInputFiles({
      name: "notes.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ hello: "world" })),
    });
    await expect(transfer.getByRole("status")).toHaveText(
      "That file is not a CS300 Practice progress export.",
    );

    await input.setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from("{not json"),
    });
    await expect(transfer.getByRole("status")).toHaveText("That file is not valid JSON.");
  });
});
