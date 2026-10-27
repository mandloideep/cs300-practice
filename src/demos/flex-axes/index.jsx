import { useState } from "react";
import { Caption, CodeView, Row, Stack } from "../kit.jsx";
import "./styles.css";

export const id = "flex-axes";

export const defaults = { items: ["Study resources", "HTML", "CSS"] };

const OPTIONS = {
  direction: ["row", "row-reverse", "column", "column-reverse"],
  justify: ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"],
  align: ["stretch", "flex-start", "center", "flex-end"],
  wrap: ["nowrap", "wrap"],
  gap: ["0", "0.5rem", "1rem"],
};

const GAPS = { 0: "0", "0.5rem": "var(--space-2)", "1rem": "var(--space-4)" };

const PROPERTY = {
  direction: "flex-direction",
  justify: "justify-content",
  align: "align-items",
  wrap: "flex-wrap",
  gap: "gap",
};

const BASE = {
  direction: "row",
  justify: "flex-start",
  align: "stretch",
  wrap: "nowrap",
  gap: "0",
};

const STAGES = [
  { focus: "direction", set: {} },
  { focus: "justify", set: { justify: "space-between" } },
  { focus: "align", set: { justify: "space-between", align: "center" } },
  { focus: "gap", set: { justify: "space-between", align: "center", gap: "1rem" } },
  {
    focus: "direction",
    set: { direction: "column", justify: "space-between", align: "center", gap: "1rem" },
  },
  { focus: "wrap", set: { align: "center", gap: "1rem", wrap: "wrap" } },
];

const AXES = {
  row: { main: "left to right", cross: "top to bottom" },
  "row-reverse": { main: "right to left", cross: "top to bottom" },
  column: { main: "top to bottom", cross: "left to right" },
  "column-reverse": { main: "bottom to top", cross: "left to right" },
};

const JUSTIFY = {
  "flex-start": "packs the items at the start of the main axis",
  center: "gathers the items in the middle of the main axis",
  "flex-end": "pushes the items to the end of the main axis",
  "space-between":
    "puts the first item at the start of the main axis, the last at the end, and shares the leftover space between them",
  "space-around":
    "gives every item the same space on both sides along the main axis, so the edges get half a share",
  "space-evenly": "makes every space along the main axis the same, the two edges included",
};

const ALIGN = {
  stretch: "the default, makes every item fill the cross axis",
  "flex-start": "puts the items at the start of the cross axis",
  center: "centers the items on the cross axis",
  "flex-end": "puts the items at the end of the cross axis",
};

function settings(props) {
  const list = Array.isArray(props.items)
    ? props.items.filter(
        (item) => typeof item === "string" && item.trim() !== "" && item.length <= 20,
      )
    : [];
  return { items: list.length >= 2 ? list.slice(0, 6) : defaults.items };
}

export function stepCount() {
  return STAGES.length;
}

function captionFor(focus, values, index) {
  const { main, cross } = AXES[values.direction];
  const axes = `The main axis runs ${main} and the cross axis ${cross}.`;
  if (focus === "direction") {
    const lead =
      index === 0
        ? "display: flex lines the children up as flex items along the main axis."
        : `flex-direction: ${values.direction} turns the main axis to run ${main}, and the cross axis ${cross}.`;
    const rest =
      index === 0
        ? `With flex-direction: ${values.direction}, it runs ${main} and the cross axis ${cross}.`
        : values.direction.startsWith("column")
          ? "justify-content now moves the items up and down, and align-items moves them sideways."
          : "justify-content moves the items along the row, and align-items across it.";
    return `${lead} ${rest}`;
  }
  if (focus === "justify") {
    return `justify-content: ${values.justify} ${JUSTIFY[values.justify]}. ${axes}`;
  }
  if (focus === "align") {
    return `align-items: ${values.align} ${ALIGN[values.align]}. ${axes}`;
  }
  if (focus === "gap") {
    return values.gap === "0"
      ? `gap: 0 leaves no space between the items. ${axes}`
      : `gap: ${values.gap} puts space between the items and nowhere else: none before the first item or after the last. ${axes}`;
  }
  return values.wrap === "wrap"
    ? `flex-wrap: wrap lets items that do not fit start a new line, stacked along the cross axis. ${axes}`
    : `flex-wrap: nowrap, the default, keeps every item on one line, shrinking them when they do not fit. ${axes}`;
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="flex-axes__select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Arrow({ name, orientation, reverse }) {
  return (
    <span className={`flex-axes__arrow flex-axes__arrow--${orientation} is-${name}`}>
      <span className="flex-axes__arrow-label">{name} axis</span>
      <span className="flex-axes__arrow-track">
        {reverse && <span className="flex-axes__head">{orientation === "x" ? "◀" : "▲"}</span>}
        <span className="flex-axes__line" />
        {!reverse && <span className="flex-axes__head">{orientation === "x" ? "▶" : "▼"}</span>}
      </span>
    </span>
  );
}

export default function FlexAxes({ props, step }) {
  const { items } = settings(props);
  const index = Math.max(0, Math.min(STAGES.length - 1, step));
  const stage = STAGES[index];
  const [edits, setEdits] = useState({});
  const values = { ...BASE, ...stage.set, ...edits[index] };
  const change = (key) => (value) =>
    setEdits((current) => ({ ...current, [index]: { ...current[index], [key]: value } }));
  const column = values.direction.startsWith("column");
  const reversed = values.direction.endsWith("reverse");
  const lines = [
    ".site-header {",
    "  display: flex;",
    ...Object.keys(PROPERTY).map((key) => `  ${PROPERTY[key]}: ${values[key]};`),
    "}",
  ];
  const active = index === 0 ? 1 : 2 + Object.keys(PROPERTY).indexOf(stage.focus);

  return (
    <div className="flex-axes">
      <Row>
        <div className="flex-axes__drawing">
          <div className={`flex-axes__stage${column ? " is-column" : ""}`} aria-hidden="true">
            <span className="flex-axes__corner" />
            <Arrow name={column ? "cross" : "main"} orientation="x" reverse={!column && reversed} />
            <Arrow name={column ? "main" : "cross"} orientation="y" reverse={column && reversed} />
            <div
              className="flex-axes__container"
              style={{
                display: "flex",
                flexDirection: values.direction,
                justifyContent: values.justify,
                alignItems: values.align,
                flexWrap: values.wrap,
                gap: GAPS[values.gap],
              }}
            >
              {items.map((item, position) => (
                <span
                  key={position}
                  className={position === 0 ? "flex-axes__item is-brand" : "flex-axes__item"}
                >
                  {reversed && <span className="flex-axes__number">{position + 1}</span>}
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <Stack>
          <div className="flex-axes__controls">
            {Object.keys(OPTIONS).map((key) => (
              <Select
                key={key}
                label={PROPERTY[key]}
                value={values[key]}
                options={OPTIONS[key]}
                onChange={change(key)}
              />
            ))}
          </div>
          <CodeView lines={lines} active={active} label="styles.css" />
        </Stack>
      </Row>
      <Caption>{captionFor(stage.focus, values, index)}</Caption>
    </div>
  );
}
