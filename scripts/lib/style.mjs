// Style rules for the files under content/, applied line by line so that every message names
// the file and the line. content.mjs runs them as part of validation; they fail it rather than
// warn, so that CI holds the line.
//
// - noEmDash: the em dash character appears nowhere under content/.
// - oneSentencePerLine: a line of Markdown prose holds one sentence. The heuristic flags a line
//   with a sentence end followed by a space and a capital letter, outside code fences, front
//   matter, tables, inline code, link text, and HTML tags, after any list marker, heading marker,
//   or blockquote marker.
// - noCommentLines: a workspace, solution, or local file has no line that starts a comment with
//   //, /*, or <!--. A # in CSS is a color or an id selector, never a comment.

export const EM_DASH = "—";

const FENCE = /^\s*(`{3,}|~{3,})/;
const TABLE_ROW = /^\s*\|/;
const LINE_START = /^\s*(?:>\s*)*(?:#{1,6}\s+)?(?:(?:[-*+]|\d+[.)])\s+)?(?:\d+[.)]\s+)?/;
const INLINE_CODE = /`[^`]*`/g;
const LINK = /\[([^\]]*)\]\([^)]*\)/g;
const HTML_TAG = /<[^>]+>/g;
const SENTENCE_BREAK = /[.!?](?:["')\]*_]+)?\s+[A-Z]/;
const COMMENT_START = /^\s*(?:\/\/|\/\*|<!--)/;

// Returns [{ line, reason }] for every line that holds an em dash.
export function noEmDash(text) {
  const problems = [];
  text.split("\n").forEach((line, index) => {
    if (line.includes(EM_DASH)) {
      problems.push({ line: index + 1, reason: "contains the em dash character; use a hyphen" });
    }
  });
  return problems;
}

// The part of a Markdown line the sentence rule reads.
export function proseOf(line) {
  return line
    .replace(LINE_START, "")
    .replace(INLINE_CODE, "code")
    .replace(LINK, "link")
    .replace(HTML_TAG, "");
}

// Returns [{ line, reason }] for every prose line that holds more than one sentence.
export function oneSentencePerLine(markdown) {
  const problems = [];
  const lines = markdown.split("\n");
  let inFrontMatter = lines[0] === "---";
  let fence = null;
  lines.forEach((line, index) => {
    if (index === 0 && inFrontMatter) return;
    if (inFrontMatter) {
      if (line === "---") inFrontMatter = false;
      return;
    }
    const opening = FENCE.exec(line);
    if (opening) {
      if (fence === null) fence = opening[1][0];
      else if (opening[1][0] === fence) fence = null;
      return;
    }
    if (fence !== null || TABLE_ROW.test(line)) return;
    if (SENTENCE_BREAK.test(proseOf(line))) {
      problems.push({
        line: index + 1,
        reason: "holds more than one sentence; put each sentence on its own line",
      });
    }
  });
  return problems;
}

// Returns [{ line, reason }] for every line that starts a comment.
export function noCommentLines(text) {
  const problems = [];
  text.split("\n").forEach((line, index) => {
    if (COMMENT_START.test(line)) {
      problems.push({
        line: index + 1,
        reason:
          "is a comment line; code that students see carries no comments, so move the explanation into step.md",
      });
    }
  });
  return problems;
}

const CODE_DIRS = /(?:^|\/)(?:workspace|solution|local)\//;
const LOCAL_DIR = /(?:^|\/)local\//;

// The rules that apply to one file under content/, by its relative path.
export function rulesFor(file) {
  const rules = [noEmDash];
  if (file.endsWith(".md") && !LOCAL_DIR.test(file)) rules.push(oneSentencePerLine);
  if (CODE_DIRS.test(file)) rules.push(noCommentLines);
  return rules;
}
