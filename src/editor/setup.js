import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  highlightSpecialChars,
} from "@codemirror/view";
import { EditorState, Prec } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
  HighlightStyle,
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { tags as t } from "@lezer/highlight";

export function tabId(path) {
  return String(path).replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function languageFor(path) {
  if (/\.(jsx?|mjs)$/.test(path)) return javascript({ jsx: true });
  if (path.endsWith(".html")) return html();
  if (path.endsWith(".css")) return css();
  if (path.endsWith(".json")) return json();
  return [];
}

// Colors come from CSS custom properties in tokens.css, so light and dark follow the system.
export const labTheme = EditorView.theme({
  "&": {
    color: "var(--color-text)",
    backgroundColor: "var(--color-surface)",
    fontSize: "var(--text-sm)",
  },
  ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.55" },
  ".cm-content": { caretColor: "var(--color-text)", padding: "var(--space-2) 0" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--color-text)" },
  "&.cm-focused": { outline: "none" },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    { backgroundColor: "var(--editor-selection)" },
  ".cm-activeLine": { backgroundColor: "var(--editor-active-line)" },
  ".cm-gutters": {
    color: "var(--color-text-muted)",
    backgroundColor: "var(--color-surface-sunken)",
    borderRight: "1px solid var(--color-border)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--editor-active-line)",
    color: "var(--color-text)",
  },
  ".cm-tooltip": {
    border: "1px solid var(--color-border)",
    backgroundColor: "var(--color-surface-raised)",
    color: "var(--color-text)",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "var(--color-accent-soft)",
    color: "var(--color-text)",
  },
  ".cm-panels": { backgroundColor: "var(--color-surface-sunken)", color: "var(--color-text)" },
  ".cm-searchMatch": {
    backgroundColor: "var(--color-warning-soft)",
    outline: "1px solid var(--color-warning)",
  },
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
    backgroundColor: "var(--color-accent-soft)",
    outline: "1px solid var(--color-border-strong)",
  },
  ".cm-changedLine": { backgroundColor: "var(--diff-inserted)" },
  ".cm-deletedChunk": { backgroundColor: "var(--diff-deleted)" },
  "&.cm-merge-a .cm-changedLine, .cm-merge-a .cm-changedLine": {
    backgroundColor: "var(--diff-deleted)",
  },
  "&.cm-merge-b .cm-changedLine, .cm-merge-b .cm-changedLine": {
    backgroundColor: "var(--diff-inserted)",
  },
  ".cm-changedText": { background: "none" },
});

const fillHeight = EditorView.theme({ "&": { height: "100%" } });

export const labHighlight = syntaxHighlighting(
  HighlightStyle.define([
    {
      tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword],
      color: "var(--syntax-keyword)",
    },
    { tag: [t.string, t.special(t.string), t.regexp], color: "var(--syntax-string)" },
    { tag: [t.number, t.bool, t.null, t.atom], color: "var(--syntax-number)" },
    {
      tag: [t.comment, t.lineComment, t.blockComment],
      color: "var(--syntax-comment)",
      fontStyle: "italic",
    },
    { tag: [t.tagName, t.angleBracket], color: "var(--syntax-tag)" },
    { tag: t.attributeName, color: "var(--syntax-attribute)" },
    { tag: [t.propertyName, t.definition(t.propertyName)], color: "var(--syntax-property)" },
    {
      tag: [t.function(t.variableName), t.function(t.propertyName)],
      color: "var(--syntax-function)",
    },
    { tag: [t.typeName, t.className, t.definition(t.typeName)], color: "var(--syntax-type)" },
    { tag: t.invalid, color: "var(--syntax-invalid)" },
  ]),
);

export function readOnlyExtensions(path) {
  return [
    lineNumbers(),
    highlightSpecialChars(),
    EditorState.readOnly.of(true),
    EditorView.editable.of(false),
    languageFor(path),
    labTheme,
    labHighlight,
  ];
}

export function editableExtensions(path, { onRun }) {
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    foldGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    Prec.highest(
      keymap.of([
        {
          key: "Escape",
          run: (view) => {
            view.setTabFocusMode(2000);
            return false;
          },
        },
      ]),
    ),
    keymap.of([
      { key: "Mod-Enter", run: () => (onRun(), true), preventDefault: true },
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),
    languageFor(path),
    labTheme,
    fillHeight,
    labHighlight,
    EditorView.contentAttributes.of({ "aria-label": `Code editor for ${path}` }),
  ];
}
