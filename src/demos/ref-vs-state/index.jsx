import { Caption, Chip, CodeView, ConsoleView, Panel, Row, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "ref-vs-state";

export const defaults = { name: "saves" };

const RESERVED = new Set(["do", "if", "in", "for", "let", "new", "try", "var", "case", "else"]);

function readName(props) {
  const name = typeof props.name === "string" ? props.name : "";
  return /^[a-z][A-Za-z0-9]{1,15}$/.test(name) && !RESERVED.has(name) ? name : defaults.name;
}

function refCode(name) {
  return [
    "function SaveButton() {",
    `  const ${name} = useRef(0);`,
    "  function handleSave() {",
    `    ${name}.current += 1;`,
    `    console.log("Save", ${name}.current);`,
    "  }",
    "  return <button onClick={handleSave}>Save</button>;",
    "}",
  ];
}

function stateCode(name) {
  const setter = `set${name[0].toUpperCase()}${name.slice(1)}`;
  return [
    "function SaveButton() {",
    `  const [${name}, ${setter}] = useState(0);`,
    "  function handleSave() {",
    `    ${setter}(${name} + 1);`,
    "  }",
    `  return <button onClick={handleSave}>Saves: {${name}}</button>;`,
    "}",
  ];
}

function stages(name) {
  return [
    {
      ref: { value: 0, renders: 1, logs: 0, active: 1 },
      state: { value: 0, shown: 0, renders: 1, active: 1 },
      caption: `Two versions of one button. On the left, ${name} is a ref; on the right, it is state. Both start at 0, and each component has rendered once.`,
    },
    {
      ref: { value: 1, renders: 1, logs: 1, active: 3, changed: true },
      state: { value: 1, shown: 1, renders: 2, active: 3, changed: true, rendered: true },
      caption: `You click each button once. The ref becomes 1 and the console says so, but nothing re-renders. The state becomes 1, React renders that component again, and its button shows Saves: 1.`,
    },
    {
      ref: { value: 2, renders: 1, logs: 2, active: 3, changed: true },
      state: { value: 2, shown: 2, renders: 3, active: 3, changed: true, rendered: true },
      caption:
        "Click again. The ref counts to 2, still with no render. The state counts to 2 with its third render. Each state change costs a render; a ref change costs nothing.",
    },
    {
      ref: { value: 2, renders: 2, logs: 2, active: 1, rendered: true, kept: true },
      state: { value: 2, shown: 2, renders: 4, active: 1, rendered: true, kept: true },
      caption: `Now the parent re-renders both for some other reason. useRef hands back the same object, so ${name}.current is still 2. A plain let ${name} = 0 in the body would be 0 again.`,
    },
    {
      ref: { value: 2, renders: 2, logs: 2, active: -1 },
      state: { value: 2, shown: 2, renders: 4, active: -1 },
      summary: true,
      caption:
        "Both remember across renders. Only state re-renders when it changes, so state is for what the page shows, and a ref is for a value the page does not show.",
    },
  ];
}

export function stepCount() {
  return 5;
}

function Side({ kind, title, lines, side, name }) {
  const label = kind === "ref" ? `${name}.current` : name;
  return (
    <Panel title={title} className="ref-vs-state__side">
      <CodeView lines={lines} active={side.active} label={`${title}, App.jsx`} />
      <dl className="ref-vs-state__facts">
        <div>
          <dt className="demo-mono">{label}</dt>
          <dd>
            <Chip tone={side.changed ? "accent" : side.kept ? "success" : undefined}>
              {side.value}
            </Chip>
            {side.kept && <span className="meta">remembered</span>}
          </dd>
        </div>
        <div>
          <dt>Renders so far</dt>
          <dd>
            <Chip tone={side.rendered ? "warning" : undefined}>{side.renders}</Chip>
            {side.changed && !side.rendered && <span className="meta">no render</span>}
          </dd>
        </div>
      </dl>
      <p className="ref-vs-state__screen">
        <span className="meta">On screen:</span>
        <span className="ref-vs-state__button">
          {kind === "ref" ? "Save" : `Saves: ${side.shown}`}
        </span>
      </p>
      {kind === "ref" && (
        <ConsoleView
          lines={Array.from({ length: side.logs }, (_, index) => `Save ${index + 1}`)}
          fresh={side.changed ? 1 : 0}
        />
      )}
    </Panel>
  );
}

export default function RefVsState({ props, step }) {
  const name = readName(props);
  const stage = stageAt(stages(name), step);
  return (
    <div className="ref-vs-state">
      <Row>
        <Side kind="ref" title="useRef" lines={refCode(name)} side={stage.ref} name={name} />
        <Side
          kind="state"
          title="useState"
          lines={stateCode(name)}
          side={stage.state}
          name={name}
        />
      </Row>
      {stage.summary && (
        <table className="demo-table ref-vs-state__table">
          <caption className="visually-hidden">Ref and state compared</caption>
          <thead>
            <tr>
              <th scope="col">
                <span className="visually-hidden">Question</span>
              </th>
              <th scope="col">Ref</th>
              <th scope="col">State</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Survives a re-render?</th>
              <td>✓ Yes</td>
              <td>✓ Yes</td>
            </tr>
            <tr>
              <th scope="row">Changing it re-renders?</th>
              <td>✗ No</td>
              <td>✓ Yes</td>
            </tr>
            <tr>
              <th scope="row">Use it for</th>
              <td>A value the page does not show</td>
              <td>A value the page shows</td>
            </tr>
          </tbody>
        </table>
      )}
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
