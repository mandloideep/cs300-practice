import { Box, Caption, Chip, CodeView, Panel, Row, Stack, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "node-modules-tree";

export const defaults = {};

const PACKAGE_JSON = ['"dependencies": {', '  "react": "19.2.8",', '  "react-dom": "19.2.8"', "}"];

const LOCK_ENTRY = [
  '"node_modules/scheduler": {',
  '  "version": "0.27.0",',
  '  "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.27.0.tgz",',
  '  "integrity": "sha512-eNv+WrVbKu1f3vbYJT/xtiF5syA5HPIMtf9IgY/nKg0sWqzAUEvqY/xm7OcZc/qafLx/iO9FgOmeSAp4v5ti/Q==",',
  '  "license": "MIT"',
  "}",
];

const PACKAGES = [
  { name: "react", version: "19.2.8", why: "you asked for it", needs: [] },
  {
    name: "react-dom",
    version: "19.2.8",
    why: "you asked for it",
    needs: [
      { name: "scheduler", range: "^0.27.0", peer: false },
      { name: "react", range: "^19.2.8", peer: true },
    ],
  },
  { name: "scheduler", version: "0.27.0", why: "react-dom needs it", needs: [] },
];

const STAGES = [
  {
    installed: 0,
    reading: -1,
    lock: false,
    ci: false,
    caption:
      "package.json asks for two packages, react and react-dom, each at an exact version. You run npm install, and there is no node_modules folder yet.",
  },
  {
    installed: 1,
    reading: 0,
    lock: false,
    ci: false,
    caption:
      "npm reads react 19.2.8's own package.json from the registry. It lists no dependencies, so npm downloads it into node_modules/react and moves on.",
  },
  {
    installed: 2,
    reading: 1,
    lock: false,
    ci: false,
    caption:
      "react-dom 19.2.8 lists a dependency of its own, scheduler ^0.27.0, and a peer dependency on react ^19.2.8. The peer is already met by the react you installed.",
  },
  {
    installed: 3,
    reading: 2,
    lock: false,
    ci: false,
    caption:
      "^0.27.0 allows 0.27.0 or a later 0.27 release, and npm takes the newest one that fits, 0.27.0. It goes at the top of node_modules beside the others, not inside react-dom, so the tree stays flat. You never asked for scheduler, but you have it.",
  },
  {
    installed: 3,
    reading: -1,
    lock: true,
    ci: false,
    caption:
      "npm also writes package-lock.json: every package in the tree with the exact version it chose, the address it downloaded from, and an integrity hash of the file.",
  },
  {
    installed: 3,
    reading: -1,
    lock: true,
    ci: true,
    caption:
      "Suppose scheduler 0.27.1 comes out next week. A teammate who runs npm ci still gets 0.27.0, because npm ci installs exactly what the lockfile says and checks each hash. Commit package-lock.json to Git; never commit node_modules.",
  },
];

export function stepCount() {
  return STAGES.length;
}

function Graph({ stage }) {
  return (
    <Panel title="What each package needs">
      <ul className="node-modules-tree__graph" aria-label="Packages and their dependencies">
        {PACKAGES.map((item, index) => {
          if (index >= stage.installed) return null;
          const reading = index === stage.reading;
          return (
            <li key={item.name}>
              <Box tone={reading ? "accent" : undefined} className="node-modules-tree__package">
                <span className="node-modules-tree__name">
                  <span className="demo-mono">{item.name}</span> {item.version}
                </span>
                <span className="node-modules-tree__why">{item.why}</span>
                {item.needs.length === 0 ? (
                  <span className="node-modules-tree__needs">
                    <Chip tone="muted">no dependencies</Chip>
                  </span>
                ) : (
                  <span className="node-modules-tree__needs">
                    {item.needs.map((need) => (
                      <Chip key={need.name} tone={need.peer ? "success" : undefined}>
                        {need.peer ? "peer " : "needs "}
                        <span className="demo-mono">
                          {need.name} {need.range}
                        </span>
                        {need.peer && (
                          <>
                            {" "}
                            <span aria-hidden="true">✓</span>
                            <span className="visually-hidden">already met</span>
                          </>
                        )}
                      </Chip>
                    ))}
                  </span>
                )}
              </Box>
            </li>
          );
        })}
      </ul>
      {stage.installed === 0 && <p className="demo-empty">Nothing read yet.</p>}
    </Panel>
  );
}

function Folder({ stage }) {
  const rows = [
    { name: "package.json", depth: 1, show: true },
    { name: "package-lock.json", depth: 1, show: stage.lock, fresh: stage.lock && !stage.ci },
    { name: "node_modules/", depth: 1, show: stage.installed > 0, fresh: stage.reading === 0 },
    ...PACKAGES.map((item, index) => ({
      name: `${item.name}/`,
      depth: 2,
      show: index < stage.installed,
      fresh: index === stage.reading,
    })),
  ].filter((row) => row.show);
  return (
    <Panel title="The project folder" sunken>
      <ul className="node-modules-tree__folder" aria-label="Files and folders">
        <li className="node-modules-tree__entry">my-first-react/</li>
        {rows.map((row) => (
          <li
            key={row.name}
            className={`node-modules-tree__entry node-modules-tree__entry--${row.depth}${row.fresh ? " is-new" : ""}`}
          >
            {row.name}
            {row.fresh && <Chip tone="accent">new</Chip>}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default function NodeModulesTree({ step }) {
  const stage = stageAt(STAGES, step);
  return (
    <div className="node-modules-tree">
      <Row>
        <Stack>
          <Panel title="package.json" className="node-modules-tree__file">
            <CodeView lines={PACKAGE_JSON} label="package.json, the dependencies field" />
          </Panel>
          <Graph stage={stage} />
        </Stack>
        <Stack>
          <Folder stage={stage} />
          {stage.lock && (
            <Panel title="package-lock.json" className="node-modules-tree__file">
              <table className="demo-table node-modules-tree__locked">
                <thead>
                  <tr>
                    <th scope="col">Entry</th>
                    <th scope="col">Locked</th>
                  </tr>
                </thead>
                <tbody>
                  {PACKAGES.map((item) => (
                    <tr key={item.name}>
                      <td className="demo-mono">node_modules/{item.name}</td>
                      <td className="demo-mono">{item.version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <CodeView
                lines={LOCK_ENTRY}
                marks={stage.ci ? { 1: "good", 3: "good" } : {}}
                label="package-lock.json, the scheduler entry"
              />
            </Panel>
          )}
          {stage.ci && (
            <p className="node-modules-tree__ci">
              <Chip tone="success">npm ci</Chip> installs scheduler 0.27.0, not 0.27.1
            </p>
          )}
        </Stack>
      </Row>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
