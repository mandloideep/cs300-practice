// Adds the next numbered step to a topic. The new step starts from the previous edit step's
// solution: its workspace/ and solution/ are copies of it, along with any fixtures/, and its
// step.md keeps that step's entry, inspector, and api settings.
// Refuses to overwrite an existing step directory.
//
// Usage: npm run new:step -- <topic-id> "<title>"

import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseOptions, UsageError } from "./lib/cli.mjs";
import { scaffoldStep, ScaffoldError } from "./lib/scaffold.mjs";

const USAGE = 'Usage: npm run new:step -- <topic-id> "<title>"';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  const { positional } = parseOptions(process.argv.slice(2), []);
  if (positional.length !== 2) throw new UsageError("expected a topic id and a step title");
  const result = scaffoldStep({
    contentDir: path.join(root, "content"),
    topicId: positional[0],
    title: positional[1],
  });
  const relative = path.relative(root, result.stepDir);
  console.log(`new:step: wrote ${relative}/`);
  for (const file of result.files) console.log(`  ${file}`);
  console.log("\nFill in:");
  for (const line of result.next) console.log(`  ${line}`);
} catch (error) {
  if (error instanceof UsageError) {
    console.error(`new:step: ${error.message}\n${USAGE}`);
    process.exit(2);
  }
  if (error instanceof ScaffoldError) {
    console.error(`new:step: ${error.message}`);
    process.exit(1);
  }
  throw error;
}
