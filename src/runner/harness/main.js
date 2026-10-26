// Development-only harness for the runner. It reads every step straight from content/, builds a
// run for its workspace or solution, mounts the result iframe, and prints every bridge message.
// Playwright drives it through window.__harness (see tests/runner.spec.js).

import { IFRAME_SANDBOX, buildRun } from "../index.js";

const sources = import.meta.glob("/content/topics/*/*/**/*", {
  query: "?raw",
  import: "default",
  eager: true,
});

const FIXTURES_BASE = "https://fixtures.local";
const DEFAULT_FIXTURE_CONTROLS = {
  latencyMs: 0,
  errorStatus: null,
  malformedBody: false,
  dropConnection: false,
};

function parseValue(text) {
  const value = text.trim();
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return value.replace(/^(["'])(.*)\1$/, "$2");
}

// Reads the small YAML subset step.md front matter uses: scalars, inline lists, and one level of
// nested keys.
function parseFrontMatter(markdown) {
  const match = /^---\n([\s\S]*?)\n---/.exec(markdown ?? "");
  const data = {};
  if (!match) return data;
  let parent = null;
  for (const line of match[1].split("\n")) {
    const nested = /^\s+([\w-]+):\s*(.*)$/.exec(line);
    const top = /^([\w-]+):\s*(.*)$/.exec(line);
    if (nested && parent) {
      data[parent][nested[1]] = parseValue(nested[2]);
    } else if (top) {
      if (top[2].trim() === "") {
        parent = top[1];
        data[parent] = {};
      } else {
        parent = null;
        data[top[1]] = parseValue(top[2]);
      }
    }
  }
  return data;
}

function filesUnder(prefix) {
  const files = {};
  for (const [path, text] of Object.entries(sources)) {
    if (path.startsWith(prefix)) files[path.slice(prefix.length)] = text;
  }
  return Object.keys(files).length > 0 ? files : null;
}

function loadSteps() {
  const directories = new Set();
  for (const path of Object.keys(sources)) {
    const match = /^\/content\/topics\/([^/]+)\/(\d+-[^/]+)\//.exec(path);
    if (match) directories.add(`${match[1]}/${match[2]}`);
  }
  return [...directories].sort().map((id) => {
    const [topic, slug] = id.split("/");
    const base = `/content/topics/${id}/`;
    const meta = parseFrontMatter(sources[`${base}step.md`]);
    const fixtureFiles = filesUnder(`${base}fixtures/`);
    let fixtures = null;
    if (fixtureFiles?.["routes.json"]) {
      const { "routes.json": routes, ...bodies } = fixtureFiles;
      fixtures = { routes: JSON.parse(routes).routes, bodies };
    }
    return {
      id,
      topic,
      slug,
      title: meta.title ?? slug,
      mode: meta.mode ?? null,
      entry: meta.entry ?? null,
      required: meta.required ?? null,
      api: meta.api ?? null,
      check: sources[`${base}check.js`] ?? null,
      fixtures,
      workspace: filesUnder(`${base}workspace/`),
      solution: filesUnder(`${base}solution/`),
    };
  });
}

const steps = loadSteps();
const stepById = new Map(steps.map((step) => [step.id, step]));

const runtimeBase = import.meta.env.BASE_URL + "runtime/";
const messagesByRun = new Map();
const waiters = new Set();
let current = null;

const elements = {
  form: document.getElementById("controls"),
  step: document.getElementById("step"),
  inspector: document.getElementById("inspector"),
  slot: document.getElementById("frame-slot"),
  log: document.getElementById("log"),
  status: document.getElementById("status"),
  runChecks: document.getElementById("run-checks"),
  clear: document.getElementById("clear"),
};

function logLine(className, text) {
  const item = document.createElement("li");
  item.className = className;
  item.textContent = text;
  elements.log.append(item);
  item.scrollIntoView({ block: "nearest" });
}

function describe(message) {
  const { type, source: _source, runId: _runId, ...rest } = message;
  if (type === "console") return `console.${rest.level}: ${rest.text}`;
  if (type === "check-results") {
    return `check-results:\n${rest.results.map((r) => `  ${r.pass ? "pass" : "FAIL"} ${r.id}: ${r.title}${r.pass ? "" : ` (${r.hint})`}`).join("\n")}`;
  }
  return Object.keys(rest).length > 0 ? `${type}: ${JSON.stringify(rest)}` : type;
}

window.addEventListener("message", (event) => {
  const message = event.data;
  if (message?.source !== "cs300-lab" || !messagesByRun.has(message.runId)) return;
  messagesByRun.get(message.runId).push(message);
  if (message.runId === current?.runId) {
    logLine(message.type, describe(message));
    if (message.type === "settled") elements.status.textContent = "settled";
  }
  for (const waiter of waiters) waiter();
});

function waitFor(predicate, timeoutMs) {
  return new Promise((resolve) => {
    const check = () => {
      if (!predicate()) return false;
      finish(true);
      return true;
    };
    const finish = (value) => {
      waiters.delete(check);
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    waiters.add(check);
    check();
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function send(message) {
  const frame = elements.slot.querySelector("iframe");
  frame?.contentWindow?.postMessage(
    { ...message, source: "cs300-lab", runId: current?.runId },
    "*",
  );
}

// Builds and mounts a run, then resolves once it settled and, when it has a check, once the
// automatic check finished, plus `quietMs` for late messages.
async function run({
  files,
  entry,
  check = null,
  fixtures = null,
  env = {},
  fixtureControls = DEFAULT_FIXTURE_CONTROLS,
  inspector = false,
  timeoutMs = 15_000,
  quietMs = 300,
}) {
  current?.dispose();
  elements.slot.replaceChildren();
  elements.status.textContent = "running";

  const built = buildRun({
    files,
    entry,
    runtimeBase,
    env,
    fixtures,
    fixtureControls,
    check,
    inspector,
  });
  current = built;
  const messages = [];
  messagesByRun.set(built.runId, messages);
  logLine("ready", `— ${built.runId} (${entry}) —`);

  const result = () => ({
    runId: built.runId,
    srcdoc: built.srcdoc,
    diagnostics: built.diagnostics,
    moduleUrls: built.moduleUrls,
    declarations: built.declarations,
    messages: structuredClone(messages),
  });

  if (built.diagnostics.length > 0) {
    for (const d of built.diagnostics) {
      logLine("diagnostic", `${d.file}:${d.line}:${d.column} ${d.message}`);
    }
    elements.status.textContent = "compile error";
    return { ...result(), timedOut: false };
  }

  const frame = document.createElement("iframe");
  frame.title = "Result";
  frame.setAttribute("sandbox", IFRAME_SANDBOX);
  frame.srcdoc = built.srcdoc;
  elements.slot.append(frame);

  const has = (type) => messages.some((message) => message.type === type);
  let done = await waitFor(() => has("settled"), timeoutMs);
  if (done && check) {
    done = await waitFor(() => has("check-results") || has("check-error"), timeoutMs);
  }
  await delay(quietMs);
  return { ...result(), timedOut: !done };
}

function runStep(id, variant = "solution", options = {}) {
  const step = stepById.get(id);
  if (!step) throw new Error(`Unknown step ${id}`);
  const files = step[variant];
  if (!files) throw new Error(`Step ${id} has no ${variant} files`);
  elements.step.value = id;
  elements.form.elements.variant.value = variant;
  return run({
    files,
    entry: step.entry,
    check: step.check,
    fixtures: step.fixtures,
    env: step.api ? { API_BASE: FIXTURES_BASE } : {},
    ...options,
  });
}

for (const topic of [...new Set(steps.map((step) => step.topic))]) {
  const group = document.createElement("optgroup");
  group.label = topic;
  for (const step of steps.filter((candidate) => candidate.topic === topic)) {
    const option = new Option(`${step.slug} (${step.mode})`, step.id);
    option.disabled = step.mode !== "edit";
    group.append(option);
  }
  elements.step.append(group);
}
elements.step.value = steps.find((step) => step.mode === "edit")?.id ?? "";

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const variant = new FormData(elements.form).get("variant");
  runStep(elements.step.value, variant, { inspector: elements.inspector.checked });
});
elements.runChecks.addEventListener("click", () => send({ type: "run-checks" }));
elements.clear.addEventListener("click", () => elements.log.replaceChildren());

window.__harness = {
  ready: true,
  steps: steps.map(({ workspace: _w, solution: _s, check, fixtures, ...meta }) => ({
    ...meta,
    hasCheck: Boolean(check),
    hasFixtures: Boolean(fixtures),
  })),
  step: (id) => stepById.get(id),
  run,
  runStep,
  send,
  messages: () => structuredClone(messagesByRun.get(current?.runId) ?? []),
};
