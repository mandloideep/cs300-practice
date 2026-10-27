import { useState } from "react";

// The live element tree of the result, from the bridge's `dom` snapshots (docs/CONTRACTS.md
// section 4.3): each element with its tag, id, and classes, its attributes on request, and its
// own text shortened. Pointing at or focusing a row outlines the element in the result through
// a `dom-highlight` message; rows whose element a script added, removed, or changed since the
// last snapshot flash; selecting a row that came from the markup opens its line of index.html.

// The bridge sends at most this many characters of an element's own text (CONTRACTS 4.3), so a
// text that long is shown with an ellipsis.
const TEXT_LIMIT = 60;

const CHANGE_LABELS = {
  added: "added",
  removed: "removed",
  attributes: "attributes changed",
  text: "text changed",
};

export function describeNode(node) {
  const id = node.attributes?.id ? `#${node.attributes.id}` : "";
  const classes = (node.attributes?.class ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => `.${name}`)
    .join("");
  return `<${node.tag}${id}${classes}>`;
}

// Nests the flat node list of a snapshot by parentId, keeping document order; a removed node
// whose parent is gone too sits under that parent, which the snapshot still lists.
function buildTree(nodes) {
  const byParent = new Map();
  const known = new Set(nodes.map((node) => node.id));
  const roots = [];
  for (const node of nodes) {
    if (node.parentId != null && known.has(node.parentId)) {
      if (!byParent.has(node.parentId)) byParent.set(node.parentId, []);
      byParent.get(node.parentId).push(node);
    } else {
      roots.push(node);
    }
  }
  const attach = (node) => ({ ...node, children: (byParent.get(node.id) ?? []).map(attach) });
  return roots.map(attach);
}

function DomRow({ node, seq, expanded, onToggle, onHighlight, onJumpToCode }) {
  const classes = (node.attributes?.class ?? "").split(/\s+/).filter(Boolean);
  const attributes = Object.entries(node.attributes ?? {});
  const removed = node.changed === "removed";
  const declared = node.declaredAt ? `${node.declaredAt.file}:${node.declaredAt.line}` : null;
  const isOpen = expanded.has(node.id);
  const hiddenNote = [
    declared ? `declared at ${declared}` : "created by a script",
    node.changed ? CHANGE_LABELS[node.changed] : null,
  ]
    .filter(Boolean)
    .join(", ");
  const rowClass = [
    "dom-row",
    node.changed ? `is-changed is-changed--${seq % 2}` : "",
    removed ? "dom-row--removed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li className="dom-node">
      <div
        className={rowClass}
        data-node-id={node.id}
        data-changed={node.changed ?? undefined}
        onMouseEnter={() => onHighlight(node.id)}
        onMouseLeave={() => onHighlight(null)}
      >
        <button
          type="button"
          className="dom-row__name"
          onFocus={() => onHighlight(node.id)}
          onBlur={() => onHighlight(null)}
          onClick={() => {
            if (node.declaredAt) onJumpToCode(node.declaredAt);
          }}
          title={declared ? `Open ${declared}` : "Created by a script, so it has no line to open"}
        >
          <span className="dom-row__tag">&lt;{node.tag}</span>
          {node.attributes?.id && <span className="dom-row__id">#{node.attributes.id}</span>}
          {classes.map((name) => (
            <span key={name} className="dom-row__class">
              .{name}
            </span>
          ))}
          <span className="dom-row__tag">&gt;</span>
          {node.text && (
            <span className="dom-row__text">
              {node.text.length >= TEXT_LIMIT ? `${node.text}…` : node.text}
            </span>
          )}
          <span className="visually-hidden">, {hiddenNote}</span>
        </button>
        {node.changed && (
          <span className={`dom-chip dom-chip--${node.changed}`} aria-hidden="true">
            {CHANGE_LABELS[node.changed]}
          </span>
        )}
        {attributes.length > 0 && (
          <button
            type="button"
            className="link-button dom-row__attributes"
            aria-expanded={isOpen}
            aria-label={`${attributes.length} ${attributes.length === 1 ? "attribute" : "attributes"} of ${describeNode(node)}`}
            onClick={() => onToggle(node.id)}
          >
            {attributes.length} {attributes.length === 1 ? "attribute" : "attributes"}
          </button>
        )}
      </div>
      {isOpen && attributes.length > 0 && (
        <dl
          className="inspector-values dom-attributes"
          aria-label={`${describeNode(node)} attributes`}
        >
          {attributes.map(([name, value]) => (
            <div key={name} className="inspector-values__row">
              <dt>{name}</dt>
              <dd>
                <code>{JSON.stringify(value)}</code>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {node.children.length > 0 && (
        <ul className="dom-tree">
          {node.children.map((child) => (
            <DomRow
              key={child.id}
              node={child}
              seq={seq}
              expanded={expanded}
              onToggle={onToggle}
              onHighlight={onHighlight}
              onJumpToCode={onJumpToCode}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function emptyText(status) {
  if (status === "compile-error") return "Fix the compile error to see the page's elements.";
  if (status === "settled") return "The page has no elements in its body yet.";
  return "Run the code to see the elements of the page as the browser holds them.";
}

export default function DomView({ snapshot, status, send, onJumpToCode }) {
  const [expanded, setExpanded] = useState(() => new Set());

  function toggle(id) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function highlight(nodeId) {
    send({ type: "dom-highlight", nodeId });
  }

  if (!snapshot || snapshot.nodes.length === 0) {
    return <p className="meta inspector-empty">{emptyText(status)}</p>;
  }

  const tree = buildTree(snapshot.nodes);
  return (
    <>
      <ul className="dom-tree dom-tree--root" aria-label="Elements of the page">
        {tree.map((node) => (
          <DomRow
            key={node.id}
            node={node}
            seq={snapshot.seq}
            expanded={expanded}
            onToggle={toggle}
            onHighlight={highlight}
            onJumpToCode={onJumpToCode}
          />
        ))}
      </ul>
      <p className="meta inspector-help">
        Point at a row to outline the element in the result. Select a row to open the line of
        index.html that wrote it; elements a script created have no line.
      </p>
    </>
  );
}
