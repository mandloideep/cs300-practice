import { Box, Caption, Chip, CodeView, ConsoleView, Panel, Row, Stack, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "state-snapshot";

export const defaults = { title: "Essence Mascara Lash Princess", delay: 3000 };

const SECOND_CLICK = 1000;

function settings(props) {
  const title =
    typeof props.title === "string" && props.title.trim() !== ""
      ? props.title.trim()
      : defaults.title;
  const delay =
    Number.isInteger(props.delay) && props.delay >= 1500 && props.delay <= 10000
      ? props.delay
      : defaults.delay;
  return { title, delay };
}

const seconds = (ms) => `${ms / 1000} s`;

function code(delay) {
  return [
    "function ProductCard({ product }) {",
    "  const [quantity, setQuantity] = useState(0);",
    "",
    "  function handleAdd() {",
    "    setQuantity(quantity + 1);",
    "    setTimeout(() => {",
    '      console.log("Timer sees", quantity);',
    `    }, ${delay});`,
    "  }",
    "",
    "  return (",
    "    <article>",
    "      <h3>{product.title}</h3>",
    "      <p>In cart: {quantity}</p>",
    "      <button onClick={handleAdd}>Add to cart</button>",
    "    </article>",
    "  );",
    "}",
  ];
}

function stages({ delay }) {
  const span = delay / 1000;
  const unit = span === 1 ? "second" : "seconds";
  return [
    {
      time: null,
      renders: 1,
      timers: [],
      logs: [],
      active: -1,
      caption:
        "ProductCard renders with quantity 0. Think of this render as a snapshot: inside it, quantity is 0 and stays 0.",
    },
    {
      time: 0,
      renders: 1,
      timers: ["waiting"],
      logs: [],
      active: 4,
      marks: { 5: "active", 6: "active", 7: "active" },
      caption: `You click Add to cart. handleAdd from render 1 asks for 0 + 1 and starts a timer for ${span} ${unit}. The timer's function was made in render 1, so the quantity it sees is render 1's 0.`,
    },
    {
      time: 0,
      renders: 2,
      timers: ["waiting"],
      logs: [],
      active: 1,
      caption:
        "React renders again. Render 2 is a new call of ProductCard with its own quantity, 1, and the page shows In cart: 1. Render 1's quantity is still 0: nothing changed it.",
    },
    {
      time: SECOND_CLICK,
      renders: 2,
      timers: ["waiting", "waiting"],
      logs: [],
      active: 4,
      marks: { 5: "active", 6: "active", 7: "active" },
      caption:
        "You click again before the first timer runs. This time the handler from render 2 runs: it asks for 1 + 1 and starts a second timer, which sees render 2's quantity, 1.",
    },
    {
      time: SECOND_CLICK,
      renders: 3,
      timers: ["waiting", "waiting"],
      logs: [],
      active: 1,
      caption: "Render 3 has quantity 2, and the page shows In cart: 2.",
    },
    {
      time: delay,
      renders: 3,
      timers: ["logged", "waiting"],
      logs: [0],
      fresh: 1,
      active: 6,
      caption: `${span} ${unit} after the first click, the first timer runs. It logs 0, not 2, because it reads quantity from render 1, the snapshot it was made in.`,
    },
    {
      time: SECOND_CLICK + delay,
      renders: 3,
      timers: ["logged", "logged"],
      logs: [0, 1],
      fresh: 1,
      active: 6,
      caption:
        "The second timer runs and logs 1, render 2's value. The page still shows 2, the value in the latest render.",
    },
    {
      time: SECOND_CLICK + delay,
      renders: 3,
      timers: ["logged", "logged"],
      logs: [0, 1],
      active: -1,
      settled: true,
      caption:
        "Each render has its own quantity, and every function made during a render, a handler or a timer, keeps that render's value. A setter never changes the variable; it asks for a new render with a new value.",
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

export default function StateSnapshot({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(stages(setup), step);
  const shown = stage.renders - 1;
  return (
    <div className="state-snapshot">
      <Row>
        <Panel title="ProductCard" className="state-snapshot__code">
          <CodeView
            lines={code(setup.delay)}
            active={stage.active}
            marks={stage.marks}
            label="ProductCard"
          />
        </Panel>
        <Stack>
          <p className="state-snapshot__clock">
            <span>Time since the first click</span>
            <Chip tone={stage.time === null ? "muted" : "accent"}>
              {stage.time === null ? "no click yet" : seconds(stage.time)}
            </Chip>
          </p>
          <Panel title="Renders">
            <ol className="state-snapshot__renders" aria-label="Renders so far">
              {Array.from({ length: stage.renders }, (_, index) => {
                const current = index === shown;
                const timer = stage.timers[index];
                return (
                  <li key={index}>
                    <Box
                      tone={current ? "accent" : undefined}
                      label={`Render ${index + 1}`}
                      className="state-snapshot__render"
                    >
                      <span className="demo-mono">quantity = {index}</span>
                      {current && <Chip tone="accent">on screen</Chip>}
                      {timer && (
                        <Chip tone={timer === "logged" ? "success" : "warning"}>
                          {timer === "logged" ? `timer logged ${index}` : "timer waiting"}
                        </Chip>
                      )}
                    </Box>
                  </li>
                );
              })}
            </ol>
          </Panel>
          <Panel title="The page">
            <p className="state-snapshot__page">
              <strong>{setup.title}</strong>
              <span>In cart: {shown}</span>
            </p>
          </Panel>
          <ConsoleView
            lines={stage.logs.map((value) => `Timer sees ${value}`)}
            fresh={stage.fresh ?? 0}
          />
        </Stack>
      </Row>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
