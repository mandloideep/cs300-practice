import { Caption, Chip, CodeView, ConsoleView, Panel, Row, Stack, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "bare-import-fail";

export const defaults = {};

const ERROR =
  'Uncaught TypeError: Failed to resolve module specifier "react". Relative references must start with either "/", "./", or "../".';

const PLAIN_HTML = [
  "<!doctype html>",
  "<title>Plain page</title>",
  '<script type="module" src="./main.js"></script>',
];

const MAPPED_HTML = [
  "<!doctype html>",
  "<title>Plain page</title>",
  '<script type="importmap">',
  "  {",
  '    "imports": {',
  '      "react": "https://esm.sh/react@19.2.8"',
  "    }",
  "  }",
  "</script>",
  '<script type="module" src="./main.js"></script>',
];

const BUILT_HTML = [
  "<!doctype html>",
  "<title>Plain page</title>",
  '<script type="module" crossorigin src="/assets/index-B7kQ2mXa.js"></script>',
];

const MAIN = ['import { version } from "react";', 'console.log("React", version);'];

const DEV_DEP = "/node_modules/.vite/deps/react.js?v=4f9c2d1e";

const RULES = [
  { label: "Starts with", code: "/" },
  { label: "Starts with", code: "./" },
  { label: "Starts with", code: "../" },
  { label: "A full URL, such as", code: "https://" },
];

const STAGES = [
  {
    mode: "Plain page",
    html: PLAIN_HTML,
    mainMark: {},
    requests: [],
    resolve: null,
    console: [],
    caption:
      'A plain page with no build tool: index.html loads main.js as a module, and main.js imports version from "react".',
  },
  {
    mode: "Plain page",
    html: PLAIN_HTML,
    htmlActive: 2,
    mainMark: {},
    requests: [
      { url: "/", ok: true },
      { url: "/main.js", ok: true },
    ],
    resolve: null,
    console: [],
    caption:
      "The browser fetches the page, then main.js. Before a module runs, the browser must fetch every module it imports.",
  },
  {
    mode: "Plain page",
    html: PLAIN_HTML,
    mainActive: 0,
    requests: [
      { url: "/", ok: true },
      { url: "/main.js", ok: true },
      { url: '"react"', ok: false },
    ],
    resolve: "rules",
    console: [],
    caption:
      'The browser turns each import into a URL. "react" does not start with /, ./, or ../ and is not a full URL, so there is no address to fetch. The browser never looks in node_modules: that is a folder Node searches, and the browser knows only URLs.',
  },
  {
    mode: "Plain page",
    html: PLAIN_HTML,
    mainMark: { 0: "error" },
    requests: [
      { url: "/", ok: true },
      { url: "/main.js", ok: true },
      { url: '"react"', ok: false },
    ],
    resolve: null,
    console: [{ text: ERROR, error: true }],
    caption:
      "Chrome stops with a TypeError in the console. main.js fails before any of its code runs, so nothing is logged and the page stays blank.",
  },
  {
    mode: "Import map",
    html: MAPPED_HTML,
    htmlMark: { 2: "good", 3: "good", 4: "good", 5: "good", 6: "good", 7: "good", 8: "good" },
    mainMark: { 0: "good" },
    requests: [
      { url: "/", ok: true },
      { url: "/main.js", ok: true },
      { url: "https://esm.sh/react@19.2.8", ok: true },
    ],
    resolve: { to: "https://esm.sh/react@19.2.8", how: "from the import map" },
    console: ["React 19.2.8"],
    caption:
      'One fix with no tools: an import map tells the browser which URL a bare name stands for. "react" now resolves to a file on a CDN, and main.js runs.',
  },
  {
    mode: "Vite dev server",
    html: PLAIN_HTML,
    mainMark: { 0: "good" },
    requests: [
      { url: "/", ok: true },
      { url: "/@vite/client", ok: true },
      { url: "/main.js", ok: true },
      { url: DEV_DEP, ok: true },
    ],
    resolve: { to: DEV_DEP, how: "rewritten by Vite before the browser sees main.js" },
    console: ["React 19.2.8"],
    caption:
      "The fix this course uses is a bundler. With npm run dev, Vite serves main.js, finds react in node_modules, and rewrites the import to a URL it serves, before the browser sees the file.",
  },
  {
    mode: "Vite build",
    html: BUILT_HTML,
    htmlMark: { 2: "good" },
    mainMark: { 0: "good" },
    requests: [
      { url: "/", ok: true },
      { url: "/assets/index-B7kQ2mXa.js", ok: true },
    ],
    resolve: { to: null, how: "joined into the bundle by npm run build" },
    console: ["React 19.2.8"],
    caption:
      "npm run build goes one step further: it joins main.js and React into one file in dist/assets and points the page at it, so no bare import is left for the browser to resolve.",
  },
];

const MODES = ["Plain page", "Import map", "Vite dev server", "Vite build"];

export function stepCount() {
  return STAGES.length;
}

function Resolve({ resolve }) {
  if (resolve === "rules") {
    return (
      <Panel title="Resolving the import" className="bare-import-fail__resolve">
        <ul className="bare-import-fail__rules" aria-label="Specifiers the browser can fetch">
          {RULES.map((rule) => (
            <li key={rule.code}>
              <span>
                {rule.label} <code>{rule.code}</code>
              </span>
              <Chip tone="danger">
                <span aria-hidden="true">✗</span> no
              </Chip>
            </li>
          ))}
        </ul>
        <p className="bare-import-fail__verdict">
          <Chip tone="danger">bare specifier</Chip> no URL to fetch
        </p>
      </Panel>
    );
  }
  return (
    <Panel title="Resolving the import" className="bare-import-fail__resolve">
      <p className="bare-import-fail__verdict">
        <Chip tone="success">
          <span aria-hidden="true">✓</span> resolved
        </Chip>{" "}
        {resolve.to ? <span className="demo-mono">{resolve.to}</span> : "no import left"}
      </p>
      <p className="bare-import-fail__how meta">{resolve.how}</p>
    </Panel>
  );
}

export default function BareImportFail({ step }) {
  const stage = stageAt(STAGES, step);
  return (
    <div className="bare-import-fail">
      <ol className="bare-import-fail__modes" aria-label="Ways to run the page">
        {MODES.map((mode) => (
          <li key={mode}>
            <Chip tone={stage.mode === mode ? "accent" : undefined}>
              {stage.mode === mode && <span className="visually-hidden">Now: </span>}
              {mode}
            </Chip>
          </li>
        ))}
      </ol>
      <Row>
        <Stack>
          <Panel title="index.html" className="bare-import-fail__file">
            <CodeView
              lines={stage.html}
              active={stage.htmlActive ?? -1}
              marks={stage.htmlMark}
              label="index.html"
            />
          </Panel>
          <Panel title="main.js" className="bare-import-fail__file">
            <CodeView
              lines={MAIN}
              active={stage.mainActive ?? -1}
              marks={stage.mainMark}
              label="main.js"
            />
          </Panel>
        </Stack>
        <Stack>
          <Panel title="Network" sunken>
            {stage.requests.length === 0 ? (
              <p className="demo-empty">No requests yet.</p>
            ) : (
              <ol className="bare-import-fail__requests" aria-label="Requests">
                {stage.requests.map((request) => (
                  <li key={request.url}>
                    <span className="demo-mono">
                      {request.ok ? "GET " : ""}
                      {request.url}
                    </span>
                    <Chip tone={request.ok ? "success" : "danger"}>
                      {request.ok ? "200" : "not sent"}
                    </Chip>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
          {stage.resolve && <Resolve resolve={stage.resolve} />}
          <ConsoleView lines={stage.console} fresh={stage.console.length} />
        </Stack>
      </Row>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
