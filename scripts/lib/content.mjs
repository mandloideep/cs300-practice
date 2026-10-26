// Reads content/ into one model and checks it against docs/CONTRACTS.md sections 2 and 3.
// validate-content.mjs reports the problems; build-content.mjs reports them and, when there are
// none, turns the same model into public/content/.

import { readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { transform } from "sucrase";
import { unifiedDiff } from "./diff.mjs";
import { ACTIONS, ANCHORED_ACTIONS, applyEdits, editsFromTokens, parseInfo } from "./edits.mjs";
import { isDirectory, listDirectories, readJson, readTree } from "./files.mjs";
import { createMarkdown, LANGUAGES } from "./render.mjs";

export const MODES = ["edit", "read", "local"];
export const VIEWS = ["boundaries", "flash", "tree", "network"];
const REACT_VIEWS = ["boundaries", "flash", "tree"];
const STEP_DIR = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const EM_DASH = "—";
const markdown = createMarkdown();

class Problems {
  constructor(root) {
    this.root = root;
    this.list = [];
  }

  add(file, reason, detail = null) {
    this.list.push({
      file: path.relative(this.root, file).split(path.sep).join("/"),
      reason,
      detail,
    });
  }
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function compiles(code, filePath) {
  try {
    transform(code, { transforms: ["jsx"], jsxRuntime: "automatic", production: false, filePath });
    return null;
  } catch (error) {
    return error.message;
  }
}

function isReactWorkspace(files) {
  return Object.entries(files).some(
    ([file, code]) =>
      /\.(jsx?|mjs)$/.test(file) && /\bfrom\s+["']react(?:\/[\w-]+)?["']/.test(code),
  );
}

function checkMarkdownText(text, file, problems) {
  const lines = text.split("\n");
  lines.forEach((line, index) => {
    if (line.includes(EM_DASH))
      problems.add(file, `line ${index + 1} contains the em dash character`);
  });
}

function checkCompiles(files, base, label, problems) {
  for (const [file, code] of Object.entries(files)) {
    if (!/\.(jsx?|mjs)$/.test(file)) continue;
    const error = compiles(code, file);
    if (error)
      problems.add(path.join(base, file), `${label} file does not compile with Sucrase: ${error}`);
  }
}

function loadFixtures(stepDir, problems) {
  const dir = path.join(stepDir, "fixtures");
  if (!isDirectory(dir)) return null;
  const routesFile = path.join(dir, "routes.json");
  const { value, error } = readJson(routesFile);
  if (error) {
    problems.add(routesFile, error);
    return null;
  }
  if (!value || !Array.isArray(value.routes)) {
    problems.add(routesFile, 'must be an object with a "routes" array');
    return null;
  }
  const files = readTree(dir);
  const bodies = {};
  for (const [name, text] of Object.entries(files)) {
    if (name !== "routes.json") bodies[name] = text;
  }
  value.routes.forEach((route, index) => {
    const where = `route ${index + 1}`;
    if (typeof route.path !== "string" || !route.path.startsWith("/")) {
      problems.add(routesFile, `${where} needs a "path" that starts with /`);
    }
    if (route.method !== undefined && typeof route.method !== "string") {
      problems.add(routesFile, `${where} has a "method" that is not a string`);
    }
    if (typeof route.body === "string" && !(route.body in bodies)) {
      problems.add(
        routesFile,
        `${where} names body file ${route.body}, which is missing from fixtures/`,
      );
    }
  });
  return { routes: value.routes, bodies };
}

function loadStep(topicDir, dirName, index, context, problems) {
  const stepDir = path.join(topicDir, dirName);
  const match = STEP_DIR.exec(dirName);
  const n = index + 1;
  if (!match) {
    problems.add(stepDir, "step directory must be named NN-slug with a lowercase hyphenated slug");
  } else if (Number(match[1]) !== n) {
    problems.add(
      stepDir,
      `step directories must be numbered contiguously from 01; expected ${String(n).padStart(2, "0")}`,
    );
  }
  const slug = match ? match[2] : dirName.replace(/^\d+-/, "");
  const stepFile = path.join(stepDir, "step.md");
  let raw;
  try {
    raw = readFileSync(stepFile, "utf8");
  } catch {
    problems.add(stepFile, "file is missing");
    return null;
  }
  checkMarkdownText(raw, stepFile, problems);

  let front;
  let body;
  try {
    const parsed = matter(raw);
    front = parsed.data;
    body = parsed.content;
  } catch (error) {
    problems.add(stepFile, `front matter is not valid YAML: ${error.message}`);
    return null;
  }

  if (typeof front.title !== "string" || front.title.trim() === "")
    problems.add(stepFile, "front matter needs a title");
  if (!MODES.includes(front.mode)) {
    problems.add(
      stepFile,
      `mode ${JSON.stringify(front.mode)} is unknown; expected one of ${MODES.join(", ")}`,
    );
  }

  let inspector = null;
  if (front.inspector !== undefined) {
    const views = front.inspector?.views;
    const watch = front.inspector?.watch;
    if (views !== undefined && !isStringArray(views))
      problems.add(stepFile, "inspector.views must be a list of view names");
    else
      for (const view of views ?? []) {
        if (!VIEWS.includes(view))
          problems.add(
            stepFile,
            `inspector.views has unknown view ${JSON.stringify(view)}; expected ${VIEWS.join(", ")}`,
          );
      }
    if (watch !== undefined && !isStringArray(watch))
      problems.add(stepFile, "inspector.watch must be a list of component names");
    inspector = { views: views ?? null, watch: watch ?? [] };
  }

  let api = null;
  if (front.api !== undefined) {
    const value = front.api?.default;
    const allowed = ["fixtures", "custom", ...context.presetIds];
    if (!allowed.includes(value)) {
      problems.add(
        stepFile,
        `api.default ${JSON.stringify(value)} must be fixtures, custom, or a preset id (${context.presetIds.join(", ")})`,
      );
    }
    api = { default: value ?? null };
  }

  let required = null;
  if (front.required !== undefined) {
    if (!isStringArray(front.required))
      problems.add(stepFile, "required must be a list of check ids written as strings");
    required = front.required;
  }

  const offset = raw.split("\n").length - body.split("\n").length;
  const tokens = markdown.parse(body, {});
  for (const token of tokens) {
    if (token.type !== "fence") continue;
    const { lang } = parseInfo(token.info);
    if (!LANGUAGES.includes(lang)) {
      problems.add(
        stepFile,
        `line ${(token.map?.[0] ?? 0) + 1 + offset}: code block language ${JSON.stringify(lang)} is not one of ${LANGUAGES.join(", ")}`,
      );
    }
  }
  for (const link of body.matchAll(/\]\(#\/topic\/([^)/#\s]+)[^)]*\)/g)) {
    if (!context.topicIds.includes(link[1]))
      problems.add(stepFile, `links to unknown topic ${link[1]}`);
  }

  const edits = editsFromTokens(tokens).map((edit) => ({ ...edit, line: edit.line + offset }));
  edits.forEach((edit, i) => {
    const where = `edit block ${i + 1} (line ${edit.line})`;
    if (!ACTIONS.includes(edit.action)) {
      problems.add(
        stepFile,
        `${where} has action ${JSON.stringify(edit.action)}; expected one of ${ACTIONS.join(", ")}`,
      );
    } else if (ANCHORED_ACTIONS.includes(edit.action) && !edit.anchor) {
      problems.add(stepFile, `${where} needs an anchor for action ${edit.action}`);
    }
  });

  const checkFile = path.join(stepDir, "check.js");
  let check = null;
  try {
    check = readFileSync(checkFile, "utf8");
  } catch {
    check = null;
  }
  if (check !== null) {
    const error = compiles(check, "check.js");
    if (error) problems.add(checkFile, `check module does not compile with Sucrase: ${error}`);
  }

  const fixtures = loadFixtures(stepDir, problems);
  if (api && !fixtures && api.default === "fixtures") {
    problems.add(stepFile, "api.default is fixtures but the step has no fixtures/routes.json");
  }

  let workspace = null;
  let solution = null;
  let entry = null;
  if (front.mode === "edit") {
    workspace = readTree(path.join(stepDir, "workspace"));
    solution = readTree(path.join(stepDir, "solution"));
    entry = typeof front.entry === "string" ? front.entry : null;
    if (!workspace) problems.add(stepDir, "edit step has no workspace/ directory");
    if (!solution) problems.add(stepDir, "edit step has no solution/ directory");
    if (!entry) problems.add(stepFile, "edit step needs an entry in its front matter");
    if (workspace && solution) {
      if (entry && !(entry in workspace))
        problems.add(stepFile, `entry ${entry} is missing from workspace/`);
      if (entry && !(entry in solution))
        problems.add(stepFile, `entry ${entry} is missing from solution/`);
      const onlyWorkspace = Object.keys(workspace).filter((file) => !(file in solution));
      const onlySolution = Object.keys(solution).filter((file) => !(file in workspace));
      if (onlyWorkspace.length || onlySolution.length) {
        problems.add(
          stepDir,
          "workspace/ and solution/ must have the same file set" +
            (onlyWorkspace.length ? `; only in workspace: ${onlyWorkspace.join(", ")}` : "") +
            (onlySolution.length ? `; only in solution: ${onlySolution.join(", ")}` : ""),
        );
      }
      if (!("index.html" in workspace)) problems.add(stepDir, "workspace/ has no index.html");
      checkCompiles(workspace, path.join(stepDir, "workspace"), "workspace", problems);
      checkCompiles(solution, path.join(stepDir, "solution"), "solution", problems);

      const { files, failures } = applyEdits(workspace, edits);
      for (const { index: i, edit, reason } of failures) {
        problems.add(stepFile, `edit block ${i + 1} (line ${edit.line}) ${reason}`);
      }
      if (failures.length === 0) {
        for (const file of Object.keys(solution)) {
          if (!(file in files) || files[file] === solution[file]) continue;
          problems.add(
            stepFile,
            `applying the edit blocks to workspace/${file} does not produce solution/${file}`,
            unifiedDiff(
              files[file] ?? "",
              solution[file] ?? "",
              `workspace/${file} with edits applied`,
              `solution/${file}`,
            ),
          );
        }
      }
    }
  } else if (front.mode === "local") {
    if (!isDirectory(path.join(stepDir, "local")))
      problems.add(stepDir, "local step has no local/ directory");
  }

  const local = readTree(path.join(stepDir, "local"));

  return {
    n,
    slug,
    title: typeof front.title === "string" ? front.title : "",
    mode: front.mode,
    body,
    entry,
    inspector:
      inspector && inspector.views === null
        ? { ...inspector, views: workspace && isReactWorkspace(workspace) ? REACT_VIEWS : [] }
        : inspector,
    api,
    required,
    edits: edits.map(({ file, action, anchor, code, lang }) => ({
      file,
      action,
      anchor,
      code,
      lang,
    })),
    workspace,
    solution,
    fixtures,
    check,
    local,
  };
}

const TOPIC_FIELDS = [
  "id",
  "title",
  "area",
  "summary",
  "prerequisites",
  "minutes",
  "updated",
  "changeNote",
];

function loadTopic(topicsDir, id, context, problems) {
  const topicDir = path.join(topicsDir, id);
  const topicFile = path.join(topicDir, "topic.json");
  const { value: meta, error } = readJson(topicFile);
  if (error) {
    problems.add(topicFile, error);
    return null;
  }
  for (const field of TOPIC_FIELDS) {
    if (meta[field] === undefined) problems.add(topicFile, `is missing the ${field} field`);
  }
  if (meta.id !== id)
    problems.add(topicFile, `id ${JSON.stringify(meta.id)} must equal the directory name ${id}`);
  if (!context.areaIds.includes(meta.area)) {
    problems.add(topicFile, `area ${JSON.stringify(meta.area)} is not an id in content/areas.json`);
  }
  if (!isStringArray(meta.prerequisites ?? [])) {
    problems.add(topicFile, "prerequisites must be a list of topic ids");
  } else {
    for (const prerequisite of meta.prerequisites ?? []) {
      if (!context.topicIds.includes(prerequisite))
        problems.add(topicFile, `prerequisite ${prerequisite} is not a topic`);
      if (prerequisite === id) problems.add(topicFile, "a topic cannot be its own prerequisite");
    }
  }
  if (meta.minutes !== undefined && !(Number.isInteger(meta.minutes) && meta.minutes > 0)) {
    problems.add(topicFile, "minutes must be a positive whole number");
  }
  if (meta.updated !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(meta.updated)) {
    problems.add(topicFile, "updated must be a date written as YYYY-MM-DD");
  }

  const dirs = listDirectories(topicDir);
  if (dirs.length === 0) problems.add(topicDir, "topic has no step directories");
  const steps = dirs
    .map((dir, index) => loadStep(topicDir, dir, index, context, problems))
    .filter(Boolean);
  const metaOut = Object.fromEntries(TOPIC_FIELDS.map((field) => [field, meta[field] ?? null]));
  return { ...metaOut, steps };
}

function loadList(file, problems, label) {
  const { value, error } = readJson(file);
  if (error) {
    problems.add(file, error);
    return [];
  }
  if (!Array.isArray(value)) {
    problems.add(file, `must be an array of ${label}`);
    return [];
  }
  const seen = new Set();
  value.forEach((item, index) => {
    if (typeof item?.id !== "string") problems.add(file, `item ${index + 1} needs a string id`);
    else if (seen.has(item.id)) problems.add(file, `id ${item.id} appears more than once`);
    else seen.add(item.id);
  });
  return value;
}

function checkPresets(presets, file, problems) {
  for (const preset of presets) {
    for (const field of ["title", "baseUrl", "docsUrl", "responseShape", "rateLimit"]) {
      if (typeof preset[field] !== "string")
        problems.add(file, `preset ${preset.id} needs a ${field} string`);
    }
    if (
      typeof preset.baseUrl === "string" &&
      (!/^https:\/\//.test(preset.baseUrl) || preset.baseUrl.endsWith("/"))
    ) {
      problems.add(
        file,
        `preset ${preset.id} baseUrl must start with https:// and have no trailing slash`,
      );
    }
    if (!Array.isArray(preset.endpoints) || preset.endpoints.length === 0) {
      problems.add(file, `preset ${preset.id} needs at least one endpoint`);
    }
  }
}

function loadPaths(pathsDir, topicIds, problems) {
  const paths = [];
  for (const name of readDirFiles(pathsDir)) {
    const file = path.join(pathsDir, name);
    const { value, error } = readJson(file);
    if (error) {
      problems.add(file, error);
      continue;
    }
    if (value.id !== name.replace(/\.json$/, ""))
      problems.add(file, "id must equal the file name without .json");
    if (!Array.isArray(value.units)) {
      problems.add(file, "must have a units array");
      continue;
    }
    for (const unit of value.units) {
      const where = `unit ${unit.id ?? "(no id)"}`;
      for (const field of ["id", "title", "intro"]) {
        if (typeof unit[field] !== "string") problems.add(file, `${where} needs a ${field} string`);
      }
      if (!Array.isArray(unit.topics)) {
        problems.add(file, `${where} needs a topics array`);
        continue;
      }
      for (const topic of unit.topics) {
        if (!topicIds.includes(topic.id))
          problems.add(file, `${where} names unknown topic ${topic.id}`);
        if (typeof topic.required !== "boolean")
          problems.add(file, `${where} topic ${topic.id} needs required: true or false`);
      }
      if (unit.localNotes !== undefined && !isStringArray(unit.localNotes)) {
        problems.add(file, `${where} localNotes must be a list of strings`);
      }
    }
    paths.push(value);
  }
  return paths;
}

function readDirFiles(dir) {
  const tree = readTree(dir) ?? {};
  return Object.keys(tree).filter((name) => name.endsWith(".json") && !name.includes("/"));
}

// Returns { content, problems } where problems is [{ file, reason, detail }].
export function loadContent(contentDir) {
  const problems = new Problems(path.dirname(contentDir));
  const areas = loadList(path.join(contentDir, "areas.json"), problems, "areas");
  const presetsFile = path.join(contentDir, "api-presets.json");
  const presets = loadList(presetsFile, problems, "presets");
  checkPresets(presets, presetsFile, problems);

  for (const file of Object.keys(readTree(contentDir) ?? {})) {
    if (!file.endsWith(".md") || file.endsWith("/step.md")) continue;
    checkMarkdownText(
      readFileSync(path.join(contentDir, file), "utf8"),
      path.join(contentDir, file),
      problems,
    );
  }

  const topicsDir = path.join(contentDir, "topics");
  const topicIds = listDirectories(topicsDir);
  const context = {
    areaIds: areas.map((area) => area.id),
    presetIds: presets.map((preset) => preset.id),
    topicIds,
  };
  const topics = topicIds.map((id) => loadTopic(topicsDir, id, context, problems)).filter(Boolean);
  const paths = loadPaths(path.join(contentDir, "paths"), topicIds, problems);

  return { content: { areas, presets, topics, paths }, problems: problems.list };
}

export function formatProblems(problems) {
  return problems
    .map(
      ({ file, reason, detail }) =>
        `error ${file}: ${reason}` + (detail ? "\n" + detail.replace(/^/gm, "    ") : ""),
    )
    .join("\n");
}
