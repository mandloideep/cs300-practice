import { useState } from "react";
import { Caption, Chip, Choice, CodeView, ConsoleView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "promise-states";

export const defaults = { path: "/products?limit=8", outcome: "fulfill" };

const OUTCOMES = [
  { value: "fulfill", label: "The request succeeds" },
  { value: "reject", label: "The connection drops" },
];

function settings(props) {
  const path =
    typeof props?.path === "string" && /^\/[^\s"'`\\]{0,60}$/.test(props.path)
      ? props.path
      : defaults.path;
  const outcome = props?.outcome === "reject" ? "reject" : "fulfill";
  return { path, outcome };
}

function code(path) {
  return [
    `fetch(import.meta.env.API_BASE + ${JSON.stringify(path)})`,
    '  .then((response) => console.log("then:", response.status))',
    '  .catch((error) => console.log("catch:", error.message))',
    '  .finally(() => console.log("finally"));',
  ];
}

const HANDLERS = [
  { name: "then", line: 1 },
  { name: "catch", line: 2 },
  { name: "finally", line: 3 },
];

function stages(outcome) {
  const ok = outcome === "fulfill";
  const thenLog = "then: 200";
  const catchLog = "catch: Failed to fetch";
  return [
    {
      state: "pending",
      active: 0,
      handlers: [null, null, null],
      logs: [],
      caption:
        "fetch sends the request and returns a promise at once. The promise is pending: the answer is not here yet.",
    },
    {
      state: "pending",
      active: 1,
      handlers: ["waiting", "waiting", "waiting"],
      logs: [],
      caption:
        "then, catch, and finally each register a callback and return at once. Nothing runs yet: they all wait for the promise to settle.",
    },
    {
      state: ok ? "fulfilled" : "rejected",
      active: 0,
      handlers: ["waiting", "waiting", "waiting"],
      logs: [],
      caption: ok
        ? "The response arrives, so the promise is fulfilled with a Response object whose status is 200. A settled promise never changes again."
        : 'The connection drops, so the promise is rejected with a TypeError, "Failed to fetch" in Chrome. A settled promise never changes again.',
    },
    {
      state: ok ? "fulfilled" : "rejected",
      active: ok ? 1 : -1,
      handlers: [ok ? "ran" : "skipped", "waiting", "waiting"],
      logs: ok ? [thenLog] : [],
      fresh: ok ? 1 : 0,
      caption: ok
        ? 'The promise is fulfilled, so the then callback runs with the response and logs "then: 200".'
        : "then only handles a fulfilled promise, so its callback is skipped and the rejection passes down the chain.",
    },
    {
      state: ok ? "fulfilled" : "rejected",
      active: ok ? -1 : 2,
      handlers: [ok ? "ran" : "skipped", ok ? "skipped" : "ran", "waiting"],
      logs: ok ? [thenLog] : [catchLog],
      fresh: ok ? 0 : 1,
      caption: ok
        ? "Nothing was rejected, so the catch callback is skipped."
        : 'catch receives the error and logs "catch: Failed to fetch". The chain is handled, so no uncaught error reaches the console.',
    },
    {
      state: ok ? "fulfilled" : "rejected",
      active: 3,
      handlers: [ok ? "ran" : "skipped", ok ? "skipped" : "ran", "ran"],
      logs: ok ? [thenLog, "finally"] : [catchLog, "finally"],
      fresh: 1,
      caption:
        'finally runs whichever way the promise settled, with no value, and logs "finally". It is the place for cleanup such as enabling a button again.',
    },
    {
      state: ok ? "fulfilled" : "rejected",
      active: -1,
      handlers: [ok ? "ran" : "skipped", ok ? "skipped" : "ran", "ran"],
      logs: ok ? [thenLog, "finally"] : [catchLog, "finally"],
      fresh: 0,
      caption: ok
        ? "Fulfilled: then and finally ran, catch did not. Switch the outcome above to see the other path through the same chain."
        : "Rejected: catch and finally ran, then did not. Switch the outcome above to see the other path through the same chain.",
    },
  ];
}

export function stepCount() {
  return stages("fulfill").length;
}

const STATE_TONE = { pending: "accent", fulfilled: "success", rejected: "danger" };
const STATUS = {
  waiting: { tone: "muted", text: "waiting" },
  ran: { tone: "success", text: "✓ ran" },
  skipped: { tone: undefined, text: "skipped" },
};

export default function PromiseStates({ props, step }) {
  const setup = settings(props);
  const [outcome, setOutcome] = useState(setup.outcome);
  const stage = stageAt(stages(outcome), step);
  const lines = code(setup.path);

  return (
    <div className="promise-states">
      <Choice legend="Outcome" options={OUTCOMES} value={outcome} onChange={setOutcome} />
      <CodeView lines={lines} active={stage.active} label="The promise chain" />
      <div className="promise-states__grid">
        <Panel title="The promise from fetch">
          <ol className="promise-states__track" aria-label="Promise states">
            {["pending", "fulfilled", "rejected"].map((name) => (
              <li key={name}>
                <Chip tone={stage.state === name ? STATE_TONE[name] : "muted"}>
                  {stage.state === name && <span className="visually-hidden">Now: </span>}
                  {name}
                </Chip>
              </li>
            ))}
          </ol>
          <p className="promise-states__value">
            {stage.state === "pending"
              ? "No value yet."
              : stage.state === "fulfilled"
                ? "Value: a Response, status 200"
                : "Reason: TypeError: Failed to fetch"}
          </p>
        </Panel>
        <Panel title="Callbacks">
          <ul className="promise-states__handlers" aria-label="Callbacks">
            {HANDLERS.map((handler, index) => {
              const status = stage.handlers[index];
              const shown = status ? STATUS[status] : { tone: "muted", text: "not attached" };
              return (
                <li key={handler.name}>
                  <span className="demo-mono">{handler.name}</span>
                  <Chip tone={shown.tone}>{shown.text}</Chip>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
      <ConsoleView lines={stage.logs} fresh={stage.fresh ?? 0} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
