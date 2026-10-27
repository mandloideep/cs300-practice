import { Caption, Choice, CodeView, Panel, Row } from "../kit.jsx";
import "./styles.css";

export const id = "structure-not-style";

export const defaults = {};

const MODES = [
  { value: "none", label: "No styles" },
  { value: "defaults", label: "Browser defaults" },
  { value: "stylesheet", label: "Your stylesheet" },
];

const HTML = [
  "<h1>CS300 Study Group</h1>",
  '<p>Bring your questions and the <a href="https://developer.mozilla.org">MDN pages</a>.</p>',
  "<h2>When we meet</h2>",
  "<ul>",
  "  <li>Tuesday, 4 pm</li>",
  "  <li>Thursday, 4 pm</li>",
  "</ul>",
];

const CSS = [
  "h1 { border-bottom: 3px solid; }",
  "a { font-weight: 700; }",
  "ul {",
  "  display: flex;",
  "  flex-wrap: wrap;",
  "  gap: 0.5rem;",
  "  padding: 0;",
  "  list-style: none;",
  "}",
  "li {",
  "  padding: 0.25rem 0.75rem;",
  "  border: 1px solid;",
  "  border-radius: 1rem;",
  "}",
];

const TREE = [
  ["body", 0],
  ["h1", 1],
  ["p", 1],
  ["a", 2],
  ["h2", 1],
  ["ul", 1],
  ["li", 2],
  ["li", 2],
];

const STAGES = [
  {
    mode: "none",
    caption:
      "No styles at all, not even the browser's own. Every element is drawn inline, so the heading, the paragraph, and the list run together as one stream of text. The structure is still in the file; nothing on screen shows it.",
  },
  {
    mode: "defaults",
    caption:
      "The browser's default stylesheet: big bold headings, space between paragraphs, bullets on the list, and links blue and underlined. You wrote no CSS, and the page already looks structured.",
  },
  {
    mode: "stylesheet",
    caption:
      "Your stylesheet on top: the same elements, drawn your way. The heading gets a rule under it and the list becomes a row of pills, without one change to the HTML.",
  },
  {
    mode: "stylesheet",
    tree: true,
    caption:
      "The tree never changed. Screen readers, search engines, and your JavaScript read the elements, not their looks, so choose each element for what it means and leave the looks to CSS.",
  },
];

export function stepCount() {
  return STAGES.length;
}

function Preview({ mode }) {
  return (
    <div className={`structure-not-style__page is-${mode}`} aria-hidden="true">
      <span className="structure-not-style__h1">CS300 Study Group</span>{" "}
      <span className="structure-not-style__p">
        Bring your questions and the <span className="structure-not-style__a">MDN pages</span>.
      </span>{" "}
      <span className="structure-not-style__h2">When we meet</span>{" "}
      <span className="structure-not-style__ul">
        <span className="structure-not-style__li">Tuesday, 4 pm</span>{" "}
        <span className="structure-not-style__li">Thursday, 4 pm</span>
      </span>
    </div>
  );
}

export default function StructureNotStyle({ step, goTo }) {
  const index = Math.max(0, Math.min(STAGES.length - 1, step));
  const stage = STAGES[index];
  const label = MODES.find((mode) => mode.value === stage.mode).label;

  return (
    <div className="structure-not-style">
      <Choice
        legend="Styles"
        options={MODES}
        value={stage.mode}
        onChange={(value) => goTo(MODES.findIndex((mode) => mode.value === value))}
      />
      <Row>
        {stage.tree ? (
          <Panel title="The tree, in all three">
            <ul className="structure-not-style__tree" aria-label="The elements of the page">
              {TREE.map(([tag, depth], row) => (
                <li key={row} style={{ paddingLeft: `calc(${depth} * var(--space-4))` }}>
                  <span className="structure-not-style__tag">{tag}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : (
          <Panel title={stage.mode === "stylesheet" ? "The HTML and the CSS" : "The HTML"}>
            <CodeView lines={HTML} label="index.html" />
            {stage.mode === "stylesheet" && (
              <div className="structure-not-style__css">
                <CodeView lines={CSS} label="styles.css" />
              </div>
            )}
          </Panel>
        )}
        <Panel title={`The page: ${label.toLowerCase()}`}>
          <Preview mode={stage.mode} />
        </Panel>
      </Row>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
