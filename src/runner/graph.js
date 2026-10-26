// Turns workspace files into blob URL modules.
//
// Each JavaScript file is compiled, its relative imports are resolved against the workspace, its
// dependencies get blob URLs first, and its specifiers are rewritten to those URLs. Bare
// specifiers are left for the iframe's import map. CSS and JSON files can be imported too: each
// becomes a small module whose default export is its text or value, and imported CSS is also
// collected so the srcdoc can add it as a <style>.

import { parse } from "es-module-lexer/js";
import { compileModule, isModulePath } from "./compile.js";

export const BARE_SPECIFIERS = [
  "react",
  "react-dom",
  "react-dom/client",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-router",
];

const BARE_LIST = BARE_SPECIFIERS.join(", ");

export function isRelativeSpecifier(specifier) {
  return /^(?:\.{1,2}\/|\/(?!\/))/.test(specifier);
}

export function isUrlSpecifier(specifier) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(specifier);
}

// Resolves "./x.jsx", "../x.js", and "/src/x.jsx" against the importing file's directory or the
// workspace root, returning a normalized workspace path such as "src/x.jsx".
export function resolvePath(specifier, importer) {
  const [withoutQuery] = specifier.split(/[?#]/);
  const segments = withoutQuery.startsWith("/")
    ? []
    : importer.split("/").slice(0, -1).filter(Boolean);
  for (const segment of withoutQuery.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") segments.pop();
    else segments.push(segment);
  }
  return segments.join("/");
}

// Exact path first, then the extensions and index files Vite would also accept.
export function findFile(files, path) {
  const candidates = [path, `${path}.jsx`, `${path}.js`, `${path}/index.jsx`, `${path}/index.js`];
  return candidates.find((candidate) => Object.hasOwn(files, candidate)) ?? null;
}

export function lineAndColumn(text, index) {
  const before = text.slice(0, index);
  const line = before.split("\n").length;
  return { line, column: index - before.lastIndexOf("\n") };
}

function blobUrl(code, type = "text/javascript") {
  return URL.createObjectURL(new Blob([code], { type }));
}

export function createModuleGraph(files) {
  const moduleUrls = {};
  const assetUrls = new Map();
  const styles = [];
  const diagnostics = [];
  const createdUrls = [];
  const visiting = [];
  const failed = new Set();

  function diagnose(file, source, index, message) {
    const { line, column } = lineAndColumn(source, index);
    diagnostics.push({ file, line, column, message });
  }

  function assetUrl(path) {
    if (assetUrls.has(path)) return assetUrls.get(path);
    const text = files[path];
    let code;
    if (path.endsWith(".css")) {
      styles.push({ file: path, css: text });
      code = `export default ${JSON.stringify(text)};\n`;
    } else {
      try {
        code = `export default ${JSON.stringify(JSON.parse(text))};\n`;
      } catch (error) {
        diagnostics.push({ file: path, line: 1, column: 1, message: error.message });
        return null;
      }
    }
    const url = blobUrl(code);
    createdUrls.push(url);
    assetUrls.set(path, url);
    return url;
  }

  // Returns the blob URL for a workspace JavaScript file, or null when it or a dependency failed.
  function load(path) {
    if (moduleUrls[path]) return moduleUrls[path];
    if (failed.has(path)) return null;

    visiting.push(path);
    const url = compileAndLink(path);
    visiting.pop();

    if (url) moduleUrls[path] = url;
    else failed.add(path);
    return url;
  }

  function compileAndLink(path) {
    const source = files[path];
    const { code, diagnostic } = compileModule(path, source);
    if (diagnostic) {
      diagnostics.push(diagnostic);
      return null;
    }

    let imports;
    try {
      [imports] = parse(code);
    } catch (error) {
      diagnose(path, code, error.idx ?? 0, `Could not read the imports: ${error.message}`);
      return null;
    }

    const replacements = [];
    let ok = true;

    for (const entry of imports) {
      const specifier = entry.specifier;
      if (entry.type === "meta" || specifier === undefined) continue;
      const quoted = entry.type === "dynamic";

      if (!isRelativeSpecifier(specifier)) {
        if (isUrlSpecifier(specifier) || BARE_SPECIFIERS.includes(specifier)) continue;
        diagnose(
          path,
          code,
          entry.start,
          `Cannot import "${specifier}". The lab provides these packages: ${BARE_LIST}.`,
        );
        ok = false;
        continue;
      }

      const target = findFile(files, resolvePath(specifier, path));
      if (!target) {
        diagnose(
          path,
          code,
          entry.start,
          `Cannot find "${specifier}" (looked for ${resolvePath(specifier, path)} in the workspace).`,
        );
        ok = false;
        continue;
      }

      let targetUrl;
      if (isModulePath(target)) {
        const cycleStart = visiting.indexOf(target);
        if (cycleStart !== -1) {
          const chain = [...visiting.slice(cycleStart), target].join(" → ");
          diagnose(
            path,
            code,
            entry.start,
            `Import cycle: ${chain}. Each file runs as its own module here, so files cannot import each other in a circle.`,
          );
          ok = false;
          continue;
        }
        targetUrl = load(target);
      } else if (/\.(?:css|json)$/.test(target)) {
        targetUrl = assetUrl(target);
      } else {
        diagnose(
          path,
          code,
          entry.start,
          `Cannot import "${specifier}": only JavaScript, JSX, CSS, and JSON files can be imported.`,
        );
        ok = false;
        continue;
      }

      if (!targetUrl) {
        ok = false;
        continue;
      }
      replacements.push({
        start: entry.start,
        end: entry.end,
        text: quoted ? JSON.stringify(targetUrl) : targetUrl,
      });
    }

    if (!ok) return null;

    let linked = code;
    for (const { start, end, text } of replacements.sort((a, b) => b.start - a.start)) {
      linked = linked.slice(0, start) + text + linked.slice(end);
    }
    const url = blobUrl(linked);
    createdUrls.push(url);
    return url;
  }

  return {
    load,
    moduleUrls,
    styles,
    diagnostics,
    createdUrls,
  };
}
