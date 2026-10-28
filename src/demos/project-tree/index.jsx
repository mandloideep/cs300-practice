import { useState } from "react";
import { Caption, Chip, Panel } from "../kit.jsx";
import "./styles.css";

export const id = "project-tree";

const entry = (path, kind, description) => ({
  path,
  depth: path.split("/").length - 1,
  kind,
  description,
  fresh: true,
});

export const defaults = {
  stages: [
    {
      label: "After npm create vite",
      entries: [
        entry("my-first-react", "folder", "The project folder the creator made"),
        entry(
          "my-first-react/index.html",
          "file",
          "The page the browser opens; React draws inside its root div",
        ),
        entry(
          "my-first-react/package.json",
          "file",
          "The project's name, its scripts, and the packages it needs",
        ),
        entry("my-first-react/styles.css", "file", "The page's styles, linked from index.html"),
        entry(
          "my-first-react/vite.config.js",
          "file",
          "Vite's settings, with the plugin that lets it compile JSX",
        ),
        entry("my-first-react/src", "folder", "The source files you edit"),
        entry("my-first-react/src/main.jsx", "file", "Finds the root div and renders App into it"),
        entry("my-first-react/src/App.jsx", "file", "The top component"),
      ],
    },
    {
      label: "After npm install",
      entries: [
        entry(
          "my-first-react/node_modules",
          "folder",
          "Every installed package; never edited, never committed",
        ),
        entry(
          "my-first-react/package-lock.json",
          "file",
          "The exact version npm chose for every package; committed",
        ),
      ],
    },
    {
      label: "After npm run build",
      entries: [
        entry(
          "my-first-react/dist",
          "folder",
          "The built site a host serves; rebuilt from src, never edited",
        ),
        entry(
          "my-first-react/dist/index.html",
          "file",
          "The built page, whose script tag points at the bundle",
        ),
        entry("my-first-react/dist/assets", "folder", "The bundled script and stylesheet"),
        entry(
          "my-first-react/dist/assets/index-Bd5MmS7H.js",
          "file",
          "Every module of the app, React included, in one file",
        ),
        entry(
          "my-first-react/dist/assets/index-CjQ7w0Ld.css",
          "file",
          "Every stylesheet of the app in one file",
        ),
      ],
    },
  ],
};

const MAX_STAGES = 6;

function validEntry(item) {
  return (
    item &&
    typeof item.path === "string" &&
    item.path !== "" &&
    Number.isInteger(item.depth) &&
    (item.kind === "file" || item.kind === "folder") &&
    (item.description === null || typeof item.description === "string")
  );
}

function settings(props) {
  const stages = props?.stages;
  const ok =
    Array.isArray(stages) &&
    stages.length >= 1 &&
    stages.length <= MAX_STAGES &&
    stages.every(
      (stage) =>
        stage &&
        (stage.label === null || typeof stage.label === "string") &&
        Array.isArray(stage.entries) &&
        stage.entries.length > 0 &&
        stage.entries.every(validEntry),
    );
  return ok ? stages : defaults.stages;
}

// The entries of stages 0 to `upTo` in tree order: each entry under its folder, a later stage's
// entries after the ones its folder already holds.
function treeOf(stages, upTo) {
  const root = { children: [] };
  const nodes = new Map();
  stages.slice(0, upTo + 1).forEach((stage, index) => {
    for (const item of stage.entries) {
      const slash = item.path.lastIndexOf("/");
      const parent = slash === -1 ? root : (nodes.get(item.path.slice(0, slash)) ?? root);
      const node = { ...item, stage: index, children: [] };
      nodes.set(item.path, node);
      parent.children.push(node);
    }
  });
  const order = [];
  const visit = (node) =>
    node.children.forEach((child) => {
      order.push(child);
      visit(child);
    });
  visit(root);
  return order;
}

function nameOf(item) {
  const name = item.path.slice(item.path.lastIndexOf("/") + 1);
  return item.kind === "folder" ? `${name}/` : name;
}

function joinWords(items) {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function stepCount(props) {
  const stages = settings(props);
  return stages.length > 1 ? stages.length : stages[0].entries.length;
}

function command(label) {
  const match = /^after\s+(.+)$/i.exec(label ?? "");
  return match ? match[1] : null;
}

function caption(stages, staged, current, shown, selected) {
  const about = `${nameOf(selected)}: ${selected.description ?? "an entry of the project, with no description in this listing"}.`;
  if (!staged) {
    const label = stages[0].label ? `${stages[0].label}. ` : "";
    return `${label}Entry ${current + 1} of ${shown.length}, ${about}`;
  }
  const stage = stages[current];
  if (current === 0) {
    return `${stage.label}: the project holds ${shown.length} files and folders. Select one to see what it is for. ${about}`;
  }
  const top = Math.min(...stage.entries.map((item) => item.depth));
  const added = joinWords(stage.entries.filter((item) => item.depth === top).map(nameOf));
  const run = command(stage.label);
  return `${run ? `${run} added ${added}` : `${stage.label}: ${added} appeared`}, marked new. ${about}`;
}

export default function ProjectTree({ props, step, goTo }) {
  const stages = settings(props);
  const staged = stages.length > 1;
  const current = staged
    ? Math.max(0, Math.min(stages.length - 1, step))
    : Math.max(0, Math.min(stages[0].entries.length - 1, step));
  const shown = treeOf(stages, staged ? current : 0);
  const initial = staged
    ? (stages[current].entries[0]?.path ?? shown[0].path)
    : shown[current].path;
  const [picked, setPicked] = useState(initial);
  const [seen, setSeen] = useState(current);
  if (seen !== current) {
    setSeen(current);
    setPicked(initial);
  }
  const selected = shown.find((item) => item.path === picked) ?? shown[0];

  return (
    <div className="project-tree">
      <ul className="project-tree__list" aria-label="The project folder">
        {shown.map((item, index) => {
          const fresh = staged && current > 0 && item.stage === current;
          const isSelected = item.path === selected.path;
          return (
            <li key={item.path} style={{ "--depth": item.depth }}>
              <button
                type="button"
                className={[
                  "project-tree__entry",
                  item.kind === "folder" && "project-tree__entry--folder",
                  fresh && "is-fresh",
                  isSelected && "is-selected",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={isSelected}
                onClick={() => (staged ? setPicked(item.path) : goTo(index))}
              >
                <span className="project-tree__name">{nameOf(item)}</span>
                {fresh && <Chip tone="accent">new</Chip>}
              </button>
            </li>
          );
        })}
      </ul>
      <Panel title={selected.path} className="project-tree__detail">
        <p>{selected.description ?? "No description in this listing."}</p>
      </Panel>
      <Caption>{caption(stages, staged, current, shown, selected)}</Caption>
    </div>
  );
}
