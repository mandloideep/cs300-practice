import { Caption, Chip, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "storage-across-reload";

export const defaults = { title: "Portfolio" };

const KEY = "project-browser";

const STARTER = [
  { id: 1, title: "Profile card", category: "HTML", done: true },
  { id: 2, title: "Landing page", category: "CSS", done: false },
  { id: 3, title: "Reading list", category: "JavaScript", done: false },
];

const NEW_ID = 1793112400000;

const CODE = [
  `const STORAGE_KEY = "${KEY}";`,
  "const projects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || starterProjects;",
  "let doneOnly = false;",
  "function saveProjects() {",
  "  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));",
  "}",
];

function readTitle(props) {
  const title = typeof props.title === "string" ? props.title.trim() : "";
  return title !== "" && title.length <= 30 ? title : defaults.title;
}

function stages(title) {
  const added = [...STARTER, { id: NEW_ID, title, category: "New", done: false }];
  const json = JSON.stringify(added);
  return [
    {
      memory: { projects: STARTER, doneOnly: false, fresh: ["projects", "doneOnly"] },
      stored: null,
      page: { projects: STARTER, doneOnly: false },
      active: 1,
      read: "null",
      caption:
        "The first load. getItem finds nothing under the key and returns null, JSON.parse(null) is null, and || picks the starter list. doneOnly starts as false.",
    },
    {
      memory: { projects: added, doneOnly: false, fresh: ["projects"] },
      stored: json,
      freshStore: true,
      page: { projects: added, doneOnly: false },
      active: 4,
      caption: `You add ${title}. The submit pushes it into the array, and saveProjects writes the whole array to localStorage as one string of JSON text.`,
    },
    {
      memory: { projects: added, doneOnly: true, fresh: ["doneOnly"] },
      stored: json,
      page: { projects: added, doneOnly: true },
      active: -1,
      caption:
        "You press Show finished only. doneOnly becomes true and the page shows one project. Nothing calls saveProjects, so this change lives only in a variable.",
    },
    {
      memory: null,
      stored: json,
      page: null,
      active: -1,
      caption:
        "You reload the page. The browser throws away the old page and every variable its script made: projects and doneOnly are gone. localStorage is kept for the site.",
    },
    {
      memory: { projects: added, doneOnly: false, fresh: ["projects", "doneOnly"] },
      stored: json,
      page: null,
      active: 1,
      marks: { 0: "done" },
      read: "text",
      caption:
        "The script runs again from the top. This time getItem returns the saved text, and JSON.parse turns it back into an array of four objects. let doneOnly = false runs again too.",
    },
    {
      memory: { projects: added, doneOnly: false },
      stored: json,
      page: { projects: added, doneOnly: false },
      active: -1,
      caption: `The page draws four projects, ${title} included, because the array came back from storage. The toggle is off again, because doneOnly was only ever a variable.`,
    },
    {
      memory: { projects: added, doneOnly: false },
      stored: json,
      page: { projects: added, doneOnly: false },
      active: -1,
      caption:
        "A variable lasts as long as the page. localStorage lasts across reloads, holds only strings, and keeps only what you remember to save after each change.",
    },
  ];
}

export function stepCount() {
  return 7;
}

function titles(list) {
  return `[${list.map((project) => JSON.stringify(project.title)).join(", ")}]`;
}

function Memory({ memory }) {
  if (!memory) {
    return <p className="demo-empty">Empty: the old page and its variables are gone.</p>;
  }
  const fresh = memory.fresh ?? [];
  return (
    <dl className="storage-across-reload__vars">
      <div className={fresh.includes("projects") ? "is-fresh" : undefined}>
        <dt className="demo-mono">projects</dt>
        <dd className="demo-mono">
          {memory.projects.length} objects {titles(memory.projects)}
        </dd>
      </div>
      <div className={fresh.includes("doneOnly") ? "is-fresh" : undefined}>
        <dt className="demo-mono">doneOnly</dt>
        <dd className="demo-mono">{String(memory.doneOnly)}</dd>
      </div>
    </dl>
  );
}

function Page({ page }) {
  if (!page) return <p className="demo-empty">Reloading…</p>;
  const visible = page.doneOnly ? page.projects.filter((project) => project.done) : page.projects;
  return (
    <div className="storage-across-reload__page">
      <span className="storage-across-reload__toggle">
        {page.doneOnly ? "☑" : "☐"} Show finished only
      </span>
      <ul className="storage-across-reload__list" aria-label="Projects on the page">
        {visible.map((project) => (
          <li key={project.id}>{project.title}</li>
        ))}
      </ul>
      <p className="meta">
        {visible.length} of {page.projects.length} projects shown.
      </p>
    </div>
  );
}

export default function StorageAcrossReload({ props, step }) {
  const title = readTitle(props);
  const stage = stageAt(stages(title), step);
  return (
    <div className="storage-across-reload">
      <div className="storage-across-reload__grid">
        <Panel title="Variables in memory" className="storage-across-reload__memory">
          <Memory memory={stage.memory} />
        </Panel>
        <Panel title="The page" className="storage-across-reload__view">
          <Page page={stage.page} />
        </Panel>
        <Panel title="localStorage" sunken className="storage-across-reload__store">
          {stage.stored === null ? (
            <p className="demo-empty">Nothing saved under {KEY}.</p>
          ) : (
            <div
              className={
                stage.freshStore
                  ? "storage-across-reload__entry is-fresh"
                  : "storage-across-reload__entry"
              }
            >
              <p className="storage-across-reload__key">
                <span className="demo-mono">{KEY}</span>
                <Chip tone="success">kept across reloads</Chip>
              </p>
              <p className="demo-mono storage-across-reload__json">{stage.stored}</p>
            </div>
          )}
          {stage.read && (
            <p className="storage-across-reload__read">
              getItem returned{" "}
              <Chip tone={stage.read === "null" ? "muted" : "accent"}>
                {stage.read === "null" ? "null" : "the JSON text"}
              </Chip>
            </p>
          )}
        </Panel>
      </div>
      <CodeView lines={CODE} active={stage.active} marks={stage.marks} label="app.js" />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
