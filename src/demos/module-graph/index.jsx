import { useId } from "react";
import { Caption, Chip, CodeView, Panel } from "../kit.jsx";
import "./styles.css";

export const id = "module-graph";

export const defaults = {
  files: [
    {
      name: "app.js",
      imports: {
        "views.js": ["browseView", "bookmarksView"],
        "api.js": ["requestBooks"],
        "storage.js": ["loadBookmarks", "saveBookmarks"],
      },
    },
    {
      name: "views.js",
      imports: { "cards.js": ["bookList"], "html.js": ["escapeHTML"] },
      exports: ["browseView", "bookmarksView"],
    },
    { name: "api.js", exports: ["requestBooks"] },
    { name: "storage.js", exports: ["loadBookmarks", "saveBookmarks"] },
    { name: "cards.js", imports: { "html.js": ["escapeHTML"] }, exports: ["bookCard", "bookList"] },
    { name: "html.js", exports: ["escapeHTML"] },
  ],
  follow: "escapeHTML",
};

const FILE = /^[A-Za-z][\w-]{0,15}\.jsx?$/;
const NAME = /^[A-Za-z_$][\w$]{0,23}$/;

function parse(props) {
  const raw = props?.files;
  if (!Array.isArray(raw) || raw.length < 2 || raw.length > 7) return null;
  const files = [];
  for (const item of raw) {
    if (!item || typeof item.name !== "string" || !FILE.test(item.name)) return null;
    const exports = item.exports === undefined ? [] : item.exports;
    if (!Array.isArray(exports) || !exports.every((name) => NAME.test(name))) return null;
    const rawImports = item.imports === undefined ? {} : item.imports;
    if (!rawImports || typeof rawImports !== "object" || Array.isArray(rawImports)) return null;
    const imports = Object.entries(rawImports).map(([from, names]) => ({ from, names }));
    files.push({ name: item.name, exports: [...new Set(exports)], imports });
  }
  const byName = new Map(files.map((file) => [file.name, file]));
  if (byName.size !== files.length) return null;
  for (const file of files) {
    for (const { from, names } of file.imports) {
      const target = byName.get(from);
      if (!target || from === file.name || !Array.isArray(names) || names.length === 0) {
        return null;
      }
      if (!names.every((name) => target.exports.includes(name))) return null;
    }
  }
  return files;
}

function importersOf(files, name, exporter) {
  return files.filter((file) =>
    file.imports.some((entry) => entry.from === exporter && entry.names.includes(name)),
  );
}

function pickFollow(files, wanted) {
  const candidates = files.flatMap((file) =>
    file.exports.map((name) => ({
      name,
      exporter: file.name,
      count: importersOf(files, name, file.name).length,
    })),
  );
  const chosen = candidates.find((item) => item.name === wanted && item.count > 0);
  if (chosen) return chosen;
  const best = [...candidates].sort((a, b) => b.count - a.count)[0];
  return best && best.count > 0 ? best : null;
}

function layout(files) {
  const byName = new Map(files.map((file) => [file.name, file]));
  const level = new Map([[files[0].name, 0]]);
  const queue = [files[0].name];
  while (queue.length) {
    const name = queue.shift();
    for (const { from } of byName.get(name).imports) {
      if (!level.has(from)) {
        level.set(from, level.get(name) + 1);
        queue.push(from);
      }
    }
  }
  if (level.size !== files.length) return null;
  const rows = [];
  for (const [name, row] of level) (rows[row] ??= []).push(name);
  const columns = Math.max(...rows.map((row) => row.length));
  const column = new Map();
  rows.forEach((row, index) => {
    const preferred = row.map((name, order) => {
      const parents = files
        .filter((file) => level.get(file.name) < index)
        .filter((file) => file.imports.some((entry) => entry.from === name))
        .map((file) => column.get(file.name));
      const spread = ((order + 0.5) * columns) / row.length - 0.5;
      const value = parents.length
        ? parents.reduce((sum, col) => sum + col, 0) / parents.length
        : spread;
      return { name, value, order };
    });
    const free = new Set(Array.from({ length: columns }, (_, col) => col));
    preferred
      .sort((a, b) => a.value - b.value || a.order - b.order)
      .forEach(({ name, value }) => {
        const col = [...free].sort((a, b) => Math.abs(a - value) - Math.abs(b - value) || a - b)[0];
        free.delete(col);
        column.set(name, col);
      });
  });
  return { level, rows, columns, column };
}

function runOrder(files) {
  const byName = new Map(files.map((file) => [file.name, file]));
  const seen = new Set();
  const order = [];
  const visit = (name) => {
    if (seen.has(name)) return;
    seen.add(name);
    for (const { from } of byName.get(name).imports) visit(from);
    order.push(name);
  };
  visit(files[0].name);
  return order;
}

function importLine(entry) {
  return `import { ${entry.names.join(", ")} } from "./${entry.from}";`;
}

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven"];

function count(n) {
  return WORDS[n] ?? String(n);
}

