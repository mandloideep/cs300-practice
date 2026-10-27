import { Caption, Chip, CodeView, ConsoleView, Panel, Row, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "callback";

export const defaults = { style: "dom", name: "handleClick", log: "Clicked" };

function settings(props) {
  const style = props.style === "react" ? "react" : "dom";
  const fallbackName = style === "react" ? "handleAdd" : defaults.name;
  const name =
    typeof props.name === "string" && /^[A-Za-z_$][\w$]*$/.test(props.name)
      ? props.name
      : fallbackName;
  const log =
    typeof props.log === "string" && props.log.trim() !== ""
      ? props.log
      : style === "react"
        ? "Added to the cart: Essence Mascara"
        : defaults.log;
  return { style, name, log };
}

function code({ style, name, log }, call) {
  const handler = call ? `${name}()` : name;
  const body = [`function ${name}() {`, `  console.log(${JSON.stringify(log)});`, "}"];
  return style === "react"
    ? [...body, `return <button onClick={${handler}}>Add</button>;`]
    : [...body, `button.addEventListener("click", ${handler});`];
}

function stages({ style, name, log }) {
  const who = style === "react" ? "React" : "The browser";
  const attach = style === "react" ? "React renders the button" : "Line 4 runs";
  return [
    {
      left: { active: -1, holds: null, logs: 0 },
      right: { active: -1, holds: null, logs: 0 },
      caption: `Two versions that differ by two characters: the right one has parentheses after ${name}.`,
    },
    {
      left: { active: 3, holds: "function", logs: 0 },
      right: { active: -1, holds: null, logs: 0 },
      caption: `${attach}. Without parentheses, ${name} is a value: the function itself is handed over, and nothing runs yet.`,
    },
    {
      left: { active: -1, holds: "function", logs: 0 },
      right: { active: 1, holds: "undefined", logs: 1 },
      caption: `${attach} on the right too, but ${name}() calls the function now. It logs "${log}" before any click and returns undefined, so undefined is what gets attached.`,
    },
    {
      left: { active: 1, holds: "function", logs: 1, clicks: 1 },
      right: { active: -1, holds: "undefined", logs: 1, clicks: 1 },
      caption: `First click. ${who} calls ${name} on the left, which logs. On the right there is no function to call, so nothing happens.`,
    },
    {
      left: { active: 1, holds: "function", logs: 2, clicks: 2 },
      right: { active: -1, holds: "undefined", logs: 1, clicks: 2 },
      caption: `Second click: the left logs again, once per click. The right still shows only the message from before any click.`,
    },
    {
      left: { active: -1, holds: "function", logs: 2, clicks: 2 },
      right: { active: -1, holds: "undefined", logs: 1, clicks: 2 },
      caption: `Pass the function, do not call it: ${who.toLowerCase()} calls it later, once for each click. That function is a callback.`,
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

function Side({ title, lines, state, setup }) {
  return (
    <Panel title={title} className="callback__side">
      <CodeView lines={lines} active={state.active} label={title} />
      <p className="callback__holds">
        <span>Attached: </span>
        {state.holds === null ? (
          <Chip tone="muted">not yet</Chip>
        ) : (
          <Chip tone={state.holds === "function" ? "success" : "danger"}>
            {state.holds === "function" ? `the function ${setup.name}` : "undefined"}
          </Chip>
        )}
      </p>
      <p className="callback__clicks meta">Clicks: {state.clicks ?? 0}</p>
      <ConsoleView lines={Array.from({ length: state.logs }, () => setup.log)} />
    </Panel>
  );
}

export default function Callback({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(stages(setup), step);
  return (
    <div className="callback">
      <Row>
        <Side
          title="Pass the function"
          lines={code(setup, false)}
          state={stage.left}
          setup={setup}
        />
        <Side title="Call it at once" lines={code(setup, true)} state={stage.right} setup={setup} />
      </Row>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
