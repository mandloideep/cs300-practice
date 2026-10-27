import { Box, Caption, Chip, CodeView, ConsoleView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "closure";

export const defaults = {};

const FACTORY = [
  "function makeCounter() {",
  "  let count = 0;",
  "  return () => {",
  "    count = count + 1;",
  "    return count;",
  "  };",
  "}",
  "const a = makeCounter();",
  "const b = makeCounter();",
  "const c = makeCounter();",
  "console.log(a(), a(), b(), c());",
];

function loop(keyword) {
  return [`for (${keyword} i = 0; i < 3; i++) {`, "  setTimeout(() => console.log(i), 0);", "}"];
}

const STAGES = [
  {
    part: "factory",
    line: 0,
    counters: [],
    logs: [],
    caption:
      "makeCounter is a factory. Each call makes a variable count and returns an arrow function that uses it.",
  },
  {
    part: "factory",
    line: 7,
    counters: [{ name: "a", count: 0, fresh: true }],
    logs: [],
    caption:
      "makeCounter() runs, makes count = 0, and returns the arrow. The call is over, yet the arrow keeps its count alive. A function that keeps the variables around it like this is a closure.",
  },
  {
    part: "factory",
    line: 9,
    counters: [
      { name: "a", count: 0 },
      { name: "b", count: 0, fresh: true },
      { name: "c", count: 0, fresh: true },
    ],
    logs: [],
    caption:
      "Two more calls make two more counts. Three counters from one factory, and each keeps a count of its own.",
  },
  {
    part: "factory",
    line: 10,
    counters: [
      { name: "a", count: 2, fresh: true },
      { name: "b", count: 0 },
      { name: "c", count: 0 },
    ],
    logs: [],
    caption:
      "a() runs twice and adds one to the count that a keeps each time: 1, then 2. The counts of b and c do not move.",
  },
  {
    part: "factory",
    line: 10,
    counters: [
      { name: "a", count: 2 },
      { name: "b", count: 1, fresh: true },
      { name: "c", count: 1, fresh: true },
    ],
    logs: ["1 2 1 1"],
    caption: "b() and c() each start from their own 0 and return 1. The log prints 1 2 1 1.",
  },
  {
    part: "var",
    line: 1,
    boxes: [{ label: "i", value: 3, note: "one i, shared by all three callbacks" }],
    callbacks: ["the shared i", "the shared i", "the shared i"],
    logs: [],
    caption:
      "The loop-variable classic. With var there is one i for the whole loop. Each pass schedules a callback that uses i, and the loop ends with i at 3.",
  },
  {
    part: "var",
    line: -1,
    boxes: [{ label: "i", value: 3, note: "one i, shared by all three callbacks" }],
    callbacks: ["the shared i", "the shared i", "the shared i"],
    logs: ["3", "3", "3"],
    ran: true,
    caption:
      "The timers run only after the loop has finished. All three callbacks read the same i, which is 3 by then, so the log prints 3, 3, 3.",
  },
  {
    part: "let",
    line: 1,
    boxes: [
      { label: "i, pass 1", value: 0 },
      { label: "i, pass 2", value: 1 },
      { label: "i, pass 3", value: 2 },
    ],
    callbacks: ["i from pass 1", "i from pass 2", "i from pass 3"],
    logs: [],
    caption:
      "Change var to let. Now each pass of the loop gets a new i of its own, and each callback closes over the i of its pass.",
  },
  {
    part: "let",
    line: -1,
    boxes: [
      { label: "i, pass 1", value: 0 },
      { label: "i, pass 2", value: 1 },
      { label: "i, pass 3", value: 2 },
    ],
    callbacks: ["i from pass 1", "i from pass 2", "i from pass 3"],
    logs: ["0", "1", "2"],
    ran: true,
    caption:
      "When the timers run, each callback reads its own i, so the log prints 0, 1, 2. Use let in loops and this surprise never happens.",
  },
];

export function stepCount() {
  return STAGES.length;
}

export default function Closure({ step }) {
  const stage = stageAt(STAGES, step);
  const index = Math.max(0, Math.min(STAGES.length - 1, step));
  const factory = stage.part === "factory";
  const lines = factory ? FACTORY : loop(stage.part);
  const marks = factory
    ? Object.fromEntries(
        lines.map((_, at) => [at, "done"]).filter(([at]) => at > 6 && at < stage.line),
      )
    : {};
  const fresh = index === 4 || stage.ran ? stage.logs.length : 0;

  return (
    <div className="closure">
      <div className="closure__layout">
        <CodeView
          lines={lines}
          active={stage.line}
          marks={marks}
          label={factory ? "Three counters" : `The loop with ${stage.part}`}
        />
        {factory ? (
          <Panel title="Counters">
            {stage.counters.length === 0 ? (
              <p className="demo-empty">No counters yet. Declaring the factory runs nothing.</p>
            ) : (
              <ul className="closure__grid" aria-label="Counters">
                {stage.counters.map((counter) => (
                  <li key={counter.name}>
                    <Box label={counter.name} tone={counter.fresh ? "accent" : undefined}>
                      <span className="closure__kind">arrow function, keeps</span>
                      <span className="demo-mono closure__value">count = {counter.count}</span>
                    </Box>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        ) : (
          <Panel title={`Callbacks with ${stage.part}`}>
            <ul className="closure__grid" aria-label="Variables the callbacks use">
              {stage.boxes.map((box) => (
                <li key={box.label}>
                  <Box label={box.label} tone={stage.ran ? "success" : undefined}>
                    <span className="demo-mono closure__value">{box.value}</span>
                    {box.note && <span className="closure__kind">{box.note}</span>}
                  </Box>
                </li>
              ))}
            </ul>
            <ol className="closure__callbacks" aria-label="Scheduled callbacks">
              {stage.callbacks.map((target, at) => (
                <li key={at}>
                  <Chip tone={stage.ran ? "success" : undefined}>
                    callback {at + 1} <span aria-hidden="true">→</span> {target}
                  </Chip>
                </li>
              ))}
            </ol>
          </Panel>
        )}
      </div>
      <ConsoleView lines={stage.logs} fresh={fresh} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
