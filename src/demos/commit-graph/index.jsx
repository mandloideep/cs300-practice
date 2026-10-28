import { Caption, Chip, Panel } from "../kit.jsx";
import "./styles.css";

export const id = "commit-graph";

export const defaults = {
  commits: [
    {
      hash: "a1b2c3d",
      message: "Initial page",
      files: ["index.html", "src/main.jsx", "src/App.jsx"],
      diff: {
        "src/App.jsx": ["+export default function App() {", "+  return <h1>Shop</h1>;", "+}"],
      },
    },
    {
      hash: "5d6e7f8",
      message: "Add styles",
      files: ["src/App.css", "src/App.jsx"],
      diff: {
        "src/App.css": ["+h1 {", "+  color: navy;", "+}"],
        "src/App.jsx": ['+import "./App.css";', "+", " export default function App() {"],
      },
    },
    {
      hash: "9f4e2b7",
      message: "Rename the heading",
      files: ["src/App.jsx"],
      diff: { "src/App.jsx": ["-  return <h1>Shop</h1>;", "+  return <h1>The Shop</h1>;"] },
    },
    {
      hash: "3c8d1fa",
      message: "Add the product list",
      files: ["src/ProductList.jsx", "src/App.jsx"],
      diff: {
        "src/ProductList.jsx": [
          "+export default function ProductList() {",
          '+  return <ul className="products" />;',
          "+}",
        ],
        "src/App.jsx": [
          '+import ProductList from "./ProductList.jsx";',
          "-  return <h1>The Shop</h1>;",
          "+  return (",
          "+    <main>",
          "+      <h1>The Shop</h1>",
          "+      <ProductList />",
          "+    </main>",
          "+  );",
        ],
      },
    },
  ],
};

const MAX_COMMITS = 8;
const MAX_FILES = 10;
const HASH = /^[0-9a-f]{7}$/;
const PATH = /^(?!.*\.\.)[\w.@-]+(\/[\w.@-]+){0,5}$/;

function cleanDiff(raw, files) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([path, lines]) => files.includes(path) && Array.isArray(lines))
      .map(([path, lines]) => [
        path,
        lines.filter((line) => typeof line === "string" && /^[-+ ]/.test(line)).slice(0, 12),
      ])
      .filter(([, lines]) => lines.length > 0),
  );
}

function clean(entry) {
  if (!entry || typeof entry !== "object") return null;
  const hash = typeof entry.hash === "string" ? entry.hash.trim().toLowerCase() : "";
  const message = typeof entry.message === "string" ? entry.message.trim() : "";
  if (!HASH.test(hash) || message === "" || message.length > 80) return null;
  const files = Array.isArray(entry.files)
    ? [...new Set(entry.files.filter((path) => typeof path === "string" && PATH.test(path)))]
    : [];
  if (files.length === 0 || files.length > MAX_FILES) return null;
  return { hash, message, files, diff: cleanDiff(entry.diff, files) };
}

function settings(props) {
  const raw = Array.isArray(props.commits) ? props.commits : [];
  const given = raw.map(clean);
  const ok =
    given.length >= 1 &&
    given.length <= MAX_COMMITS &&
    given.every(Boolean) &&
    new Set(given.map((commit) => commit.hash)).size === given.length;
  return history(ok ? given : defaults.commits.map(clean));
}

function history(commits) {
  const seen = new Set();
  return commits.map((commit, index) => {
    const changes = commit.files.map((path) => ({
      path,
      kind: seen.has(path) ? "modified" : "added",
    }));
    commit.files.forEach((path) => seen.add(path));
    return {
      ...commit,
      parent: index > 0 ? commits[index - 1].hash : null,
      changes,
      snapshot: [...seen].sort(),
    };
  });
}

export function stepCount(props) {
  return settings(props).length;
}

