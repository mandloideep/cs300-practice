import { Caption, Chip, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "strict-mode-double";

export const defaults = {};

const MAIN = [
  'createRoot(document.getElementById("root")).render(',
  "  <StrictMode>",
  "    <App />",
  "  </StrictMode>,",
  ");",
];

const PURE = [
  "export default function App() {",
  "  const [items] = useState(products);",
  '  console.log("Rendering App with", items.length, "products");',
  "  return <ProductList items={items} />;",
  "}",
];

const IMPURE = [
  "let renders = 0;",
  "export default function App() {",
  "  const [items] = useState(products);",
  "  renders += 1;",
  '  console.log("Render number", renders);',
  "  return <ProductList items={items} />;",
  "}",
];

const PURE_LOG = "Rendering App with 6 products";

const STAGES = [
  {
    file: "main",
    active: 2,
    calls: [],
    logs: [],
    page: false,
    caption:
      "Every Vite React project wraps App in StrictMode in main.jsx. While you develop, Strict Mode checks your components by doing some work twice on purpose.",
  },
  {
    file: "pure",
    active: 2,
    calls: [{ state: "running" }],
    logs: [{ text: PURE_LOG }],
    page: false,
    caption:
      "React calls App to render it. The function logs one line and returns JSX that describes a list of six products. Nothing is on the page yet.",
  },
  {
    file: "pure",
    active: 2,
    calls: [{ state: "done" }, { state: "running" }],
    logs: [{ text: PURE_LOG }, { text: PURE_LOG, second: true }],
    page: false,
    caption:
      "In development, Strict Mode calls App a second time with the same state, so the line is logged twice. With React DevTools installed, the console dims the second line rather than hiding it.",
  },
  {
    file: "pure",
    active: -1,
    calls: [{ state: "discarded" }, { state: "kept" }],
    logs: [{ text: PURE_LOG }, { text: PURE_LOG, second: true }],
    page: true,
    caption:
      "React keeps one result, the second, and throws the other away, then commits once. The page shows the list once: two calls, one render on the screen.",
  },
  {
    file: "impure",
    active: 3,
    calls: [
      { state: "discarded", note: "renders is 1" },
      { state: "kept", note: "renders is 2" },
    ],
    logs: [{ text: "Render number 1" }, { text: "Render number 2", second: true }],
    page: true,
    caption:
      "A pure component returns the same JSX both times, so the extra call is harmless. This one changes a variable outside itself, and the second call shows 2 where you expected 1: Strict Mode made the bug visible.",
  },
  {
    file: "pure",
    active: 2,
    calls: [{ state: "kept" }],
    logs: [{ text: PURE_LOG }],
    page: true,
    production: true,
    caption:
      "The production build calls App once and logs once. So count console lines per action, never in total, and fix the component rather than removing StrictMode.",
  },
];

export function stepCount() {
  return STAGES.length;
}

const CALL_TONES = { running: "accent", done: undefined, discarded: "muted", kept: "success" };
const CALL_WORDS = {
  running: "running",
  done: "returned JSX",
  discarded: "✗ result thrown away",
  kept: "✓ result committed",
};

export default function StrictModeDouble({ step }) {
  const stage = stageAt(STAGES, step);
  const code = stage.file === "main" ? MAIN : stage.file === "impure" ? IMPURE : PURE;
  const label = stage.file === "main" ? "main.jsx" : "App.jsx";
  return (
    <div className="strict-mode-double">
      <p className="strict-mode-double__build">
        <span>Build:</span>
        <Chip tone={stage.production ? "success" : "warning"}>
          {stage.production ? "production" : "development, Strict Mode on"}
        </Chip>
      </p>
      <CodeView lines={code} active={stage.active} label={label} />
      <div className="strict-mode-double__grid">
        <Panel title="Calls to App">
          {stage.calls.length === 0 ? (
            <p className="demo-empty">Not called yet.</p>
          ) : (
            <ol className="strict-mode-double__calls" aria-label="Calls to App">
              {stage.calls.map((call, index) => (
                <li key={index} className={`strict-mode-double__call is-${call.state}`}>
                  <span className="strict-mode-double__call-name">Call {index + 1}</span>
                  <Chip tone={CALL_TONES[call.state]}>{CALL_WORDS[call.state]}</Chip>
                  {call.note && <span className="meta">{call.note}</span>}
                </li>
              ))}
            </ol>
          )}
        </Panel>
        <Panel title="Console" sunken>
          {stage.logs.length === 0 ? (
            <p className="demo-empty">Nothing logged yet.</p>
          ) : (
            <ol className="demo-console strict-mode-double__console" aria-label="Console lines">
              {stage.logs.map((line, index) => (
                <li key={index} className={line.second ? "is-dimmed" : undefined}>
                  {line.second && <span className="visually-hidden">Dimmed: </span>}
                  {line.text}
                </li>
              ))}
            </ol>
          )}
        </Panel>
        <Panel title="The page">
          {stage.page ? (
            <p className="strict-mode-double__page">
              <span aria-hidden="true">▤ </span>One product list, six cards
            </p>
          ) : (
            <p className="demo-empty">Nothing committed yet.</p>
          )}
        </Panel>
      </div>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
