import { Caption, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "page-tour";

export const defaults = {};

const PANES = [
  {
    key: "explanation",
    name: "Explanation",
    sketch: ["Step 2 of 6", "Lead", "Edit block"],
    says: "Read this first. It says what the step builds, shows the idea moving, and lists the edits to type. Come back to it whenever you are unsure what to do next.",
  },
  {
    key: "editor",
    name: "Editor",
    sketch: ["App.jsx", "main.jsx"],
    says: "The step's files, one tab each. Type the edit blocks here; your changes are kept in this browser. Run with the Run button or Ctrl+Enter.",
  },
  {
    key: "result",
    name: "Result",
    sketch: ["Your page"],
    says: "Your code running as a real page. Look here after every Run to see what it drew, and click it like any page.",
  },
  {
    key: "console",
    name: "Console",
    sketch: ["> Rendering…"],
    says: "What your code logged, and any error with a link to its line. Look here first when the result is blank or wrong.",
  },
  {
    key: "inspector",
    name: "Inspector",
    sketch: ["App", "ProductList"],
    says: "On React steps, your components drawn as boxes, which ones re-rendered, and the state each holds. Look here to see what React did.",
  },
  {
    key: "checks",
    name: "Checks",
    sketch: ["✓ Three items", "✗ Stable keys"],
    says: "What this step expects, each check passing or failing with a hint. When every required check passes, the step is complete.",
  },
  {
    key: "steps",
    name: "Step navigation",
    sketch: ["← Step 1", "Step 3 →"],
    says: "The previous and next steps and the list of every step in the topic. Your progress is saved, so you can leave and come back.",
  },
];

export function stepCount() {
  return PANES.length;
}

export default function PageTour({ step, goTo }) {
  const current = stageAt(PANES, step);
  return (
    <div className="page-tour">
      <div className="page-tour__page" role="group" aria-label="The step page in miniature">
        {PANES.map((pane, index) => (
          <button
            key={pane.key}
            type="button"
            className={`page-tour__pane page-tour__pane--${pane.key}`}
            aria-pressed={pane.key === current.key}
            onClick={() => goTo(index)}
          >
            <span className="page-tour__name">{pane.name}</span>
            <span className="page-tour__sketch" aria-hidden="true">
              {pane.sketch.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          </button>
        ))}
      </div>
      <Caption>
        <strong>{current.name}.</strong> {current.says}
      </Caption>
    </div>
  );
}
