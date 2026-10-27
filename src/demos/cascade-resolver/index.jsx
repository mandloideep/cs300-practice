import { useState } from "react";
import { Caption, Chip, CodeView, Panel, Row, Stack, TextField } from "../kit.jsx";
import {
  buildTree,
  compareSpecificity,
  flatten,
  matchingComplex,
  parseSelector,
  specificity,
} from "../selector-matcher/selectors.js";
import "./styles.css";

export const id = "cascade-resolver";

export const defaults = { blue: "main article.card", brown: ".is-warning" };

const RULES = {
  blue: { name: "blue", value: "var(--accent)", tone: "accent" },
  brown: { name: "brown", value: "var(--warning)", tone: "warning" },
};

const COLUMNS = ["ids", "classes", "elements"];

const PAGE = buildTree({
  tag: "html",
  children: [
    {
      tag: "body",
      children: [
        {
          tag: "main",
          children: [
            { tag: "h1" },
            { tag: "article", classes: ["card", "is-warning"] },
            { tag: "article", classes: ["card"] },
            { tag: "section", id: "steps" },
          ],
        },
      ],
    },
  ],
});

const CARD = flatten(PAGE).find(({ element }) => element.classes.includes("is-warning")).element;

const MARKUP = [
  "<main>",
  "  <h1>Study resources</h1>",
  '  <article class="card is-warning">',
  "    <h2>Deployment link</h2>",
];

const STAGES = ["setup", "match", "ids", "classes", "elements", "result"];

function settings(props) {
  const pick = (value, fallback) =>
    typeof value === "string" && value.trim() !== "" && value.length <= 60 ? value : fallback;
  return { blue: pick(props.blue, defaults.blue), brown: pick(props.brown, defaults.brown) };
}

export function stepCount() {
  return STAGES.length;
}

function weigh(key, text) {
  const parsed = parseSelector(text);
  const hits = matchingComplex(CARD, parsed);
  const counts =
    parsed.status !== "ok"
      ? null
      : (hits.length ? hits : parsed.list)
          .map(specificity)
          .reduce((best, next) => (compareSpecificity(next, best) > 0 ? next : best));
  return { key, text: text.trim(), parsed, matches: hits.length > 0, counts };
}

function resolve(rules) {
  const [first, later] = rules;
  const live = rules.filter((rule) => rule.matches);
  if (live.length < 2) return { winner: live[0] ?? null, decidedAt: null };
  for (let column = 0; column < 3; column += 1) {
    const diff = first.counts[column] - later.counts[column];
    if (diff !== 0) return { winner: diff > 0 ? first : later, decidedAt: column };
  }
  return { winner: later, decidedAt: 3 };
}

function matchWords(rule) {
  if (rule.parsed.status === "unsupported") {
    return `the ${rule.key} rule uses ${rule.parsed.what}, which this explainer does not handle`;
  }
  if (rule.parsed.status !== "ok") return `the ${rule.key} rule's selector is not valid`;
  return `${rule.text} ${rule.matches ? "does" : "does not"}`;
}

function captionFor(stage, rules, outcome) {
  const [first, later] = rules;
  const { winner, decidedAt } = outcome;
  const both = first.matches && later.matches;
  if (stage === "setup") {
    return `Two rules set color on the same card: the blue rule and the brown rule, with the ${later.key} one later in the file. The browser has to pick one value.`;
  }
  if (stage === "match") {
    const said = `First, the browser checks that each selector matches the card: ${matchWords(first)}, and ${matchWords(later)}.`;
    if (both) return `${said} Both apply, so they compete.`;
    return winner
      ? `${said} Only the ${winner.key} rule applies, so it wins without a contest.`
      : `${said} Neither applies, so the card keeps the color it inherits.`;
  }
  if (stage !== "result") {
    const column = COLUMNS.indexOf(stage);
    if (!both) return "With fewer than two rules in the contest, there is nothing to weigh.";
    const a = first.counts[column];
    const b = later.counts[column];
    if (column < decidedAt) {
      return `Count the ${stage}: ${a} and ${b}, a tie. On to the next count.`;
    }
    if (column === decidedAt) {
      return `Count the ${stage}: the ${winner.key} rule has ${Math.max(a, b)} and the other has ${Math.min(a, b)}. More ${stage} wins, and the counts after this one are never looked at.`;
    }
    return `The ${COLUMNS[decidedAt]} already decided it, so the ${stage} do not matter.`;
  }
  const inline = "An inline style attribute would beat both, and !important beats them all.";
  if (!winner) return `Neither rule applies, so the card keeps its inherited text color. ${inline}`;
  const reason = !both
    ? `The ${winner.key} rule is the only one that matches`
    : decidedAt === 3
      ? `All three counts tie, so source order decides: the ${winner.key} rule comes later in the file`
      : `The ${winner.key} rule is more specific`;
  return `${reason}, so the card's text is ${winner.key}. ${inline}`;
}

