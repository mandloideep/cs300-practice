import { Caption, Chip, CodeView, ConsoleView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "scope-chain";

export const defaults = {};

const CODE = [
  'const course = "CS300";',
  "function showGrade(score) {",
  '  const label = "Score";',
  "  if (score >= 90) {",
  '    const grade = "A";',
  "    console.log(course, label, score, grade);",
  "  }",
  "}",
  "showGrade(95);",
  "console.log(grade);",
];

const SCOPES = [
  { key: "global", name: "Global scope", vars: ['course = "CS300"', "showGrade = function"] },
  { key: "function", name: "showGrade scope", vars: ["score = 95", 'label = "Score"'] },
  { key: "block", name: "if block scope", vars: ['grade = "A"'] },
];

const SHORT = { global: "global", function: "showGrade", block: "if block" };

const STAGES = [
  {
    line: 5,
    open: 3,
    lookup: null,
    logs: [],
    caption:
      "showGrade(95) is running, paused at the log inside the if block. Three scopes are open, nested like boxes: the block inside showGrade inside the global scope.",
  },
  {
    line: 5,
    open: 3,
    lookup: { name: "grade", path: ["block"], found: "block" },
    logs: [],
    caption:
      "To read grade, JavaScript starts in the innermost scope, the if block. grade is declared right there, so the lookup stops at once.",
  },
  {
    line: 5,
    open: 3,
    lookup: { name: "label", path: ["block", "function"], found: "function" },
    logs: [],
    caption:
      "label is not in the block, so the lookup moves out one box to showGrade, and finds it there. score, a parameter, is found the same way.",
  },
  {
    line: 5,
    open: 3,
    lookup: { name: "course", path: ["block", "function", "global"], found: "global" },
    logs: [],
    caption:
      "course is in neither the block nor showGrade, so the lookup walks out two boxes to the global scope and finds it there.",
  },
  {
    line: 5,
    open: 3,
    lookup: null,
    logs: ["CS300 Score 95 A"],
    caption: "Every name was found on the way out, so the log prints CS300 Score 95 A.",
  },
  {
    line: 9,
    open: 1,
    lookup: { name: "grade", path: ["global"], found: null },
    logs: ["CS300 Score 95 A", { text: "ReferenceError: grade is not defined", error: true }],
    caption:
      "The call is over, and its scopes are closed. Global code looks for grade, does not find it, and has no outer scope left, so it throws ReferenceError: grade is not defined.",
  },
  {
    line: -1,
    open: 3,
    lookup: null,
    logs: ["CS300 Score 95 A", { text: "ReferenceError: grade is not defined", error: true }],
    caption:
      "A lookup only walks outward. Code in an inner scope can read every name around it; code outside never sees the names declared inside.",
  },
];

export function stepCount() {
  return STAGES.length;
}

function status(stage, key) {
  const { lookup } = stage;
  if (!lookup || !lookup.path.includes(key)) return null;
  if (lookup.found === key) return "found";
  return "missed";
}

function Scope({ stage, depth }) {
  const scope = SCOPES[depth];
  const state = status(stage, scope.key);
  const name = stage.lookup?.name;
  const classes = ["scope-chain__scope", `scope-chain__scope--${scope.key}`];
  if (state) classes.push(`is-${state}`);
  return (
    <div className={classes.join(" ")}>
      <p className="scope-chain__head">
        <span className="scope-chain__name">{scope.name}</span>
        {state === "found" && <Chip tone="success">✓ {name} found here</Chip>}
        {state === "missed" && <Chip tone="muted">✗ no {name} here</Chip>}
      </p>
      <ul className="scope-chain__vars" aria-label={`${scope.name} variables`}>
        {scope.vars.map((entry) => {
          const hit = state === "found" && entry.startsWith(`${name} `);
          return (
            <li key={entry}>
              <Chip tone={hit ? "success" : undefined}>
                <span className="demo-mono">{entry}</span>
              </Chip>
            </li>
          );
        })}
      </ul>
      {depth + 1 < stage.open && <Scope stage={stage} depth={depth + 1} />}
    </div>
  );
}

export default function ScopeChain({ step }) {
  const stage = stageAt(STAGES, step);
  const index = Math.max(0, Math.min(STAGES.length - 1, step));
  const marks = index === 5 ? { 9: "error" } : {};
  const { lookup } = stage;
  const order = lookup ? [...lookup.path] : [];
  return (
    <div className="scope-chain">
      <div className="scope-chain__layout">
        <CodeView lines={CODE} active={stage.line} marks={marks} label="main.js" />
        <div className="scope-chain__side">
          <Panel title="Lookup" sunken>
            {lookup ? (
              <ol className="scope-chain__path" aria-label={`Looking up ${lookup.name}`}>
                <li className="demo-mono scope-chain__looking">{lookup.name}:</li>
                {order.map((key) => (
                  <li key={key}>
                    <Chip tone={lookup.found === key ? "success" : "muted"}>
                      {lookup.found === key ? "✓" : "✗"} {SHORT[key]}
                    </Chip>
                  </li>
                ))}
                {lookup.found === null && (
                  <li>
                    <Chip tone="danger">no outer scope: ReferenceError</Chip>
                  </li>
                )}
              </ol>
            ) : (
              <p className="demo-empty">No lookup at this stage.</p>
            )}
          </Panel>
          <Scope stage={stage} depth={0} />
        </div>
      </div>
      <ConsoleView lines={stage.logs} fresh={index === 4 || index === 5 ? 1 : 0} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
