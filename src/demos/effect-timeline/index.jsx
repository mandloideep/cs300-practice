import { Caption, Chip, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "effect-timeline";

export const defaults = {};

const CODE = [
  "useEffect(() => {",
  "  if (!savedAt) return;",
  "  const timer = setTimeout(() => setSavedAt(null), 2000);",
  "  return () => clearTimeout(timer);",
  "}, [savedAt]);",
];

const PASSES = [
  { at: "0 s", why: "First load" },
  { at: "5 s", why: "You add a product" },
  { at: "6 s", why: "You add another" },
  { at: "7 s", why: "You press Beauty" },
  { at: "8 s", why: "Timer B fires" },
];

const TONES = {
  Render: "accent",
  Commit: "success",
  Effect: "warning",
  Cleanup: "danger",
  Skipped: "muted",
};

const STAGES = [
  {
    events: [[0, "Render"]],
    deps: { before: null, now: "null", changed: true },
    timers: [],
    active: -1,
    caption:
      "React calls App. savedAt is null, and App returns JSX that describes the page. Nothing is on the screen yet, and no effect has run.",
  },
  {
    events: [[0, "Commit"]],
    deps: { before: null, now: "null", changed: true },
    timers: [],
    active: -1,
    caption: "Commit: React updates the DOM to match the JSX, and the list appears on the page.",
  },
  {
    events: [[0, "Effect", "returns early"]],
    deps: { before: null, now: "null", changed: true },
    timers: [],
    active: 1,
    caption:
      "After the commit, the effect runs for the first time. savedAt is null, so it returns at once. In development, Strict Mode runs a new effect, its cleanup, and the effect again on mount; this one starts nothing, so the extra run changes nothing.",
  },
  {
    events: [
      [1, "Render"],
      [1, "Commit"],
    ],
    deps: { before: "null", now: "5 s", changed: true },
    timers: [],
    active: -1,
    caption:
      "You add a product, and the submit sets savedAt to the time. React renders and commits, so the notice appears. savedAt changed, so the effect must run.",
  },
  {
    events: [[1, "Effect", "starts timer A"]],
    deps: { before: "null", now: "5 s", changed: true },
    timers: [{ name: "A", state: "running" }],
    active: 2,
    caption:
      "The effect runs with the new savedAt and starts timer A. It returns a cleanup function that remembers timer A.",
  },
  {
    events: [
      [2, "Render"],
      [2, "Commit"],
    ],
    deps: { before: "5 s", now: "6 s", changed: true },
    timers: [{ name: "A", state: "running" }],
    active: -1,
    caption:
      "One second later you add another product. savedAt changes again, and React renders and commits. Timer A is still running.",
  },
  {
    events: [[2, "Cleanup", "clears timer A"]],
    deps: { before: "5 s", now: "6 s", changed: true },
    timers: [{ name: "A", state: "cleared" }],
    active: 3,
    caption:
      "Before it runs the effect again, React calls the cleanup from the previous run. clearTimeout stops timer A, so it can never hide the new notice early.",
  },
  {
    events: [[2, "Effect", "starts timer B"]],
    deps: { before: "5 s", now: "6 s", changed: true },
    timers: [
      { name: "A", state: "cleared" },
      { name: "B", state: "running" },
    ],
    active: 2,
    caption:
      "Then the effect runs with the newest savedAt and starts timer B. Only one timer is ever alive.",
  },
  {
    events: [
      [3, "Render"],
      [3, "Commit"],
      [3, "Skipped", "savedAt unchanged"],
    ],
    deps: { before: "6 s", now: "6 s", changed: false },
    timers: [
      { name: "A", state: "cleared" },
      { name: "B", state: "running" },
    ],
    active: 4,
    caption:
      "You press a category. App renders and commits, but savedAt is the same as last time, so React runs neither the cleanup nor the effect. Timer B keeps going.",
  },
  {
    events: [
      [4, "Render"],
      [4, "Commit"],
      [4, "Cleanup", "clearTimeout(B), already fired"],
      [4, "Effect", "returns early"],
    ],
    deps: { before: "6 s", now: "null", changed: true },
    timers: [
      { name: "A", state: "cleared" },
      { name: "B", state: "fired" },
    ],
    active: 1,
    caption:
      "Timer B fires two seconds after the second save and sets savedAt to null. Render, commit, then the cleanup for the old value and the effect for the new one, which returns early. The notice is gone.",
  },
];

export function stepCount() {
  return STAGES.length;
}

function history(step) {
  const shown = STAGES.slice(0, step + 1);
  return PASSES.map((pass, index) => ({
    ...pass,
    events: shown.flatMap((stage, at) =>
      stage.events
        .filter(([passIndex]) => passIndex === index)
        .map(([, kind, note]) => ({ kind, note, fresh: at === step })),
    ),
  })).filter((pass) => pass.events.length > 0);
}

const TIMER_TONES = { running: "accent", cleared: "muted", fired: "success" };
const TIMER_WORDS = { running: "running", cleared: "✗ cleared", fired: "✓ fired" };

export default function EffectTimeline({ step }) {
  const current = Math.max(0, Math.min(STAGES.length - 1, step));
  const stage = stageAt(STAGES, current);
  return (
    <div className="effect-timeline">
      <ol className="effect-timeline__passes" aria-label="Timeline">
        {history(current).map((pass) => (
          <li key={pass.at} className="effect-timeline__pass">
            <span className="effect-timeline__when">
              <span className="effect-timeline__at">{pass.at}</span>
              {pass.why}
            </span>
            <ol className="effect-timeline__events" aria-label={`${pass.why}, in order`}>
              {pass.events.map((event, index) => (
                <li
                  key={index}
                  className={
                    event.fresh ? "effect-timeline__event is-fresh" : "effect-timeline__event"
                  }
                >
                  <Chip tone={TONES[event.kind]}>{event.kind}</Chip>
                  {event.note && <span className="effect-timeline__note">{event.note}</span>}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
      <div className="effect-timeline__row">
        <Panel title="Dependencies" sunken>
          <p className="effect-timeline__deps">
            <span className="demo-mono">[savedAt]</span>
            {stage.deps.before === null ? (
              <Chip tone="accent">first render: always runs</Chip>
            ) : (
              <>
                <span className="demo-mono">
                  {stage.deps.before} → {stage.deps.now}
                </span>
                <Chip tone={stage.deps.changed ? "accent" : "muted"}>
                  {stage.deps.changed ? "changed" : "same: skip"}
                </Chip>
              </>
            )}
          </p>
        </Panel>
        <Panel title="Timers" sunken>
          {stage.timers.length === 0 ? (
            <p className="demo-empty">No timer started.</p>
          ) : (
            <ul className="effect-timeline__timers" aria-label="Timers">
              {stage.timers.map((timer) => (
                <li key={timer.name}>
                  <span>Timer {timer.name}</span>
                  <Chip tone={TIMER_TONES[timer.state]}>{TIMER_WORDS[timer.state]}</Chip>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <CodeView lines={CODE} active={stage.active} label="The effect in App" />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
