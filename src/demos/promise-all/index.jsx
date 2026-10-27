import { useState } from "react";
import { Caption, Chip, Choice, CodeView, ConsoleView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "promise-all";

export const defaults = {
  requests: [
    { name: "beauty", ms: 1500 },
    { name: "groceries", ms: 300 },
    { name: "furniture", ms: 800 },
  ],
  fails: "furniture",
  outcome: "fulfill",
};

const FAILURE = "The server answered with status 500.";

function settings(props) {
  const raw = Array.isArray(props?.requests) ? props.requests : null;
  let requests = defaults.requests;
  if (raw && raw.length >= 2 && raw.length <= 4) {
    const parsed = raw.map((item) =>
      item &&
      typeof item.name === "string" &&
      /^[a-z][a-z0-9]{0,15}$/.test(item.name) &&
      Number.isInteger(item.ms) &&
      item.ms >= 10 &&
      item.ms <= 10000
        ? { name: item.name, ms: item.ms }
        : null,
    );
    const names = new Set(parsed.map((item) => item?.name));
    if (parsed.every(Boolean) && names.size === parsed.length) requests = parsed;
  }
  const fails = requests.some((item) => item.name === props?.fails)
    ? props.fails
    : requests.some((item) => item.name === defaults.fails)
      ? defaults.fails
      : requests[requests.length - 1].name;
  const outcome = props?.outcome === "reject" ? "reject" : "fulfill";
  return { requests, fails, outcome };
}

function code(requests) {
  const names = requests.map((item) => item.name);
  return [
    "try {",
    `  const [${names.join(", ")}] = await Promise.all([`,
    ...names.map((name) => `    loadProducts(${JSON.stringify(name)}),`),
    "  ]);",
    `  console.log(${names.map((name) => `${name}.length`).join(", ")});`,
    "} catch (error) {",
    '  console.log("Failed:", error.message);',
    "}",
  ];
}

function stages({ requests, fails }, failing) {
  const n = requests.length;
  const order = requests
    .map((item, index) => ({ ...item, index }))
    .sort((a, b) => a.ms - b.ms || a.index - b.index);
  const slowest = order[n - 1];
  const logLine = n + 3;
  const catchLine = n + 5;
  const result = [];
  const settled = {};
  let all = { state: "pending", at: null };
  let logs = [];

  result.push({
    now: 0,
    settled: { ...settled },
    all: { ...all },
    logs: [],
    fresh: 0,
    active: 1,
    caption: `All ${n} requests start at once, and Promise.all returns one pending promise. await pauses until that one promise settles.`,
  });

  for (const item of order) {
    const rejects = failing && item.name === fails && all.state === "pending";
    const fresh = [];
    let caption;
    if (all.state === "rejected") {
      settled[item.name] = "late";
      caption = `At ${item.ms} ms ${item.name} fulfills too, but Promise.all already rejected. Its products are thrown away.`;
    } else if (rejects) {
      settled[item.name] = "rejected";
      all = { state: "rejected", at: item.ms };
      fresh.push(`Failed: ${FAILURE}`);
      caption = `At ${item.ms} ms ${item.name} rejects. Promise.all rejects at once with the same error, without waiting for the rest, and catch runs.`;
    } else {
      settled[item.name] = "fulfilled";
      const left = order.filter((other) => !settled[other.name]).length;
      if (left === 0) {
        all = { state: "fulfilled", at: item.ms };
        const lengths = requests.map(() => 4).join(" ");
        fresh.push(lengths);
        caption = `At ${item.ms} ms ${item.name}, the slowest, fulfills. Now every promise has a value, so Promise.all fulfills with an array in the order you listed them, not the order they finished.`;
      } else {
        caption = `At ${item.ms} ms ${item.name} fulfills. Promise.all keeps its value and keeps waiting: ${left} still pending.`;
      }
    }
    logs = [...logs, ...fresh];
    result.push({
      now: item.ms,
      settled: { ...settled },
      all: { ...all },
      logs,
      fresh: fresh.length,
      active: all.state === "pending" ? 1 : fresh.length === 0 ? -1 : rejects ? catchLine : logLine,
      caption,
    });
  }

  const sum = requests.reduce((total, item) => total + item.ms, 0);
  result.push({
    now: order[n - 1].ms,
    settled: { ...settled },
    all: { ...all },
    logs,
    fresh: 0,
    active: -1,
    caption:
      all.state === "fulfilled"
        ? `The wait was ${slowest.ms} ms, the slowest request, instead of ${sum} ms one after another.`
        : `One rejection rejects the whole: the other requests still finished, but their values never reached your code.`,
  });
  return result;
}

export function stepCount(props) {
  return settings(props).requests.length + 2;
}

const TONES = {
  pending: { tone: "accent", text: "pending" },
  fulfilled: { tone: "success", text: "✓ fulfilled" },
  rejected: { tone: "danger", text: "✗ rejected" },
  late: { tone: "muted", text: "fulfilled, ignored" },
};

function Lane({ label, ms, state, now, total, mono = true }) {
  const shown = TONES[state];
  const until = state === "pending" ? now : ms;
  return (
    <li>
      <p className="promise-all__label">
        <span className={mono ? "demo-mono" : undefined}>{label}</span>
        <Chip tone={shown.tone}>{shown.text}</Chip>
      </p>
      <div className="promise-all__track" aria-hidden="true">
        <span
          className={`promise-all__bar promise-all__bar--${state}`}
          style={{ width: `${(Math.min(until, total) / total) * 100}%` }}
        />
      </div>
    </li>
  );
}

export default function PromiseAll({ props, step }) {
  const setup = settings(props);
  const [outcome, setOutcome] = useState(setup.outcome);
  const failing = outcome === "reject";
  const stage = stageAt(stages(setup, failing), step);
  const total = Math.max(...setup.requests.map((item) => item.ms));
  const options = [
    { value: "fulfill", label: "All succeed" },
    { value: "reject", label: `${setup.fails} fails` },
  ];

  return (
    <div className="promise-all">
      <Choice legend="Outcome" options={options} value={outcome} onChange={setOutcome} />
      <CodeView lines={code(setup.requests)} active={stage.active} label="app.js" />
      <Panel title={`Promises, at ${stage.now} ms`}>
        <ol className="promise-all__lanes" aria-label="Promises">
          {setup.requests.map((item) => (
            <Lane
              key={item.name}
              label={`loadProducts("${item.name}"), ${item.ms} ms`}
              ms={item.ms}
              state={stage.settled[item.name] ?? "pending"}
              now={stage.now}
              total={total}
            />
          ))}
          <Lane
            label="Promise.all"
            ms={stage.all.at ?? total}
            state={stage.all.state}
            now={stage.now}
            total={total}
          />
        </ol>
      </Panel>
      <ConsoleView lines={stage.logs} fresh={stage.fresh} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
