import { useState } from "react";
import { Caption, Chip, Choice, Panel, stageAt } from "../kit.jsx";
import { describeOperand, describeResult, explain, parse } from "./engine.js";
import "./styles.css";

export const id = "type-coercion";

export const defaults = {
  expressions: ['"5" + 1', '"5" - 1', '"5" == 5', '0 == ""', "null == undefined", "true + 1"],
};

const MAX_STEPS = 8;
const MAX_CHOICES = 8;

const INTRO = {
  "+": "+ either adds or joins, and the types decide which.",
  "-": "- only subtracts, so it wants numbers.",
  "*": "* only multiplies, so it wants numbers.",
  "/": "/ only divides, so it wants numbers.",
  "==": "== converts mismatched types before it compares.",
  "===": "=== compares without converting anything.",
};

function explained(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const parsed = parse(item);
    if (!parsed) continue;
    const result = explain(parsed);
    if (result.steps.length > MAX_STEPS || seen.has(result.source)) continue;
    seen.add(result.source);
    out.push(result);
    if (out.length === MAX_CHOICES) break;
  }
  return out;
}

function settings(props) {
  const given = explained(props.expressions);
  const items = given.length > 0 ? given : explained(defaults.expressions);
  const depth = Math.max(...items.map((item) => item.steps.length));
  return { items, depth };
}

function stagesFor(item, depth) {
  const intro = {
    kind: "intro",
    shown: 0,
    caption: `${item.source}: ${describeOperand(item.left).kind} on the left and ${describeOperand(item.right).kind} on the right. ${INTRO[item.operator]}`,
  };
  const steps = item.steps.map((entry, index) => ({
    kind: "step",
    shown: index + 1,
    caption: entry.text,
  }));
  while (steps.length < depth) {
    steps.push({
      kind: "step",
      shown: item.steps.length,
      caption: `Nothing is left to convert: ${item.source} has settled on ${describeResult(item.result)}.`,
    });
  }
  const strict =
    item.strict && item.strict.value !== item.result.value
      ? ` With ===, which never converts, the answer would be ${item.strict.value}.`
      : item.strict
        ? " With ===, which never converts, the answer happens to be the same."
        : "";
  const hint = item.numeric ? ` To add instead, convert on purpose: ${item.numeric}.` : "";
  const result = {
    kind: "result",
    shown: item.steps.length,
    caption: `${item.source} evaluates to ${describeResult(item.result)}.${strict}${hint}`,
  };
  return [intro, ...steps, result];
}

export function stepCount(props) {
  return settings(props).depth + 2;
}

export default function TypeCoercion({ props, step }) {
  const { items, depth } = settings(props);
  const [choice, setChoice] = useState(0);
  const item = items[Math.min(choice, items.length - 1)];
  const stage = stageAt(stagesFor(item, depth), step);
  const operands = [
    ["Left", describeOperand(item.left)],
    ["Right", describeOperand(item.right)],
  ];

  return (
    <div className="type-coercion">
      <Choice
        legend="Expression"
        options={items.map((entry, index) => ({
          value: String(index),
          label: <span className="demo-mono type-coercion__option">{entry.source}</span>,
        }))}
        value={String(Math.min(choice, items.length - 1))}
        onChange={(value) => setChoice(Number(value))}
      />
      <Panel title="Expression" className="type-coercion__now">
        <p className="demo-mono type-coercion__current">{item.source}</p>
        <ul className="type-coercion__operands" aria-label="Operands">
          {operands.map(([side, operand]) => (
            <li key={side}>
              <span className="type-coercion__side">{side}:</span>
              <span className="demo-mono type-coercion__literal">{operand.text}</span>
              <Chip>{operand.kind}</Chip>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Steps" sunken className="type-coercion__steps">
        {stage.shown === 0 ? (
          <p className="demo-empty">No conversion yet. Step to apply the operator&apos;s rules.</p>
        ) : (
          <ol className="type-coercion__list" aria-label="Steps">
            {item.steps.slice(0, stage.shown).map((entry, index) => {
              const latest = index === stage.shown - 1;
              const tone = latest ? (stage.kind === "result" ? "success" : "accent") : undefined;
              return (
                <li key={index} className={latest ? "is-latest" : undefined}>
                  <Chip tone={tone}>{entry.rule}</Chip>
                  <span className="demo-mono type-coercion__expr">
                    <span aria-hidden="true">→ </span>
                    {entry.expr}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
