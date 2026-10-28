// The editor's file tree and the deployable download of docs/CONTRACTS.md sections 8.2 and 8.5:
// the WAI-ARIA tree keyboard pattern, the edited-file mark, the description line, the "On your
// computer" group for a React, a router, a fetching, and a vanilla step, the Files preference,
// the disclosure at phone width, and that the files the tree lists are exactly the files the zip
// writes, with the workflow byte for byte as docs/PHASE7.md prints it.

/* global document, window */

import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { strFromU8, unzipSync } from "fflate";
import { fileNode } from "./support/files.js";

const REACT = { topic: "getting-started", n: 2 };
const ROUTER = { topic: "routing", n: 3 };
const FETCHING = { topic: "fetching-and-request-states", n: 1 };
const VANILLA = { topic: "app-architecture", n: 1 };

const DOWNLOAD_NOTE = "This file is not in CS300 Practice; it is in the project you download.";
const REACT_DOWNLOAD = [
  ".github",
  ".github/workflows",
  ".github/workflows/deploy.yml",
  "dist",
  "node_modules",
  ".gitignore",
  "package-lock.json",
  "package.json",
  "README.md",
  "vite.config.js",
];

const workflow = readFileSync(
  new URL(
    "../content/topics/deploy-with-github-pages/05-deploy-a-vite-project/local/.github/workflows/deploy.yml",
    import.meta.url,
  ),
  "utf8",
);
const planWorkflow = /```yaml\n([\s\S]*?)```/.exec(
  readFileSync(new URL("../docs/PHASE7.md", import.meta.url), "utf8"),
)[1];

const tree = (page) => page.locator(".pane--editor").getByRole("tree", { name: "Files" });
const group = (page) => tree(page).locator('[data-source="group"]');
const downloadNodes = (page) => tree(page).locator('[data-source="download"]');

async function openStep(page, { topic, n }) {
  await page.goto(`#/topic/${topic}/${n}`);
  await expect(tree(page)).toBeVisible({ timeout: 15_000 });
}

async function downloadZip(page) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download this workspace" }).click(),
  ]);
  const zip = unzipSync(new Uint8Array(readFileSync(await download.path())));
  const folder = download.suggestedFilename().replace(/\.zip$/, "");
  return Object.fromEntries(
    Object.entries(zip).map(([path, bytes]) => [path.slice(folder.length + 1), strFromU8(bytes)]),
  );
}

async function treePaths(page) {
  await group(page).click();
  return page.evaluate(() =>
    [...document.querySelectorAll('.pane--editor [role="treeitem"][data-path]')].map((node) => ({
      path: node.dataset.path,
      source: node.dataset.source,
      kind: node.dataset.kind,
      createdBy: node.dataset.createdBy ?? null,
    })),
  );
}

async function focusedPath(page) {
  return page.evaluate(() => document.activeElement?.dataset?.key ?? null);
}

