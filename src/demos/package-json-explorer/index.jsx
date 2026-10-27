import { Caption, Chip, CodeView, Panel, Row } from "../kit.jsx";
import "./styles.css";

export const id = "package-json-explorer";

export const defaults = {
  packageJson: {
    name: "my-first-react",
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies: {
      react: "19.2.8",
      "react-dom": "19.2.8",
    },
    devDependencies: {
      "@vitejs/plugin-react": "6.0.5",
      vite: "8.2.4",
    },
  },
  script: "dev",
};

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const names = (value) => (isObject(value) ? Object.keys(value) : []);

function pinned(versions) {
  const values = Object.values(versions);
  if (values.length === 0) return "";
  return values.every((value) => /^\d+\.\d+\.\d+$/.test(String(value)))
    ? " Each version has no ^ or ~, so npm installs exactly that version."
    : " A version that starts with ^ or ~ lets npm install a newer compatible release.";
}

const list = (items) =>
  items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const FIELDS = {
  name: {
    reader: "npm",
    explain: (pkg) =>
      `name is the project's name, ${pkg.name}. npm prints it whenever a script runs. It only has to be unique if you publish the package.`,
  },
  version: {
    reader: "npm",
    explain: (pkg) =>
      `version is the project's version number, ${pkg.version}, in major.minor.patch form. An app that is never published can leave it alone.`,
  },
  private: {
    reader: "npm publish",
    explain: (pkg) =>
      pkg.private === true
        ? "private: true makes npm refuse to publish this folder to the npm registry. It guards an app that is not meant to be a library."
        : "private is not true here, so npm would let you publish this folder to the npm registry.",
  },
  type: {
    reader: "Node.js",
    explain: (pkg) =>
      pkg.type === "module"
        ? 'type "module" makes Node treat the project\'s .js files as ES modules, so files such as vite.config.js can use import and export.'
        : `type "${pkg.type}" makes Node treat the project's .js files as CommonJS, with require instead of import.`,
  },
  description: {
    reader: "npm search",
    explain: () => "description is one sentence about the package, shown when people search npm.",
  },
  license: {
    reader: "npm",
    explain: (pkg) => `license names the terms others may use the code under, here ${pkg.license}.`,
  },
  scripts: {
    reader: "npm run",
    explain: (pkg) =>
      `scripts names the commands you run with npm run followed by the name: ${list(names(pkg.scripts))}. Each name maps to the command it stands for.`,
  },
  dependencies: {
    reader: "npm install",
    explain: (pkg) =>
      `dependencies are the packages your app's code imports when it runs: ${list(names(pkg.dependencies))}.${pinned(pkg.dependencies)}`,
  },
  devDependencies: {
    reader: "npm install",
    explain: (pkg) =>
      `devDependencies are the tools you need only while you develop and build: ${list(names(pkg.devDependencies))}. Visitors never download them.`,
  },
};

const MAX_FIELDS = 8;

function settings(props) {
  const given = isObject(props.packageJson) ? props.packageJson : null;
  const usable =
    given &&
    isObject(given.scripts) &&
    Object.values(given.scripts).some((value) => typeof value === "string");
  const pkg = usable ? given : defaults.packageJson;
  const fields = Object.keys(pkg)
    .filter((key) => key in FIELDS)
    .slice(0, MAX_FIELDS);
  const scripts = Object.keys(pkg.scripts).filter((key) => typeof pkg.scripts[key] === "string");
  const script =
    typeof props.script === "string" && scripts.includes(props.script)
      ? props.script
      : scripts.includes(defaults.script)
        ? defaults.script
        : scripts[0];
  return { pkg, fields, script };
}

function jsonLines(pkg) {
  const lines = ["{"];
  const ranges = {};
  const keys = Object.keys(pkg);
  keys.forEach((key, keyIndex) => {
    const body = JSON.stringify(pkg[key], null, 2).split("\n");
    const start = lines.length;
    body.forEach((line, lineIndex) => {
      let text = lineIndex === 0 ? `  ${JSON.stringify(key)}: ${line}` : `  ${line}`;
      if (lineIndex === body.length - 1 && keyIndex < keys.length - 1) text += ",";
      lines.push(text);
    });
    ranges[key] = [start, lines.length - 1];
  });
  lines.push("}");
  return { lines, ranges };
}

