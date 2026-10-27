// Markdown to HTML for step bodies: markdown-it with raw HTML allowed (for the details and
// summary review panels), Shiki dual-theme highlighting, and edit blocks rendered as cards.
// Colors come from the --shiki-light and --shiki-dark variables; src/styles/content.css picks one
// through prefers-color-scheme. A demo fence becomes the placeholder that src/ui/StepExplanation.jsx
// mounts its explainer into, with the registry's description as the text fallback; a predict or
// quiz fence becomes the placeholder for its radio group, with the question and the options but
// not the answer as the fallback; and a "## Read more" heading folds the step from there to the
// **Check:** paragraph into a closed details element (docs/CONTRACTS.md section 7).

import MarkdownIt from "markdown-it";
import { createHighlighter } from "shiki";
import { escapeHtml, fenceCode, isEditInfo, parseInfo, placementHtml } from "./edits.mjs";
import {
  READ_MORE,
  demoRegistry,
  fenceKind,
  isCheckParagraph,
  isReadMoreHeading,
  parseDemo,
  parseQuestion,
} from "./fences.mjs";

export const LANGUAGES = ["jsx", "js", "html", "css", "json", "bash", "text", "diff"];

const THEMES = { light: "github-light", dark: "github-dark" };

export function createMarkdown() {
  return new MarkdownIt({ html: true, linkify: false, typographer: false });
}

// "Event loop: the call stack, ..." from the registry entry; a description that starts with a
// name such as JSX keeps its capitals.
function demoFallback(entry) {
  const { title, description } = entry;
  const lead = /^[A-Z][a-z]/.test(description)
    ? description[0].toLowerCase() + description.slice(1)
    : description;
  return `${title}: ${lead}`;
}

export function demoHtml(token) {
  const { id, props, error } = parseDemo(token);
  if (error) throw new Error(`demo fence ${error}`);
  const entry = demoRegistry().find((candidate) => candidate.id === id);
  return (
    `<div class="demo" data-demo="${escapeHtml(id)}" data-props="${escapeHtml(JSON.stringify(props))}">` +
    `<p class="demo-fallback">${escapeHtml(demoFallback(entry))}</p></div>\n`
  );
}

function questionHtml(md, token, env) {
  const kind = fenceKind(token.info);
  env.questions ??= { predict: 0, quiz: 0 };
  env.questions[kind] += 1;
  const question = parseQuestion(token, env.questions[kind]);
  if (question.error) throw new Error(`${kind} fence ${question.error}`);
  const label = kind === "predict" ? "Predict" : "Quiz";
  const options = question.options.map((option) => `<li>${md.renderInline(option)}</li>`).join("");
  return (
    `<div class="${kind}" data-${kind}="${escapeHtml(question.id)}">` +
    `<div class="question-fallback"><p><strong>${label}:</strong> ${md.renderInline(question.question)}</p>` +
    `<ul>${options}</ul></div></div>\n`
  );
}

// Folds the part of a step from its "## Read more" heading to its **Check:** paragraph, or to
// the end when there is none, into a details element that starts closed.
function foldReadMore(state) {
  const { tokens } = state;
  const start = tokens.findIndex((_, index) => isReadMoreHeading(tokens, index));
  if (start === -1) return;
  const open = new state.Token("html_block", "", 0);
  open.content = `<details class="read-more"><summary>${READ_MORE}</summary>\n`;
  tokens.splice(start, 3, open);
  let end = tokens.findIndex((_, index) => index > start && isCheckParagraph(tokens, index));
  if (end === -1) end = tokens.length;
  const close = new state.Token("html_block", "", 0);
  close.content = "</details>\n";
  tokens.splice(end, 0, close);
}

export async function createRenderer() {
  const highlighter = await createHighlighter({
    themes: Object.values(THEMES),
    langs: LANGUAGES.filter((lang) => lang !== "text"),
  });
  const md = createMarkdown();
  md.core.ruler.push("read_more", foldReadMore);

  const highlight = (code, lang) =>
    highlighter.codeToHtml(code, { lang: lang || "text", themes: THEMES, defaultColor: false });

  md.renderer.rules.fence = (tokens, index, options, env) => {
    const token = tokens[index];
    const kind = fenceKind(token.info);
    if (kind === "demo") return demoHtml(token);
    if (kind) return questionHtml(md, token, env);
    const code = fenceCode(token.content);
    if (!isEditInfo(token.info)) return highlight(code, parseInfo(token.info).lang) + "\n";
    const { lang, attrs } = parseInfo(token.info);
    const caption =
      `<figcaption><span class="edit-file">${escapeHtml(attrs.file)}</span> ` +
      `<span class="edit-placement">${placementHtml(attrs.action, attrs.anchor)}</span></figcaption>`;
    const body = code === "" ? "" : highlight(code, lang);
    return `<figure class="edit-card">${caption}${body}</figure>\n`;
  };

  return {
    render: (markdown) => md.render(markdown, {}),
    dispose: () => highlighter.dispose(),
  };
}
