import { useState } from "react";
import { Caption, Chip, Panel, TextField } from "../kit.jsx";
import { SUPPORTED, buildTree, describe, flatten, matches, parseSelector } from "./selectors.js";
import "./styles.css";

export const id = "selector-matcher";

export const defaults = {
  selectors: ["article", ".card", "#steps", ".card a", ".card > p", "li:first-child"],
};

const NOTES = {
  article: "A bare name is a type selector: it picks elements by their tag.",
  ".card": "A dot means a class. Both articles carry card; the first carries is-warning too.",
  "#steps": "A hash means an id, and an id is unique on a page, so it picks one element.",
  ".card a": "A space means anywhere inside: the link could sit at any depth in the card.",
  ".card > p": "> means directly inside: only the children of a card count, not deeper elements.",
  "li:first-child": ":first-child keeps an element only when it comes first among its siblings.",
};

const PAGE = {
  tag: "html",
  children: [
    {
      tag: "body",
      children: [
        {
          tag: "main",
          children: [
            { tag: "h1", text: "Study resources" },
            {
              tag: "article",
              classes: ["card", "is-warning"],
              children: [
                { tag: "p", classes: ["eyebrow"], text: "Needs a check" },
                { tag: "h2", text: "Deployment link" },
                {
                  tag: "p",
                  text: "The repository is public, but the live link still needs a check in a private window.",
                },
                { tag: "a", text: "Review the steps" },
              ],
            },
            {
              tag: "article",
              classes: ["card"],
              children: [
                { tag: "p", classes: ["eyebrow"], text: "Ready" },
                { tag: "h2", text: "Reading list" },
                { tag: "p", text: "Three MDN pages on structure, selectors, and the cascade." },
                { tag: "a", text: "Open the list" },
              ],
            },
            {
              tag: "section",
              id: "steps",
              children: [
                { tag: "h2", text: "Steps" },
                {
                  tag: "ol",
                  children: [
                    { tag: "li", text: "Open the link in a private window." },
                    { tag: "li", text: "Refresh a direct route." },
                    { tag: "li", text: "Test the first interaction." },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const ROWS = flatten(buildTree(PAGE));

function settings(props) {
  const list = Array.isArray(props.selectors)
    ? props.selectors.filter(
        (item) => typeof item === "string" && item.trim() !== "" && item.length <= 60,
      )
    : [];
  return { selectors: list.length >= 3 ? list.slice(0, 10) : defaults.selectors };
}

export function stepCount(props) {
  return settings(props).selectors.length;
}

function captionFor(parsed, count) {
  if (parsed.status === "empty") return "Type a selector to see which elements it matches.";
  if (parsed.status === "unsupported") {
    return `This explainer does not handle ${parsed.what}. It handles ${SUPPORTED}.`;
  }
  if (parsed.status === "invalid") {
    return `${parsed.text} is not a valid selector, so a browser would drop the whole rule and style nothing.`;
  }
  const who = parsed.list.map(describe).join(" and ");
  const found = count === 0 ? "none" : count;
  const sentence = `${parsed.text} picks ${who}: ${found} on this page.`;
  const note = NOTES[parsed.text];
  return note ? `${sentence} ${note}` : sentence;
}

function Attributes({ element }) {
  const parts = [];
  if (element.id) parts.push(`id="${element.id}"`);
  if (element.classes.length) parts.push(`class="${element.classes.join(" ")}"`);
  if (!parts.length) return null;
  return <span className="selector-matcher__attrs">{parts.join(" ")}</span>;
}

export default function SelectorMatcher({ props, step }) {
  const { selectors } = settings(props);
  const index = Math.max(0, Math.min(selectors.length - 1, step));
  const [edits, setEdits] = useState({});
  const text = edits[index] ?? selectors[index];
  const parsed = parseSelector(text);
  const hits = ROWS.map(({ element }) => matches(element, parsed));
  const count = hits.filter(Boolean).length;

  return (
    <div className="selector-matcher">
      <div className="selector-matcher__controls">
        <TextField
          label="Selector"
          value={text}
          onChange={(value) => setEdits((current) => ({ ...current, [index]: value }))}
        />
        <p className="selector-matcher__count">
          {parsed.status === "ok" ? (
            <Chip tone={count ? "accent" : "muted"}>
              {count} {count === 1 ? "match" : "matches"}
            </Chip>
          ) : parsed.status === "empty" ? (
            <Chip tone="muted">No selector yet</Chip>
          ) : (
            <Chip tone="warning">
              {parsed.status === "invalid" ? "⚠ Not a valid selector" : "⚠ Not handled here"}
            </Chip>
          )}
        </p>
      </div>
      <Panel title="The page">
        <ul className="selector-matcher__tree" aria-label="The elements of the page">
          {ROWS.map(({ element, depth }, row) => (
            <li
              key={row}
              className={hits[row] ? "selector-matcher__row is-match" : "selector-matcher__row"}
              style={{ marginLeft: `calc(${depth} * var(--space-3))` }}
            >
              <span className="selector-matcher__mark">
                {hits[row] && (
                  <>
                    <span aria-hidden="true">✓</span>
                    <span className="visually-hidden">Matches: </span>
                  </>
                )}
              </span>
              <span className="selector-matcher__tag">{element.tag}</span>
              <Attributes element={element} />
              {element.text && <span className="selector-matcher__text">{element.text}</span>}
            </li>
          ))}
        </ul>
      </Panel>
      <Caption>{captionFor(parsed, count)}</Caption>
    </div>
  );
}
