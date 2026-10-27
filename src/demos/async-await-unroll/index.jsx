import { Caption, Chip, CodeView, Panel, Row, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "async-await-unroll";

export const defaults = { path: "/products?limit=8" };

function settings(props) {
  const path =
    typeof props?.path === "string" && /^\/[^\s"'`\\]{0,60}$/.test(props.path)
      ? props.path
      : defaults.path;
  return { path };
}

const ASYNC = [
  "async function loadProducts() {",
  "  const response = await fetch(url);",
  "  const data = await response.json();",
  "  renderProducts(data.products);",
  "}",
];

const THEN = [
  "function loadProducts() {",
  "  return fetch(url)",
  "    .then((response) => response.json())",
  "    .then((data) => {",
  "      renderProducts(data.products);",
  "    });",
  "}",
];

const STAGES = [
  {
    left: { active: 1, done: [0], status: "Running", tone: "accent" },
    right: { active: 1, done: [0], status: "Running", tone: "accent" },
    response: null,
    data: null,
    caption:
      "You call loadProducts(). Both versions run synchronously up to fetch(url), which sends the request and returns a pending promise.",
  },
  {
    left: { active: 1, done: [0], status: "Paused at the first await", tone: "warning" },
    right: { active: 3, done: [0, 1, 2], status: "Both callbacks registered", tone: "warning" },
    response: null,
    data: null,
    caption:
      "await pauses loadProducts and hands a pending promise back to the caller. The then version registers two callbacks and returns the chain's promise. Either way the caller runs on.",
  },
  {
    left: { active: 2, done: [0, 1], status: "Paused at the second await", tone: "warning" },
    right: { active: 2, done: [0, 1], status: "First callback ran", tone: "warning" },
    response: "Response, status 200",
    data: null,
    caption:
      "The response arrives. The first await resumes with it, and the first then callback runs with it. Both call response.json(), which returns another promise to wait for.",
  },
  {
    left: { active: 3, done: [0, 1, 2], status: "Running", tone: "accent" },
    right: { active: 4, done: [0, 1, 2, 3], status: "Second callback running", tone: "accent" },
    response: "Response, status 200",
    data: "{ products, total, skip, limit }",
    caption:
      "The body is parsed. The second await resumes with data, and the second then callback runs with the same data. Both call renderProducts(data.products).",
  },
  {
    left: { active: 4, done: [0, 1, 2, 3], status: "Done", tone: "success" },
    right: { active: 6, done: [0, 1, 2, 3, 4, 5], status: "Done", tone: "success" },
    response: "Response, status 200",
    data: "{ products, total, skip, limit }",
    caption:
      "The function body ends. The promise the caller got back fulfills with undefined, in both versions.",
  },
  {
    left: { active: -1, pairs: true, status: "Same steps", tone: "success" },
    right: { active: -1, pairs: true, status: "Same steps", tone: "success" },
    response: "Response, status 200",
    data: "{ products, total, skip, limit }",
    caption:
      "The two awaits match the two thens: the code after an await is what the then callback holds. async and await let you write the same chain top to bottom.",
  },
];

const PAIRS = { left: { 1: "good", 2: "good" }, right: { 2: "good", 3: "good" } };

export function stepCount() {
  return STAGES.length;
}

function Side({ title, lines, side, pairs }) {
  const marks = side.pairs
    ? pairs
    : Object.fromEntries((side.done ?? []).map((line) => [line, "done"]));
  return (
    <Panel title={title} className="async-await-unroll__side">
      <CodeView lines={lines} active={side.active} marks={marks} label={title} />
      <p className="async-await-unroll__status">
        <span className="async-await-unroll__name">loadProducts:</span>
        <Chip tone={side.tone}>{side.status}</Chip>
      </p>
    </Panel>
  );
}

export default function AsyncAwaitUnroll({ props, step }) {
  const { path } = settings(props);
  const stage = stageAt(STAGES, step);
  return (
    <div className="async-await-unroll">
      <CodeView
        lines={[`const url = import.meta.env.API_BASE + ${JSON.stringify(path)};`]}
        label="Shared by both versions"
      />
      <Row>
        <Side title="async and await" lines={ASYNC} side={stage.left} pairs={PAIRS.left} />
        <Side title="then chain" lines={THEN} side={stage.right} pairs={PAIRS.right} />
      </Row>
      <Panel title="Values" sunken>
        <dl className="async-await-unroll__values">
          <div>
            <dt className="demo-mono">response</dt>
            <dd>{stage.response ?? <span className="demo-empty">not yet</span>}</dd>
          </div>
          <div>
            <dt className="demo-mono">data</dt>
            <dd className={stage.data ? "demo-mono" : undefined}>
              {stage.data ?? <span className="demo-empty">not yet</span>}
            </dd>
          </div>
        </dl>
      </Panel>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
