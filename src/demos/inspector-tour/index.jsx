import { Caption, Chip, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "inspector-tour";

export const defaults = { owner: "App" };

const TOTAL = 3;

const VIEWS = [
  { key: "boundaries", label: "Boundaries" },
  { key: "flash", label: "Re-render flash" },
  { key: "tree", label: "Tree and state" },
];

function settings(props) {
  return { owner: props.owner === "ReviewPanel" ? "ReviewPanel" : "App" };
}

function stages({ owner }) {
  const inApp = owner === "App";
  const flashed = inApp ? ["App", "Header", "ReviewPanel"] : ["ReviewPanel"];
  const why = inApp
    ? "App owns reviewed, so App runs again and passes new props to Header and ReviewPanel, and all three outlines flash."
    : "ReviewPanel owns reviewed, so only ReviewPanel runs again; App and Header keep what they drew.";
  return [
    {
      reviewed: 0,
      views: ["boundaries"],
      flashed: [],
      caption:
        "With Boundaries on, each component's output gets a labeled outline. The page is App, and inside it Header and ReviewPanel.",
    },
    {
      reviewed: 0,
      views: ["boundaries", "tree"],
      flashed: [],
      caption: inApp
        ? "Tree and state lists each component and what it holds. App owns the state reviewed, which is 0; Header and ReviewPanel only receive props. Press Review one concept."
        : "Tree and state lists each component and what it holds. ReviewPanel owns the state reviewed, which is 0; App and Header hold nothing. Press Review one concept.",
    },
    {
      reviewed: 1,
      views: ["boundaries", "flash", "tree"],
      flashed,
      caption: `One click: reviewed becomes 1. ${why}`,
    },
    {
      reviewed: 2,
      views: ["boundaries", "flash", "tree"],
      flashed,
      caption: inApp
        ? "A second click: reviewed is 2, and the same three outlines flash. The state panel marks what changed."
        : "A second click: reviewed is 2, and again only ReviewPanel flashes. The state panel marks what changed.",
    },
    {
      reviewed: 3,
      views: ["boundaries", "flash", "tree"],
      flashed,
      caption:
        "A third click: reviewed is 3, so the message changes and the button turns off. Both come from the same value, with no extra code.",
    },
    {
      reviewed: 3,
      views: ["boundaries", "flash", "tree"],
      flashed: [],
      caption: inApp
        ? "Nothing flashes now, because no state changed. Lifting reviewed into App let Header show what is left, at the cost of all three components running on each click."
        : "Nothing flashes now, because no state changed. With reviewed inside ReviewPanel only one component runs, but Header cannot show the count.",
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

function Boundary({ name, flashing, shown, children }) {
  const classes = ["inspector-tour__boundary"];
  if (shown) classes.push("is-shown");
  if (flashing) classes.push("is-flashing");
  return (
    <div className={classes.join(" ")}>
      {shown && (
        <span className="inspector-tour__tag">
          <span className="inspector-tour__name">{name}</span>
          {flashing && <span className="inspector-tour__flash">re-rendered</span>}
        </span>
      )}
      {children}
    </div>
  );
}

function Values({ title, entries, changed }) {
  if (entries.length === 0) return null;
  return (
    <dl className="inspector-tour__values">
      <dt>{title}</dt>
      {entries.map(([key, value]) => (
        <dd key={key} className={changed.includes(key) ? "is-changed" : undefined}>
          <code>
            {key}: {value}
          </code>
          {changed.includes(key) && <span className="inspector-tour__changed">changed</span>}
        </dd>
      ))}
    </dl>
  );
}

export default function InspectorTour({ props, step, goTo }) {
  const setup = settings(props);
  const list = stages(setup);
  const stage = stageAt(list, step);
  const index = Math.max(0, Math.min(list.length - 1, step));
  const previous = index > 0 ? list[index - 1] : stage;
  const done = stage.reviewed === TOTAL;
  const nextClick = list.findIndex((item, at) => at > index && item.reviewed > stage.reviewed);
  const shown = stage.views.includes("boundaries");
  const flashOn = stage.views.includes("flash");
  const flashing = (name) => flashOn && stage.flashed.includes(name);
  const moved = stage.reviewed !== previous.reviewed;
  const inApp = setup.owner === "App";
  const left = TOTAL - stage.reviewed;

  const tree = inApp
    ? [
        { name: "App", state: [["reviewed", stage.reviewed]], props: [], depth: 0 },
        { name: "Header", state: [], props: [["left", left]], depth: 1 },
        {
          name: "ReviewPanel",
          state: [],
          props: [
            ["reviewed", stage.reviewed],
            ["total", TOTAL],
            ["onReview", "function"],
          ],
          depth: 1,
        },
      ]
    : [
        { name: "App", state: [], props: [], depth: 0 },
        { name: "Header", state: [], props: [], depth: 1 },
        { name: "ReviewPanel", state: [["reviewed", stage.reviewed]], props: [], depth: 1 },
      ];
  const changedKeys = moved ? ["reviewed", "left"] : [];

  function click() {
    if (done || nextClick === -1) return;
    goTo(nextClick);
  }

  return (
    <div className="inspector-tour">
      <ul className="inspector-tour__views" aria-label="Inspector views">
        {VIEWS.map((view) => {
          const on = stage.views.includes(view.key);
          return (
            <li key={view.key}>
              <Chip tone={on ? "accent" : "muted"}>
                {view.label}: {on ? "on" : "off"}
              </Chip>
            </li>
          );
        })}
      </ul>
      <div className="inspector-tour__panes">
        <Panel title="Result" className="inspector-tour__result">
          <Boundary name="App" shown={shown} flashing={flashing("App")}>
            <div className="inspector-tour__children">
              <Boundary name="Header" shown={shown} flashing={flashing("Header")}>
                <p className="inspector-tour__heading">Study tracker</p>
                <p className="inspector-tour__text">
                  {inApp ? `${left} concepts left.` : "This header never changes."}
                </p>
              </Boundary>
              <Boundary name="ReviewPanel" shown={shown} flashing={flashing("ReviewPanel")}>
                <p className="inspector-tour__text">
                  Reviewed {stage.reviewed} of {TOTAL} concepts.
                </p>
                <p className="inspector-tour__text">
                  {done ? "All concepts reviewed." : "Keep going."}
                </p>
                <button
                  type="button"
                  className="button button--small inspector-tour__click"
                  aria-disabled={done || undefined}
                  onClick={click}
                >
                  Review one concept
                </button>
              </Boundary>
            </div>
          </Boundary>
        </Panel>
        <Panel title="Tree and state" sunken className="inspector-tour__tree">
          {stage.views.includes("tree") ? (
            <ul className="inspector-tour__rows" aria-label="Components">
              {tree.map((component) => (
                <li
                  key={component.name}
                  className={
                    component.depth ? "inspector-tour__row is-child" : "inspector-tour__row"
                  }
                >
                  <span className="inspector-tour__row-name">
                    {component.name}
                    {flashing(component.name) && (
                      <span className="inspector-tour__flash">re-rendered</span>
                    )}
                  </span>
                  <Values title="Props" entries={component.props} changed={changedKeys} />
                  <Values title="State" entries={component.state} changed={changedKeys} />
                  {component.props.length === 0 && component.state.length === 0 && (
                    <span className="inspector-tour__none">No props or state</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="demo-empty">Turn on Tree and state to list the components.</p>
          )}
        </Panel>
      </div>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
