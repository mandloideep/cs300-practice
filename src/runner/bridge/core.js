// Bridge core: the first part of the classic script that runs in the result iframe before the
// import map and before any workspace code. The runner concatenates core.js, inspector-hook.js,
// and fetch-shim.js, each wrapped in its own function scope, after a line that sets
// globalThis.__LAB_BOOT__ to the run's configuration.
//
// It defines globalThis.__LAB__, the one object the bridge parts and check.js share:
//   runId, env, declarations, moduleUrls, fixtures, fixtureControls, inspectorEnabled
//   console                  [{ level, text, time }] captured since the run started
//   network                  request records; the fetch shim pushes into it
//   inspector                { commits: [], latest: null }; the inspector hook fills it
//   post(message)            adds source and runId and posts to the parent window
//   serialize(value, depth)  plain-JSON form of a value, as for console args
//   fileForUrl(url)          workspace path for a module blob URL, or null
//   mapUrls(text)            text with every module blob URL replaced by its workspace path
//   router                   { attach(controller), report(location) }; the react-router wrapper
//                            reports each location, posted as a `location` message, and the
//                            attached controller takes the parent's `navigate` messages
// and globalThis.__LAB_ENV__, which compiled workspace code reads in place of import.meta.env.
//
// The document shares the site's origin, so window.localStorage and window.sessionStorage are
// replaced with views that keep workspace keys under boot.storagePrefix: the student's code sees
// only its own keys, cannot touch the site's progress, and a run starts from empty storage
// unless the parent kept it (docs/CONTRACTS.md section 4.5).

"use strict";

const boot = globalThis.__LAB_BOOT__;
delete globalThis.__LAB_BOOT__;

// A Storage-like object over `backing` that sees only the keys under `prefix`, including the
// property forms (storage.name, "name" in storage, Object.keys(storage)) the real one supports.
function scopedStorage(backing, prefix) {
  const keys = () => {
    const list = [];
    for (let i = 0; i < backing.length; i += 1) {
      const key = backing.key(i);
      if (key !== null && key.startsWith(prefix)) list.push(key.slice(prefix.length));
    }
    return list;
  };
  const storage = {
    get length() {
      return keys().length;
    },
    key(index) {
      return keys()[Number(index)] ?? null;
    },
    getItem(key) {
      return backing.getItem(prefix + String(key));
    },
    setItem(key, value) {
      backing.setItem(prefix + String(key), String(value));
    },
    removeItem(key) {
      backing.removeItem(prefix + String(key));
    },
    clear() {
      for (const key of keys()) backing.removeItem(prefix + key);
    },
  };
  return new Proxy(storage, {
    get(target, property, receiver) {
      if (typeof property === "symbol" || property in target) {
        return Reflect.get(target, property, receiver);
      }
      return target.getItem(property) ?? undefined;
    },
    set(target, property, value) {
      if (typeof property === "symbol") return false;
      target.setItem(property, value);
      return true;
    },
    has(target, property) {
      if (typeof property === "symbol") return false;
      return property in target || target.getItem(property) !== null;
    },
    deleteProperty(target, property) {
      if (typeof property !== "symbol") target.removeItem(property);
      return true;
    },
    ownKeys() {
      return keys();
    },
    getOwnPropertyDescriptor(target, property) {
      if (typeof property === "symbol") return undefined;
      const value = target.getItem(property);
      if (value === null) return undefined;
      return { value, writable: true, enumerable: true, configurable: true };
    },
  });
}