function joinWords(items) {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function caption(commits, index) {
  const commit = commits[index];
  const added = commit.changes.filter((change) => change.kind === "added").map((c) => c.path);
  const modified = commit.changes.filter((change) => change.kind === "modified").map((c) => c.path);
  const parts = [
    added.length ? `adds ${joinWords(added)}` : "",
    modified.length ? `changes ${joinWords(modified)}` : "",
  ].filter(Boolean);
  const head =
    index === commits.length - 1 ? " It is the newest commit, so HEAD and main point to it." : "";
  if (!commit.parent) {
    return `${commit.hash}, "${commit.message}", is the first commit. It has no parent, so its diff ${parts.join(" and ")}.${head} Select any commit to see what it holds.`;
  }
  return `${commit.hash}, "${commit.message}", points back to its parent ${commit.parent}. Its snapshot holds all ${plural(commit.snapshot.length, "file")} of the project as they were; its diff from ${commit.parent} only ${parts.join(" and ")}.${head}`;
}

function Chain({ commits, selected, onSelect }) {
  const newestFirst = commits.map((commit, index) => ({ commit, index })).reverse();
  return (
    <ol className="commit-graph__chain" aria-label="Commits, newest first">
      {newestFirst.map(({ commit, index }) => {
        const isSelected = index === selected;
        return (
          <li key={commit.hash} className="commit-graph__item">
            <button
              type="button"
              className={isSelected ? "commit-graph__commit is-selected" : "commit-graph__commit"}
              aria-pressed={isSelected}
              onClick={() => onSelect(index)}
            >
              <span className="commit-graph__dot" aria-hidden="true" />
              <span className="commit-graph__text">
                <span className="commit-graph__hash">{commit.hash}</span>
                <span className="commit-graph__message">{commit.message}</span>
              </span>
              {index === commits.length - 1 && <Chip tone="success">HEAD → main</Chip>}
              <span className="visually-hidden">
                {commit.parent ? `, parent ${commit.parent}` : ", no parent"}
              </span>
            </button>
            {commit.parent && (
              <span className="commit-graph__parent" aria-hidden="true">
                ↓ parent
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Snapshot({ commit }) {
  const kinds = Object.fromEntries(commit.changes.map((change) => [change.path, change.kind]));
  return (
    <Panel title={`Snapshot in ${commit.hash}`} className="commit-graph__panel">
      <ul className="commit-graph__files" aria-label={`Files in ${commit.hash}`}>
        {commit.snapshot.map((path) => (
          <li
            key={path}
            className={kinds[path] ? "commit-graph__file is-changed" : "commit-graph__file"}
          >
            <span className="demo-mono">{path}</span>
            {kinds[path] ? (
              <Chip tone={kinds[path] === "added" ? "success" : "accent"}>{kinds[path]}</Chip>
            ) : (
              <span className="commit-graph__same">unchanged</span>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function DiffLines({ lines, label }) {
  return (
    <pre className="commit-graph__diff" aria-label={label}>
      <code>
        {lines.map((line, index) => {
          const sign = line[0];
          const text = line.slice(1);
          const indent = /^ */.exec(text)[0].length;
          const kind = sign === "+" ? "add" : sign === "-" ? "del" : "same";
          return (
            <span
              key={index}
              className={`commit-graph__diff-line is-${kind}`}
              style={indent > 0 ? { "--diff-indent": `${indent}ch` } : undefined}
            >
              <span className="commit-graph__sign" aria-hidden="true">
                {sign}
              </span>
              {kind !== "same" && (
                <span className="visually-hidden">{kind === "add" ? "Added: " : "Removed: "}</span>
              )}
              {text.trim() === "" ? " " : text.slice(indent)}
            </span>
          );
        })}
      </code>
    </pre>
  );
}

function Diff({ commit }) {
  return (
    <Panel
      title={commit.parent ? `Diff from ${commit.parent}` : "Diff: the first commit"}
      className="commit-graph__panel"
    >
      <ul className="commit-graph__changes" aria-label={`Files changed in ${commit.hash}`}>
        {commit.changes.map((change) => (
          <li key={change.path} className="commit-graph__change">
            <p className="commit-graph__change-name">
              <Chip tone={change.kind === "added" ? "success" : "accent"}>{change.kind}</Chip>{" "}
              <span className="demo-mono">{change.path}</span>
            </p>
            {commit.diff[change.path] && (
              <DiffLines
                lines={commit.diff[change.path]}
                label={`Changed lines in ${change.path}`}
              />
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default function CommitGraph({ props, step, goTo }) {
  const commits = settings(props);
  const selected = Math.max(0, Math.min(commits.length - 1, step));
  const commit = commits[selected];
  return (
    <div className="commit-graph">
      <div className="commit-graph__layout">
        <Chain commits={commits} selected={selected} onSelect={goTo} />
        <div className="commit-graph__detail">
          <Diff commit={commit} />
          <Snapshot commit={commit} />
        </div>
      </div>
      <Caption>{caption(commits, selected)}</Caption>
    </div>
  );
}
