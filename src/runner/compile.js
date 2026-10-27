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

// Elements the parser never places in the body, so their tags are left out of the markup map
// when the document has no <body> tag of its own.
const HEAD_ONLY = new Set(["html", "head", "meta", "title", "link", "base"]);

// Elements whose content the parser reads as text, not markup, until the matching end tag.
const RAW_TEXT = new Set(["script", "style", "textarea", "title", "template"]);

// The DOM view's map from a live element back to the markup: the start tags of index.html's
// body in document order, each with its 1-based line, as [{ tag, line }]. The bridge pairs them
// with the elements the parser created (docs/CONTRACTS.md section 4.3, declaredAt). A tokenizer
// over the source is enough because the pairing happens by order among those elements, so only
// the sequence of start tags and their lines matter; comments, end tags, and the contents of
// raw text elements are skipped.
export function findMarkupLines(html) {
  const source = String(html ?? "");
  const hasBody = /<body[\s>]/i.test(source);
  const tags = [];
  let inBody = !hasBody;
  let index = 0;
  let line = 1;

  const advance = (to) => {
    for (let i = index; i < to; i += 1) if (source.charCodeAt(i) === 10) line += 1;
    index = to;
  };
  const skipPast = (needle) => {
    const found = source.toLowerCase().indexOf(needle, index);
    advance(found === -1 ? source.length : found + needle.length);
  };

  while (index < source.length) {
    const open = source.indexOf("<", index);
    if (open === -1) break;
    advance(open);
    if (source.startsWith("<!--", index)) {
      skipPast("-->");
      continue;
    }
    if (source[index + 1] === "!" || source[index + 1] === "?") {
      skipPast(">");
      continue;
    }
    if (source[index + 1] === "/") {
      skipPast(">");
      continue;
    }
    const match = /^<([a-zA-Z][^\s/>]*)/.exec(source.slice(index, index + 200));
    if (!match) {
      advance(index + 1);
      continue;
    }
    const tag = match[1].toLowerCase();
    const tagLine = line;
    let cursor = index + match[0].length;
    let quote = null;
    while (cursor < source.length) {
      const char = source[cursor];
      if (quote) {
        if (char === quote) quote = null;
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === ">") {
        break;
      }
      cursor += 1;
    }
    advance(Math.min(cursor + 1, source.length));
    if (tag === "body") inBody = true;
    const include =
      inBody && !(tag === "html" || tag === "head") && !(!hasBody && HEAD_ONLY.has(tag));
    if (include && tag !== "template") tags.push({ tag, line: tagLine });
    if (RAW_TEXT.has(tag)) skipPast(`</${tag}`);
  }
  return tags;
}

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
