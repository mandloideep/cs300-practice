// Validates content/ against docs/CONTRACTS.md sections 2 and 3 without writing anything.
// Exits 1 and names each file and reason when a rule fails.
//
// Usage: npm run validate

import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatProblems, loadContent } from "./lib/content.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { content, problems } = loadContent(path.join(root, "content"));

if (problems.length > 0) {
  console.error(formatProblems(problems));
  console.error(`\nvalidate: ${problems.length} problem(s) in content/`);
  process.exit(1);
}

const steps = content.topics.reduce((total, topic) => total + topic.steps.length, 0);
console.log(
  `validate: content/ is valid: ${content.topics.length} topics, ${steps} steps, ` +
    `${content.paths.length} path(s), ${content.areas.length} areas, ${content.presets.length} presets`,
);
