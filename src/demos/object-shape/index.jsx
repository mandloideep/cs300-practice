import { Caption, Chip, CodeView, ConsoleView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "object-shape";

export const defaults = {
  name: "alice",
  object: { name: "Alice", score: 95 },
  added: { grade: "A" },
};

const KEY = /^[A-Za-z_$][\w$]{0,15}$/;
const RESERVED = new Set(["field", "console", "delete", "const", "let", "var", "new", "this"]);

function primitive(value) {
  return (
    (typeof value === "string" && value.length <= 20 && !/["\\\n]/.test(value)) ||
    (typeof value === "number" && Number.isFinite(value)) ||
    typeof value === "boolean"
  );
}

function plainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function entriesOf(value, min, max) {
  if (!plainObject(value)) return null;
  const entries = Object.entries(value);
  if (entries.length < min || entries.length > max) return null;
  const ok = entries.every(([key, item]) => KEY.test(key) && key !== "field" && primitive(item));
  return ok ? entries : null;
}

function settings(props) {
  const entries = entriesOf(props.object, 2, 5) ?? Object.entries(defaults.object);
  let added = entriesOf(props.added, 1, 1);
  if (!added || entries.some(([key]) => key === added[0][0])) {
    added = Object.entries(defaults.added);
    if (entries.some(([key]) => key === added[0][0])) added = [["extra", true]];
  }
  const name =
    typeof props.name === "string" &&
    KEY.test(props.name) &&
    !RESERVED.has(props.name) &&
    !entries.some(([key]) => key === props.name)
      ? props.name
      : defaults.name;
  return { entries, added: added[0], name };
}

function literal(value) {
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

function logged(value) {
  return typeof value === "string" ? value : String(value);
}

function code({ entries, added, name }) {
  const [first] = entries[0];
  const [second] = entries[1];
  return [
    `const ${name} = { ${entries.map(([key, value]) => `${key}: ${literal(value)}`).join(", ")} };`,
    `console.log(${name}.${first});`,
    `const field = "${second}";`,
    `console.log(${name}[field]);`,
    `console.log(${name}.field);`,
    `${name}.${added[0]} = ${literal(added[1])};`,
    `delete ${name}.${second};`,
    `console.log(${name});`,
  ];
}

function listed(keys) {
  return keys.length < 3
    ? keys.join(" and ")
    : `${keys.slice(0, -1).join(", ")}, and ${keys.at(-1)}`;
}

function compact(entries) {
  return `{${entries.map(([key, value]) => `${JSON.stringify(key)}:${JSON.stringify(value)}`).join(",")}}`;
}

function stages({ entries, added, name }) {
  const [first, firstValue] = entries[0];
  const [second, secondValue] = entries[1];
  const final = [...entries.filter(([key]) => key !== second), added];
  const logs = [logged(firstValue), logged(secondValue), "undefined", compact(final)];
  return [
    {
      line: 0,
      rows: entries.map(([key, value]) => ({ key, value })),
      logs: 0,
      caption: `An object is a table of keys and values. ${name} has ${entries.length} keys: ${listed(entries.map(([key]) => key))}.`,
    },
    {
      line: 1,
      rows: entries.map(([key, value]) => ({ key, value, read: key === first })),
      logs: 1,
      caption: `Dot notation, ${name}.${first}, reads the row whose key is literally ${first}: ${literal(firstValue)}.`,
    },
    {
      line: 3,
      rows: entries.map(([key, value]) => ({ key, value, read: key === second })),
      logs: 2,
      caption: `Bracket notation, ${name}[field], first reads the variable field, which holds "${second}", and then looks up that key: ${literal(secondValue)}.`,
    },
    {
      line: 4,
      rows: [...entries.map(([key, value]) => ({ key, value })), { key: "field", missing: true }],
      logs: 3,
      caption: `${name}.field looks for a key literally named field. There is none, so the read gives undefined, with no error.`,
    },
    {
      line: 5,
      rows: [
        ...entries.map(([key, value]) => ({ key, value })),
        { key: added[0], value: added[1], added: true },
      ],
      logs: 3,
      caption: `Assigning to a key that is not there adds a row: ${name} now has ${added[0]}. const stops you from replacing the object, not from changing its rows.`,
    },
    {
      line: 6,
      rows: [
        ...entries.map(([key, value]) => ({ key, value, deleted: key === second })),
        { key: added[0], value: added[1] },
      ],
      logs: 3,
      caption: `delete removes a row, key and value together. Reading ${name}.${second} now would give undefined.`,
    },
    {
      line: 7,
      rows: final.map(([key, value]) => ({ key, value })),
      logs: 4,
      caption: `The log shows the object as it is now: ${final.length} keys, ${listed(final.map(([key]) => key))}.`,
    },
  ].map((stage) => ({ ...stage, lines: logs.slice(0, stage.logs) }));
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

export default function ObjectShape({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(stages(setup), step);
  const lines = code(setup);
  const marks = Object.fromEntries(
    lines.map((_, index) => [index, "done"]).filter(([index]) => index < stage.line),
  );
  const fresh = stage.line === 1 || stage.line === 3 || stage.line === 4 || stage.line === 7;
  return (
    <div className="object-shape">
      <CodeView lines={lines} active={stage.line} marks={marks} label="main.js" />
      <div className="demo-row object-shape__row">
        <Panel title={`The object ${setup.name}`}>
          <table className="demo-table" aria-label={`The keys and values of ${setup.name}`}>
            <thead>
              <tr>
                <th scope="col">Key</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {stage.rows.map((row) => {
                const className =
                  row.read || row.added ? "is-active" : row.deleted ? "is-muted" : undefined;
                return (
                  <tr key={row.key} className={className}>
                    <td className="demo-mono">{row.key}</td>
                    <td>
                      {row.missing ? (
                        <Chip tone="muted">no such key</Chip>
                      ) : (
                        <span className="demo-mono">{literal(row.value)}</span>
                      )}{" "}
                      {row.read && <Chip tone="accent">read</Chip>}
                      {row.added && <Chip tone="success">added</Chip>}
                      {row.deleted && <Chip tone="danger">deleted</Chip>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
        <ConsoleView lines={stage.lines} fresh={fresh ? 1 : 0} />
      </div>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