function Rule({ rule, position, onChange, verdict }) {
  const { name, value, tone } = RULES[rule.key];
  return (
    <div className="cascade-resolver__rule">
      <p className="cascade-resolver__position">
        <Chip tone={tone}>The {name} rule</Chip>
        <span className="meta">{position}</span>
      </p>
      <TextField label={`Selector of the ${name} rule`} value={rule.raw} onChange={onChange} />
      <CodeView
        lines={[`${rule.text || "…"} {`, `  color: ${value};`, "}"]}
        label={`The ${name} rule`}
      />
      {verdict}
    </div>
  );
}

export default function CascadeResolver({ props, step }) {
  const setup = settings(props);
  const stage = STAGES[Math.max(0, Math.min(STAGES.length - 1, step))];
  const [selectors, setSelectors] = useState(setup);
  const [order, setOrder] = useState(["blue", "brown"]);
  const rules = order.map((key) => ({ ...weigh(key, selectors[key]), raw: selectors[key] }));
  const outcome = resolve(rules);
  const at = STAGES.indexOf(stage);
  const active = at >= 2 && at <= 4 ? at - 2 : -1;
  const done = stage === "result";

  return (
    <div className="cascade-resolver">
      <Row>
        <Panel title="styles.css, in file order">
          <Stack>
            {rules.map((rule, index) => (
              <Rule
                key={rule.key}
                rule={rule}
                position={index === 0 ? "first in the file" : "later in the file"}
                onChange={(value) => setSelectors((current) => ({ ...current, [rule.key]: value }))}
                verdict={
                  at >= 1 && (
                    <p>
                      {rule.matches ? (
                        <Chip tone="success">✓ matches the card</Chip>
                      ) : (
                        <Chip tone="danger">✗ does not match the card</Chip>
                      )}
                    </p>
                  )
                }
              />
            ))}
            <p>
              <button
                type="button"
                className="button button--small"
                onClick={() => setOrder((current) => [current[1], current[0]])}
              >
                Swap their order in the file
              </button>
            </p>
          </Stack>
        </Panel>
        <Stack>
          <Panel title="The element">
            <CodeView lines={MARKUP} marks={{ 2: "good" }} label="index.html" />
          </Panel>
          <Panel title="Specificity">
            <table className="demo-table cascade-resolver__table">
              <thead>
                <tr>
                  <th scope="col">Rule</th>
                  {COLUMNS.map((name, column) => (
                    <th
                      key={name}
                      scope="col"
                      className={column === active ? "cascade-resolver__now" : undefined}
                    >
                      {name[0].toUpperCase() + name.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr
                    key={rule.key}
                    className={done && outcome.winner?.key === rule.key ? "is-active" : undefined}
                  >
                    <th scope="row">{rule.key}</th>
                    {COLUMNS.map((name, column) => (
                      <td
                        key={name}
                        className={column === active ? "cascade-resolver__now" : undefined}
                      >
                        {at >= 2 && rule.counts ? rule.counts[column] : "?"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {done && (
              <p className="cascade-resolver__winner">
                {outcome.winner ? (
                  <Chip tone="success">✓ The {outcome.winner.key} rule wins</Chip>
                ) : (
                  <Chip tone="muted">No rule applies</Chip>
                )}
              </p>
            )}
          </Panel>
          <Panel title="The card">
            <div
              className={`cascade-resolver__card${done && outcome.winner ? ` is-${outcome.winner.key}` : ""}`}
            >
              <span className="cascade-resolver__eyebrow">Needs a check</span>
              <span className="cascade-resolver__heading">Deployment link</span>
              <span className="meta">
                Text color:{" "}
                {done
                  ? outcome.winner
                    ? `${outcome.winner.key}`
                    : "inherited"
                  : "not decided yet"}
              </span>
            </div>
          </Panel>
        </Stack>
      </Row>
      <Caption>{captionFor(stage, rules, outcome)}</Caption>
    </div>
  );
}
