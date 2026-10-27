import { useState } from "react";
import { Caption, Choice, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "jsx-to-calls";

export const defaults = { view: "jsx" };

const JSX_LINES = [
  'const course = "CS300";',
  'const topics = ["JSX expressions", "Root rendering"];',
  "",
  "const page = (",
  "  <main>",
  "    <h1>React, Vite, JSX, and Rendering</h1>",
  "    <p>{course} renders {topics.length} concepts from data.</p>",
  '    <p className="lead">Week {9 + 1}</p>',
  "  </main>",
  ");",
];

const CALL_LINES = [
  'import { jsx, jsxs } from "react/jsx-runtime";',
  "",
  'const course = "CS300";',
  'const topics = ["JSX expressions", "Root rendering"];',
  "",
  'const page = jsxs("main", {',
  "  children: [",
  '    jsx("h1", { children: "React, Vite, JSX, and Rendering" }),',
  '    jsxs("p", {',
  '      children: [course, " renders ", topics.length, " concepts from data."],',
  "    }),",
  '    jsxs("p", { className: "lead", children: ["Week ", 9 + 1] }),',
  "  ],",
  "});",
];

const VIEWS = [
  { value: "jsx", label: "JSX you write" },
  { value: "calls", label: "Calls it compiles to" },
];

const STAGES = [
  {
    jsx: [],
    calls: [],
    caption:
      "JSX like this is not JavaScript a browser can run. Before the page loads, the build tool rewrites every tag as a function call. Switch the view to compare the two.",
  },
  {
    jsx: [5],
    calls: [7],
    caption:
      'A tag becomes a call: <h1>...</h1> becomes jsx("h1", { children: "React, Vite, JSX, and Rendering" }). The tag name is the first argument, and what sits between the tags becomes the children prop.',
  },
  {
    jsx: [6],
    calls: [8, 9, 10],
    caption:
      'The braces disappear. course and topics.length are plain JavaScript expressions in the children array, between the text pieces " renders " and " concepts from data.".',
  },
  {
    jsx: [7],
    calls: [11],
    caption:
      'An attribute becomes a prop in the same object: className="lead" becomes className: "lead", next to children. 9 + 1 stays an expression, so React shows 10.',
  },
  {
    jsx: [4, 8],
    calls: [5, 6, 12, 13],
    caption:
      "main has three children, so they go in an array and the call is jsxs, the version for several children. The h1 has one child, so its call is jsx.",
  },
  {
    jsx: [],
    calls: [0],
    caption:
      "The compiler adds one line you never write: it imports jsx and jsxs from react/jsx-runtime. That is why a file with JSX does not need to import React itself.",
  },
  {
    jsx: [3],
    calls: [5],
    result: true,
    caption:
      "Running the calls builds plain objects called React elements. Each has a type, such as main or h1, and props holding its children. React reads these objects to build the DOM.",
  },
];

const RESULT = [
  { at: "page", text: 'type: "main", props.children: three elements' },
  { at: "[0]", text: 'type: "h1", children: "React, Vite, JSX, and Rendering"' },
  { at: "[1]", text: 'type: "p", children: ["CS300", " renders ", 2, " concepts from data."]' },
  { at: "[2]", text: 'type: "p", className: "lead", children: ["Week ", 10]' },
];

export function stepCount() {
  return STAGES.length;
}

function marksOf(lines) {
  return Object.fromEntries(lines.map((line) => [line, "active"]));
}

export default function JsxToCalls({ props, step }) {
  const first = props.view === "calls" ? "calls" : defaults.view;
  const [view, setView] = useState(first);
  const stage = stageAt(STAGES, step);
  const calls = view === "calls";
  return (
    <div className="jsx-to-calls">
      <Choice legend="Show" options={VIEWS} value={view} onChange={setView} />
      <Panel title={calls ? "After the build" : "What you write"} className="jsx-to-calls__code">
        <CodeView
          lines={calls ? CALL_LINES : JSX_LINES}
          marks={marksOf(calls ? stage.calls : stage.jsx)}
          label={calls ? "The compiled calls" : "The JSX"}
        />
      </Panel>
      {stage.result && (
        <Panel title="The value of page" sunken className="jsx-to-calls__result">
          <ul className="jsx-to-calls__elements" aria-label="React elements">
            {RESULT.map((row) => (
              <li key={row.at}>
                <span className="jsx-to-calls__at">{row.at}</span>
                <span className="demo-mono">{row.text}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
