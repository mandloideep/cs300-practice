// Markdown to HTML for step bodies: markdown-it with raw HTML allowed (for the details and
// summary review panels), Shiki dual-theme highlighting, and edit blocks rendered as cards.
// Colors come from the --shiki-light and --shiki-dark variables; src/styles/content.css picks one
// through prefers-color-scheme.

import MarkdownIt from "markdown-it";
import { createHighlighter } from "shiki";
import { escapeHtml, fenceCode, isEditInfo, parseInfo, placementHtml } from "./edits.mjs";

export const LANGUAGES = ["jsx", "js", "html", "css", "json", "bash", "text", "diff"];

const THEMES = { light: "github-light", dark: "github-dark" };

export function createMarkdown() {
  return new MarkdownIt({ html: true, linkify: false, typographer: false });
}

export async function createRenderer() {
  const highlighter = await createHighlighter({
    themes: Object.values(THEMES),
    langs: LANGUAGES.filter((lang) => lang !== "text"),
  });
  const md = createMarkdown();

  const highlight = (code, lang) =>
    highlighter.codeToHtml(code, { lang: lang || "text", themes: THEMES, defaultColor: false });

  md.renderer.rules.fence = (tokens, index) => {
    const token = tokens[index];
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
    render: (markdown) => md.render(markdown),
    dispose: () => highlighter.dispose(),
  };
}
