import { useState } from "react";
import { Caption, Chip, Choice, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "abort-controller";

export const defaults = {
  first: "beauty",
  second: "groceries",
  slow: 1500,
  fast: 300,
  switchAt: 200,
  check: true,
};

const PRODUCTS = {
  beauty: ["Essence Mascara Lash Princess", "Eyeshadow Palette with Mirror", "Powder Canister"],
  groceries: ["Apple", "Beef Steak", "Cat Food"],
  furniture: ["Annibale Colombo Bed", "Annibale Colombo Sofa", "Bedside Table African Cherry"],
  fragrances: ["Calvin Klein CK One", "Chanel Coco Noir Eau De", "Dior J'adore"],
};

const VERSIONS = [
  { value: "check", label: "catch checks signal.aborted" },
  { value: "plain", label: "catch does not check" },
];

const ABORT_MESSAGE = "signal is aborted without reason";

const HEAD = [
  "useEffect(() => {",
  "  const controller = new AbortController();",
  '  setRequest({ status: "loading", products: [], error: null });',
  "  loadProducts(category, controller.signal)",
  "    .then((products) => {",
  '      setRequest({ status: "success", products, error: null });',
  "    })",
  "    .catch((error) => {",
];

const CHECKED = [
  ...HEAD,
  "      if (!controller.signal.aborted) {",
  '        setRequest({ status: "error", products: [], error: error.message });',
  "      }",
  "    });",
  "  return () => controller.abort();",
  "}, [category]);",
];

const PLAIN = [
  ...HEAD,
  '      setRequest({ status: "error", products: [], error: error.message });',
  "    });",
  "  return () => controller.abort();",
  "}, [category]);",
];

const LINES = {
  check: { send: 3, success: 5, catch: 8, cleanup: 12 },
  plain: { send: 3, success: 5, catch: 8, cleanup: 10 },
};

function category(value, fallback) {
  return typeof value === "string" && /^[a-z][a-z-]{0,19}$/.test(value) ? value : fallback;
}

function ms(value, fallback, min, max) {
  return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
}

function settings(props) {
  const first = category(props?.first, defaults.first);
  const second = category(props?.second, defaults.second);
  const slow = ms(props?.slow, defaults.slow, 100, 10000);
  const fast = ms(props?.fast, defaults.fast, 50, 10000);
  const switchAt = ms(props?.switchAt, defaults.switchAt, 1, 10000);
  const check = props?.check !== false;
  if (first === second || switchAt >= slow) return { ...defaults, check };
  return { first, second, slow, fast, switchAt, check };
}

function stages({ first, second, slow, fast, switchAt }, checked) {
  const lines = LINES[checked ? "check" : "plain"];
  const end = switchAt + fast;
  const one = { name: first, start: 0, end: slow, controller: 1 };
  const two = { name: second, start: switchAt, end, controller: 2 };
  const loading = { kind: "loading" };
  const error = { kind: "error", text: `Could not load products. ${ABORT_MESSAGE}` };
  return [
    {
      now: 0,
      select: first,
      page: loading,
      runs: [{ ...one, state: "pending", aborted: false }],
      rejection: null,
      active: lines.send,
      caption: `The page opens on ${first}. The effect's first run makes a controller and passes its signal to fetch with the request for ${first}, which would take ${slow} ms.`,
    },
    {
      now: switchAt,
      select: second,
      page: loading,
      runs: [{ ...one, state: "aborted", aborted: true }],
      rejection: null,
      active: lines.cleanup,
      caption: `At ${switchAt} ms you choose ${second}. Before running the effect again, React calls the first run's cleanup: controller.abort(). The browser drops the ${first} connection.`,
    },
    {
      now: switchAt,
      select: second,
      page: loading,
      runs: [
        { ...one, state: "aborted", aborted: true },
        { ...two, state: "pending", aborted: false },
      ],
      rejection: null,
      active: lines.send,
      caption: `Still at ${switchAt} ms, the second run makes its own controller, sets loading, and asks for ${second}.`,
    },
    {
      now: switchAt,
      select: second,
      page: checked ? loading : error,
      runs: [
        { ...one, state: "aborted", aborted: true },
        { ...two, state: "pending", aborted: false },
      ],
      rejection: true,
      active: lines.catch,
      caption: checked
        ? `Right after, the first fetch rejects with an AbortError, so its then never runs and its catch does. signal.aborted is true, so the catch does nothing.`
        : `Right after, the first fetch rejects with an AbortError and its catch runs. Without the check it stores the error, and the page shows "${ABORT_MESSAGE}" while ${second} is still loading.`,
    },
    {
      now: end,
      select: second,
      page: { kind: "products", name: second },
      runs: [
        { ...one, state: "aborted", aborted: true },
        { ...two, state: "applied", aborted: false },
      ],
      rejection: true,
      active: lines.success,
      caption: checked
        ? `At ${end} ms ${second} answers, and the second run stores the products. The list matches the select.`
        : `At ${end} ms ${second} answers and replaces the error. The page was right in the end, but it flashed an error the shopper should never see.`,
    },
    {
      now: end,
      select: second,
      page: { kind: "products", name: second },
      runs: [
        { ...one, state: "aborted", aborted: true },
        { ...two, state: "applied", aborted: false },
      ],
      rejection: true,
      active: -1,
      caption: checked
        ? `The ${first} request was cancelled, not ignored: no answer arrived late, so there was nothing stale to throw away. The Network view shows it as aborted.`
        : "An aborted request always rejects, so the catch must tell an abort apart from a real failure. Switch to the check above and step through again.",
    },
  ];
}

export function stepCount() {
  return 6;
}

const STATE = {
  pending: { tone: "accent", text: "in flight" },
  applied: { tone: "success", text: "✓ 200, stored" },
  aborted: { tone: "warning", text: "aborted" },
};

function Lane({ run, index, now, total }) {
  const until = run.state === "aborted" ? run.abortAt : Math.min(now, run.end);
  const state = STATE[run.state];
  const width = Math.max(until - run.start, 0);
  return (
    <li>
      <p className="abort-controller__label">
        <span>
          Run {index + 1}: <span className="demo-mono">{run.name}</span>
        </span>
        <Chip tone={state.tone}>{state.text}</Chip>
      </p>
      <div className="abort-controller__track" aria-hidden="true">
        <span
          className={`abort-controller__bar abort-controller__bar--${run.state}`}
          style={{ left: `${(run.start / total) * 100}%`, width: `${(width / total) * 100}%` }}
        />
      </div>
      <p className="abort-controller__times meta">
        Sent at {run.start} ms
        {run.state === "aborted"
          ? `, aborted at ${run.abortAt} ms`
          : now >= run.end
            ? `, answered at ${run.end} ms`
            : ""}
        . signal.aborted: {String(run.aborted)}
      </p>
    </li>
  );
}

export default function AbortControllerDemo({ props, step }) {
  const setup = settings(props);
  const [version, setVersion] = useState(setup.check ? "check" : "plain");
  const checked = version === "check";
  const stage = stageAt(stages(setup, checked), step);
  const total = Math.max(setup.slow, setup.switchAt + setup.fast);
  const runs = stage.runs.map((run) =>
    run.state === "aborted" ? { ...run, abortAt: setup.switchAt } : run,
  );
  const products =
    stage.page.kind === "products"
      ? (PRODUCTS[stage.page.name] ?? [`${stage.page.name} products`])
      : [];

  return (
    <div className="abort-controller">
      <Choice legend="The effect" options={VERSIONS} value={version} onChange={setVersion} />
      <Panel title={`Requests, at ${stage.now} ms`}>
        <ol className="abort-controller__lanes" aria-label="Requests">
          {runs.map((run, index) => (
            <Lane key={run.name} run={run} index={index} now={stage.now} total={total} />
          ))}
        </ol>
        {stage.rejection && (
          <p className="abort-controller__rejection">
            Run 1 rejected: <span className="demo-mono">AbortError: {ABORT_MESSAGE}</span>
          </p>
        )}
      </Panel>
      <div className="abort-controller__grid">
        <CodeView
          lines={checked ? CHECKED : PLAIN}
          active={stage.active}
          label="The effect in App"
        />
        <Panel title="Page">
          <p className="abort-controller__select">
            Category: <span className="demo-mono">{stage.select}</span>
          </p>
          {stage.page.kind === "loading" && <p className="demo-empty">Loading products...</p>}
          {stage.page.kind === "error" && (
            <p className="abort-controller__error">
              <Chip tone="danger">✗ error</Chip> {stage.page.text}
            </p>
          )}
          {stage.page.kind === "products" && (
            <ul className="abort-controller__products" aria-label="Products shown">
              {products.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
