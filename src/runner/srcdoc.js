// Builds the iframe document in the order fixed by docs/CONTRACTS.md section 4.2:
// doctype, workspace <head> contents (stylesheets inlined, scripts removed or rewritten), the
// bridge as an inline classic script, the import map, workspace <body> contents, then the entry
// module script.

import {
  BARE_SPECIFIERS,
  isUrlSpecifier as isExternal,
  lineAndColumn,
  resolvePath,
} from "./graph.js";

// Output file under runtime/ for each bare specifier. react-router always points at the wrapper
// that runs BrowserRouter and createBrowserRouter on a memory history, because the sandboxed
// document has no URL to push; the wrapper re-exports everything else from the real module.
const RUNTIME_FILES = {
  react: "react.js",
  "react-dom": "react-dom.js",
  "react-dom/client": "react-dom-client.js",
  "react/jsx-runtime": "react-jsx-runtime.js",
  "react/jsx-dev-runtime": "react-jsx-dev-runtime.js",
  "react-router": "wrap/react-router.js",
};

// With the inspector on, react and react/jsx-dev-runtime point at wrappers that re-export the
// real modules and label setters, function props, and JSX sources for the inspector.
const INSPECTOR_FILES = {
  ...RUNTIME_FILES,
  react: "wrap/react.js",
  "react/jsx-dev-runtime": "wrap/react-jsx-dev-runtime.js",
};

export function createImportMap(runtimeBase, { inspector = false } = {}) {
  const files = inspector ? INSPECTOR_FILES : RUNTIME_FILES;
  return {
    imports: Object.fromEntries(
      BARE_SPECIFIERS.map((specifier) => [specifier, runtimeBase + files[specifier]]),
    ),
  };
}

const EMPTY_DOCUMENT = "<!doctype html><html><head></head><body></body></html>";

// Inline <script> and <style> text ends at the first closing tag, so those must not appear inside.
export function escapeScriptText(text) {
  return text.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");
}

export function inlineJson(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function escapeStyleText(text) {
  return text.replace(/<\/(style)/gi, "<\\/$1");
}

function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function attributesOf(element) {
  return [...element.attributes]
    .map((attribute) => ` ${attribute.name}="${escapeAttribute(attribute.value)}"`)
    .join("");
}

function locate(html, needle) {
  const index = needle ? html.indexOf(needle) : -1;
  return lineAndColumn(html, Math.max(index, 0));
}

// A classic script runs where the parser meets it, while module, async, and non-JavaScript
// scripts run later or not at all.
function isClassicScript(script) {
  const type = (script.getAttribute("type") ?? "").trim().toLowerCase();
  if (script.hasAttribute("async")) return false;
  return type === "" || type === "text/javascript" || type === "application/javascript";
}

// Two inline scripts around a classic workspace script tell the DOM part of the bridge which
// elements the parser had created before the script ran and which the script created itself,
// so that the DOM view can map markup elements to their lines in index.html. Each one removes
// itself, so the student's script and the finished page see no extra element.
function markRun(doc, script) {
  const before = doc.createElement("script");
  before.textContent = "globalThis.__LAB__?.markup.before()";
  const after = doc.createElement("script");
  after.textContent = "globalThis.__LAB__?.markup.after()";
  script.before(before);
  script.after(after);
}

// options:
//   html            the workspace index.html, or undefined
//   files           the workspace file map
//   entryIsModule   true when the run has a module entry, false when the entry is index.html
//   entryUrl        blob URL of the entry module, or null
//   loadScript(path) blob URL for a workspace script, or null when it failed (entry index.html)
//   extraStyles     [{ file, css }] imported from JavaScript
//   bridge          the bridge script text
//   importMap       the import map object
// Returns { srcdoc, diagnostics }.
export function buildSrcdoc({
  html,
  files,
  entryIsModule,
  entryUrl,
  loadScript,
  extraStyles,
  bridge,
  importMap,
}) {
  const diagnostics = [];
  const source = html ?? EMPTY_DOCUMENT;
  const doc = new DOMParser().parseFromString(source, "text/html");

  for (const link of doc.querySelectorAll('link[rel~="stylesheet" i][href]')) {
    const href = link.getAttribute("href");
    if (isExternal(href)) continue;
    const path = resolvePath(href, "index.html");
    if (!Object.hasOwn(files, path)) {
      const { line, column } = locate(source, href);
      diagnostics.push({
        file: "index.html",
        line,
        column,
        message: `Cannot find the stylesheet "${href}" (looked for ${path} in the workspace).`,
      });
      continue;
    }
    const style = doc.createElement("style");
    style.setAttribute("data-lab-file", path);
    style.textContent = escapeStyleText(files[path]);
    link.replaceWith(style);
  }

  for (const script of doc.querySelectorAll("script")) {
    if (entryIsModule) {
      script.remove();
      continue;
    }
    if (isClassicScript(script)) markRun(doc, script);
    const src = script.getAttribute("src");
    if (src === null || isExternal(src)) continue;
    const path = resolvePath(src, "index.html");
    if (!Object.hasOwn(files, path)) {
      const { line, column } = locate(source, src);
      diagnostics.push({
        file: "index.html",
        line,
        column,
        message: `Cannot find the script "${src}" (looked for ${path} in the workspace).`,
      });
      continue;
    }
    const url = loadScript(path);
    if (url) script.setAttribute("src", url);
  }

  const styleTags = (extraStyles ?? [])
    .map(
      ({ file, css }) =>
        `<style data-lab-file="${escapeAttribute(file)}">${escapeStyleText(css)}</style>\n`,
    )
    .join("");

  // The DOM part of the bridge recognizes this script by its entryEvaluated call and leaves it
  // out of the body tree.
  const entryScript = entryUrl
    ? `<script type="module">import ${JSON.stringify(entryUrl)};\nglobalThis.__LAB__.entryEvaluated();</script>\n`
    : "";

  const srcdoc =
    "<!doctype html>\n" +
    `<html${attributesOf(doc.documentElement)}>\n` +
    "<head>\n" +
    doc.head.innerHTML.trim() +
    "\n" +
    styleTags +
    `<script>\n${bridge}\n</script>\n` +
    `<script type="importmap">${inlineJson(importMap)}</script>\n` +
    "</head>\n" +
    `<body${attributesOf(doc.body)}>\n` +
    doc.body.innerHTML.trim() +
    "\n" +
    entryScript +
    "</body>\n" +
    "</html>\n";

  return { srcdoc, diagnostics };
}