if (boot.storagePrefix) {
  for (const name of ["localStorage", "sessionStorage"]) {
    let backing = null;
    try {
      backing = window[name];
    } catch {
      // Storage is blocked in this browser; the workspace sees the same failure it would in Vite.
    }
    if (!backing) continue;
    Object.defineProperty(window, name, {
      value: scopedStorage(backing, boot.storagePrefix),
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
}

const LEVELS = ["log", "info", "warn", "error", "debug"];
const MAX_ITEMS = 100;

const urlToFile = new Map(Object.entries(boot.moduleUrls).map(([file, url]) => [url, file]));
if (boot.checkUrl) urlToFile.set(boot.checkUrl, "check.js");

function fileForUrl(url) {
  return urlToFile.get(url) ?? null;
}

function mapUrls(text) {
  return String(text).replace(
    /blob:[^\s)'"]+?(?=:\d+:\d+|[\s)'"]|$)/g,
    (url) => urlToFile.get(url) ?? url,
  );
}

function envWith(values) {
  return { ...values, MODE: "development", DEV: true, BASE_URL: "/" };
}

const env = envWith(boot.env);
globalThis.__LAB_ENV__ = env;

const originalConsole = {};
for (const level of LEVELS) originalConsole[level] = console[level];

function post(message) {
  const full = { ...message, source: "cs300-lab", runId: boot.runId };
  try {
    window.parent.postMessage(full, "*");
  } catch {
    window.parent.postMessage(JSON.parse(JSON.stringify(full)), "*");
  }
}

function describeNode(node) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const id = node.id ? `#${node.id}` : "";
    const classes = [...node.classList].map((name) => `.${name}`).join("");
    return `<${node.tagName.toLowerCase()}${id}${classes}>`;
  }
  return `<${node.nodeName.toLowerCase()}>`;
}

const REACT_ELEMENT_TYPES = [Symbol.for("react.transitional.element"), Symbol.for("react.element")];

function reactElementName(element) {
  const type = element.type;
  if (typeof type === "string") return type;
  if (typeof type === "function") return type.displayName || type.name || "Anonymous";
  if (typeof type === "symbol") return type.description?.replace(/^react\./, "") ?? "Fragment";
  return type?.displayName ?? "Component";
}

function constructorName(value) {
  try {
    return Object.getPrototypeOf(value)?.constructor?.name || "Object";
  } catch {
    return "Object";
  }
}

// Primitives as is, functions as "[Function name]", DOM nodes as "<tag#id.class>", errors as
// { name, message, stack }, and objects and arrays to `depth` levels with cycles cut.
function serialize(value, depth = 3, ancestors = []) {
  const type = typeof value;
  if (value === null || type === "string" || type === "number" || type === "boolean") return value;
  if (type === "undefined") return undefined;
  if (type === "bigint") return `${value}n`;
  if (type === "symbol") return value.toString();
  if (type === "function") return `[Function ${value.name || "anonymous"}]`;
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: mapUrls(value.stack ?? "") };
  }
  if (typeof Node !== "undefined" && value instanceof Node) return describeNode(value);
  if (value === window) return "[Window]";
  if (REACT_ELEMENT_TYPES.includes(value.$$typeof)) return `<${reactElementName(value)} />`;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? "Invalid Date" : value.toISOString();
  if (value instanceof RegExp) return String(value);
  if (value instanceof Promise) return "[Promise]";
  if (ancestors.includes(value)) return "[Circular]";

  const isArray = Array.isArray(value);
  if (depth <= 0) {
    if (isArray) return `[Array(${value.length})]`;
    if (value instanceof Map || value instanceof Set)
      return `[${constructorName(value)}(${value.size})]`;
    return `[${constructorName(value)}]`;
  }

  const inner = [...ancestors, value];
  if (isArray || value instanceof Set) {
    const items = [...value];
    const result = items.slice(0, MAX_ITEMS).map((item) => serialize(item, depth - 1, inner));
    if (items.length > MAX_ITEMS) result.push(`… ${items.length - MAX_ITEMS} more`);
    return result;
  }
  if (value instanceof Map) {
    return [...value]
      .slice(0, MAX_ITEMS)
      .map(([key, item]) => [serialize(key, depth - 1, inner), serialize(item, depth - 1, inner)]);
  }

  const result = {};
  let keys;
  try {
    keys = Object.keys(value);
  } catch {
    return `[${constructorName(value)}]`;
  }
  for (const key of keys.slice(0, MAX_ITEMS)) {
    try {
      result[key] = serialize(value[key], depth - 1, inner);
    } catch {
      result[key] = "[Unreadable]";
    }
  }
  if (keys.length > MAX_ITEMS) result["…"] = `${keys.length - MAX_ITEMS} more`;
  return result;
}

function display(value) {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  const serialized = serialize(value);
  if (typeof serialized === "string") return serialized;
  try {
    return JSON.stringify(serialized) ?? String(value);
  } catch {
    return String(value);
  }
}

// Applies the console's %s, %d, %i, %f, %o, %O, and %c substitutions the way browsers do, then
// appends the remaining arguments separated by spaces.
function formatArgs(args) {
  const parts = [];
  let next = 0;
  if (typeof args[0] === "string" && args.length > 1) {
    next = 1;
    parts.push(
      args[0].replace(/%([sdifoOc%])/g, (match, flag) => {
        if (flag === "%") return "%";
        if (next >= args.length) return match;
        const value = args[next++];
        if (flag === "c") return "";
        if (flag === "d" || flag === "i") return String(Math.trunc(Number(value)));
        if (flag === "f") return String(Number(value));
        return display(value);
      }),
    );
  }
  for (const value of args.slice(next)) parts.push(display(value));
  return mapUrls(parts.join(" "));
}

// The router channel. The react-router wrapper attaches the controller of the router it mounted
// (`navigate(delta | path)`) and reports each location; the same location twice in a row, as
// when a development double effect replays the first report, is posted once.
let routerController = null;
let lastLocation = null;

const router = {
  attach(controller) {
    routerController = controller;
    return () => {
      if (routerController === controller) routerController = null;
    };
  },
  report(location) {
    const next = {
      pathname: String(location?.pathname ?? "/"),
      search: String(location?.search ?? ""),
      hash: String(location?.hash ?? ""),
      index: Math.max(0, Math.trunc(Number(location?.index)) || 0),
      length: Math.max(1, Math.trunc(Number(location?.length)) || 1),
    };
    if (
      lastLocation &&
      ["pathname", "search", "hash", "index", "length"].every(
        (field) => lastLocation[field] === next[field],
      )
    ) {
      return;
    }
    lastLocation = next;
    post({ type: "location", ...next });
  },
};

