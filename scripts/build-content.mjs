// Compiles content/ into public/content/: index.json with areas, topics, paths, and presets, and
// one topics/<id>.json per topic with rendered step HTML, workspaces, solutions, fixtures, and
// checks. Runs every validation rule first and writes nothing when one fails.
//
// Usage: npm run build:content

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatProblems, loadContent } from "./lib/content.mjs";
import { buildIndex, buildTopic } from "./lib/output.mjs";
import { createRenderer } from "./lib/render.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "content");

const { content, problems } = loadContent(path.join(root, "content"));
if (problems.length > 0) {
  console.error(formatProblems(problems));
  console.error(`\nbuild:content: ${problems.length} problem(s) in content/; nothing was written`);
  process.exit(1);
}

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
console.log(`build:content: wrote public/content/ with ${topics.length} topics and ${steps} steps`);
