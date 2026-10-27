// Bridge part 4: the DOM view. While the parent has the `dom` view open (it says so through
// `inspector-config`), a MutationObserver on document.body collects what scripts change, and once
// per animation frame in which something changed a `dom` snapshot of the body's subtree is posted
// (docs/CONTRACTS.md section 4.3): every element with its tag, attributes, shortened own text,
// the line of index.html it came from, and what changed. A `dom-highlight` message from the
// parent outlines one element in the shared overlay layer (section 4.4).
//
// Which elements came from the markup: the runner wraps each classic script of index.html in two
// inline scripts that call markup.before() and markup.after(). Everything in the body that
// before() has not seen yet was written by the parser, everything new at after() was created by
// the script in between, and everything new when parsing finishes (readyState "interactive",
// before deferred and module scripts run) is the parser's too. The markup elements, in document
// order, are then paired with the start tags the compile step found in index.html, also in
// document order, matching by tag name and skipping tags the parser left out or added, such as
// an implied tbody. Elements a script created never get a line.

"use strict";

const lab = globalThis.__LAB__;

const TEXT_LIMIT = 60;
const CHANGE_RANK = { added: 4, removed: 3, attributes: 2, text: 1 };

// Elements the parser created ("markup") or a script created ("script").
const creator = new WeakMap();
const declaredLine = new WeakMap();
let matched = false;

// The runner's own entry script, the inline module that imports the entry and reports that it
// evaluated, is plumbing, not the student's page.
function isRunnerElement(element) {
  return (
    element.localName === "script" &&
    element.type === "module" &&
    !element.hasAttribute("src") &&
    element.textContent.includes("__LAB__.entryEvaluated()")
  );
}

function bodyElements() {
  const body = document.body;
  return body ? [body, ...body.querySelectorAll("*")].filter((el) => !isRunnerElement(el)) : [];
}

function tagUntagged(kind) {
  for (const element of bodyElements()) {
    if (!creator.has(element)) creator.set(element, kind);
  }
}

function removeCurrentScript() {
  document.currentScript?.remove();
}

lab.markup = {
  before() {
    removeCurrentScript();
    tagUntagged("markup");
  },
  // The parser inserted the script element itself after before() ran, so it is claimed for the
  // markup before everything else new is credited to the script.
  after() {
    const sentinel = document.currentScript;
    const script = sentinel?.previousElementSibling;
    if (script?.localName === "script" && !creator.has(script)) creator.set(script, "markup");
    removeCurrentScript();
    tagUntagged("script");
  },
};

function matchMarkup() {
  if (matched) return;
  matched = true;
  tagUntagged("markup");
  const tokens = lab.markupLines;
  let cursor = 0;
  for (const element of bodyElements()) {
    if (creator.get(element) !== "markup") continue;
    const tag = element.localName.toLowerCase();
    let index = cursor;
    while (index < tokens.length && tokens[index].tag !== tag) index += 1;
    if (index < tokens.length) {
      declaredLine.set(element, tokens[index].line);
      cursor = index + 1;
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("readystatechange", () => {
    if (document.readyState !== "loading") matchMarkup();
  });
} else {
  matchMarkup();
}

// Snapshots -----------------------------------------------------------------------------------

const ids = new WeakMap();
const elementsById = new Map();
let nextId = 1;
let seq = 0;
let previousNodes = [];
let previousById = new Map();

function idFor(element) {
  let id = ids.get(element);
  if (!id) {
    id = `n${nextId++}`;
    ids.set(element, id);
  }
  elementsById.set(id, element);
  return id;
}

function ownText(element) {
  if (element.firstElementChild) return null;
  const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
  return text.length > TEXT_LIMIT ? text.slice(0, TEXT_LIMIT) : text;
}

// A script's src is the blob URL the runner gave the workspace file; the student sees the path.
function attributesOf(element) {
  const attributes = {};
  for (const attribute of element.attributes) {
    const value = attribute.value;
    attributes[attribute.name] = value.startsWith("blob:")
      ? (lab.fileForUrl(value) ?? value)
      : value;
  }
  return attributes;
}

function declaredAt(element) {
  const line = declaredLine.get(element);
  return line === undefined ? null : { file: "index.html", line };
}

function describe(element, parentId, changed) {
  return {
    id: idFor(element),
    parentId,
    tag: element.localName,
    attributes: attributesOf(element),
    text: ownText(element),
    declaredAt: declaredAt(element),
    changed,
  };
}

// The live body subtree in document order, then the elements removed since the last snapshot,
// each placed after the node that preceded it last time so that it keeps its old position.
function buildSnapshot(changes) {
  matchMarkup();
  const nodes = [];
  const visit = (element, parentId) => {
    let changed = changes.get(element) ?? null;
    if (changed === "removed") changed = "added";
    const node = describe(element, parentId, changed);
    nodes.push(node);
    for (const child of element.children) {
      if (!isRunnerElement(child)) visit(child, node.id);
    }
  };
  if (document.body) visit(document.body, null);

  const removed = [];
  for (const [element, changed] of changes) {
    if (changed !== "removed" || element.isConnected) continue;
    const id = ids.get(element);
    const last = id && previousById.get(id);
    if (last) removed.push(last);
  }
  removed.sort((a, b) => previousNodes.indexOf(a) - previousNodes.indexOf(b));
  for (const last of removed) {
    const node = { ...last, changed: "removed" };
    let position = nodes.length;
    for (let index = previousNodes.indexOf(last) - 1; index >= 0; index -= 1) {
      const anchor = nodes.findIndex((candidate) => candidate.id === previousNodes[index].id);
      if (anchor !== -1) {
        position = anchor + 1;
        break;
      }
    }
    nodes.splice(position, 0, node);
  }

  for (const last of removed) elementsById.delete(last.id);
  previousNodes = nodes.filter((node) => node.changed !== "removed");
  previousById = new Map(previousNodes.map((node) => [node.id, node]));
  return { seq: ++seq, time: performance.now(), nodes };
}

function post(changes) {
  const snapshot = buildSnapshot(changes);
  lab.dom.latest = snapshot;
  lab.post({ type: "dom", snapshot });
}

// Mutation batching ----------------------------------------------------------------------------

let viewOpen = false;
let started = false;
let observer = null;
let pending = [];
let scheduled = false;

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

function mark(changes, element, kind) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
  const current = changes.get(element);
  if (!current || CHANGE_RANK[kind] > CHANGE_RANK[current]) changes.set(element, kind);
}

function markSubtree(changes, element, kind) {
  if (element.nodeType !== Node.ELEMENT_NODE) return;
  mark(changes, element, kind);
  for (const descendant of element.querySelectorAll("*")) mark(changes, descendant, kind);
}

function changesFrom(records) {
  const changes = new Map();
  for (const record of records) {
    if (record.type === "attributes") {
      mark(changes, record.target, "attributes");
    } else if (record.type === "characterData") {
      mark(changes, record.target.parentElement, "text");
    } else {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) markSubtree(changes, node, "added");
        else if (node.nodeType === Node.TEXT_NODE) mark(changes, record.target, "text");
      }
      for (const node of record.removedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) markSubtree(changes, node, "removed");
        else if (node.nodeType === Node.TEXT_NODE) mark(changes, record.target, "text");
      }
    }
  }
  return changes;
}

