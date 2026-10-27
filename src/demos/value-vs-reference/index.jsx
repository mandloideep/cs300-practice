import { Box, Caption, Chip, CodeView, ConsoleView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "value-vs-reference";

export const defaults = { name: "Alice", score: 95, next: 100 };

function finite(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function settings(props) {
  const name =
    typeof props.name === "string" && /^[A-Z][a-z]{0,11}$/.test(props.name)
      ? props.name
      : defaults.name;
  const score = finite(props.score, defaults.score);
  const wanted = finite(props.next, defaults.next);
  const next = wanted === score ? score + 1 : wanted;
  return { name, score, next, variable: name.toLowerCase() };
}

function code({ name, score, next, variable }) {
  return [
    `let score = ${score};`,
    "let copy = score;",
    `copy = ${next};`,
    `const ${variable} = { name: "${name}", score: ${score} };`,
    `const same = ${variable};`,
    `same.score = ${next};`,
    `console.log(score, copy, ${variable}.score);`,
  ];
}

function stages({ score, next, variable }) {
  return [
    {
      line: 0,
      vars: [{ name: "score", value: score }],
      object: null,
      caption: `let score = ${score} makes a box named score and puts the number ${score} in it.`,
    },
    {
      line: 1,
      vars: [
        { name: "score", value: score },
        { name: "copy", value: score, fresh: true },
      ],
      object: null,
      caption: `let copy = score makes a second box and copies the number into it. Now there are two ${score}s, one in each box.`,
    },
    {
      line: 2,
      vars: [
        { name: "score", value: score },
        { name: "copy", value: next, fresh: true },
      ],
      object: null,
      caption: `copy = ${next} changes only the copy box. score still holds ${score}, because the two boxes never shared anything.`,
    },
    {
      line: 3,
      vars: [
        { name: "score", value: score },
        { name: "copy", value: next },
        { name: variable, ref: true, fresh: true },
      ],
      object: { score, changed: false },
      caption: `The object literal makes one object, and ${variable} holds an arrow to it, a reference, not the object itself.`,
    },
    {
      line: 4,
      vars: [
        { name: "score", value: score },
        { name: "copy", value: next },
        { name: variable, ref: true },
        { name: "same", ref: true, fresh: true },
      ],
      object: { score, changed: false },
      caption: `const same = ${variable} copies the arrow, not the object. Two names now point at the same single object.`,
    },
    {
      line: 5,
      vars: [
        { name: "score", value: score },
        { name: "copy", value: next },
        { name: variable, ref: true },
        { name: "same", ref: true },
      ],
      object: { score: next, changed: true },
      caption: `same.score = ${next} follows the arrow and changes the one object. ${variable}.score is ${next} too, because ${variable} points at the same object.`,
    },
    {
      line: 6,
      vars: [
        { name: "score", value: score },
        { name: "copy", value: next },
        { name: variable, ref: true },
        { name: "same", ref: true },
      ],
      object: { score: next, changed: false },
      log: `${score} ${next} ${next}`,
      caption: `The log prints ${score} ${next} ${next}. Changing copy left score alone; changing same changed what ${variable} sees. That difference is why React asks for a new object instead of a changed one.`,
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

export default function ValueVsReference({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(stages(setup), step);
  const lines = code(setup);
  const marks = Object.fromEntries(
    lines.map((_, index) => [index, "done"]).filter(([index]) => index < stage.line),
  );
  return (
    <div className="value-vs-reference">
      <CodeView lines={lines} active={stage.line} marks={marks} label="main.js" />
      <div className="value-vs-reference__memory">
        <Panel title="Variables">
          <ul className="value-vs-reference__vars" aria-label="Variables">
            {stage.vars.map((item) => (
              <li key={item.name}>
                <Box
                  label={item.name}
                  tone={item.fresh ? "accent" : undefined}
                  className="value-vs-reference__var"
                >
                  {item.ref ? (
                    <span className="value-vs-reference__ref">
                      <span aria-hidden="true">→ </span>
                      object 1
                    </span>
                  ) : (
                    <span className="demo-mono value-vs-reference__value">{item.value}</span>
                  )}
                </Box>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Objects">
          {stage.object ? (
            <Box
              label="object 1"
              tone={stage.object.changed ? "warning" : undefined}
              className="value-vs-reference__object"
            >
              <span className="demo-mono">name: &quot;{setup.name}&quot;</span>
              <span className="demo-mono">
                score: {stage.object.score}
                {stage.object.changed && (
                  <Chip tone="warning" className="value-vs-reference__flag">
                    changed
                  </Chip>
                )}
              </span>
              <span className="value-vs-reference__holders">
                Pointed at by:{" "}
                {stage.vars
                  .filter((item) => item.ref)
                  .map((item) => item.name)
                  .join(" and ")}
              </span>
            </Box>
          ) : (
            <p className="demo-empty">No objects yet. Numbers live right in their boxes.</p>
          )}
        </Panel>
      </div>
      <ConsoleView lines={stage.log ? [stage.log] : []} fresh={stage.log ? 1 : 0} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
