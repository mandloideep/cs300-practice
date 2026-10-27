import { useState } from "react";
import { Caption, Chip, Choice, CodeView, Panel, Row, Stack } from "../kit.jsx";
import "./styles.css";

export const id = "setter-batching";

export const defaults = { calls: 3, form: "value" };

const FORMS = [
  { value: "value", label: "setCount(count + 1)" },
  { value: "updater", label: "setCount((c) => c + 1)" },
];

const WORDS = ["zero", "one", "two", "three", "four", "five"];

function settings(props) {
  const calls =
    Number.isInteger(props.calls) && props.calls >= 2 && props.calls <= 5
      ? props.calls
      : defaults.calls;
  const form = props.form === "updater" ? "updater" : defaults.form;
  return { calls, form };
}

export function stepCount(props) {
  return settings(props).calls + 3;
}

function code(calls, form) {
  const call = form === "updater" ? "    setCount((c) => c + 1);" : "    setCount(count + 1);";
  return [
    "function Counter() {",
    "  const [count, setCount] = useState(0);",
    "",
    "  function handleClick() {",
    ...Array.from({ length: calls }, () => call),
    "  }",
    "",
    "  return (",
    "    <button onClick={handleClick}>",
    "      Count is {count}",
    "    </button>",
    "  );",
    "}",
  ];
}

function caption(calls, form, step) {
  const updater = form === "updater";
  const many = WORDS[calls][0].toUpperCase() + WORDS[calls].slice(1);
  if (step === 0) {
    return "Counter has rendered with count 0. In this render, count is 0, and it stays 0 until the next render. You click the button.";
  }
  if (step <= calls) {
    if (updater) {
      return step === 1
        ? "Call 1: setCount((c) => c + 1) queues the function itself, not a number. React will call it later with the latest value. Nothing renders yet."
        : `Call ${step}: another function joins the queue. React still has not rendered; it waits for the handler to finish.`;
    }
    return step === 1
      ? "Call 1: setCount(count + 1). count is 0 in this render, so this asks React to set the state to 1. Nothing renders yet: React queues the update."
      : `Call ${step}: count is still 0, because this is still the same render, so this call also asks for 1.`;
  }
  if (step === calls + 1) {
    return updater
      ? "The handler is done, so React works through the queue, passing each function the result of the one before it: 0 + 1, then 1 + 1, and so on."
      : `The handler is done, so React works through the queue: set to 1, then set to 1 again, ${calls} times in all. The result is 1.`;
  }
  return updater
    ? `React renders once, with count ${calls}. React 19 batches every update from one event into a single render, and the updater form lets each update build on the one before.`
    : `React renders once, with count 1. ${many} calls, one render, and the count went up by one, because every call read the same snapshot, 0.`;
}

export default function SetterBatching({ props, step }) {
  const setup = settings(props);
  const [form, setForm] = useState(setup.form);
  const { calls } = setup;
  const last = calls + 2;
  const current = Math.max(0, Math.min(last, step));
  const updater = form === "updater";
  const queued = Math.min(current, calls);
  const processing = current >= calls + 1;
  const rendered = current === last;
  const lines = code(calls, form);
  const results = Array.from({ length: calls }, (_, index) => (updater ? index + 1 : 1));
  const total = results[results.length - 1];

  return (
    <div className="setter-batching">
      <Choice legend="Each call in the handler" options={FORMS} value={form} onChange={setForm} />
      <Row>
        <Panel title="Counter" className="setter-batching__code">
          <CodeView
            lines={lines}
            active={current >= 1 && current <= calls ? 3 + current : -1}
            label="Counter"
          />
        </Panel>
        <Stack>
          <Panel title="Update queue">
            {queued === 0 ? (
              <p className="demo-empty">Empty.</p>
            ) : (
              <ol className="setter-batching__queue" aria-label="Queued updates">
                {Array.from({ length: queued }, (_, index) => {
                  const before = updater ? index : index === 0 ? 0 : 1;
                  return (
                    <li key={index} className={index === current - 1 ? "is-new" : undefined}>
                      <span className="setter-batching__number">{index + 1}</span>
                      <span className="demo-mono">{updater ? "(c) => c + 1" : "set to 1"}</span>
                      {processing && (
                        <Chip tone="success">
                          {updater ? `${before} + 1 = ${results[index]}` : `${before} → 1`}
                        </Chip>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>
          <Panel title="The page">
            <p className="setter-batching__page">
              <span className="setter-batching__button">Count is {rendered ? total : 0}</span>
              <span className="meta">
                Renders after the click: <strong>{rendered ? 1 : 0}</strong>
              </span>
            </p>
          </Panel>
        </Stack>
      </Row>
      <Caption>{caption(calls, form, current)}</Caption>
    </div>
  );
}
