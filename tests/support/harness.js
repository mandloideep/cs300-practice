// Shared by the Playwright specs: the edit steps in content/ and helpers that drive the
// dev-only runner harness at src/runner/harness/index.html.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

export const HARNESS = "src/runner/harness/index.html";
export const topicsDir = path.join(import.meta.dirname, "..", "..", "content", "topics");

function frontMatter(markdown) {
  const block = /^---\n([\s\S]*?)\n---/.exec(markdown)?.[1] ?? "";
  const field = (name) => new RegExp(`^${name}:\\s*(.+)$`, "m").exec(block)?.[1].trim() ?? null;
  const list = field("required");
  return {
    mode: field("mode"),
    entry: field("entry"),
    starterCompiles: field("starterCompiles") !== "false",
    required: list
      ? list
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : null,
  };
}

// Which of the inspector and network arguments the step's check.js destructures.
function checkDependencies(source) {
  const parameters = /export default async function \w*\s*\(\s*\{([^}]*)\}/.exec(source)?.[1] ?? "";
  return ["inspector", "network"].filter((name) => new RegExp(`\\b${name}\\b`).test(parameters));
}

function readFiles(directory, prefix = "") {
  if (!existsSync(directory)) return {};
  const files = {};
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory())
      Object.assign(files, readFiles(path.join(directory, entry.name), `${relative}/`));
    else files[relative] = readFileSync(path.join(directory, entry.name), "utf8");
  }
  return files;
}

export function editSteps() {
  const steps = [];
  for (const topic of readdirSync(topicsDir).sort()) {
    const topicDir = path.join(topicsDir, topic);
    if (!existsSync(path.join(topicDir, "topic.json"))) continue;
    for (const slug of readdirSync(topicDir).sort()) {
      const stepFile = path.join(topicDir, slug, "step.md");
      if (!existsSync(stepFile)) continue;
      const meta = frontMatter(readFileSync(stepFile, "utf8"));
      if (meta.mode !== "edit") continue;
      const checkFile = path.join(topicDir, slug, "check.js");
      const check = existsSync(checkFile) ? readFileSync(checkFile, "utf8") : null;
      steps.push({
        id: `${topic}/${slug}`,
        ...meta,
        hasCheck: Boolean(check),
        checkDependsOn: check ? checkDependencies(check) : [],
        solution: readFiles(path.join(topicDir, slug, "solution")),
      });
    }
  }
  return steps;
}

export async function openHarness(page) {
  await page.goto(HARNESS);
  await page.waitForFunction(() => globalThis.__harness?.ready === true);
}

export function runStep(page, id, variant, options = {}) {
  return page.evaluate(
    ([stepId, which, extra]) => globalThis.__harness.runStep(stepId, which, extra),
    [id, variant, options],
  );
}

export function run(page, options) {
  return page.evaluate((runOptions) => globalThis.__harness.run(runOptions), options);
}

export function resultFrame(page) {
  return page.frames().find((frame) => frame.parentFrame() === page.mainFrame());
}
