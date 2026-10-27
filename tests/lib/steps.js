// Reads content/ directly so that specs can list every step without a compiled build.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const topicsDir = path.join(import.meta.dirname, "..", "..", "content", "topics");

const unquote = (value) => value?.replace(/^(["'])(.*)\1$/, "$2") ?? null;

// "[a, b]" -> ["a", "b"]; anything else -> null.
function list(value) {
  if (!value || !/^\[.*\]$/.test(value)) return null;
  return value
    .slice(1, -1)
    .split(",")
    .map((item) => unquote(item.trim()))
    .filter(Boolean);
}

// The small YAML subset step.md uses: top-level scalars and lists, plus one level of nesting
// under `inspector` and `api`.
function frontMatter(markdown) {
  const block = /^---\n([\s\S]*?)\n---/.exec(markdown)?.[1] ?? "";
  const field = (name) => new RegExp(`^${name}:\\s*(.+)$`, "m").exec(block)?.[1].trim() ?? null;
  const nested = (parent, name) =>
    new RegExp(`^${parent}:\\n(?:[ \\t]+.+\\n?)*?[ \\t]+${name}:\\s*(.+)$`, "m")
      .exec(block)?.[1]
      .trim() ?? null;
  return {
    title: unquote(field("title")),
    mode: field("mode"),
    entry: field("entry"),
    required: list(field("required")),
    inspector: /^inspector:/m.test(block)
      ? { views: list(nested("inspector", "views")), watch: list(nested("inspector", "watch")) }
      : null,
  };
}

// The ids of the results a check.js returns, read from its `id: "..."` lines.
function checkIds(source) {
  return [...new Set([...source.matchAll(/^\s*id:\s*"([\w-]+)"/gm)].map((match) => match[1]))];
}

// The check arguments a step's check.js destructures that are not delivered yet.
function checkDependencies(source) {
  const parameters = /export default async function \w*\s*\(\s*\{([^}]*)\}/.exec(source)?.[1] ?? "";
  return ["inspector", "network"].filter((name) => new RegExp(`\\b${name}\\b`).test(parameters));
}

// Whether any script under the step's solution/ has an import matching the pattern.
function solutionImports(stepDir, pattern) {
  const solutionDir = path.join(stepDir, "solution");
  if (!existsSync(solutionDir)) return false;
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(jsx?|mjs)$/.test(entry.name)) files.push(full);
    }
  };
  walk(solutionDir);
  return files.some((file) => pattern.test(readFileSync(file, "utf8")));
}

// Whether the solution imports react-router: those solutions run only once the runtime maps
// BrowserRouter onto a memory history inside the iframe (PHASE3 milestone 1).
function usesRouter(stepDir) {
  return solutionImports(stepDir, /\bfrom\s+["']react-router["']/);
}

// Whether the solution is a React workspace (CONTRACTS section 2); a vanilla workspace renders
// no components, so the inspector pane shows its empty message instead of a commit.
function usesReact(stepDir) {
  return solutionImports(stepDir, /\bfrom\s+["']react(?:\/[\w-]+)?["']/);
}

export function allSteps() {
  const steps = [];
  for (const topic of readdirSync(topicsDir).sort()) {
    const topicDir = path.join(topicsDir, topic);
    if (!existsSync(path.join(topicDir, "topic.json"))) continue;
    const slugs = readdirSync(topicDir)
      .filter((slug) => /^\d\d-/.test(slug))
      .sort();
    slugs.forEach((slug, index) => {
      const stepDir = path.join(topicDir, slug);
      const meta = frontMatter(readFileSync(path.join(stepDir, "step.md"), "utf8"));
      const checkFile = path.join(stepDir, "check.js");
      const check = existsSync(checkFile) ? readFileSync(checkFile, "utf8") : null;
      steps.push({
        id: `${topic}/${slug}`,
        topic,
        n: index + 1,
        ...meta,
        hasCheck: Boolean(check),
        checkIds: check ? checkIds(check) : [],
        checkDependsOn: check ? checkDependencies(check) : [],
        hasLocal: existsSync(path.join(stepDir, "local")),
        usesRouter: usesRouter(stepDir),
        usesReact: usesReact(stepDir),
      });
    });
  }
  return steps;
}

export function stepById(id) {
  const step = allSteps().find((candidate) => candidate.id === id);
  if (!step) throw new Error(`No step ${id} under content/topics/`);
  return step;
}
