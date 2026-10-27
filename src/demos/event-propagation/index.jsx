import { useState } from "react";
import { Caption, Chip, Choice, CodeView, ConsoleView, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "event-propagation";

export const defaults = { stop: "none" };

const STOPS = [
  { value: "none", label: "Nobody" },
  { value: "button", label: "The button" },
  { value: "list", label: "The list" },
];

function initialStop(props) {
  return STOPS.some((option) => option.value === props.stop) ? props.stop : defaults.stop;
}

const NODES = [
  { key: "outer", name: "window, document, html, body" },
  { key: "main", name: "main" },
  { key: "list", name: "ul#project-list" },
  { key: "li", name: "li" },
  { key: "button", name: "button.remove" },
];

const VISITS = [
  { node: "outer", phase: "capture", stage: 1 },
  { node: "main", phase: "capture", stage: 1, log: "capture: main" },
  { node: "list", phase: "capture", stage: 1 },
  { node: "li", phase: "capture", stage: 1 },
  { node: "button", phase: "target", stage: 2, log: "target: button" },
  { node: "li", phase: "bubble", stage: 3 },
  { node: "list", phase: "bubble", stage: 3, log: "bubble: list" },
  { node: "main", phase: "bubble", stage: 4, log: "bubble: main" },
  { node: "outer", phase: "bubble", stage: 4 },
];

const PHASES = [
  { key: "capture", label: "Capture ↓", stages: [1] },
  { key: "target", label: "Target", stages: [2] },
  { key: "bubble", label: "Bubble ↑", stages: [3, 4] },
];

const STAGE_COUNT = 6;

function trace(stop) {
  const stopAt = VISITS.findIndex((visit) => visit.node === stop && visit.log);
  return VISITS.map((visit, index) => ({
    ...visit,
    reached: stopAt === -1 || index <= stopAt,
    stops: index === stopAt,
  }));
}

function code(stop) {
  const lines = [
    'main.addEventListener("click", () => console.log("capture: main"), { capture: true });',
    'button.addEventListener("click", (event) => {',
    '  console.log("target: button");',
  ];
  if (stop === "button") lines.push("  event.stopPropagation();");
  lines.push(
    "});",
    'list.addEventListener("click", (event) => {',
    '  console.log("bubble: list");',
  );
  if (stop === "list") lines.push("  event.stopPropagation();");
  lines.push("});", 'main.addEventListener("click", () => console.log("bubble: main"));');
  return lines;
}

function activeLines(stop, visits) {
  const lines = code(stop);
  const find = (text) => lines.findIndex((line) => line.includes(text));
  const active = visits.find((visit) => visit.log && visit.reached);
  if (!active) return -1;
  return find(`"${active.log}"`);
}

function caption(step, stop, steps) {
  const stopper = stop === "button" ? "the button" : "the list";
  const after = (index) => steps.find((visit) => visit.stage === index);
  if (step === 0) {
    return `You click Remove beside Profile card, the first project. Before any listener runs, the browser works out the path from window down to the button, and the event will travel down that path and back up.`;
  }
  if (step === 1) {
    return "Capture phase: the event travels down from window toward the button. Only a listener added with { capture: true } runs on the way down, so main logs first.";
  }
  if (step === 2) {
    return stop === "button"
      ? "Target phase: the event reaches the button, the element you clicked. Its listener logs and calls event.stopPropagation(), so the event goes no further."
      : "Target phase: the event reaches the button, the element you clicked, and its listener logs.";
  }
  if (step === 3) {
    if (!after(3).reached) {
      return "Bubble phase: nothing happens. The button stopped the event, so it never climbs back to li or the list, and the list's listener never runs.";
    }
    return stop === "list"
      ? "Bubble phase: the event climbs back up through li to the list. The list's listener logs and then calls event.stopPropagation()."
      : "Bubble phase: the event climbs back up through li to the list, and the list's listener logs. Most listeners run here, on the way up.";
  }
  if (step === 4) {
    if (stop !== "none") {
      return `Still nothing: main's bubble listener never runs, and neither does anything on body, document, or window, because ${stopper} stopped the event.`;
    }
    return "The event keeps climbing through main, body, html, document, and window. Main's second listener, the one without capture, logs now.";
  }
  if (stop === "none") {
    return "Every click makes the same trip: capture down, target, bubble up. Four listeners, four lines, always in this order. Try a stopPropagation() choice above.";
  }
  return `stopPropagation() did not undo anything that already ran: main's capture listener had logged before the event reached the button. It only cut off the rest of the trip after ${stopper}.`;
}

export function stepCount() {
  return STAGE_COUNT;
}

export default function EventPropagation({ props, step }) {
  const [stop, setStop] = useState(() => initialStop(props));
  const current = Math.max(0, Math.min(STAGE_COUNT - 1, step));
  const steps = trace(stop);
  const shown = steps.filter((visit) => visit.stage <= current);
  const now = steps.filter((visit) => visit.stage === current);
  const logs = shown.filter((visit) => visit.log && visit.reached).map((visit) => visit.log);
  const fresh = now.filter((visit) => visit.log && visit.reached).length;
  const phase = stageAt([null, ...PHASES.flatMap((p) => p.stages.map(() => p.key)), null], current);

  function status(node) {
    const mine = shown.filter((visit) => visit.node === node);
    const latest = mine[mine.length - 1];
    if (!latest) return null;
    if (!latest.reached) {
      return latest.stage === current ? { tone: "muted", text: "never reached" } : null;
    }
    const isNow = latest.stage === current;
    const word =
      latest.phase === "capture"
        ? "capture ↓"
        : latest.phase === "target"
          ? "target ●"
          : "bubble ↑";
    return {
      tone: isNow ? "accent" : undefined,
      text: isNow ? word : `passed ${word}`,
      ran: isNow && latest.log ? "logs" : null,
      stops: isNow && latest.stops,
    };
  }

  function box(index) {
    const node = NODES[index];
    const info = status(node.key);
    const clicked = node.key === "button" && current === 0;
    const tone = clicked ? "accent" : info?.tone === "accent" ? "accent" : undefined;
    const classes = ["event-propagation__box", tone && `event-propagation__box--${tone}`]
      .filter(Boolean)
      .join(" ");
    return (
      <div className={classes}>
        <div className="event-propagation__head">
          <span className="demo-mono event-propagation__name">{node.name}</span>
          {clicked && <Chip tone="accent">clicked</Chip>}
          {info && <Chip tone={info.tone}>{info.text}</Chip>}
          {info?.ran && <Chip tone="success">✓ {info.ran}</Chip>}
          {info?.stops && <Chip tone="warning">■ stopPropagation()</Chip>}
        </div>
        {node.key === "li" && (
          <span className="event-propagation__item">
            <span>Profile card</span>
            <span className="event-propagation__category">HTML</span>
          </span>
        )}
        {index < NODES.length - 1 && box(index + 1)}
        {node.key === "button" && <span className="event-propagation__remove">Remove</span>}
      </div>
    );
  }

  return (
    <div className="event-propagation">
      <Choice
        legend="Who calls event.stopPropagation()?"
        options={STOPS}
        value={stop}
        onChange={setStop}
      />
      <ol className="event-propagation__phases" aria-label="Phases">
        {PHASES.map((p) => (
          <li key={p.key}>
            <Chip tone={phase === p.key ? "accent" : undefined}>
              {phase === p.key && <span className="visually-hidden">Now: </span>}
              {p.label}
            </Chip>
          </li>
        ))}
      </ol>
      <div className="event-propagation__layout">
        <div className="event-propagation__tree">{box(0)}</div>
        <div className="event-propagation__console">
          <ConsoleView lines={logs} fresh={fresh} />
        </div>
      </div>
      <CodeView lines={code(stop)} active={activeLines(stop, now)} label="app.js" />
      <Caption>{caption(current, stop, steps)}</Caption>
    </div>
  );
}
