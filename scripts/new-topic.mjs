// Scaffolds a topic under content/topics/: topic.json and a first edit step with step.md,
// workspace/, solution/, and check.js from the templates under scripts/templates/.
// Refuses to overwrite an existing topic directory.
//
// Usage: npm run new:topic -- <id> --area <area> --title "<title>" [--kind react|vanilla]
//        [--step "<first step title>"]
//
// The kind picks the starter workspace: vanilla for the html, css, javascript, dom, and fetch
// areas and react for the others, unless --kind says otherwise.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseOptions, UsageError } from "./lib/cli.mjs";
import { KINDS, scaffoldTopic, ScaffoldError } from "./lib/scaffold.mjs";

const USAGE =
  'Usage: npm run new:topic -- <id> --area <area> --title "<title>" ' +
  `[--kind ${KINDS.join("|")}] [--step "<first step title>"]`;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  const { positional, options } = parseOptions(process.argv.slice(2), [
    "area",
    "title",
    "kind",
    "step",
  ]);
  if (positional.length !== 1) throw new UsageError("expected exactly one topic id");
  if (!options.area) throw new UsageError("--area is needed");
  if (!options.title) throw new UsageError("--title is needed");
  const result = scaffoldTopic({
    contentDir: path.join(root, "content"),
    id: positional[0],
    area: options.area,
    title: options.title,
    ...(options.kind ? { kind: options.kind } : {}),
    ...(options.step ? { stepTitle: options.step } : {}),
  });
  const relative = path.relative(root, result.topicDir);
  console.log(`new:topic: wrote ${relative}/`);
  for (const file of result.files) console.log(`  ${file}`);
  console.log("\nFill in:");
  for (const line of result.next) console.log(`  ${line}`);
} catch (error) {
  if (error instanceof UsageError) {
    console.error(`new:topic: ${error.message}\n${USAGE}`);
    process.exit(2);
  }
  if (error instanceof ScaffoldError) {
    console.error(`new:topic: ${error.message}`);
    process.exit(1);
  }
  throw error;
}
