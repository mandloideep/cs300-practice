import { Box, Caption, Chip, CodeView, ConsoleView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "function-call";

export const defaults = { args: [10, 3] };

function settings(props) {
  const args =
    Array.isArray(props.args) &&
    props.args.length === 2 &&
    props.args.every((value) => typeof value === "number" && Number.isFinite(value))
      ? props.args
      : defaults.args;
  const [price, quantity] = args;
  return { price, quantity, cost: price * quantity };
}

function code({ price, quantity }) {
  return [
    "function lineTotal(price, quantity) {",
    "  const cost = price * quantity;",
    "  return cost;",
    "}",
    `const total = lineTotal(${price}, ${quantity});`,
    'console.log("Total:", total);',
  ];
}

function stages({ price, quantity, cost }) {
  return [
    {
      line: 0,
      total: null,
      frame: null,
      logs: [],
      caption:
        "The declaration stores a function under the name lineTotal. Nothing inside its body runs yet.",
    },
    {
      line: 4,
      total: "waiting",
      frame: null,
      args: true,
      logs: [],
      caption: `lineTotal(${price}, ${quantity}) is a call. JavaScript works out the arguments, ${price} and ${quantity}, and this line waits for the call to finish.`,
    },
    {
      line: 0,
      total: "waiting",
      frame: { price, quantity },
      args: true,
      bind: true,
      logs: [],
      caption: `The call gets a frame of its own. The parameters are matched by position: price gets ${price} and quantity gets ${quantity}.`,
    },
    {
      line: 1,
      total: "waiting",
      frame: { price, quantity, cost },
      logs: [],
      caption: `The body runs inside the frame. cost is ${price} * ${quantity}, which is ${cost}, and it exists only in this frame.`,
    },
    {
      line: 2,
      total: "waiting",
      frame: { price, quantity, cost },
      returning: true,
      logs: [],
      caption: `return hands the value ${cost} back to the caller and ends the call. The frame, with price, quantity, and cost, is thrown away.`,
    },
    {
      line: 4,
      total: cost,
      frame: null,
      logs: [],
      caption: `Back on the calling line, the call is replaced by its return value, so total is ${cost}.`,
    },
    {
      line: 5,
      total: cost,
      frame: null,
      logs: [`Total: ${cost}`],
      caption: `The log prints Total: ${cost}. Each call makes a fresh frame, so calling lineTotal again starts with new parameters and a new cost.`,
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

function Variable({ name, children, tone }) {
  return (
    <li>
      <Box label={name} tone={tone} className="function-call__var">
        {children}
      </Box>
    </li>
  );
}

export default function FunctionCall({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(stages(setup), step);
  const index = Math.max(0, Math.min(6, step));
  const inBody = stage.frame && stage.line <= 3;
  return (
    <div className="function-call">
      <CodeView lines={code(setup)} active={stage.line} label="main.js" />
      <div className="function-call__frames">
        <Panel title="Global">
          <ul className="function-call__vars" aria-label="Global variables">
            <Variable name="lineTotal">
              <span className="function-call__kind">function</span>
            </Variable>
            {stage.total !== null && (
              <Variable name="total" tone={index === 5 ? "accent" : undefined}>
                {stage.total === "waiting" ? (
                  <span className="function-call__kind">waiting for the call</span>
                ) : (
                  <span className="demo-mono function-call__value">{stage.total}</span>
                )}
              </Variable>
            )}
          </ul>
          {stage.args && (
            <p className="function-call__args">
              <span>Arguments:</span>
              <Chip tone="accent">
                <span className="demo-mono">{setup.price}</span>
              </Chip>
              <Chip tone="accent">
                <span className="demo-mono">{setup.quantity}</span>
              </Chip>
            </p>
          )}
        </Panel>
        <Panel
          title="lineTotal frame"
          sunken
          className={stage.returning ? "function-call__frame is-leaving" : "function-call__frame"}
        >
          {stage.frame ? (
            <>
              <ul className="function-call__vars" aria-label="Frame variables">
                <Variable name="price" tone={stage.bind ? "accent" : undefined}>
                  <span className="demo-mono function-call__value">{stage.frame.price}</span>
                  {stage.bind && <span className="function-call__from">from argument 1</span>}
                </Variable>
                <Variable name="quantity" tone={stage.bind ? "accent" : undefined}>
                  <span className="demo-mono function-call__value">{stage.frame.quantity}</span>
                  {stage.bind && <span className="function-call__from">from argument 2</span>}
                </Variable>
                {stage.frame.cost !== undefined && (
                  <Variable name="cost" tone={index === 3 ? "accent" : undefined}>
                    <span className="demo-mono function-call__value">{stage.frame.cost}</span>
                  </Variable>
                )}
              </ul>
              {stage.returning && (
                <p className="function-call__args">
                  <span>Returns:</span>
                  <Chip tone="success">
                    <span className="demo-mono">{setup.cost}</span>
                  </Chip>
                  <span className="function-call__kind">frame discarded</span>
                </p>
              )}
              {inBody && !stage.returning && (
                <p className="function-call__kind">Running the body.</p>
              )}
            </>
          ) : (
            <p className="demo-empty">
              {index < 2 ? "No call running yet." : "The call has ended; its frame is gone."}
            </p>
          )}
        </Panel>
      </div>
      <ConsoleView lines={stage.logs} fresh={stage.logs.length} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
