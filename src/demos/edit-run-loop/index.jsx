import { Caption, Chip, CodeView, ConsoleView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "edit-run-loop";

export const defaults = {};

const LOOP = ["Edit", "Run", "Result", "Console", "Checks"];

const FIRST = 'heading.textContent = "Hello, lab";';
const FIXED = 'heading.textContent = "Hello, lab!";';

const STAGES = [
  {
    at: "Edit",
    line: FIRST,
    ran: "Hello",
    checks: null,
    caption:
      "You type a change in the editor. Nothing else moves yet: the result still shows the last run, which said Hello.",
  },
  {
    at: "Run",
    line: FIRST,
    ran: null,
    checks: null,
    caption:
      "You press Run, or Ctrl+Enter. The lab compiles your files and loads the page fresh in the result pane.",
  },
  {
    at: "Result",
    line: FIRST,
    ran: "Hello, lab",
    checks: null,
    caption: "The result pane shows the page your code made, as a browser draws it.",
  },
  {
    at: "Console",
    line: FIRST,
    ran: "Hello, lab",
    checks: null,
    caption: "The console shows what the code logged, and any error with a link to its line.",
  },
  {
    at: "Checks",
    line: FIRST,
    ran: "Hello, lab",
    checks: [true, false],
    caption:
      "The checks test the result against the step. One fails, and its hint says what to look at.",
  },
  {
    at: "Edit",
    line: FIXED,
    ran: "Hello, lab",
    checks: [true, false],
    caption: "Back to the editor: the hint asked for an exclamation mark, so you add one.",
  },
  {
    at: "Checks",
    line: FIXED,
    ran: "Hello, lab!",
    checks: [true, true],
    caption:
      "Run again and every check passes. That loop, edit, run, look, check, is how every step works.",
  },
];

const CHECKS = [
  { title: "One message in the console", hint: null },
  { title: "The heading says Hello, lab!", hint: "End the heading with an exclamation mark." },
];

export function stepCount() {
  return STAGES.length;
}

export default function EditRunLoop({ step }) {
  const stage = stageAt(STAGES, step);
  const focus = (name) =>
    stage.at === name ? "edit-run-loop__pane is-focus" : "edit-run-loop__pane";
  const lines = [
    'const heading = document.querySelector("h1");',
    stage.line,
    'console.log("Updated the heading");',
  ];

  return (
    <div className="edit-run-loop">
      <ol className="edit-run-loop__loop" aria-label="The loop">
        {LOOP.map((name) => (
          <li key={name}>
            <Chip tone={stage.at === name ? "accent" : undefined}>
              {stage.at === name && <span className="visually-hidden">Now: </span>}
              {name}
            </Chip>
          </li>
        ))}
      </ol>
      <div className="edit-run-loop__panes">
        <Panel title="Editor" className={focus("Edit")}>
          <CodeView lines={lines} active={stage.at === "Edit" ? 1 : -1} label="main.js" />
        </Panel>
        <Panel title="Result" className={focus("Result")}>
          {stage.at === "Run" ? (
            <p className="demo-empty">Loading the page…</p>
          ) : stage.ran ? (
            <p className="edit-run-loop__heading">{stage.ran}</p>
          ) : (
            <p className="demo-empty">Not run yet.</p>
          )}
        </Panel>
        <div className={focus("Console")}>
          <ConsoleView lines={stage.ran && stage.at !== "Run" ? ["Updated the heading"] : []} />
        </div>
        <Panel title="Checks" className={focus("Checks")}>
          {stage.checks ? (
            <ul className="demo-list">
              {CHECKS.map((check, index) => (
                <li key={check.title}>
                  <Chip tone={stage.checks[index] ? "success" : "danger"}>
                    {stage.checks[index] ? "Pass" : "Fail"}
                  </Chip>{" "}
                  {check.title}
                  {!stage.checks[index] && check.hint && (
                    <span className="edit-run-loop__hint">{check.hint}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="demo-empty">The checks run after the page settles.</p>
          )}
        </Panel>
      </div>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
