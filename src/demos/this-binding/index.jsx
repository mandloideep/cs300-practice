import { Box, Caption, Chip, CodeView, ConsoleView, Panel, Stack, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "this-binding";

export const defaults = { name: "Alice" };

const ERROR = "TypeError: Cannot read properties of undefined (reading 'name')";

function settings(props) {
  const name =
    typeof props.name === "string" && /^[A-Z][a-z]{0,11}$/.test(props.name)
      ? props.name
      : defaults.name;
  return { name };
}

function code({ name }) {
  return [
    "const student = {",
    `  name: "${name}",`,
    "  greet() {",
    "    return `Hi, I am ${this.name}`;",
    "  },",
    "};",
    "console.log(student.greet());",
    "const greet = student.greet;",
    "console.log(greet());",
  ];
}

const FIX = ["const bound =", "  student.greet.bind(student);", "console.log(bound());"];

function stages({ name }) {
  const hi = `Hi, I am ${name}`;
  return [
    {
      line: 2,
      self: null,
      call: null,
      logs: [],
      caption:
        "greet is a function stored on the object, a method. What this means inside it is not fixed when it is written; each call decides.",
    },
    {
      line: 6,
      self: "student",
      call: "student.greet()",
      logs: [],
      caption:
        "student.greet() calls the function with a dot. The object to the left of the dot, student, becomes this for this call.",
    },
    {
      line: 3,
      self: "student",
      call: "student.greet()",
      logs: [hi],
      caption: `this.name reads student.name, which is "${name}", and the log prints ${hi}.`,
    },
    {
      line: 7,
      self: null,
      call: null,
      copied: true,
      logs: [hi],
      caption:
        "const greet = student.greet copies the function into a new variable. It copies only the function: nothing in greet remembers student.",
    },
    {
      line: 8,
      self: "undefined",
      call: "greet()",
      logs: [hi],
      caption:
        "greet() is a plain call, with no dot and no object. A module runs in strict mode, and in strict mode a plain call sets this to undefined.",
    },
    {
      line: 3,
      self: "undefined",
      call: "greet()",
      error: true,
      logs: [hi, { text: ERROR, error: true }],
      caption: `So this.name reads a property of undefined, and the call throws ${ERROR}. That is how Chrome words it; the cause is that this is undefined.`,
    },
    {
      line: -1,
      self: "student",
      call: "bound()",
      fix: true,
      logs: [hi],
      caption: `this follows the call, not the function. Call the method with its object, student.greet(), or fix this with bind, which returns a new function whose this is always student: it logs ${hi}.`,
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

export default function ThisBinding({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(stages(setup), step);
  const lines = code(setup);
  const marks = stage.error ? { 8: "error" } : {};
  return (
    <div className="this-binding">
      <div className="this-binding__layout">
        <Stack>
          <CodeView lines={lines} active={stage.line} marks={marks} label="main.js" />
          {stage.fix && (
            <Panel title="The fix">
              <CodeView lines={FIX} active={2} label="The fix" />
            </Panel>
          )}
        </Stack>
        <div className="this-binding__side">
          <Panel title="The call">
            {stage.call ? (
              <p className="this-binding__call">
                <span className="demo-mono this-binding__expr">{stage.call}</span>
                <Chip tone={stage.self === "undefined" ? "danger" : "success"}>
                  {stage.self === "undefined"
                    ? "no object: this is undefined"
                    : stage.fix
                      ? "bound: this is student"
                      : "left of the dot: student"}
                </Chip>
              </p>
            ) : (
              <p className="demo-empty">
                {stage.copied ? "Nothing is called on this line." : "No call yet."}
              </p>
            )}
          </Panel>
          <div className="this-binding__values">
            <Box
              label="this"
              tone={stage.self === "undefined" ? "danger" : stage.self ? "success" : undefined}
            >
              {stage.self === null ? (
                <span className="this-binding__note">Not set: no call is running.</span>
              ) : (
                <span className="demo-mono this-binding__value">{stage.self}</span>
              )}
            </Box>
            <Box label="student" tone={stage.self === "student" ? "success" : undefined}>
              <span className="demo-mono">name: &quot;{setup.name}&quot;</span>
              <span className="demo-mono">greet: function</span>
            </Box>
            {(stage.copied || step >= 3) && (
              <Box label="greet" tone={stage.copied ? "accent" : undefined}>
                <span className="demo-mono">the same function</span>
                <span className="this-binding__note">no link to student</span>
              </Box>
            )}
          </div>
        </div>
      </div>
      <ConsoleView
        lines={stage.logs}
        fresh={step === 2 || step === 5 || stage.fix ? 1 : 0}
        label={stage.fix ? "Console, running the fix" : "Console"}
      />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
