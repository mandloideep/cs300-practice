import { Caption, Chip, CodeView, ConsoleView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "call-stack";

export const defaults = {};

const CODE = [
  "function getGrade(score) {",
  '  if (score < 0) throw new Error("Score cannot be negative");',
  '  return score >= 90 ? "A" : "B";',
  "}",
  "function describe(student) {",
  "  return `${student.name}: ${getGrade(student.score)}`;",
  "}",
  "function report(students) {",
  "  for (const student of students) {",
  "    console.log(describe(student));",
  "  }",
  "}",
  "report([",
  '  { name: "Alice", score: 95 },',
  '  { name: "Bob", score: -5 },',
  "]);",
];

const TRACE = [
  "Uncaught Error: Score cannot be negative",
  "    at getGrade (main.js:2:24)",
  "    at describe (main.js:6:30)",
  "    at report (main.js:10:17)",
  "    at main.js:13:1",
];

const TOP = { name: "top level of main.js", at: "line 13" };
const REPORT = { name: "report(students)", at: "line 10" };

const STAGES = [
  {
    line: 12,
    stack: [TOP],
    logs: [],
    caption:
      "The stack starts with the module's top-level code. It reaches line 13 and calls report, so its frame waits there.",
  },
  {
    line: 9,
    stack: [TOP, REPORT],
    pushed: true,
    logs: [],
    caption:
      "report's frame is pushed on top. Its loop takes Alice and calls describe on line 10, so report waits there.",
  },
  {
    line: 5,
    stack: [TOP, REPORT, { name: "describe(Alice)", at: "line 6" }],
    pushed: true,
    logs: [],
    caption:
      "describe's frame goes on top. It needs a grade, so it calls getGrade on line 6 and waits.",
  },
  {
    line: 2,
    stack: [
      TOP,
      REPORT,
      { name: "describe(Alice)", at: "line 6" },
      { name: "getGrade(95)", at: "line 3" },
    ],
    pushed: true,
    logs: [],
    caption:
      "getGrade is on top now, four frames deep. Only the top frame runs; every frame below it waits for the one above.",
  },
  {
    line: 9,
    stack: [TOP, REPORT],
    popped: ["getGrade(95)", "describe(Alice)"],
    logs: ["Alice: A"],
    caption:
      'getGrade returns "A" and its frame is popped; describe returns "Alice: A" and is popped too. Back in report, the log prints Alice: A.',
  },
  {
    line: 1,
    stack: [
      TOP,
      REPORT,
      { name: "describe(Bob)", at: "line 6" },
      { name: "getGrade(-5)", at: "line 2", error: true },
    ],
    pushed: true,
    logs: ["Alice: A"],
    caption:
      "The loop takes Bob, and the same two frames are pushed again. This time score is -5, so line 2 throws an Error.",
  },
  {
    line: 1,
    stack: [],
    logs: ["Alice: A", { text: "Error: Score cannot be negative", error: true }],
    trace: true,
    caption:
      "Nothing catches the error, so every frame is thrown away, top to bottom, and the program stops. The browser's DevTools console prints the stack as it was at the throw: a stack trace.",
  },
  {
    line: 1,
    stack: [],
    logs: ["Alice: A", { text: "Error: Score cannot be negative", error: true }],
    trace: true,
    read: true,
    caption:
      "Read a trace top down. The first at line is where the error was thrown, getGrade on line 2; each line below is the caller that was waiting. Start at the first line that is your code.",
  },
];

export function stepCount() {
  return STAGES.length;
}

export default function CallStack({ step }) {
  const stage = stageAt(STAGES, step);
  const frames = [...stage.stack].reverse();
  const marks = stage.trace ? { [stage.line]: "error" } : {};
  const traceMarks = stage.read ? { 0: "error" } : {};
  return (
    <div className="call-stack">
      <div className="call-stack__layout">
        <CodeView
          lines={CODE}
          active={stage.trace ? -1 : stage.line}
          marks={marks}
          label="main.js"
        />
        <div className="call-stack__side">
          <Panel title="Call stack, top first">
            {frames.length === 0 ? (
              <p className="demo-empty">Empty: every frame was thrown away.</p>
            ) : (
              <ol className="call-stack__frames" aria-label="Call stack, top first">
                {frames.map((frame, index) => {
                  const top = index === 0;
                  const classes = ["call-stack__frame"];
                  if (top) classes.push("is-top");
                  if (frame.error) classes.push("is-error");
                  return (
                    <li key={frame.name} className={classes.join(" ")}>
                      <span className="demo-mono call-stack__name">{frame.name}</span>
                      <span className="call-stack__at">
                        {top ? `running ${frame.at}` : `waiting at ${frame.at}`}
                      </span>
                      {top && stage.pushed && !frame.error && <Chip tone="accent">pushed</Chip>}
                      {frame.error && <Chip tone="danger">throws</Chip>}
                    </li>
                  );
                })}
              </ol>
            )}
            {stage.popped && (
              <p className="call-stack__popped">
                Popped:{" "}
                {stage.popped.map((name) => (
                  <Chip key={name} tone="muted">
                    <span className="demo-mono">{name}</span>
                  </Chip>
                ))}
              </p>
            )}
          </Panel>
          {stage.trace && (
            <Panel title="Stack trace in DevTools">
              <CodeView
                lines={TRACE}
                active={stage.read ? 1 : -1}
                marks={traceMarks}
                label="Stack trace"
              />
            </Panel>
          )}
        </div>
      </div>
      <ConsoleView lines={stage.logs} fresh={step === 4 || step === 6 ? 1 : 0} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
