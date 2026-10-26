// Reads content/ directly so that specs can list every step without a compiled build.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const topicsDir = path.join(import.meta.dirname, "..", "..", "content", "topics");

function frontMatter(markdown) {
  const block = /^---\n([\s\S]*?)\n---/.exec(markdown)?.[1] ?? "";
  const field = (name) => new RegExp(`^${name}:\\s*(.+)$`, "m").exec(block)?.[1].trim() ?? null;
  const unquote = (value) => value?.replace(/^(["'])(.*)\1$/, "$2") ?? null;
  return { title: unquote(field("title")), mode: field("mode") };
}

// The check arguments a step's check.js destructures that are not delivered yet.
function checkDependencies(source) {
  const parameters = /export default async function \w*\s*\(\s*\{([^}]*)\}/.exec(source)?.[1] ?? "";
  return ["inspector", "network"].filter((name) => new RegExp(`\\b${name}\\b`).test(parameters));
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
        checkDependsOn: check ? checkDependencies(check) : [],
        hasLocal: existsSync(path.join(stepDir, "local")),
      });
    });
  }
  return steps;
}