test.describe("the file tree", () => {
  test("is one tab stop and follows the tree keyboard pattern", async ({ page }) => {
    await openStep(page, REACT);
    const app = fileNode(page, "src/App.jsx");
    await expect(app).toHaveAttribute("aria-selected", "true");
    await expect(tree(page).locator('[tabindex="0"]')).toHaveCount(1);
    await expect(tree(page).locator('[role="treeitem"]')).toHaveText([
      "▾src/",
      "App.jsx",
      "main.jsx",
      "index.html",
      "styles.css",
      "▸On your computer",
    ]);

    await app.focus();
    await page.keyboard.press("ArrowUp");
    expect(await focusedPath(page)).toBe("src");
    await page.keyboard.press("ArrowLeft");
    await expect(fileNode(page, "src")).toHaveAttribute("aria-expanded", "false");
    await expect(app).toHaveCount(0);
    await page.keyboard.press("ArrowRight");
    await expect(fileNode(page, "src")).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("ArrowRight");
    expect(await focusedPath(page)).toBe("src/App.jsx");
    await page.keyboard.press("ArrowDown");
    expect(await focusedPath(page)).toBe("src/main.jsx");
    await page.keyboard.press("ArrowLeft");
    expect(await focusedPath(page), "Left on a file moves to its folder").toBe("src");
    await page.keyboard.press("End");
    expect(await focusedPath(page)).toBe("download:");
    await page.keyboard.press("ArrowRight");
    await expect(group(page)).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Home");
    expect(await focusedPath(page)).toBe("src");
    await page.keyboard.press("s");
    expect(await focusedPath(page), "a letter moves to the next entry that starts with it").toBe(
      "styles.css",
    );
    await page.keyboard.press("m");
    expect(await focusedPath(page)).toBe("src/main.jsx");
    await page.keyboard.press("Enter");
    await expect(fileNode(page, "src/main.jsx")).toHaveAttribute("aria-selected", "true");
    await expect(app).toHaveAttribute("aria-selected", "false");
    await expect(page.locator(".pane--editor .cm-content")).toHaveAttribute(
      "aria-label",
      "Code editor for src/main.jsx",
    );
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press(" ");
    await expect(fileNode(page, "index.html")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".code-editor__path")).toHaveText("index.html");
    await expect(tree(page).locator('[tabindex="0"]')).toHaveCount(1);
  });

  test("marks an edited file and says what the selected entry is for", async ({ page }) => {
    await openStep(page, REACT);
    const description = page.locator(`#${await tree(page).getAttribute("aria-describedby")}`);
    await expect(description).toHaveText(
      "src/App.jsx: The top component: what appears inside the root div.",
    );

    await page.locator(".pane--editor .cm-content").click();
    await page.keyboard.press("End");
    await page.keyboard.insertText(" ");
    await expect(fileNode(page, "src/App.jsx")).toContainText("•");
    await expect(fileNode(page, "src/App.jsx")).toContainText("(edited)");
    await expect(fileNode(page, "src/main.jsx")).not.toContainText("•");

    await fileNode(page, "index.html").click();
    await expect(description).toContainText("index.html: The page the browser opens");

    await group(page).click();
    await tree(page).locator('[data-path="package-lock.json"]').click();
    await expect(description).toHaveText(
      `package-lock.json: The exact version npm chose for every package; commit it. ${DOWNLOAD_NOTE} Running npm install creates it.`,
    );
    await expect(fileNode(page, "index.html"), "the editor keeps its file").toHaveAttribute(
      "aria-selected",
      "true",
    );
    await tree(page).locator('[data-path="dist"]').click();
    await expect(description).toContainText("Running npm run build creates it.");
    await tree(page).locator('[data-path="vite.config.js"]').click();
    await expect(description).toContainText(DOWNLOAD_NOTE);
    await expect(description).not.toContainText("creates it");
  });

  test("lists what a React, a router, a fetching, and a vanilla download add", async ({ page }) => {
    for (const [step, expected] of [
      [REACT, REACT_DOWNLOAD],
      [ROUTER, REACT_DOWNLOAD],
      [FETCHING, [...REACT_DOWNLOAD.slice(0, 5), ".env", ...REACT_DOWNLOAD.slice(5)]],
      [VANILLA, ["README.md"]],
    ]) {
      await openStep(page, step);
      await expect(group(page)).toHaveAttribute("aria-expanded", "false");
      await expect(downloadNodes(page)).toHaveCount(0);
      await group(page).click();
      const paths = await downloadNodes(page).evaluateAll((nodes) =>
        nodes.map((node) => node.dataset.path),
      );
      expect(paths, `${step.topic}/${step.n}`).toEqual(expected);
    }
  });

  test("lists exactly the files the download writes", async ({ page }) => {
    for (const step of [REACT, ROUTER, FETCHING, VANILLA]) {
      await openStep(page, step);
      const entries = await treePaths(page);
      const written = entries
        .filter((entry) => entry.kind === "file" && entry.createdBy === null)
        .map((entry) => entry.path)
        .sort();
      const zip = await downloadZip(page);
      expect(Object.keys(zip).sort(), `${step.topic}/${step.n}`).toEqual(written);
      for (const created of entries.filter((entry) => entry.createdBy)) {
        expect(Object.keys(zip).some((path) => path.startsWith(created.path))).toBe(false);
      }

      if (step === VANILLA) {
        expect(zip["README.md"]).toContain("Deploy from a branch");
        continue;
      }
      expect(zip[".github/workflows/deploy.yml"]).toBe(workflow);
      expect(zip[".github/workflows/deploy.yml"]).toBe(planWorkflow);
      expect(zip[".gitignore"]).toBe("node_modules\ndist\n");
      expect(zip["vite.config.js"]).toContain('defineConfig({ base: "./", plugins: [react()]');
      expect(zip["README.md"]).toContain("## Deploy to GitHub Pages");
      expect(zip["README.md"].includes("HashRouter` in place of `BrowserRouter`, which")).toBe(
        step === ROUTER,
      );
      expect(Boolean(zip[".env"])).toBe(step === FETCHING);
      if (step === FETCHING) {
        expect(zip["vite.config.js"]).toContain('envPrefix: ["VITE_", "API_"]');
      }
    }
  });

  test("the solution comparison shows the workspace files only", async ({ page }) => {
    await openStep(page, REACT);
    await page.getByRole("button", { name: "Show solution" }).click();
    const dialog = page.getByRole("dialog", { name: "Your files and the solution" });
    const compare = dialog.getByRole("tree", { name: "Files to compare" });
    await expect(compare).toBeVisible();
    await expect(compare.locator('[data-source="group"]')).toHaveCount(0);
    await expect(compare.locator('[data-path="src/App.jsx"]')).toContainText(
      "differs from the solution",
    );
    await compare.locator('[data-path="index.html"]').click();
    await expect(dialog.locator("#solution-diff-summary")).toHaveText(
      "index.html matches the solution.",
    );
  });
});

