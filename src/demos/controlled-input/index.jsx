import { Caption, Chip, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "controlled-input";

export const defaults = { text: "Kiwi", rejected: "7" };

const LOOP = ["onChange", "setTitle", "Render"];

const CODE = [
  "function AddProductForm() {",
  '  const [title, setTitle] = useState("");',
  "  function handleChange(event) {",
  "    const next = event.target.value;",
  "    if (/\\d/.test(next)) return;",
  "    setTitle(next);",
  "  }",
  "  return (",
  "    <form>",
  '      <p>{title ? "Adding " + title : "Type a title to begin."}</p>',
  "      <input value={title} onChange={handleChange} />",
  "    </form>",
  "  );",
  "}",
];

function readText(props) {
  const text = typeof props.text === "string" ? props.text : "";
  return /^[A-Za-z][A-Za-z ]{1,15}$/.test(text) ? text : defaults.text;
}

function readRejected(props) {
  const key = typeof props.rejected === "string" ? props.rejected : "";
  return /^\d$/.test(key) ? key : defaults.rejected;
}

function stages(text, digit) {
  const first = text[0];
  const rest = text.slice(1);
  const typed = `${text}${digit}`;
  return [
    {
      at: "Render",
      field: "",
      state: "",
      active: 10,
      caption:
        'The state owns the text. title starts as "", so value={title} makes the input show nothing and the note asks for a title.',
    },
    {
      at: "onChange",
      field: first,
      state: "",
      pending: true,
      active: 3,
      caption: `You press ${first}. For a moment the field holds "${first}", and React calls onChange. event.target.value is "${first}", but the state is still "".`,
    },
    {
      at: "setTitle",
      field: first,
      state: first,
      pending: true,
      fresh: true,
      active: 5,
      marks: { 3: "done", 4: "good" },
      caption: `"${first}" has no digit, so the guard lets it through and setTitle("${first}") stores it. The state changes, and React schedules a render.`,
    },
    {
      at: "Render",
      field: first,
      state: first,
      active: 10,
      caption: `React calls AddProductForm again. value={title} is "${first}" now, so the input shows it, and the note reads Adding ${first}.`,
    },
    {
      at: "Render",
      field: text,
      state: text,
      active: 10,
      caption: `You type ${rest.split("").join(", ")}. Each keystroke makes the same loop: onChange, setTitle, render. The state is "${text}" and the field shows it.`,
    },
    {
      at: "onChange",
      field: typed,
      state: text,
      pending: true,
      active: 3,
      caption: `You press ${digit}. For a moment the field holds "${typed}", and onChange runs with event.target.value "${typed}".`,
    },
    {
      at: "setTitle",
      field: typed,
      state: text,
      pending: true,
      rejected: true,
      active: -1,
      marks: { 3: "done", 4: "error" },
      caption: `"${typed}" has a digit, so the handler returns before setTitle. The state rejects the keystroke: title is still "${text}".`,
    },
    {
      at: "Render",
      field: text,
      state: text,
      active: 10,
      caption: `After the event, React makes the input match the state again, so the field shows "${text}" and the ${digit} never stays. The input shows only what the state accepts.`,
    },
  ];
}

export function stepCount() {
  return 8;
}

export default function ControlledInput({ props, step }) {
  const text = readText(props);
  const digit = readRejected(props);
  const stage = stageAt(stages(text, digit), step);
  return (
    <div className="controlled-input">
      <ol className="controlled-input__loop" aria-label="The loop">
        {LOOP.map((name) => (
          <li key={name}>
            <Chip tone={name === stage.at ? (stage.rejected ? "danger" : "accent") : undefined}>
              {name === stage.at && <span className="visually-hidden">Now: </span>}
              {name === stage.at && stage.rejected && "✗ "}
              {name}
            </Chip>
          </li>
        ))}
        <li aria-hidden="true" className="controlled-input__back">
          ↺
        </li>
      </ol>
      <div className="controlled-input__grid">
        <Panel title="The page" className="controlled-input__page">
          <p className="controlled-input__note">
            {stage.state ? `Adding ${stage.state}` : "Type a title to begin."}
          </p>
          <p
            className={
              stage.pending ? "controlled-input__field is-pending" : "controlled-input__field"
            }
          >
            <span className="controlled-input__label">Title</span>
            <span className="controlled-input__box demo-mono">
              <span className="visually-hidden">The field shows: </span>
              {stage.field}
              <span className="controlled-input__caret" aria-hidden="true" />
            </span>
          </p>
          {stage.pending && (
            <p>
              <Chip tone="warning">event.target.value = &quot;{stage.field}&quot;</Chip>
            </p>
          )}
        </Panel>
        <Panel title="State in AddProductForm" sunken className="controlled-input__state">
          <p className="controlled-input__value">
            <span className="demo-mono">title</span>
            <Chip tone={stage.rejected ? "danger" : stage.fresh ? "accent" : undefined}>
              &quot;{stage.state}&quot;
            </Chip>
            {stage.rejected && <Chip tone="danger">✗ rejected</Chip>}
            {stage.fresh && <Chip tone="success">✓ stored</Chip>}
          </p>
        </Panel>
      </div>
      <CodeView lines={CODE} active={stage.active} marks={stage.marks} label="App.jsx" />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
