import { useState } from "react";
import { Box, Caption, Chip, Choice, CodeView, ConsoleView, Panel, Row, Stack } from "../kit.jsx";
import "./styles.css";

export const id = "error-propagation";

export const defaults = { price: "abc", caught: true };

const COMMON = [
  "function parsePrice(text) {",
  "  const price = Number(text);",
  "  if (Number.isNaN(price)) {",
  "    throw new Error(`Not a price: ${text}`);",
  "  }",
  "  return price;",
  "}",
  "",
  "function saveProduct(fields) {",
  "  const price = parsePrice(fields.price);",
  "  return { title: fields.title, price };",
  "}",
  "",
];

const WITH_CATCH = [
  "function handleSubmit(fields) {",
  "  try {",
  "    const product = saveProduct(fields);",
  '    console.log("Saved:", product.title);',
  "  } catch (error) {",
  '    console.log("Could not save:", error.message);',
  "  }",
  "}",
];

const WITHOUT_CATCH = [
  "function handleSubmit(fields) {",
  "  const product = saveProduct(fields);",
  '  console.log("Saved:", product.title);',
  "}",
];

const STAGE_COUNT = 8;

function settings(props) {
  const price =
    typeof props.price === "string" && props.price.length <= 20 && Number.isNaN(Number(props.price))
      ? props.price
      : defaults.price;
  const caught = typeof props.caught === "boolean" ? props.caught : defaults.caught;
  return { price, caught };
}

export function stepCount() {
  return STAGE_COUNT;
}

function program(price, caught) {
  const handler = caught ? WITH_CATCH : WITHOUT_CATCH;
  const start = COMMON.length;
  const call = start + handler.length + 1;
  const lines = [
    ...COMMON,
    ...handler,
    "",
    `handleSubmit({ title: "Kiwi", price: ${JSON.stringify(price)} });`,
    'console.log("Done");',
  ];
  return {
    lines,
    call,
    done: call + 1,
    inHandler: start + (caught ? 2 : 1),
    catchLine: start + 4,
    caughtLog: start + 5,
  };
}

function Trace({ head, frames }) {
  return (
    <>
      <span className="error-propagation__trace">{head}</span>
      {frames.map((text) => (
        <span key={text} className="error-propagation__trace error-propagation__trace--at">
          {text}
        </span>
      ))}
    </>
  );
}

function frame(name, line) {
  return { name, line };
}

