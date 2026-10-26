// The runner: turns a workspace into a document for the sandboxed result iframe.
// See docs/CONTRACTS.md section 4 for the API, the srcdoc order, and the bridge messages.

import coreSource from "./bridge/core.js?raw";
import inspectorHookSource from "./bridge/inspector-hook.js?raw";
import fetchShimSource from "./bridge/fetch-shim.js?raw";
import { compileModule, findDeclarations, isModulePath } from "./compile.js";
import { createModuleGraph } from "./graph.js";
import { buildSrcdoc, createImportMap, escapeScriptText, inlineJson } from "./srcdoc.js";

export const IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-forms allow-modals allow-popups";

const BRIDGE_PARTS = [
  ["core.js", coreSource],
  ["inspector-hook.js", inspectorHookSource],
  ["fetch-shim.js", fetchShimSource],
];

let runCount = 0;

function createRunId() {
  runCount += 1;
  const random =
    globalThis.crypto?.randomUUID?.().slice(0, 8) ?? Math.random().toString(36).slice(2, 10);
  return `run-${runCount}-${random}`;
}

// Each part runs in its own function scope so their top-level names cannot collide; they share
// state only through globalThis.__LAB__.
function assembleBridge(boot) {
  const parts = BRIDGE_PARTS.map(
    ([name, source]) => `// ${name}\n(function () {\n${escapeScriptText(source)}\n})();`,
  );
  return [`globalThis.__LAB_BOOT__ = ${inlineJson(boot)};`, ...parts].join("\n");
}

function absoluteUrl(url) {
  return new URL(url, document.baseURI).href;
}

function dedupe(diagnostics) {
  const seen = new Set();
  return diagnostics.filter((diagnostic) => {
    const key = `${diagnostic.file}:${diagnostic.line}:${diagnostic.column}:${diagnostic.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildRun({
  files,
  entry,
  runtimeBase,
  env = {},
  fixtures = null,
  fixtureControls = null,
  check = null,
  inspector = false,
}) {
  const runId = createRunId();
  const graph = createModuleGraph(files);
  const diagnostics = graph.diagnostics;
  const entryIsModule = entry !== "index.html";

  let entryUrl = null;
  if (entryIsModule) {
    if (Object.hasOwn(files, entry)) {
      entryUrl = graph.load(entry);
    } else {
      diagnostics.push({
        file: entry,
        line: 1,
        column: 1,
        message: `The entry file ${entry} is not in the workspace.`,
      });
    }
  }

  const declarations = {};
  for (const [path, source] of Object.entries(files)) {
    if (isModulePath(path)) declarations[path] = findDeclarations(source);
  }

  let checkUrl = null;
  if (check) {
    const compiled = compileModule("check.js", check, { rewriteEnv: false });
    if (compiled.diagnostic) {
      diagnostics.push(compiled.diagnostic);
    } else {
      checkUrl = URL.createObjectURL(new Blob([compiled.code], { type: "text/javascript" }));
      graph.createdUrls.push(checkUrl);
    }
  }

  // The bridge has to know every module URL, but scripts referenced from index.html are only
  // loaded while the document is built, so the document is built first and the bridge text is
  // dropped in afterwards.
  const placeholder = `__LAB_BRIDGE_${runId}__`;
  const built = buildSrcdoc({
    html: files["index.html"],
    files,
    entryIsModule,
    entryUrl,
    loadScript: (path) => graph.load(path),
    extraStyles: graph.styles,
    bridge: placeholder,
    importMap: createImportMap(absoluteUrl(runtimeBase)),
  });
  diagnostics.push(...built.diagnostics);

  const moduleUrls = { ...graph.moduleUrls };
  const urls = graph.createdUrls;
  const dispose = () => {
    for (const url of urls.splice(0)) URL.revokeObjectURL(url);
  };

  const finalDiagnostics = dedupe(diagnostics);
  if (finalDiagnostics.length > 0) {
    dispose();
    return {
      runId,
      srcdoc: null,
      diagnostics: finalDiagnostics,
      moduleUrls,
      declarations,
      dispose,
    };
  }

  const bridge = assembleBridge({
    runId,
    env,
    declarations,
    moduleUrls,
    fixtures,
    fixtureControls,
    checkUrl,
    inspector: Boolean(inspector),
    entryIsModule,
  });
  const srcdoc = built.srcdoc.replace(placeholder, () => bridge);

  return { runId, srcdoc, diagnostics: [], moduleUrls, declarations, dispose };
}