test.describe("the Files preference", () => {
  test("hides the tree, survives a reload, and is kept in progress", async ({ page }) => {
    await openStep(page, REACT);
    const toggle = page.getByRole("button", { name: "Files", exact: true });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(tree(page)).toBeHidden();
    await expect(page.locator(".code-editor__path")).toHaveText("src/App.jsx");
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("cs300-lab:progress")),
    );
    expect(stored.preferences.filesOpen).toBe(false);
    expect(stored.version).toBe(2);

    await page.reload();
    await expect(page.locator(".pane--editor .cm-content")).toBeVisible({ timeout: 15_000 });
    await expect(tree(page)).toBeHidden();
    await page.getByRole("button", { name: "Files", exact: true }).click();
    await expect(tree(page)).toBeVisible();
  });
});

test.describe("at phone width", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the tree is a disclosure above the code that names the active file", async ({ page }) => {
    await page.goto(`#/topic/${REACT.topic}/${REACT.n}`);
    const disclosure = page.locator(".file-disclosure");
    await expect(disclosure).toBeVisible({ timeout: 15_000 });
    await expect(disclosure).toHaveText(/^Filessrc\/App\.jsx$/);
    await expect(disclosure).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", { name: "Files", exact: true })).toBeHidden();
    await expect(tree(page)).toBeHidden();

    await disclosure.click();
    await expect(tree(page)).toBeVisible();
    await expect(disclosure).toHaveAttribute("aria-expanded", "true");
    await fileNode(page, "src/main.jsx").click();
    await expect(tree(page)).toBeHidden();
    await expect(disclosure).toHaveText(/src\/main\.jsx$/);
    await expect(page.locator(".pane--editor .cm-content")).toHaveAttribute(
      "aria-label",
      "Code editor for src/main.jsx",
    );
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow, "nothing scrolls sideways").toBe(false);
  });
});

test.describe("a local step's download note", () => {
  test("says to install only when the folder has a package.json", async ({ page }) => {
    await page.goto("#/topic/git-basics/8");
    await expect(page.locator(".local-download .meta")).toContainText(
      "open its index.html in your browser; there is nothing to install.",
    );
    await page.goto("#/topic/deploy-with-github-pages/5");
    await expect(page.locator(".local-download .meta")).toContainText(
      "Unzip it, then run npm install and npm run dev in the folder.",
    );
  });
});