export function stepCount(props) {
  return settings(props).fields.length + 2;
}

function marksFor(from, to) {
  const marks = {};
  for (let index = from; index <= to; index += 1) marks[index] = "active";
  return marks;
}

function Expansion({ pkg, script }) {
  const command = pkg.scripts[script];
  const first = command.trim().split(/\s+/)[0];
  const installed = [...names(pkg.dependencies), ...names(pkg.devDependencies)].includes(first);
  const header =
    typeof pkg.name === "string" && typeof pkg.version === "string"
      ? [`> ${pkg.name}@${pkg.version} ${script}`, `> ${command}`]
      : [`> ${command}`];
  return (
    <Panel title={`npm run ${script}`} className="package-json-explorer__expansion">
      <ol className="package-json-explorer__chain" aria-label={`What npm run ${script} does`}>
        <li>
          <span className="package-json-explorer__label">You type</span>
          <code>npm run {script}</code>
        </li>
        <li>
          <span className="package-json-explorer__label">npm reads scripts.{script}</span>
          <code>{command}</code>
        </li>
        <li>
          <span className="package-json-explorer__label">npm runs it in a shell</span>
          <span>
            with <code>node_modules/.bin</code> added to the PATH
            {installed && (
              <>
                , so <code>{first}</code> is <code>node_modules/.bin/{first}</code>
              </>
            )}
          </span>
        </li>
        <li>
          <span className="package-json-explorer__label">The terminal shows first</span>
          <samp className="package-json-explorer__samp">{header.join("\n")}</samp>
        </li>
      </ol>
    </Panel>
  );
}

function Field({ pkg, field }) {
  const value = pkg[field];
  const kind = isObject(value)
    ? `object with ${names(value).length} ${names(value).length === 1 ? "entry" : "entries"}`
    : typeof value;
  return (
    <Panel title="Selected field" className="package-json-explorer__field">
      <p className="package-json-explorer__key demo-mono">&quot;{field}&quot;</p>
      <dl className="package-json-explorer__facts">
        <div>
          <dt>Value</dt>
          <dd>{kind}</dd>
        </div>
        <div>
          <dt>Read by</dt>
          <dd>
            <Chip tone="accent">{FIELDS[field].reader}</Chip>
          </dd>
        </div>
      </dl>
    </Panel>
  );
}

export default function PackageJsonExplorer({ props, step, goTo }) {
  const { pkg, fields, script } = settings(props);
  const { lines, ranges } = jsonLines(pkg);
  const last = fields.length + 1;
  const current = Math.max(0, Math.min(last, step));
  const field = current >= 1 && current <= fields.length ? fields[current - 1] : null;
  const scriptLine = ranges.scripts[0] + 1 + Object.keys(pkg.scripts).indexOf(script);

  let marks = {};
  let caption;
  if (field) {
    marks = marksFor(...ranges[field]);
    caption = FIELDS[field].explain(pkg);
  } else if (current === last) {
    marks = { [scriptLine]: "active" };
    caption = `npm run ${script} looks up ${script} in scripts and runs ${pkg.scripts[script]}. npm puts node_modules/.bin on the PATH first, so the command finds the tools this project installed.`;
  } else {
    caption = `package.json describes the project to npm: its name, the commands it can run, and the packages it needs. Select a field to see what it does.`;
  }

  const options = [
    { label: "Whole file", stage: 0 },
    ...fields.map((name, index) => ({ label: name, stage: index + 1 })),
    { label: `npm run ${script}`, stage: last },
  ];

  return (
    <div className="package-json-explorer">
      <div className="package-json-explorer__picker" role="group" aria-label="Fields">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            className="package-json-explorer__pick"
            aria-pressed={option.stage === current}
            onClick={() => goTo(option.stage)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Row>
        <Panel title="package.json" className="package-json-explorer__file">
          <CodeView lines={lines} marks={marks} label="package.json" />
        </Panel>
        {field && <Field pkg={pkg} field={field} />}
        {current === last && <Expansion pkg={pkg} script={script} />}
      </Row>
      <Caption>{caption}</Caption>
    </div>
  );
}