function joinNames(names) {
  if (names.length <= 1) return names.join("");
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function build(files, follow) {
  const byName = new Map(files.map((file) => [file.name, file]));
  const entry = files[0].name;
  const stages = [];
  const loaded = new Set([entry]);
  const edges = [];

  stages.push({
    loaded: new Set(loaded),
    edges: [],
    fresh: [],
    marks: { [entry]: { tone: "accent", tag: "entry" } },
    panel: {
      kind: "code",
      items: [
        {
          label: "index.html",
          lines: [`<script type="module" src="${entry}"></script>`],
          active: 0,
        },
      ],
    },
    caption: `The browser starts at the entry: index.html loads ${entry} as a module. It downloads ${entry} and reads its import lines before running anything.`,
  });

  let frontier = [entry];
  while (frontier.some((name) => byName.get(name).imports.length > 0)) {
    const reading = frontier.filter((name) => byName.get(name).imports.length > 0);
    const leaves = frontier.filter((name) => byName.get(name).imports.length === 0);
    const fresh = [];
    const added = [];
    const sentences = [];
    for (const name of reading) {
      const targets = byName.get(name).imports.map((item) => item.from);
      const already = targets.filter((target) => loaded.has(target));
      for (const target of targets) {
        fresh.push({ from: name, to: target });
        if (!loaded.has(target)) {
          loaded.add(target);
          added.push(target);
        }
      }
      sentences.push(`${name} imports from ${joinNames(targets)}.`);
      if (already.length) {
        sentences.push(
          `${joinNames(already)} ${already.length === 1 ? "is" : "are"} already loaded, so ${already.length === 1 ? "it is" : "they are"} not downloaded or run a second time.`,
        );
      }
    }
    if (added.length) sentences.push(`The browser downloads ${joinNames(added)}.`);
    if (leaves.length) {
      sentences.push(`${joinNames(leaves)} ${leaves.length === 1 ? "imports" : "import"} nothing.`);
    }
    edges.push(...fresh);
    const marks = Object.fromEntries(
      reading.map((name) => [name, { tone: "accent", tag: "reading" }]),
    );
    stages.push({
      loaded: new Set(loaded),
      edges: [...edges],
      fresh,
      marks,
      panel: {
        kind: "code",
        items: reading.map((name) => ({
          label: name,
          lines: byName.get(name).imports.map(importLine),
          active: -1,
        })),
      },
      caption: sentences.join(" "),
    });
    frontier = added;
  }

  const order = runOrder(files);
  stages.push({
    loaded: new Set(loaded),
    edges: [...edges],
    fresh: [],
    marks: Object.fromEntries(order.map((name, index) => [name, { tag: `runs ${index + 1}` }])),
    panel: null,
    caption: `Every file is loaded. Now the browser runs each one exactly once, dependencies first: ${order.join(", ")}.`,
  });

  const importers = importersOf(files, follow.name, follow.exporter).map((file) => file.name);
  const exporterMark = { tone: "success", tag: "export" };
  stages.push({
    loaded: new Set(loaded),
    edges: [...edges],
    fresh: [],
    marks: { [follow.exporter]: exporterMark },
    panel: {
      kind: "exports",
      file: follow.exporter,
      names: byName.get(follow.exporter).exports,
      follow: follow.name,
    },
    caption: `Follow one export: ${follow.exporter} exports ${follow.name}. ${importers.length === 1 ? "One file imports" : `${count(importers.length)[0].toUpperCase()}${count(importers.length).slice(1)} files import`} it.`,
  });

  importers.forEach((name, index) => {
    const shown = importers.slice(0, index + 1);
    const file = byName.get(name);
    const lineIndex = file.imports.findIndex(
      (item) => item.from === follow.exporter && item.names.includes(follow.name),
    );
    stages.push({
      loaded: new Set(loaded),
      edges: [...edges],
      fresh: shown.map((from) => ({ from, to: follow.exporter })),
      marks: {
        [follow.exporter]: exporterMark,
        ...Object.fromEntries(shown.map((item) => [item, { tone: "accent", tag: "imports it" }])),
      },
      panel: {
        kind: "code",
        items: [{ label: name, lines: file.imports.map(importLine), active: lineIndex }],
      },
      caption:
        index === 0
          ? `${name} imports ${follow.name} from "./${follow.exporter}". The name in the braces must match the export exactly.`
          : `${name} imports ${follow.name} too, from the same file.`,
    });
  });

  stages.push({
    loaded: new Set(loaded),
    edges: [...edges],
    fresh: importers.map((from) => ({ from, to: follow.exporter })),
    marks: {
      [follow.exporter]: exporterMark,
      ...Object.fromEntries(importers.map((item) => [item, { tone: "accent", tag: "imports it" }])),
    },
    panel: { kind: "summary", follow, importers },
    caption: `One export, ${importers.length === 1 ? "one import" : `${count(importers.length)} imports`}, one copy: ${follow.exporter} ran once, so every file that imports ${follow.name} gets the very same ${follow.name}.`,
  });

  return { stages, files };
}

function settings(props) {
  const files = parse(props);
  if (files) {
    const follow = pickFollow(files, props.follow);
    const placed = layout(files);
    if (follow && placed) {
      const result = build(files, follow);
      if (result.stages.length >= 3 && result.stages.length <= 10) return { ...result, placed };
    }
  }
  const fallback = defaults.files.map((file) => ({
    name: file.name,
    exports: file.exports ?? [],
    imports: Object.entries(file.imports ?? {}).map(([from, names]) => ({ from, names })),
  }));
  const follow = pickFollow(fallback, defaults.follow);
  return { ...build(fallback, follow), placed: layout(fallback) };
}

export function stepCount(props) {
  return settings(props).stages.length;
}

function percent(value) {
  return `${(value * 100).toFixed(3)}%`;
}

function Graph({ files, placed, stage }) {
  const marker = useId().replace(/[^A-Za-z0-9_-]/g, "");
  const rows = placed.rows.length;
  const center = (name) => ({
    x: (placed.column.get(name) + 0.5) / placed.columns,
    y: (placed.level.get(name) + 0.5) / rows,
  });
  const isFresh = (edge) =>
    stage.fresh.some((item) => item.from === edge.from && item.to === edge.to);
  const lit = stage.edges.filter(isFresh);
  const ordered = [...stage.edges.filter((edge) => !isFresh(edge)), ...lit];
  const unique = ordered.filter(
    (edge, index) =>
      ordered.findIndex((item) => item.from === edge.from && item.to === edge.to) === index,
  );

  return (
    <div className="module-graph__graph">
      <svg className="module-graph__edges" aria-hidden="true" focusable="false">
        <defs>
          {["plain", "lit"].map((kind) => (
            <marker
              key={kind}
              id={`${marker}-${kind}`}
              markerUnits="userSpaceOnUse"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" className={`module-graph__head--${kind}`} />
            </marker>
          ))}
        </defs>
        {unique.map((edge) => {
          const a = center(edge.from);
          const b = center(edge.to);
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          const kind = isFresh(edge) ? "lit" : "plain";
          return (
            <g key={`${edge.from}-${edge.to}`} className={`module-graph__edge--${kind}`}>
              <line
                x1={percent(a.x)}
                y1={percent(a.y)}
                x2={percent(mid.x)}
                y2={percent(mid.y)}
                markerEnd={`url(#${marker}-${kind})`}
              />
              <line x1={percent(mid.x)} y1={percent(mid.y)} x2={percent(b.x)} y2={percent(b.y)} />
            </g>
          );
        })}
      </svg>
      <ol
        className="module-graph__nodes"
        aria-label="Files"
        style={{
          gridTemplateColumns: `repeat(${placed.columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {files.map((file) => {
          const loaded = stage.loaded.has(file.name);
          const mark = stage.marks[file.name];
          const targets = stage.edges.filter((edge) => edge.from === file.name).map((e) => e.to);
          const classes = [
            "module-graph__node",
            !loaded && "is-unloaded",
            mark?.tone && `module-graph__node--${mark.tone}`,
          ].filter(Boolean);
          return (
            <li
              key={file.name}
              className={classes.join(" ")}
              style={{
                gridRow: placed.level.get(file.name) + 1,
                gridColumn: placed.column.get(file.name) + 1,
              }}
            >
              <span className="module-graph__file">{file.name}</span>
              {mark?.tag && <span className="module-graph__tag">{mark.tag}</span>}
              <span className="visually-hidden">
                {loaded ? "" : ", not loaded yet"}
                {targets.length ? `, imports from ${joinNames(targets)}` : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Detail({ panel }) {
  if (!panel) return null;
  if (panel.kind === "code") {
    return (
      <div className="module-graph__code">
        {panel.items.map((item) => (
          <Panel key={item.label} title={item.label} className="module-graph__file-panel">
            <CodeView lines={item.lines} active={item.active} label={item.label} />
          </Panel>
        ))}
      </div>
    );
  }
  if (panel.kind === "exports") {
    return (
      <Panel title={`${panel.file} exports`} className="module-graph__file-panel">
        <ul className="module-graph__chips" aria-label={`${panel.file} exports`}>
          {panel.names.map((name) => (
            <li key={name}>
              <Chip tone={name === panel.follow ? "success" : undefined}>
                {name === panel.follow ? `→ ${name}` : name}
              </Chip>
            </li>
          ))}
        </ul>
      </Panel>
    );
  }
  return (
    <Panel title={panel.follow.name} className="module-graph__file-panel">
      <dl className="module-graph__summary">
        <div>
          <dt>Exported by</dt>
          <dd className="demo-mono">{panel.follow.exporter}</dd>
        </div>
        <div>
          <dt>Imported by</dt>
          <dd className="demo-mono">{panel.importers.join(", ")}</dd>
        </div>
      </dl>
    </Panel>
  );
}

export default function ModuleGraph({ props, step }) {
  const { stages, files, placed } = settings(props);
  const stage = stages[Math.max(0, Math.min(stages.length - 1, step))];
  return (
    <div className="module-graph">
      <Graph files={files} placed={placed} stage={stage} />
      <Detail panel={stage.panel} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
