import { useState } from "react";
import { Caption, Chip, Choice, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "stale-response";

export const defaults = {
  first: "beauty",
  second: "groceries",
  slow: 1500,
  fast: 300,
  switchAt: 200,
  flag: false,
};

const PRODUCTS = {
  beauty: ["Essence Mascara Lash Princess", "Eyeshadow Palette with Mirror", "Powder Canister"],
  groceries: ["Apple", "Beef Steak", "Cat Food"],
  furniture: ["Annibale Colombo Bed", "Annibale Colombo Sofa", "Bedside Table African Cherry"],
  fragrances: ["Calvin Klein CK One", "Chanel Coco Noir Eau De", "Dior J'adore"],
};

const VERSIONS = [
  { value: "plain", label: "No cleanup" },
  { value: "flag", label: "With a cancelled flag" },
];

const PLAIN = [
  "useEffect(() => {",
  '  setRequest({ status: "loading", products: [], error: null });',
  "  loadProducts(category).then((products) => {",
  '    setRequest({ status: "success", products, error: null });',
  "  });",
  "}, [category]);",
];

const FLAGGED = [
  "useEffect(() => {",
  "  let cancelled = false;",
  '  setRequest({ status: "loading", products: [], error: null });',
  "  loadProducts(category).then((products) => {",
  "    if (!cancelled) {",
  '      setRequest({ status: "success", products, error: null });',
  "    }",
  "  });",
  "  return () => {",
  "    cancelled = true;",
  "  };",
  "}, [category]);",
];

const LINES = {
  plain: { send: 2, answer: 3, cleanup: -1 },
  flag: { send: 3, answer: 4, cleanup: 9 },
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
  const flag = props?.flag === true;
  if (first === second || slow <= switchAt + fast) {
    return { ...defaults, flag };
  }
  return { first, second, slow, fast, switchAt, flag };
}

function stages({ first, second, slow, fast, switchAt }, guarded) {
  const end = switchAt + fast;
  const lines = LINES[guarded ? "flag" : "plain"];
  const one = { name: first, start: 0, end: slow };
  const two = { name: second, start: switchAt, end };
  return [
    {
      now: 0,
      select: first,
      shown: null,
      runs: [{ ...one, state: "pending", cancelled: false }],
      active: lines.send,
      caption: `The page opens on ${first}. The effect's first run sets loading and asks for ${first}, which takes ${slow} ms.`,
    },
    {
      now: switchAt,
      select: second,
      shown: null,
      runs: [
        { ...one, state: "pending", cancelled: guarded },
        { ...two, state: "pending", cancelled: false },
      ],
      active: guarded ? lines.cleanup : lines.send,
      caption: guarded
        ? `At ${switchAt} ms you choose ${second}. React calls the first run's cleanup, so that run's cancelled becomes true. Then the second run asks for ${second}.`
        : `At ${switchAt} ms you choose ${second}. The effect runs again and asks for ${second}. Nothing tells the first run it is out of date, so both requests are in flight.`,
    },
    {
      now: end,
      select: second,
      shown: second,
      runs: [
        { ...one, state: "pending", cancelled: guarded },
        { ...two, state: "applied", cancelled: false },
      ],
      active: lines.answer,
      caption: `At ${end} ms ${second} answers first. The second run stores those products, and the list matches the select.`,
    },
    {
      now: slow,
      select: second,
      shown: guarded ? second : first,
      runs: [
        { ...one, state: guarded ? "ignored" : "stale", cancelled: guarded },
        { ...two, state: "applied", cancelled: false },
      ],
      active: lines.answer,
      caption: guarded
        ? `At ${slow} ms the ${first} answer finally arrives. The first run checks cancelled, finds true, and does nothing.`
        : `At ${slow} ms the ${first} answer finally arrives, and the first run stores it. The select says ${second}, but the list shows ${first}.`,
    },
    {
      now: slow,
      select: second,
      shown: guarded ? second : first,
      runs: [
        { ...one, state: guarded ? "ignored" : "stale", cancelled: guarded },
        { ...two, state: "applied", cancelled: false },
      ],
      active: -1,
      caption: guarded
        ? "Each run has its own cancelled flag, and the cleanup marks the old run as replaced. The request still finished, but its answer was ignored."
        : "The answer that arrives last wins, not the question asked last. Switch to the cancelled flag above and step through again.",
    },
  ];
}

export function stepCount() {
  return 5;
}

const STATE = {
  pending: { tone: "accent", text: "in flight" },
  applied: { tone: "success", text: "✓ stored" },
  stale: { tone: "danger", text: "✗ stored, stale" },
  ignored: { tone: "muted", text: "ignored" },
};

function Lane({ run, index, now, total, guarded }) {
  const arrived = now >= run.end;
  const width = Math.min(now, run.end) - run.start;
  const state = STATE[run.state];
  return (
    <li className="stale-response__lane">
      <p className="stale-response__label">
        <span>
          Run {index + 1}: <span className="demo-mono">{run.name}</span>
        </span>
        <Chip tone={state.tone}>{state.text}</Chip>
      </p>
      <div className="stale-response__track" aria-hidden="true">
        <span
          className={`stale-response__bar stale-response__bar--${run.state}`}
          style={{
            left: `${(run.start / total) * 100}%`,
            width: `${(Math.max(width, 0) / total) * 100}%`,
          }}
        />
      </div>
      <p className="stale-response__times meta">
        Sent at {run.start} ms{arrived ? `, answered at ${run.end} ms` : ""}
        {guarded && `. cancelled: ${run.cancelled}`}
      </p>
    </li>
  );
}

export default function StaleResponse({ props, step }) {
  const setup = settings(props);
  const [version, setVersion] = useState(setup.flag ? "flag" : "plain");
  const guarded = version === "flag";
  const stage = stageAt(stages(setup, guarded), step);
  const total = setup.slow;
  const matches = stage.shown === null || stage.shown === stage.select;
  const products = stage.shown ? (PRODUCTS[stage.shown] ?? [`${stage.shown} products`]) : [];

  return (
    <div className="stale-response">
      <Choice legend="The effect" options={VERSIONS} value={version} onChange={setVersion} />
      <Panel title={`Requests, at ${stage.now} ms`}>
        <ol className="stale-response__lanes" aria-label="Requests">
          {stage.runs.map((run, index) => (
            <Lane
              key={run.name}
              run={run}
              index={index}
              now={stage.now}
              total={total}
              guarded={guarded}
            />
          ))}
        </ol>
      </Panel>
      <div className="stale-response__grid">
        <CodeView
          lines={guarded ? FLAGGED : PLAIN}
          active={stage.active}
          label="The effect in App"
        />
        <Panel title="Page">
          <p className="stale-response__select">
            Category: <span className="demo-mono">{stage.select}</span>
          </p>
          {stage.shown === null ? (
            <p className="demo-empty">Loading products...</p>
          ) : (
            <>
              <ul className="stale-response__products" aria-label="Products shown">
                {products.map((title) => (
                  <li key={title}>{title}</li>
                ))}
              </ul>
              <Chip tone={matches ? "success" : "danger"}>
                {matches ? "✓ matches the select" : `✗ ${stage.shown}, not ${stage.select}`}
              </Chip>
            </>
          )}
        </Panel>
      </div>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
