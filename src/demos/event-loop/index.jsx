import { Box, Caption, Chip, CodeView, ConsoleView, Panel } from "../kit.jsx";
import "./styles.css";

export const id = "event-loop";

export const defaults = {
  script: [
    { log: "A" },
    { timeout: "B", delay: 0, then: "C" },
    { promise: "D" },
    { click: "E", at: 500 },
    { log: "F" },
  ],
};

function message(value) {
  return typeof value === "string" && value.trim() !== "" && value.length <= 24
    ? value.trim()
    : null;
}

function wholeNumber(value, fallback, min, max) {
  if (value === undefined) return fallback;
  return Number.isInteger(value) && value >= min && value <= max ? value : null;
}

function statement(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const then = raw.then === undefined ? null : message(raw.then);
  if (raw.then !== undefined && then === null) return null;
  if (raw.log !== undefined) {
    const text = message(raw.log);
    return text && { kind: "log", text };
  }
  if (raw.promise !== undefined) {
    const text = message(raw.promise);
    return text && { kind: "promise", text };
  }
  if (raw.timeout !== undefined) {
    const text = message(raw.timeout);
    const delay = wholeNumber(raw.delay, 0, 0, 10000);
    return text && delay !== null && { kind: "timeout", text, delay, then };
  }
  if (raw.click !== undefined) {
    const text = message(raw.click);
    const at = wholeNumber(raw.at, 500, 1, 10000);
    return text && at !== null && { kind: "click", text, at, then };
  }
  return null;
}

function callbackLines(head, tail, text, then) {
  if (!then) return [`${head}() => console.log(${JSON.stringify(text)})${tail}`];
  return [
    `${head}() => {`,
    `  console.log(${JSON.stringify(text)});`,
    `  Promise.resolve().then(() => console.log(${JSON.stringify(then)}));`,
    `}${tail}`,
  ];
}

function codeFor(item) {
  if (item.kind === "log") return [`console.log(${JSON.stringify(item.text)});`];
  if (item.kind === "promise") {
    return [`Promise.resolve().then(() => console.log(${JSON.stringify(item.text)}));`];
  }
  if (item.kind === "timeout") {
    return callbackLines("setTimeout(", `, ${item.delay});`, item.text, item.then);
  }
  return callbackLines('document.addEventListener("click", ', ");", item.text, item.then);
}

const CALLS = {
  log: (item) => `console.log(${JSON.stringify(item.text)})`,
  timeout: () => "setTimeout()",
  promise: () => "then()",
  click: () => "addEventListener()",
};

