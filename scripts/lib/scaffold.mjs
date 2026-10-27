// Scaffolding for content/: a new topic with its first step, and the next step of a topic.
// new-topic.mjs and new-step.mjs are the command lines; scripts/test/scaffold.test.mjs runs
// these functions against a temporary content directory and validates what they write.
//
// Templates live under scripts/templates/. Every template file is text, and {{name}} in it is
// replaced with a value; a name without a value is an error, so a template cannot be half filled.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { isDirectory, listDirectories, readJson, readTree } from "./files.mjs";

export const TEMPLATES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "templates",
);
export const KINDS = ["react", "vanilla"];
export const VANILLA_AREAS = ["html", "css", "javascript", "dom", "fetch"];
const TOPIC_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STEP_DIR = /^(\d{2})-/;

export class ScaffoldError extends Error {}

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function fill(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    if (!(name in values)) throw new ScaffoldError(`template uses {{${name}}}, which has no value`);
    return values[name];
  });
}

function stepNumber(n) {
  return String(n).padStart(2, "0");
}

function yamlScalar(text) {
  return /^[A-Za-z0-9][A-Za-z0-9 ,.()'-]*$/.test(text) ? text : JSON.stringify(text);
}

function yamlList(items) {
  return `[${items.join(", ")}]`;
}

// A path as the messages show it: relative to the repository, with forward slashes.
function shown(contentDir, file) {
  return path.relative(path.dirname(contentDir), file).split(path.sep).join("/");
}

// Writes { "relative/path": "text" } under dir, refusing to touch an existing file.
// Returns the written paths in listing order.
function writeFiles(contentDir, dir, files) {
  for (const relative of Object.keys(files)) {
    const file = path.join(dir, relative);
    if (existsSync(file)) throw new ScaffoldError(`${shown(contentDir, file)} already exists`);
  }
  for (const [relative, text] of Object.entries(files)) {
    const file = path.join(dir, relative);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, text);
  }
  return Object.keys(files).sort();
}

function filledTree(dir, values) {
  const tree = readTree(dir);
  if (!tree) throw new ScaffoldError(`template directory ${dir} is missing`);
  return Object.fromEntries(Object.entries(tree).map(([file, text]) => [file, fill(text, values)]));
}

function areaIds(contentDir) {
  const { value, error } = readJson(path.join(contentDir, "areas.json"));
  if (error) throw new ScaffoldError(`content/areas.json ${error}`);
  return value.map((area) => area.id);
}

export function defaultKind(area) {
  return VANILLA_AREAS.includes(area) ? "vanilla" : "react";
}

// Creates content/topics/<id>/ with topic.json and a first edit step.
// Returns { topicDir, files, next } where next lists what the author fills in.
export function scaffoldTopic({
  contentDir,
  templatesDir = TEMPLATES_DIR,
  id,
  area,
  title,
  kind = defaultKind(area),
  stepTitle = "First step",
  date = today(),
}) {
  if (typeof id !== "string" || !TOPIC_ID.test(id)) {
    throw new ScaffoldError(
      `topic id ${JSON.stringify(id)} must be lowercase words joined by hyphens`,
    );
  }
  if (typeof title !== "string" || title.trim() === "")
    throw new ScaffoldError("a title is needed");
  const areas = areaIds(contentDir);
  if (!areas.includes(area)) {
    throw new ScaffoldError(`area ${JSON.stringify(area)} is not one of ${areas.join(", ")}`);
  }
  if (!KINDS.includes(kind)) throw new ScaffoldError(`kind must be one of ${KINDS.join(", ")}`);
  const stepSlug = slugify(stepTitle);
  if (stepSlug === "") throw new ScaffoldError("the step title needs at least one letter or digit");
  const topicDir = path.join(contentDir, "topics", id);
  if (existsSync(topicDir))
    throw new ScaffoldError(`${shown(contentDir, topicDir)} already exists`);

  const values = { id, area, title: title.trim(), stepTitle: yamlScalar(stepTitle.trim()), date };
  const stepDir = `01-${stepSlug}`;
  const files = {
    "topic.json": fill(readFileSync(path.join(templatesDir, "topic.json"), "utf8"), values),
  };
  for (const [file, text] of Object.entries(filledTree(path.join(templatesDir, kind), values))) {
    files[`${stepDir}/${file}`] = text;
  }
  const written = writeFiles(contentDir, topicDir, files);
  return {
    topicDir,
    files: written,
    next: [
      `topic.json: write the summary, the prerequisites, the minutes, and the changeNote.`,
      `${stepDir}/step.md: replace the placeholder sentences, keep or change the edit block, and write the Check and If it breaks paragraphs.`,
      `${stepDir}/workspace/ and solution/: shape the starter files; applying the edit blocks to workspace/ must produce solution/.`,
      `${stepDir}/check.js: write two to four checks about what the step changes.`,
      `content/paths/<path>.json: add ${id} to a unit so that students can reach it.`,
      `Then run npm run validate, and npm run dev to walk the step in the browser.`,
    ],
  };
}

