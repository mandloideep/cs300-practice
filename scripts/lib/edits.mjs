// Edit blocks: fenced code blocks whose info string carries file, action, and anchor attributes.
// The semantics follow docs/CONTRACTS.md section 2, and the build and the validator share them:
// - the code is the fence content with only its final newline removed;
// - an anchor is one or more complete lines (literal \n between lines), matched exactly at the
//   first occurrence in the file as it stands after the earlier edit blocks of the same step;
// - every file ends with exactly one newline after every action.

export const ACTIONS = ["create", "replace", "insert-after", "insert-before", "append", "delete"];
export const ANCHORED_ACTIONS = ["replace", "insert-after", "insert-before", "delete"];

const attributePattern = /([A-Za-z][\w-]*)=(?:"([^"]*)"|'([^']*)')/g;

// "jsx file='src/App.jsx' action=\"replace\"" -> { lang: "jsx", attrs: { file, action } }
export function parseInfo(info) {
  const trimmed = info.trim();
  const space = trimmed.search(/\s/);
  const lang = space === -1 ? trimmed : trimmed.slice(0, space);
  const rest = space === -1 ? "" : trimmed.slice(space);
  const attrs = {};
  for (const match of rest.matchAll(attributePattern)) {
    attrs[match[1]] = match[2] ?? match[3];
  }
  return { lang, attrs };
}

export function isEditInfo(info) {
  return "file" in parseInfo(info).attrs;
}

export function fenceCode(content) {
  return content.endsWith("\n") ? content.slice(0, -1) : content;
}

// Lists the edit blocks of a parsed markdown-it token stream in document order.
export function editsFromTokens(tokens) {
  return tokens
    .filter((token) => token.type === "fence" && isEditInfo(token.info))
    .map((token) => {
      const { lang, attrs } = parseInfo(token.info);
      return {
        file: attrs.file,
        action: attrs.action ?? null,
        anchor: attrs.anchor ?? null,
        code: fenceCode(token.content),
        lang,
        line: token.map ? token.map[0] + 1 : null,
      };
    });
}

export function anchorLines(anchor) {
  return anchor.split("\\n");
}

function toLines(text) {
  if (text === "") return [];
  const lines = text.split("\n");
  if (lines.at(-1) === "") lines.pop();
  return lines;
}

function fromLines(lines) {
  return lines.length === 0 ? "" : lines.join("\n") + "\n";
}

function findAnchor(lines, anchor) {
  for (let start = 0; start + anchor.length <= lines.length; start++) {
    if (anchor.every((line, offset) => lines[start + offset] === line)) return start;
  }
  return -1;
}

// Applies one edit to a files map in place. Returns null on success or a reason string.
export function applyEdit(files, edit) {
  if (!edit.file) return "has no file attribute";
  if (!ACTIONS.includes(edit.action)) {
    return `has action ${JSON.stringify(edit.action)}; expected one of ${ACTIONS.join(", ")}`;
  }
  const codeLines = edit.code === "" ? [] : edit.code.split("\n");
  if (edit.action === "create") {
    files[edit.file] = edit.code + "\n";
    return null;
  }
  if (!(edit.file in files)) return `names ${edit.file}, which is not in the workspace`;
  const lines = toLines(files[edit.file]);
  if (edit.action === "append") {
    files[edit.file] = fromLines([...lines, ...codeLines]);
    return null;
  }
  if (edit.anchor === null || edit.anchor === "")
    return `needs an anchor for action ${edit.action}`;
  const anchor = anchorLines(edit.anchor);
  const start = findAnchor(lines, anchor);
  if (start === -1) {
    return `anchor ${JSON.stringify(edit.anchor)} is not a complete line of ${edit.file} at this point in the step`;
  }
  const end = start + anchor.length;
  const next =
    edit.action === "replace"
      ? [...lines.slice(0, start), ...codeLines, ...lines.slice(end)]
      : edit.action === "insert-after"
        ? [...lines.slice(0, end), ...codeLines, ...lines.slice(end)]
        : edit.action === "insert-before"
          ? [...lines.slice(0, start), ...codeLines, ...lines.slice(start)]
          : [...lines.slice(0, start), ...lines.slice(end)];
  files[edit.file] = fromLines(next);
  return null;
}

// Applies every edit in order to a copy of the workspace.
// Returns { files, failures: [{ index, edit, reason }] }; later edits still run after a failure.
export function applyEdits(workspace, edits) {
  const files = { ...workspace };
  const failures = [];
  edits.forEach((edit, index) => {
    const reason = applyEdit(files, edit);
    if (reason) failures.push({ index, edit, reason });
  });
  return { files, failures };
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function codeHtml(line) {
  return `<code>${escapeHtml(line.trim())}</code>`;
}

// The placement sentence shown on an edit card, as HTML.
export function placementHtml(action, anchor) {
  if (action === "create") return "create this file";
  if (action === "append") return "add to the end of the file";
  const lines = anchor ? anchorLines(anchor) : [""];
  const first = codeHtml(lines[0]);
  const last = codeHtml(lines.at(-1));
  const many = lines.length > 1;
  switch (action) {
    case "replace":
      return many ? `replace the lines from ${first} to ${last}` : `replace the line ${first}`;
    case "insert-after":
      return many ? `insert after the lines ending with ${last}` : `insert after the line ${first}`;
    case "insert-before":
      return many
        ? `insert before the lines starting with ${first}`
        : `insert before the line ${first}`;
    case "delete":
      return many ? `delete the lines from ${first} to ${last}` : `delete the line ${first}`;
    default:
      return escapeHtml(String(action));
  }
}

export { escapeHtml };
