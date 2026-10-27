import { Caption, Chip, Panel, Row, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "dev-server-vs-build";

export const defaults = {};

const JS = "/assets/index-Bd5MmS7H.js";
const CSS = "/assets/index-CjQ7w0Ld.css";

const DEV = [
  [],
  [
    { url: "/", from: "index.html, plus a script tag for /@vite/client", how: "added" },
    { url: "/@vite/client", from: "Vite's own code for live updates", how: "vite" },
  ],
  [
    { url: "/styles.css", from: "styles.css", how: "file" },
    {
      url: "/src/main.jsx",
      from: "src/main.jsx: JSX compiled, imports rewritten",
      how: "compiled",
    },
  ],
  [
    { url: "/src/App.jsx", from: "src/App.jsx: JSX compiled", how: "compiled" },
    { url: "/src/Greeting.jsx", from: "src/Greeting.jsx: JSX compiled", how: "compiled" },
    {
      url: "/node_modules/.vite/deps/react.js?v=4f9c2d1e",
      from: "React, prepared once when the server started",
      how: "file",
    },
    {
      url: "/node_modules/.vite/deps/react-dom_client.js?v=4f9c2d1e",
      from: "React DOM, prepared once when the server started",
      how: "file",
    },
  ],
  [{ url: "/src/App.jsx?t=1761584400000", from: "your edit, compiled again", how: "compiled" }],
];

const BUILD = [
  [],
  [{ url: "/", from: "dist/index.html", how: "file" }],
  [
    { url: CSS, from: `dist${CSS}`, how: "file" },
    { url: JS, from: `dist${JS}: main.jsx, App.jsx, Greeting.jsx, and React`, how: "file" },
  ],
  [],
  [],
];

const HOW = {
  compiled: { tone: "accent", text: "compiled" },
  added: { tone: "accent", text: "changed" },
  vite: { tone: "accent", text: "from Vite" },
  file: { tone: "muted", text: "file as is" },
};

const STAGES = [
  {
    upTo: 0,
    devNote: null,
    buildNote: null,
    caption:
      "The same project served two ways. npm run dev serves your source files and compiles each one when it is asked for. npm run build writes finished files into dist, and npm run preview serves them as they are.",
  },
  {
    upTo: 1,
    devNote: null,
    buildNote: null,
    caption:
      "The browser asks both servers for the page. The dev server sends your index.html with one script tag added for its live-update client. The preview server sends dist/index.html, which build already pointed at the bundle.",
  },
  {
    upTo: 2,
    devNote: null,
    buildNote: null,
    caption:
      "Next the script and the styles. The dev server reads src/main.jsx now, turns its JSX into JavaScript, and rewrites its imports into URLs. The preview server sends one file that build compiled and minified ahead of time.",
  },
  {
    upTo: 3,
    devNote: null,
    buildNote: "No more requests: everything is already in the bundle.",
    caption:
      "The browser follows main.jsx's imports, and the dev server compiles each file as it is asked for. The built page asks for nothing more, because the bundle holds all of it.",
  },
  {
    upTo: 4,
    devNote: "You saved App.jsx: Vite compiles it again and the page updates without a reload.",
    buildNote: "You saved App.jsx: nothing changes here until you run npm run build again.",
    caption:
      "You edit App.jsx and save. The dev server compiles just that file and pushes the change to the open page. dist is a snapshot of the last build, so the preview does not change.",
  },
  {
    upTo: 4,
    settled: true,
    devNote: "For working: many small files, compiled on demand, updated as you save.",
    buildNote: "For visitors: a few hashed files, compiled once, served by any static host.",
    caption:
      "Use the dev server while you work, because it is fast to change. Deploy dist, because it is a handful of plain files that any static host can serve with no Vite running.",
  },
];

export function stepCount() {
  return STAGES.length;
}

function Requests({ groups, upTo, settled, label }) {
  const shown = groups
    .slice(0, upTo + 1)
    .flatMap((group, index) =>
      group.map((request) => ({ ...request, fresh: !settled && index === upTo })),
    );
  if (shown.length === 0) return <p className="demo-empty">No requests yet.</p>;
  return (
    <ol className="dev-server-vs-build__requests" aria-label={label}>
      {shown.map((request) => (
        <li
          key={request.url}
          className={
            request.fresh ? "dev-server-vs-build__request is-new" : "dev-server-vs-build__request"
          }
        >
          <span className="dev-server-vs-build__head">
            <span className="dev-server-vs-build__url demo-mono">GET {request.url}</span>
            <Chip tone={HOW[request.how].tone}>{HOW[request.how].text}</Chip>
          </span>
          {request.fresh && <span className="dev-server-vs-build__from">{request.from}</span>}
        </li>
      ))}
    </ol>
  );
}

function Side({ title, address, serves, groups, upTo, settled, note, label }) {
  return (
    <Panel title={title} className="dev-server-vs-build__side">
      <p className="dev-server-vs-build__server">
        <span className="demo-mono">{address}</span>
        <span className="meta">{serves}</span>
      </p>
      <Requests groups={groups} upTo={upTo} settled={settled} label={label} />
      {note && <p className="dev-server-vs-build__note">{note}</p>}
    </Panel>
  );
}

export default function DevServerVsBuild({ step }) {
  const stage = stageAt(STAGES, step);
  return (
    <div className="dev-server-vs-build">
      <Row>
        <Side
          title="npm run dev"
          address="http://localhost:5173/"
          serves="Serves the project folder"
          groups={DEV}
          upTo={stage.upTo}
          settled={stage.settled}
          note={stage.devNote}
          label="Requests to the dev server"
        />
        <Side
          title="npm run preview"
          address="http://localhost:4173/"
          serves="Serves the dist folder"
          groups={BUILD}
          upTo={stage.upTo}
          settled={stage.settled}
          note={stage.buildNote}
          label="Requests to the preview server"
        />
      </Row>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