// Picks the most recent step that has a solution/ to start the next step from.
function previousEditStep(topicDir, dirs) {
  for (const dir of [...dirs].reverse()) {
    const stepDir = path.join(topicDir, dir);
    if (isDirectory(path.join(stepDir, "solution"))) return stepDir;
  }
  return null;
}

function frontMatterFrom(previousStepFile, title) {
  const previous = previousStepFile ? matter(readFileSync(previousStepFile, "utf8")).data : {};
  const lines = [`title: ${yamlScalar(title)}`];
  if (previousStepFile) {
    lines.push("mode: edit", `entry: ${previous.entry ?? "index.html"}`);
    if (previous.inspector) {
      lines.push("inspector:");
      if (previous.inspector.views) lines.push(`  views: ${yamlList(previous.inspector.views)}`);
      if (previous.inspector.watch) lines.push(`  watch: ${yamlList(previous.inspector.watch)}`);
    }
    if (previous.api) lines.push("api:", `  default: ${previous.api.default}`);
  } else {
    lines.push("mode: read");
  }
  return `---\n${lines.join("\n")}\n---\n`;
}

// Adds the next numbered step to content/topics/<topicId>/. The step starts from the previous
// edit step's solution: workspace/ and solution/ are copies of it, as are its fixtures/.
// Returns { stepDir, files, next }.
export function scaffoldStep({ contentDir, templatesDir = TEMPLATES_DIR, topicId, title }) {
  const topicDir = path.join(contentDir, "topics", topicId ?? "");
  if (!topicId || !isDirectory(topicDir)) {
    throw new ScaffoldError(
      `${JSON.stringify(topicId)} is not a topic under ${shown(contentDir, path.join(contentDir, "topics"))}/`,
    );
  }
  if (typeof title !== "string" || title.trim() === "")
    throw new ScaffoldError("a step title is needed");
  const slug = slugify(title);
  if (slug === "") throw new ScaffoldError("the step title needs at least one letter or digit");
  const dirs = listDirectories(topicDir).filter((dir) => STEP_DIR.test(dir));
  const n = dirs.length + 1;
  const dirName = `${stepNumber(n)}-${slug}`;
  const stepDir = path.join(topicDir, dirName);
  if (existsSync(stepDir)) throw new ScaffoldError(`${shown(contentDir, stepDir)} already exists`);

  const previous = previousEditStep(topicDir, dirs);
  const files = {
    "step.md":
      frontMatterFrom(previous && path.join(previous, "step.md"), title.trim()) +
      "\n" +
      readFileSync(path.join(templatesDir, "step-body.md"), "utf8"),
    "check.js": readFileSync(path.join(templatesDir, "check.js"), "utf8"),
  };
  if (previous) {
    const solution = readTree(path.join(previous, "solution"));
    for (const [file, text] of Object.entries(solution)) {
      files[`workspace/${file}`] = text;
      files[`solution/${file}`] = text;
    }
    for (const [file, text] of Object.entries(readTree(path.join(previous, "fixtures")) ?? {})) {
      files[`fixtures/${file}`] = text;
    }
  }
  const written = writeFiles(contentDir, stepDir, files);
  return {
    stepDir,
    files: written,
    next: [
      previous
        ? `${dirName}/workspace/ is a copy of ${path.basename(previous)}/solution/; change solution/ and write edit blocks in step.md that turn one into the other.`
        : `${dirName}/ is a read step because no earlier step has a solution/; add workspace/ and solution/ and set mode: edit for an edit step.`,
      `${dirName}/step.md: replace the placeholder sentences and write the Check and If it breaks paragraphs.`,
      `${dirName}/check.js: write two to four checks about what the step changes.`,
      `topic.json: set updated to today and say what changed in changeNote.`,
      `Then run npm run validate, and npm run dev to walk the step in the browser.`,
    ],
  };
}