const lab = {
  runId: boot.runId,
  env,
  declarations: boot.declarations,
  moduleUrls: boot.moduleUrls,
  fixtures: boot.fixtures,
  fixtureControls: boot.fixtureControls,
  inspectorEnabled: boot.inspector,
  console: [],
  network: [],
  inspector: { commits: [], latest: null },
  post,
  serialize,
  fileForUrl,
  mapUrls,
  originalConsole,
  router,
};
globalThis.__LAB__ = lab;

let forwarding = false;
for (const level of LEVELS) {
  const original = originalConsole[level];
  console[level] = function (...args) {
    original.apply(console, args);
    if (forwarding) return;
    forwarding = true;
    try {
      const time = performance.now();
      const text = formatArgs(args);
      lab.console.push({ level, text, time });
      post({ type: "console", level, args: args.map((value) => serialize(value)), text, time });
    } finally {
      forwarding = false;
    }
  };
}

// The first stack frame that points into a workspace module, as { file, line, column }.
function workspaceFrame(stack) {
  for (const match of String(stack ?? "").matchAll(/(blob:[^\s)]+?):(\d+):(\d+)/g)) {
    const file = fileForUrl(match[1]);
    if (file) return { file, line: Number(match[2]), column: Number(match[3]) };
  }
  return null;
}

let errorCount = 0;

window.addEventListener("error", (event) => {
  if (!(event instanceof ErrorEvent)) return;
  errorCount += 1;
  const stack = event.error?.stack ?? "";
  const frame = workspaceFrame(stack);
  const file = frame?.file ?? fileForUrl(event.filename);
  post({
    type: "error",
    message: mapUrls(event.message),
    stack: mapUrls(stack),
    file,
    line: frame?.line ?? (file ? event.lineno : null),
    column: frame?.column ?? (file ? event.colno : null),
  });
  if (loaded && entryState === "pending") settle();
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  post({
    type: "rejection",
    message: mapUrls(
      reason instanceof Error ? `${reason.name}: ${reason.message}` : display(reason),
    ),
    stack: mapUrls(reason instanceof Error ? (reason.stack ?? "") : ""),
  });
});

// settled: the entry module finished evaluating (or failed) and one animation frame passed.
let entryState = boot.entryIsModule ? "pending" : "none";
let loaded = false;
let settled = false;

function afterFrame(callback) {
  let done = false;
  const once = () => {
    if (done) return;
    done = true;
    callback();
  };
  requestAnimationFrame(() => setTimeout(once, 0));
  setTimeout(once, 250);
}

function settle() {
  if (settled) return;
  settled = true;
  afterFrame(() => {
    post({ type: "settled" });
    if (boot.checkUrl) queueChecks();
  });
}

lab.entryEvaluated = () => {
  entryState = "done";
  settle();
};

window.addEventListener("load", () => {
  loaded = true;
  if (entryState !== "pending" || errorCount > 0) settle();
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runChecks() {
  try {
    if (!boot.checkUrl) throw new Error("This step has no check.js.");
    const module = await import(boot.checkUrl);
    if (typeof module.default !== "function") {
      throw new TypeError("check.js must export a default function.");
    }
    const raw = await module.default({
      document,
      console: lab.console,
      network: lab.network,
      inspector: lab.inspector.latest ?? { components: [] },
      wait,
    });
    if (!Array.isArray(raw)) throw new TypeError("check.js must return an array of results.");
    const results = raw.map((result) => ({
      id: String(result?.id),
      title: String(result?.title ?? result?.id),
      pass: Boolean(result?.pass),
      hint: result?.hint == null ? "" : String(result.hint),
    }));
    post({ type: "check-results", results });
  } catch (error) {
    post({
      type: "check-error",
      message: error instanceof Error ? error.message : display(error),
      stack: mapUrls(error instanceof Error ? (error.stack ?? "") : ""),
    });
  }
}

let checkQueue = Promise.resolve();
function queueChecks() {
  checkQueue = checkQueue.then(runChecks);
  return checkQueue;
}
lab.runChecks = queueChecks;

window.addEventListener("message", (event) => {
  const message = event.data;
  if (event.source !== window.parent || message?.source !== "cs300-lab") return;
  if (message.runId !== boot.runId) return;
  if (message.type === "run-checks") {
    queueChecks();
  } else if (message.type === "set-api") {
    if (message.env) Object.assign(env, envWith({ ...env, ...message.env }));
    if (message.fixtureControls) lab.fixtureControls = { ...message.fixtureControls };
  } else if (message.type === "navigate") {
    if (!routerController) return;
    if (typeof message.delta === "number" && message.delta !== 0) {
      routerController.navigate(message.delta);
    } else if (typeof message.to === "string") {
      routerController.navigate(message.to);
    }
  }
});

// After the whole bridge script, so the inspector hook and fetch shim are installed too.
queueMicrotask(() => post({ type: "ready" }));
