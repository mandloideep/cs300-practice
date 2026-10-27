import { useState } from "react";
import { Caption, Chip, Choice, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "arrow-equivalence";

export const defaults = { name: "double", param: "score", body: "score * 2" };

const IDENTIFIER = /^[A-Za-z_$][\w$]{0,15}$/;
const RESERVED = new Set(["function", "return", "const", "let", "var", "new", "this"]);

function settings(props) {
  const ok = (value) => typeof value === "string" && IDENTIFIER.test(value) && !RESERVED.has(value);
  const name = ok(props.name) ? props.name : defaults.name;
  const param = ok(props.param) && props.param !== name ? props.param : defaults.param;
  const body =
    typeof props.body === "string" &&
    props.body.trim() !== "" &&
    props.body.length <= 30 &&
    !/[{};\n]|\breturn\b/.test(props.body)
      ? props.body.trim()
      : defaults.body;
  return { name, param, body };
}

function forms({ name, param, body }) {
  const head = { text: `const ${name} =`, part: "name" };
  const params = { text: `(${param})`, part: "params" };
  const expr = { text: body, part: "expr" };
  return {
    classic: [
      head,
      { text: " " },
      { text: "function", part: "keyword" },
      { text: " " },
      params,
      { text: " " },
      { text: "{", part: "braces" },
      { text: "\n  " },
      { text: "return", part: "braces" },
      { text: " " },
      expr,
      { text: ";", part: "braces" },
      { text: "\n" },
      { text: "}", part: "braces" },
      { text: ";" },
    ],
    arrow: [
      head,
      { text: " " },
      params,
      { text: " " },
      { text: "=>", part: "keyword" },
      { text: " " },
      expr,
      { text: ";" },
    ],
    braced: [
      head,
      { text: " " },
      params,
      { text: " " },
      { text: "=>", part: "keyword" },
      { text: " " },
      { text: "{", part: "braces" },
      { text: " " },
      { text: "return", part: "braces" },
      { text: " " },
      expr,
      { text: ";", part: "braces" },
      { text: " " },
      { text: "}", part: "braces" },
      { text: ";" },
    ],
  };
}

function stages({ name, param, body }) {
  return [
    {
      match: [],
      drop: [],
      caption: `Two ways to write the same function: a function expression and an arrow function. Step through to match each part of one with the other.`,
    },
    {
      match: ["name"],
      drop: [],
      caption: `const ${name} = is the same in both. Either way, a function is a value, and the const stores it under the name ${name}.`,
    },
    {
      match: ["keyword"],
      drop: [],
      caption:
        "The keyword function goes away. In its place, an arrow => comes after the parameters.",
    },
    {
      match: ["params"],
      drop: [],
      caption: `The parameter list (${param}) stays exactly as it was, in the same place before the body.`,
    },
    {
      match: ["expr"],
      drop: ["braces"],
      caption: `The braces and return go away together. Without braces, the arrow's body is one expression, ${body}, and its value is returned.`,
    },
    {
      match: ["braces"],
      drop: [],
      braced: true,
      caption: `An arrow function can keep its braces, but then it needs return too. (${param}) => { ${body}; } returns undefined.`,
    },
    {
      match: ["name", "keyword", "params", "expr"],
      drop: [],
      caption: `All the forms make the same function, and ${name}(…) calls them all the same way. The short arrow form is the usual choice for small callbacks like the ones passed to map and filter.`,
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

const VIEWS = [
  { value: "both", label: "Both" },
  { value: "classic", label: "function" },
  { value: "arrow", label: "=>" },
];

function toLines(segments) {
  const lines = [[]];
  for (const segment of segments) {
    const pieces = segment.text.split("\n");
    pieces.forEach((piece, index) => {
      if (index > 0) lines.push([]);
      if (piece !== "") lines[lines.length - 1].push({ ...segment, text: piece });
    });
  }
  return lines;
}

function Code({ segments, stage, label, side }) {
  return (
    <pre className="arrow-equivalence__code" aria-label={label}>
      <code>
        {toLines(segments).map((line, row) => (
          <span key={row} className="arrow-equivalence__line">
            {line.map((segment, index) => {
              const match = segment.part && stage.match.includes(segment.part);
              const drop = segment.part && stage.drop.includes(segment.part) && side === "classic";
              if (!match && !drop) return <span key={index}>{segment.text}</span>;
              return (
                <mark
                  key={index}
                  className={drop ? "arrow-equivalence__mark is-drop" : "arrow-equivalence__mark"}
                >
                  {segment.text}
                </mark>
              );
            })}
          </span>
        ))}
      </code>
    </pre>
  );
}

export default function ArrowEquivalence({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(stages(setup), step);
  const code = forms(setup);
  const [view, setView] = useState("both");
  const showClassic = view !== "arrow";
  const showArrow = view !== "classic";

  return (
    <div className="arrow-equivalence">
      <Choice legend="Show" options={VIEWS} value={view} onChange={setView} />
      <div className="arrow-equivalence__forms">
        {showClassic && (
          <Panel title="Function expression">
            <Code
              segments={code.classic}
              stage={stage}
              label="Function expression"
              side="classic"
            />
          </Panel>
        )}
        {showArrow && (
          <Panel title="Arrow function">
            <Code segments={code.arrow} stage={stage} label="Arrow function" side="arrow" />
            {stage.braced && (
              <>
                <p className="arrow-equivalence__also">The same arrow with braces:</p>
                <Code
                  segments={code.braced}
                  stage={stage}
                  label="Arrow function with braces"
                  side="braced"
                />
              </>
            )}
          </Panel>
        )}
      </div>
      {(stage.match.length > 0 || stage.drop.length > 0) && (
        <p className="arrow-equivalence__legend">
          <Chip tone="accent">Highlighted: the matching part</Chip>
          {stage.drop.length > 0 && (
            <Chip tone="warning">Struck through: dropped in the arrow</Chip>
          )}
        </p>
      )}
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
