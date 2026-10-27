import { Caption, Cells, Chip, CodeView, Panel, Row, Stack, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "array-methods";

export const defaults = { scores: [95, 73, 100, 62, 45] };

const METHODS = ["find", "some", "every", "slice", "sort", "splice"];

function settings(props) {
  const scores = props.scores;
  const valid =
    Array.isArray(scores) &&
    scores.length >= 3 &&
    scores.length <= 8 &&
    scores.every(
      (score) => typeof score === "number" && Number.isFinite(score) && Math.abs(score) < 1e6,
    );
  return { scores: valid ? scores : defaults.scores };
}

function list(values) {
  return `[${values.join(", ")}]`;
}

function stages({ scores }) {
  const start = [...scores];
  const lowAt = start.findIndex((score) => score < 60);
  const highAt = start.findIndex((score) => score >= 90);
  const failAt = start.findIndex((score) => score < 60);
  const middle = start.slice(1, 3);
  const asText = [...start].sort();
  const byValue = [...start].sort((a, b) => a - b);
  const removedFrom = [...byValue];
  const removed = removedFrom.splice(1, 2);
  const outOfOrder = asText.findIndex((value, index) => index > 0 && asText[index - 1] > value);
  const sortNote =
    outOfOrder === -1
      ? `These numbers happen to come out in order, but [10, 9, 1].sort() gives [1, 10, 9].`
      : `So ${asText[outOfOrder - 1]} lands before ${asText[outOfOrder]}: as text, "${asText[outOfOrder - 1]}" comes first.`;

  return [
    {
      line: 0,
      array: start,
      marks: {},
      returns: null,
      caption: `scores holds ${start.length} numbers. Each of the next lines calls one method on this same array. Watch which ones change it.`,
    },
    {
      line: 1,
      method: "find",
      array: start,
      marks: lowAt === -1 ? {} : { [lowAt]: "accent" },
      returns: { kind: "value", text: lowAt === -1 ? "undefined" : String(start[lowAt]) },
      caption:
        lowAt === -1
          ? "No score is below 60, so find returns undefined. scores is unchanged."
          : `find returns the first score below 60, ${start[lowAt]} at index ${lowAt}, and stops looking. scores is unchanged.`,
    },
    {
      line: 2,
      method: "some",
      array: start,
      marks: highAt === -1 ? {} : { [highAt]: "accent" },
      returns: { kind: "value", text: String(highAt !== -1) },
      caption:
        highAt === -1
          ? "some asks whether at least one score is 90 or more. None is, so it returns false. scores is unchanged."
          : `some asks whether at least one score is 90 or more. ${start[highAt]} at index ${highAt} is, so it returns true and stops. scores is unchanged.`,
    },
    {
      line: 3,
      method: "every",
      array: start,
      marks: failAt === -1 ? {} : { [failAt]: "danger" },
      returns: { kind: "value", text: String(failAt === -1) },
      caption:
        failAt === -1
          ? "every asks whether all scores are 60 or more. They are, so it returns true. scores is unchanged."
          : `every asks whether all scores are 60 or more. ${start[failAt]} at index ${failAt} is not, so it returns false and stops there. scores is unchanged.`,
    },
    {
      line: 4,
      method: "slice",
      array: start,
      marks: { 1: "accent", 2: "accent" },
      returns: { kind: "array", items: middle, label: "A new array" },
      caption: `slice(1, 3) copies the items at indexes 1 and 2 into a new array, ${list(middle)}. The end index is not included, and scores is unchanged.`,
    },
    {
      line: 5,
      method: "sort",
      array: asText,
      marks: {},
      changed: true,
      returns: { kind: "same" },
      caption: `sort() with no function compares the items as strings. ${sortNote} And it rearranged scores itself.`,
    },
    {
      line: 6,
      method: "sort",
      array: byValue,
      marks: {},
      changed: true,
      returns: { kind: "same" },
      caption: `Given (a, b) => a - b, sort orders by value: ${list(byValue)}. Again it changes scores in place and returns that same array.`,
    },
    {
      line: 7,
      method: "splice",
      array: removedFrom,
      marks: {},
      changed: true,
      returns: { kind: "array", items: removed, label: "The removed items" },
      caption: `splice(1, 2) removes 2 items starting at index 1 and returns them, ${list(removed)}. scores is now shorter: ${list(removedFrom)}.`,
    },
    {
      line: -1,
      method: null,
      array: removedFrom,
      marks: {},
      returns: null,
      caption:
        "find, some, every, and slice only read scores. sort and splice change it in place, so for React state, copy first: [...scores].sort((a, b) => a - b).",
    },
  ];
}

function code({ scores }) {
  return [
    `const scores = ${list(scores)};`,
    "const low = scores.find((score) => score < 60);",
    "const anyHigh = scores.some((score) => score >= 90);",
    "const allPass = scores.every((score) => score >= 60);",
    "const middle = scores.slice(1, 3);",
    "scores.sort();",
    "scores.sort((a, b) => a - b);",
    "const removed = scores.splice(1, 2);",
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

function Returns({ returns }) {
  if (!returns) return <p className="demo-empty">No method called on this line.</p>;
  if (returns.kind === "value") return <Chip>{returns.text}</Chip>;
  if (returns.kind === "same")
    return <p className="array-methods__same">The same array, scores, now rearranged.</p>;
  return (
    <div className="array-methods__returned">
      <span className="array-methods__note">{returns.label}</span>
      {returns.items.length ? (
        <Cells items={returns.items.map(String)} label={returns.label} showIndex={false} />
      ) : (
        <Chip>[]</Chip>
      )}
    </div>
  );
}

export default function ArrayMethods({ props, step }) {
  const setup = settings(props);
  const all = stages(setup);
  const index = Math.max(0, Math.min(all.length - 1, step));
  const stage = stageAt(all, index);
  const done = new Set(all.slice(1, index + 1).map((item) => item.method));
  const changed = (method) => method === "sort" || method === "splice";
  const marks = Object.fromEntries(
    code(setup)
      .map((_, at) => [at, "done"])
      .slice(0, stage.line === -1 ? 8 : stage.line),
  );
  return (
    <div className="array-methods">
      <Stack>
        <CodeView lines={code(setup)} active={stage.line} marks={marks} label="main.js" />
        <Panel title="scores" className="array-methods__array">
          <Cells items={stage.array.map(String)} marks={stage.marks} label="scores" />
          {stage.method && (
            <p className="array-methods__state">
              {stage.changed ? (
                <Chip tone="warning">≠ changed in place</Chip>
              ) : (
                <Chip tone="success">✓ unchanged</Chip>
              )}
            </p>
          )}
        </Panel>
        <Row>
          <Panel title="Returns">
            <Returns returns={stage.returns} />
          </Panel>
          <Panel title="Changes scores?">
            <ul className="array-methods__ledger" aria-label="Which methods change scores">
              {METHODS.map((method) => (
                <li key={method}>
                  <span className="demo-mono">{method}</span>
                  {!done.has(method) ? (
                    <Chip tone="muted">not yet</Chip>
                  ) : changed(method) ? (
                    <Chip tone="warning">yes</Chip>
                  ) : (
                    <Chip tone="success">no</Chip>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        </Row>
      </Stack>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
