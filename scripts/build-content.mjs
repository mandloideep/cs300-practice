// Compiles content/ into public/content/: index.json with areas, topics, paths, and presets, and
// one topics/<id>.json per topic with rendered step HTML, workspaces, solutions, fixtures, and
// checks. Runs every validation rule first and writes nothing when one fails.
//
// Releases follow docs/CONTRACTS.md section 7.5: a unit whose opens date is after the build date
// compiles as its id, title, and date only, and a topic in no open unit of an active path is left
// out. The build date is LAB_BUILD_DATE, or today in UTC; --all compiles everything.
//
// Usage: npm run build:content [-- --all]
//        LAB_BUILD_DATE=2027-03-01 npm run build:content

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { UsageError } from "./lib/cli.mjs";
import { formatProblems, loadContent, releaseContent, releaseOptions } from "./lib/content.mjs";
import { buildIndex, buildTopic } from "./lib/output.mjs";
import { createRenderer } from "./lib/render.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "content");

let release;
try {
  release = releaseOptions(process.argv.slice(2), process.env);
} catch (error) {
  if (!(error instanceof UsageError)) throw error;
  console.error(`build:content: ${error.message}\nUsage: npm run build:content [-- --all]`);
  process.exit(2);
}

const { content: loaded, problems } = loadContent(path.join(root, "content"));
if (problems.length > 0) {
  console.error(formatProblems(problems));
  console.error(`\nbuild:content: ${problems.length} problem(s) in content/; nothing was written`);
  process.exit(1);
}

const content = releaseContent(loaded, release);
const renderer = await createRenderer();
const topics = content.topics.map((topic) => buildTopic(topic, renderer.render));
renderer.dispose();

await rm(outDir, { recursive: true, force: true });
await mkdir(path.join(outDir, "topics"), { recursive: true });
await writeFile(
  path.join(outDir, "index.json"),
  JSON.stringify(buildIndex(content, new Date().toISOString()), null, 2) + "\n",
);
for (const topic of topics) {
  await writeFile(path.join(outDir, "topics", `${topic.id}.json`), JSON.stringify(topic) + "\n");
}

const steps = topics.reduce((total, topic) => total + topic.steps.length, 0);
const units = content.paths.flatMap((item) => item.units);
const closed = units.filter((unit) => unit.closed).length;
const scope = release.all
  ? "everything, with --all"
  : `as of ${release.buildDate}: ${units.length - closed} open unit(s), ${closed} closed`;
console.log(
  `build:content: wrote public/content/ with ${topics.length} topics and ${steps} steps, ${scope}`,
);
