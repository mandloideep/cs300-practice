import { useState } from "react";
import { Caption, Chip, Choice, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "fetch-timeline";

export const defaults = { path: "/products?limit=8", latency: 300, outcome: "ok" };

const OUTCOMES = [
  { value: "ok", label: "200 OK" },
  { value: "http-error", label: "500 error" },
  { value: "network-error", label: "No connection" },
];

const TITLES = [
  "Essence Mascara Lash Princess",
  "Eyeshadow Palette with Mirror",
  "Powder Canister",
];

const STATES = ["idle", "loading", "success", "error"];
const STATE_TONE = { idle: "accent", loading: "accent", success: "success", error: "danger" };

function settings(props) {
  const path =
    typeof props?.path === "string" && /^\/[^\s"'`\\]{0,60}$/.test(props.path)
      ? props.path
      : defaults.path;
  const latency =
    Number.isInteger(props?.latency) && props.latency >= 20 && props.latency <= 10000
      ? props.latency
      : defaults.latency;
  const outcome = OUTCOMES.some((option) => option.value === props?.outcome)
    ? props.outcome
    : defaults.outcome;
  const limit = Number(/[?&]limit=(\d+)/.exec(path)?.[1]);
  const count = Number.isInteger(limit) && limit >= 1 && limit <= 100 ? limit : 30;
  return { path, latency, outcome, count };
}

function code(path) {
  return [
    "async function loadProducts() {",
    '  status.textContent = "Loading products...";',
    "  try {",
    `    const response = await fetch(import.meta.env.API_BASE + ${JSON.stringify(path)});`,
    "    if (!response.ok) {",
    "      throw new Error(`The server answered with status ${response.status}.`);",
    "    }",
    "    const data = await response.json();",
    "    renderProducts(data.products);",
    "  } catch (error) {",
    '    status.textContent = "Could not load products. " + error.message;',
    "  }",
    "}",
  ];
}

function stages({ path, latency, outcome, count }) {
  const request = `GET ${path}`;
  const shared = [
    {
      state: "idle",
      active: -1,
      network: null,
      response: null,
      page: { status: "", products: false },
      time: null,
      caption: "Idle: nothing has been asked yet. The page waits for a click on Load products.",
    },
    {
      state: "loading",
      active: 1,
      network: null,
      response: null,
      page: { status: "Loading products...", products: false },
      time: 0,
      caption:
        "You click, loadProducts runs, and the status line says the page is working. The state is now loading.",
    },
    {
      state: "loading",
      active: 3,
      network: { label: "pending", tone: "accent" },
      response: null,
      page: { status: "Loading products...", products: false },
      time: 0,
      caption: `fetch sends ${request} and returns a pending promise at once. await pauses loadProducts until it settles.`,
    },
    {
      state: "loading",
      active: 3,
      network: { label: "pending", tone: "accent" },
      response: null,
      page: { status: "Loading products...", products: false },
      time: `0 to ${latency}`,
      caption: `The wait: the request travels to the server and the answer travels back, ${latency} ms here. The page is not frozen; the user can still scroll and click.`,
    },
  ];

  if (outcome === "network-error") {
    const message = "Could not load products. Failed to fetch";
    return [
      ...shared,
      {
        state: "loading",
        active: 3,
        network: { label: "failed", tone: "danger" },
        response: { failed: true },
        page: { status: "Loading products...", products: false },
        time: latency,
        caption:
          'No answer comes back: the connection dropped. fetch rejects with a TypeError, "Failed to fetch" in Chrome, so the await throws and the code jumps to catch.',
      },
      {
        state: "error",
        active: 10,
        network: { label: "failed", tone: "danger" },
        response: { failed: true },
        page: { status: message, products: false },
        time: latency,
        caption: "catch writes a sentence for the user with the error message. The state is error.",
      },
      {
        state: "error",
        active: -1,
        network: { label: "failed", tone: "danger" },
        response: { failed: true },
        page: { status: message, products: false },
        time: latency,
        caption:
          "fetch rejects only when no response arrives at all. The request ended in the error state, and the page says so instead of staying on Loading.",
      },
    ];
  }

  if (outcome === "http-error") {
    const message = "Could not load products. The server answered with status 500.";
    return [
      ...shared,
      {
        state: "loading",
        active: 4,
        network: { label: "500", tone: "danger" },
        response: { status: 500, ok: false, body: "not read" },
        page: { status: "Loading products...", products: false },
        time: latency,
        caption: `At ${latency} ms the headers arrive with status 500. fetch still fulfills: the server did answer. response.ok is false, so the if catches it.`,
      },
      {
        state: "error",
        active: 10,
        network: { label: "500", tone: "danger" },
        response: { status: 500, ok: false, body: "not read" },
        page: { status: message, products: false },
        time: latency,
        caption:
          "Our throw jumps to catch, which never reads the body. The status line explains what went wrong, and the state is error.",
      },
      {
        state: "error",
        active: -1,
        network: { label: "500", tone: "danger" },
        response: { status: 500, ok: false, body: "not read" },
        page: { status: message, products: false },
        time: latency,
        caption:
          "A 404 or a 500 is a successful fetch with a bad status, so checking response.ok is your job. The request ended in the error state.",
      },
    ];
  }

  return [
    ...shared,
    {
      state: "loading",
      active: 4,
      network: { label: "200", tone: "success" },
      response: { status: 200, ok: true, body: "not read yet" },
      page: { status: "Loading products...", products: false },
      time: latency,
      caption: `At ${latency} ms the status and headers arrive, and fetch fulfills with a Response: status 200, ok true. The body has not been read yet.`,
    },
    {
      state: "loading",
      active: 7,
      network: { label: "200", tone: "success" },
      response: { status: 200, ok: true, body: "{ products, total, skip, limit }" },
      page: { status: "Loading products...", products: false },
      time: latency,
      caption:
        "response.json() reads the whole body and parses it as JSON. It returns a promise too, so it needs its own await.",
    },
    {
      state: "success",
      active: 8,
      network: { label: "200", tone: "success" },
      response: { status: 200, ok: true, body: "{ products, total, skip, limit }" },
      page: { status: `${count} products loaded.`, products: true },
      time: latency,
      caption: `renderProducts draws data.products and the status line says ${count} products loaded. The state is success.`,
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

export default function FetchTimeline({ props, step }) {
  const setup = settings(props);
  const [outcome, setOutcome] = useState(setup.outcome);
  const stage = stageAt(stages({ ...setup, outcome }), step);
  const lines = code(setup.path);

  return (
    <div className="fetch-timeline">
      <Choice legend="The server" options={OUTCOMES} value={outcome} onChange={setOutcome} />
      <ol className="fetch-timeline__states" aria-label="Request state">
        {STATES.map((name) => (
          <li key={name}>
            <Chip tone={stage.state === name ? STATE_TONE[name] : "muted"}>
              {stage.state === name && <span className="visually-hidden">Now: </span>}
              {name}
            </Chip>
          </li>
        ))}
      </ol>
      <CodeView lines={lines} active={stage.active} label="app.js" />
      <div className="fetch-timeline__grid">
        <Panel title="Network">
          {stage.network ? (
            <p className="fetch-timeline__request">
              <span className="demo-mono">GET {setup.path}</span>
              <Chip tone={stage.network.tone}>{stage.network.label}</Chip>
            </p>
          ) : (
            <p className="demo-empty">No request yet.</p>
          )}
          {stage.time !== null && <p className="meta">Time: {stage.time} ms</p>}
        </Panel>
        <Panel title="Response">
          {!stage.response ? (
            <p className="demo-empty">Nothing back yet.</p>
          ) : stage.response.failed ? (
            <p className="fetch-timeline__failed">No response: TypeError: Failed to fetch</p>
          ) : (
            <dl className="fetch-timeline__fields">
              <div>
                <dt>status</dt>
                <dd>{stage.response.status}</dd>
              </div>
              <div>
                <dt>ok</dt>
                <dd>{String(stage.response.ok)}</dd>
              </div>
              <div>
                <dt>body</dt>
                <dd>{stage.response.body}</dd>
              </div>
            </dl>
          )}
        </Panel>
        <Panel title="Page" className="fetch-timeline__page">
          <p
            className={
              stage.state === "error" ? "fetch-timeline__status is-error" : "fetch-timeline__status"
            }
          >
            {stage.page.status || <span className="demo-empty">Status line is empty.</span>}
          </p>
          {stage.page.products && (
            <ul className="fetch-timeline__products" aria-label="Products">
              {TITLES.slice(0, Math.min(3, setup.count)).map((title) => (
                <li key={title}>{title}</li>
              ))}
              {setup.count > 3 && <li className="meta">and {setup.count - 3} more</li>}
            </ul>
          )}
        </Panel>
      </div>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
