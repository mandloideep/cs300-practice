import { Caption, Chip, Panel, Row, Stack } from "../kit.jsx";
import "./styles.css";

export const id = "nesting-and-repair";

export const defaults = { cases: ["wrong-order", "p-div", "unclosed-h1"] };

const el = (tag, children = [], note = null) => ({ tag, children, note });

const NESTED = {
  typed: [[["<p>Welcome to the <strong>study group</strong>.</p>"]]],
  tree: el("body", [el("p", ["Welcome to the ", el("strong", ["study group"]), "."])]),
  caption:
    "Tags nest like boxes: <strong> opens inside <p>, so it closes first. Typed in that order, the browser builds exactly the tree you meant.",
};

const CASES = {
  "wrong-order": {
    name: "Crossed tags",
    typed: [[["<p>Welcome to the <strong>study group"], ["</p>", true], ["</strong>", true]]],
    meant: ["<p>Welcome to the <strong>study group</strong></p>"],
    tree: el("body", [
      el("p", [
        "Welcome to the ",
        el("strong", ["study group"], { tone: "warning", text: "closed by </p>" }),
      ]),
    ]),
    dropped: "</strong>",
    caption:
      "The tags cross: </p> arrives while <strong> is still open. The browser closes the strong for you at </p>, then finds a </strong> with nothing left to close and drops it.",
  },
  "p-div": {
    name: "A div inside a paragraph",
    typed: [[["<p>Meeting times"], ["<div>", true], ["Tuesday, 4 pm</div>"], ["</p>", true]]],
    meant: ["<p>Meeting times</p>", "<div>Tuesday, 4 pm</div>"],
    tree: el("body", [
      el("p", ["Meeting times"], { tone: "warning", text: "closed early" }),
      el("div", ["Tuesday, 4 pm"]),
      el("p", [], { tone: "danger", text: "added" }),
    ]),
    caption:
      "A paragraph cannot hold a <div>, so the browser ends the paragraph the moment <div> starts. The </p> at the end then has no paragraph to close, so the browser adds an empty one to match it.",
  },
  "unclosed-h1": {
    name: "A heading left open",
    typed: [[["<h1>", true], ["CS300 Study Group"]], [["<p>Welcome to the study group.</p>"]]],
    meant: ["<h1>CS300 Study Group</h1>", "<p>Welcome to the study group.</p>"],
    tree: el("body", [
      el(
        "h1",
        [
          "CS300 Study Group",
          el("p", ["Welcome to the study group."], { tone: "danger", text: "inside the heading" }),
        ],
        { tone: "warning", text: "never closed" },
      ),
    ]),
    caption:
      "Nothing closes the <h1>, and a <p> does not end a heading the way a <div> ends a paragraph, so the paragraph ends up inside the heading. The browser draws it heading-sized, and no error appears anywhere.",
  },
  "optional-end": {
    name: "Missing </li> tags",
    typed: [[["<ul><li>Tuesday"], ["<li>", true], ["Thursday"], ["</ul>", true]]],
    meant: ["<ul><li>Tuesday</li><li>Thursday</li></ul>"],
    tree: el("body", [
      el("ul", [
        el("li", ["Tuesday"], { tone: "success", text: "closed by the next <li>" }),
        el("li", ["Thursday"], { tone: "success", text: "closed by </ul>" }),
      ]),
    ]),
    caption:
      "Not every missing tag is a mistake: a new <li> closes the one before it, and </ul> closes the last. The tree is what you meant, but writing every </li> keeps the file easy to read.",
  },
  carried: {
    name: "Bold across two paragraphs",
    typed: [
      [["<p><strong>Welcome"], ["</p>", true], ["<p>to the group"], ["</strong>", true], ["</p>"]],
    ],
    meant: ["<p><strong>Welcome</strong></p>", "<p><strong>to the group</strong></p>"],
    tree: el("body", [
      el("p", [el("strong", ["Welcome"], { tone: "warning", text: "closed by </p>" })]),
      el("p", [
        el("strong", ["to the group"], { tone: "danger", text: "reopened by the browser" }),
      ]),
    ]),
    caption:
      "The <strong> is still open at </p>. The browser closes it there, then opens a new <strong> in the next paragraph, which the late </strong> closes.",
  },
};

function settings(props) {
  const list = Array.isArray(props.cases) ? props.cases : [];
  const known = [...new Set(list.filter((key) => typeof key === "string" && CASES[key]))];
  return { cases: known.length ? known.slice(0, 8) : defaults.cases };
}

function stages({ cases }) {
  return [
    { kind: "nested", ...NESTED },
    ...cases.map((key) => ({ kind: "case", key, ...CASES[key] })),
    {
      kind: "summary",
      caption:
        "The browser never reports these mistakes: it repairs them and draws the result. When a page looks wrong, open the DOM view and compare its tree with your file.",
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

function Typed({ lines, label }) {
  return (
    <pre className="demo-code nesting-and-repair__typed" aria-label={label}>
      <code>
        {lines.map((parts, row) => (
          <span key={row} className="nesting-and-repair__line">
            {parts.map(([text, bad], index) =>
              bad ? (
                <span key={index} className="nesting-and-repair__bad">
                  {text}
                </span>
              ) : (
                <span key={index}>{text}</span>
              ),
            )}
          </span>
        ))}
      </code>
    </pre>
  );
}

function Node({ node }) {
  if (typeof node === "string") {
    return (
      <li className="nesting-and-repair__text">
        <span className="demo-mono">&quot;{node}&quot;</span>
      </li>
    );
  }
  return (
    <li>
      <span className="nesting-and-repair__node">
        <span className={`nesting-and-repair__tag${node.note ? ` is-${node.note.tone}` : ""}`}>
          {node.tag}
        </span>
        {node.note && <Chip tone={node.note.tone}>{node.note.text}</Chip>}
        {node.children.length === 0 && <span className="meta">(empty)</span>}
      </span>
      {node.children.length > 0 && (
        <ul className="nesting-and-repair__children">
          {node.children.map((child, index) => (
            <Node key={index} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

function Tree({ root }) {
  return (
    <ul className="nesting-and-repair__tree" aria-label="The tree the browser builds">
      <Node node={root} />
    </ul>
  );
}

export default function NestingAndRepair({ props, step }) {
  const setup = settings(props);
  const all = stages(setup);
  const stage = all[Math.max(0, Math.min(all.length - 1, step))];

  if (stage.kind === "summary") {
    return (
      <div className="nesting-and-repair">
        <Panel title="What you meant, written out">
          <Stack>
            {setup.cases.map((key) => (
              <div key={key} className="nesting-and-repair__fixed">
                <p className="meta">{CASES[key].name}</p>
                <Typed lines={CASES[key].meant.map((line) => [[line]])} label={CASES[key].name} />
              </div>
            ))}
          </Stack>
        </Panel>
        <Caption>{stage.caption}</Caption>
      </div>
    );
  }

  return (
    <div className="nesting-and-repair">
      <Row>
        <Panel title="You typed">
          <Typed lines={stage.typed} label="The markup as typed" />
          {stage.kind === "case" && (
            <p className="nesting-and-repair__legend meta">
              <span className="nesting-and-repair__bad">Underlined</span>: the tags the browser has
              to repair.
            </p>
          )}
        </Panel>
        <Panel title="The browser builds">
          <Tree root={stage.tree} />
          {stage.dropped && (
            <p className="nesting-and-repair__dropped">
              <Chip tone="muted">dropped</Chip> <span className="demo-mono">{stage.dropped}</span>
            </p>
          )}
        </Panel>
      </Row>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
