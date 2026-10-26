// Compiles one workspace JavaScript file for the iframe and records where its top-level
// functions and constants are declared.
//
// Sucrase keeps every line where it was, so line numbers in compiled code, stack traces, and
// jsxDEV sources all point at the line the student sees in the editor.

import { transform } from "sucrase";

const IMPORT_META_ENV = /\bimport\.meta\.env\b/g;

const SUCRASE_OPTIONS = {
  transforms: ["jsx"],
  jsxRuntime: "automatic",
  production: false,
};

export function isModulePath(path) {
  return /\.(?:js|jsx|mjs)$/.test(path);
}

// Returns { code, diagnostic }: code is null exactly when diagnostic is set.
// `rewriteEnv` is false for check.js, whose hint text talks about import.meta.env.
export function compileModule(path, source, { rewriteEnv = true } = {}) {
  const prepared = rewriteEnv ? source.replace(IMPORT_META_ENV, "__LAB_ENV__") : source;
  try {
    const { code } = transform(prepared, { ...SUCRASE_OPTIONS, filePath: path });
    return { code, diagnostic: null };
  } catch (error) {
    return { code: null, diagnostic: syntaxDiagnostic(path, error) };
  }
}

function syntaxDiagnostic(file, error) {
  const message = String(error?.message ?? error)
    .replace(/^Error transforming [^:]*: /, "")
    .replace(/ \(\d+:\d+\)$/, "");
  return {
    file,
    line: error?.loc?.line ?? 1,
    column: (error?.loc?.column ?? 0) + 1,
    message,
  };
}

// A declaration counts when it starts at the beginning of a line, which is how top-level code is
// written in every workspace; nested functions are indented and are skipped.
const DECLARATION =
  /^(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)|^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=/;

// Returns { [name]: line } with 1-based lines, first declaration wins.
export function findDeclarations(source) {
  const declarations = {};
  source.split("\n").forEach((text, index) => {
    const match = DECLARATION.exec(text);
    const name = match?.[1] ?? match?.[2];
    if (name && !(name in declarations)) {
      declarations[name] = index + 1;
    }
  });
  return declarations;
}