function flush() {
  scheduled = false;
  if (!started) return;
  const records = [...pending, ...observer.takeRecords()];
  pending = [];
  if (records.length === 0) return;
  post(changesFrom(records));
  highlight.schedule();
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  afterFrame(flush);
}

function startObserving() {
  if (started || !document.body) return;
  started = true;
  observer = new MutationObserver((records) => {
    pending.push(...records);
    schedule();
  });
  observer.observe(document.body, {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
  });
  post(new Map());
}

function stopObserving() {
  if (!started) return;
  started = false;
  observer.disconnect();
  observer = null;
  pending = [];
}

lab.dom = { latest: null };

lab.onSettled(() => {
  if (viewOpen) startObserving();
});

// Highlight ------------------------------------------------------------------------------------

const highlight = (() => {
  let nodeId = null;
  let frame = 0;
  const style = document.createElement("style");
  style.textContent = `
    .dom-layer { position: fixed; inset: 0; pointer-events: none; font: 600 11px/1.3 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .dom-box { position: fixed; box-sizing: border-box; border: 2px solid #0b63ce; border-radius: 3px; background: rgb(11 99 206 / 0.14); }
    .dom-label { position: fixed; box-sizing: border-box; max-width: 90vw; padding: 1px 6px; border-radius: 3px; background: #0b63ce; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  `;
  const layer = document.createElement("div");
  layer.className = "dom-layer";

  function attach() {
    if (!layer.isConnected) lab.overlay.shadow().append(style, layer);
  }

  function label(element) {
    const id = element.id ? `#${element.id}` : "";
    const classes = [...element.classList].map((name) => `.${name}`).join("");
    return `${element.localName}${id}${classes}`;
  }

  function draw() {
    frame = 0;
    layer.replaceChildren();
    const element = nodeId === null ? null : elementsById.get(nodeId);
    if (!element || !element.isConnected) return;
    attach();
    const rect = element.getBoundingClientRect();
    const box = document.createElement("div");
    box.className = "dom-box";
    box.style.left = `${rect.x}px`;
    box.style.top = `${rect.y}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
    layer.append(box);
    const tag = document.createElement("div");
    tag.className = "dom-label";
    tag.textContent = `${label(element)} ${Math.round(rect.width)} × ${Math.round(rect.height)}`;
    layer.append(tag);
    const height = tag.offsetHeight || 16;
    tag.style.left = `${Math.max(0, rect.x)}px`;
    tag.style.top = `${rect.y >= height ? rect.y - height : rect.y + rect.height}px`;
  }

  function schedule() {
    if (!frame && (nodeId !== null || layer.childElementCount > 0)) {
      frame = requestAnimationFrame(draw);
    }
  }

  function set(id) {
    nodeId = typeof id === "string" ? id : null;
    schedule();
  }

  addEventListener("scroll", schedule, { capture: true, passive: true });
  addEventListener("resize", schedule);

  return { set, schedule };
})();

addEventListener("message", (event) => {
  const message = event.data;
  if (event.source !== window.parent || message?.source !== "cs300-lab") return;
  if (message.runId !== lab.runId) return;
  if (message.type === "inspector-config" && Array.isArray(message.views)) {
    const next = message.views.includes("dom");
    if (next === viewOpen) return;
    viewOpen = next;
    if (!viewOpen) stopObserving();
    else if (lab.hasSettled()) startObserving();
  } else if (message.type === "dom-highlight") {
    highlight.set(message.nodeId ?? null);
  }
});