function simulate(script) {
  const lines = [];
  const placed = script.map((item) => {
    const code = codeFor(item);
    const start = lines.length;
    lines.push(...code);
    const inner = item.then ? start + 1 : start;
    return { ...item, start, end: lines.length - 1, inner, thenLine: item.then ? start + 2 : -1 };
  });

  const stages = [];
  const logs = [];
  let micro = [];
  let queue = [];
  let browser = [];
  let done = [];

  const snapshot = (fields) => {
    stages.push({
      logs: [...logs],
      micro: [...micro],
      queue: [...queue],
      browser: [...browser],
      done: [...done],
      ...fields,
    });
  };

  placed.forEach((item, index) => {
    let caption;
    const before = logs.length;
    if (item.kind === "log") {
      logs.push(item.text);
      caption = `Line ${item.start + 1} runs on the call stack and logs "${item.text}" at once.`;
    } else if (item.kind === "timeout") {
      browser.push({ key: `t${index}`, label: `timer ${item.delay} ms: "${item.text}"` });
      caption = `setTimeout hands the callback to the browser with a ${item.delay} ms timer and returns at once. Nothing is logged.`;
    } else if (item.kind === "promise") {
      micro.push({
        key: `p${index}`,
        label: `then: "${item.text}"`,
        text: item.text,
        line: item.start,
      });
      caption = `Promise.resolve() is already fulfilled, so then puts its callback straight into the microtask queue. It still waits for the stack to empty.`;
    } else {
      browser.push({ key: `c${index}`, label: `on click: "${item.text}"` });
      caption = `addEventListener registers the handler with the browser. It runs only when a click happens.`;
    }
    if (index === placed.length - 1) {
      caption += " That was the last line: the script is done and the call stack is empty.";
    }
    snapshot({
      stack: ["script", CALLS[item.kind](item)],
      active: item.start,
      fresh: logs.length - before,
      caption,
      time: null,
    });
    done = [
      ...done,
      ...Array.from({ length: item.end - item.start + 1 }, (_, i) => item.start + i),
    ];
  });

  const tasks = placed
    .map((item, order) => ({ item, order }))
    .filter(({ item }) => item.kind === "timeout" || item.kind === "click")
    .map(({ item, order }) => ({
      item,
      order,
      time: item.kind === "timeout" ? item.delay : item.at,
      key: item.kind === "timeout" ? `t${order}` : `c${order}`,
    }))
    .sort((a, b) => a.time - b.time || a.order - b.order);

  let now = 0;
  const expire = () => {
    for (const task of tasks) {
      if (task.item.kind !== "timeout" || task.time > now) continue;
      const waiting = browser.find((entry) => entry.key === task.key);
      if (!waiting) continue;
      browser = browser.filter((entry) => entry.key !== task.key);
      queue.push({ key: task.key, label: `timer: "${task.item.text}"` });
    }
  };

  const drain = (caption, line) => {
    const before = logs.length;
    const ran = micro.map((entry) => entry.text);
    for (const text of ran) logs.push(text);
    micro = [];
    snapshot({
      stack: ["then callback"],
      active: line,
      fresh: logs.length - before,
      caption: caption(ran),
      time: now,
    });
  };

  const list = (texts) => texts.map((text) => `"${text}"`).join(", ");
  if (micro.length > 0) {
    expire();
    const line = micro[micro.length - 1].line;
    const waiting = queue.length;
    drain(
      (ran) =>
        `The stack is empty, so every microtask runs now, before any task, and logs ${list(ran)}.` +
        (waiting === 1
          ? " The 0 ms timer has already run out, but its callback waits in the task queue."
          : waiting > 1
            ? " The 0 ms timers have already run out, but their callbacks wait in the task queue."
            : ""),
      line,
    );
  }

  for (const task of tasks) {
    now = Math.max(now, task.time);
    expire();
    const before = logs.length;
    const { item } = task;
    let caption;
    if (item.kind === "timeout") {
      queue = queue.filter((entry) => entry.key !== task.key);
      caption = `At ${now} ms the event loop takes one task, the oldest: the timer callback. It logs "${item.text}".`;
    } else {
      caption = `At ${now} ms you click the page. The browser queues the click handler as a task, and with the stack empty it runs and logs "${item.text}".`;
    }
    logs.push(item.text);
    if (item.then) {
      micro.push({ key: `m${task.key}`, label: `then: "${item.then}"`, text: item.then });
      caption += ` Its then callback goes into the microtask queue.`;
    }
    snapshot({
      stack: [item.kind === "timeout" ? "timer callback" : "click handler"],
      active: item.inner,
      fresh: logs.length - before,
      caption,
      time: now,
    });
    if (item.then) {
      drain(
        (ran) =>
          `Before the next task, the event loop runs every microtask, so ${list(ran)} is logged now.` +
          (queue.length > 0 ? " Only then does the next task get its turn." : ""),
        item.thenLine,
      );
    }
  }

  const last = stages[stages.length - 1];
  last.caption += ` The console order is ${list(logs)}.`;
  return { lines, stages };
}

function settings(props) {
  const raw = Array.isArray(props?.script) ? props.script : null;
  if (raw && raw.length >= 1 && raw.length <= 8) {
    const script = raw.map(statement);
    const clicks = script.filter((item) => item && item.kind === "click");
    const delays = script.filter((item) => item && item.kind === "timeout").map((t) => t.delay);
    const valid =
      script.every(Boolean) &&
      clicks.length <= 1 &&
      clicks.every((click) => !delays.includes(click.at));
    if (valid) {
      const result = simulate(script);
      if (result.stages.length >= 3 && result.stages.length <= 10) return result;
    }
  }
  return simulate(defaults.script.map(statement));
}

export function stepCount(props) {
  return settings(props).stages.length;
}

function Queue({ title, items, empty, tone }) {
  return (
    <Panel title={title} className="event-loop__panel">
      {items.length === 0 ? (
        <p className="demo-empty">{empty}</p>
      ) : (
        <ol className="event-loop__items" aria-label={title}>
          {items.map((entry) => (
            <li key={entry.key}>
              <Chip tone={tone}>{entry.label}</Chip>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

export default function EventLoop({ props, step }) {
  const { lines, stages } = settings(props);
  const stage = stages[Math.max(0, Math.min(stages.length - 1, step))];
  const marks = Object.fromEntries(stage.done.map((line) => [line, "done"]));
  const frames = [...stage.stack].reverse();

  return (
    <div className="event-loop">
      <CodeView lines={lines} active={stage.active} marks={marks} label="app.js" />
      <div className="event-loop__grid">
        <Panel title="Call stack" className="event-loop__panel">
          <ol className="event-loop__stack" aria-label="Call stack, top first">
            {frames.map((frame, index) => (
              <li key={`${frame}-${index}`}>
                <Box tone={index === 0 ? "accent" : undefined} className="event-loop__frame">
                  <span className="demo-mono">{frame}</span>
                </Box>
              </li>
            ))}
          </ol>
        </Panel>
        <div className="event-loop__queues">
          <Queue title="Microtasks" items={stage.micro} empty="Empty." tone="accent" />
          <Queue title="Tasks" items={stage.queue} empty="Empty." />
          <Queue title="Browser" items={stage.browser} empty="Nothing waiting." tone="muted" />
        </div>
      </div>
      {stage.time !== null && <p className="event-loop__time meta">Time: {stage.time} ms</p>}
      <ConsoleView lines={stage.logs} fresh={stage.fresh} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