function stage(step, price, caught) {
  const code = program(price, caught);
  const message = `Not a price: ${price}`;
  const top = frame("top level of main.js", code.call + 1);
  const handler = frame("handleSubmit", code.inHandler + 1);
  const save = frame("saveProduct", 10);
  const parse = frame("parsePrice", 4);
  const uncaught = {
    error: true,
    text: (
      <Trace
        head={`Uncaught Error: ${message}`}
        frames={[
          "at parsePrice (main.js:4:11)",
          "at saveProduct (main.js:10:17)",
          `at handleSubmit (main.js:${code.inHandler + 1}:19)`,
          `at main.js:${code.call + 1}:1`,
        ]}
      />
    ),
  };
  const stages = [
    {
      active: code.call,
      marks: {},
      frames: [top],
      holder: null,
      logs: [],
      caption: `main.js runs from the top. Its last two lines call handleSubmit with the price ${JSON.stringify(price)} and then log Done.`,
    },
    {
      active: code.inHandler,
      marks: {},
      frames: [top, handler],
      holder: null,
      logs: [],
      caption: caught
        ? "Each call puts a frame on the call stack. handleSubmit runs, and inside its try block it calls saveProduct."
        : "Each call puts a frame on the call stack. handleSubmit runs and calls saveProduct.",
    },
    {
      active: 9,
      marks: {},
      frames: [top, handler, save],
      holder: null,
      logs: [],
      caption: `saveProduct runs and calls parsePrice with ${JSON.stringify(price)}, which puts a third frame on the stack.`,
    },
    {
      active: 3,
      marks: {},
      frames: [top, handler, save, parse],
      holder: "parsePrice",
      logs: [],
      caption: `Number(${JSON.stringify(price)}) is NaN, so parsePrice throws an Error. The throw stops parsePrice at once: return price never runs.`,
    },
    {
      active: -1,
      marks: { 3: "error", 9: "error" },
      frames: [top, handler, save],
      holder: "saveProduct",
      logs: [],
      caption:
        "parsePrice has no catch, so its frame is thrown away and the error lands on the line in saveProduct that called it.",
    },
    {
      active: -1,
      marks: { 3: "error", 9: "error", [code.inHandler]: "error" },
      frames: [top, handler],
      holder: "handleSubmit",
      logs: [],
      caption:
        "saveProduct has no catch either. Its frame goes too, its return never runs, and the error lands in handleSubmit.",
    },
    caught
      ? {
          active: code.caughtLog,
          marks: { 3: "error", 9: "error", [code.inHandler]: "error", [code.catchLine]: "good" },
          frames: [top, handler],
          holder: null,
          logs: [`Could not save: ${message}`],
          fresh: 1,
          caption:
            'The call sat inside try, so catch (error) takes the error and the unwinding stops here. The "Saved:" line is skipped and the catch block logs the message instead.',
        }
      : {
          active: -1,
          marks: { 3: "error", 9: "error", [code.inHandler]: "error", [code.call]: "error" },
          frames: [],
          holder: null,
          logs: [uncaught],
          fresh: 1,
          caption:
            "handleSubmit has no catch, and neither does the top level. The stack empties and the console reports an Uncaught Error with the frames it passed through.",
        },
    caught
      ? {
          active: code.done,
          marks: { 3: "error", [code.catchLine]: "good" },
          frames: [frame("top level of main.js", code.done + 1)],
          holder: null,
          logs: [`Could not save: ${message}`, "Done"],
          fresh: 1,
          caption:
            "The catch handled it, so handleSubmit returns normally and the top level goes on to log Done. Any caller with a try around the call can stop the unwinding.",
        }
      : {
          active: -1,
          marks: { 3: "error", [code.call]: "error" },
          frames: [],
          holder: null,
          logs: [uncaught],
          fresh: 0,
          caption:
            "Nothing caught it, so the rest of main.js never runs and Done is never logged. Read the trace from the top: where it was thrown, then each call that led there.",
        },
  ];
  return { code, now: stages[Math.max(0, Math.min(STAGE_COUNT - 1, step))], message };
}

export default function ErrorPropagation({ props, step }) {
  const setup = settings(props);
  const [caught, setCaught] = useState(setup.caught);
  const { code, now, message } = stage(step, setup.price, caught);
  return (
    <div className="error-propagation">
      <Choice
        legend="handleSubmit has"
        options={[
          { value: "yes", label: "A try...catch" },
          { value: "no", label: "No try...catch" },
        ]}
        value={caught ? "yes" : "no"}
        onChange={(value) => setCaught(value === "yes")}
      />
      <Stack>
        <CodeView lines={code.lines} active={now.active} marks={now.marks} label="main.js" />
        <Row>
          <Panel title="Call stack, top first">
            {now.frames.length === 0 ? (
              <p className="demo-empty">Empty: nothing is running.</p>
            ) : (
              <ol className="error-propagation__stack" aria-label="Call stack, top first">
                {[...now.frames].reverse().map((item) => (
                  <li key={item.name}>
                    <Box
                      tone={now.holder === item.name ? "danger" : undefined}
                      className="error-propagation__frame"
                    >
                      <span className="error-propagation__name">{item.name}</span>
                      <span className="error-propagation__line">line {item.line}</span>
                      {now.holder === item.name && (
                        <span className="error-propagation__holds">
                          <Chip tone="danger">Error: {message}</Chip>
                        </span>
                      )}
                    </Box>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
          <ConsoleView lines={now.logs} fresh={now.fresh ?? 0} />
        </Row>
      </Stack>
      <Caption>{now.caption}</Caption>
    </div>
  );
}
