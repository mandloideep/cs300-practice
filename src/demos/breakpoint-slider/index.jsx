import { useState } from "react";
import { Caption, Chip, CodeView, Panel, Slider, Stack } from "../kit.jsx";
import "./styles.css";

export const id = "breakpoint-slider";

export const defaults = { widths: [375, 767, 768, 1023, 1024, 1440] };

const MIN = 320;
const MAX = 1600;
const QUERIES = [768, 1024];

const CODE = [
  ".site-header {",
  "  flex-direction: column;",
  "}",
  ".cards {",
  "  grid-template-columns: 1fr;",
  "}",
  "",
  "@media (min-width: 768px) {",
  "  .site-header {",
  "    flex-direction: row;",
  "  }",
  "  .cards {",
  "    grid-template-columns: repeat(2, 1fr);",
  "  }",
  "}",
  "",
  "@media (min-width: 1024px) {",
  "  .cards {",
  "    grid-template-columns: repeat(3, 1fr);",
  "  }",
  "}",
];

const BASE = [0, 1, 2, 3, 4, 5];

const BLOCKS = [
  [7, 8, 9, 10, 11, 12, 13, 14],
  [16, 17, 18, 19, 20],
];

const CARDS = ["Start with structure", "Make the layout fit", "Explain your change"];

function settings(props) {
  const list = Array.isArray(props.widths)
    ? props.widths.filter(
        (value) =>
          typeof value === "number" && Number.isFinite(value) && value >= MIN && value <= MAX,
      )
    : [];
  return { widths: list.length >= 3 ? list.slice(0, 10).map(Math.round) : defaults.widths };
}

export function stepCount(props) {
  return settings(props).widths.length;
}

function captionFor(width, [tablet, desktop]) {
  if (!tablet) {
    const edge = width === 767 ? " One pixel wider and the first query switches on." : "";
    return `At ${width}px, neither query is true, so only the plain rules apply: the header stacks and the cards sit in one column.${edge}`;
  }
  if (!desktop) {
    const edge =
      width === 768
        ? " min-width includes the width itself, so exactly 768 counts."
        : " (min-width: 1024px) is still false.";
    return `At ${width}px, (min-width: 768px) is true: the header becomes a row and the cards get two columns.${edge}`;
  }
  return `At ${width}px, both queries are true. The header row still comes from the first, and the second, later in the file, wins on .cards and gives them three columns.`;
}

export default function BreakpointSlider({ props, step }) {
  const { widths } = settings(props);
  const index = Math.max(0, Math.min(widths.length - 1, step));
  const [edits, setEdits] = useState({});
  const width = edits[index] ?? widths[index];
  const active = QUERIES.map((query) => width >= query);
  const columns = active[1] ? 3 : active[0] ? 2 : 1;
  const marks = {};
  BLOCKS.forEach((lines, block) => {
    for (const line of lines) marks[line] = active[block] ? "good" : "done";
  });
  for (const line of BASE) marks[line] = "good";
  const at = (value) => `${((value - MIN) / (MAX - MIN)) * 100}%`;

  return (
    <div className="breakpoint-slider">
      <Slider
        label="Viewport width"
        min={MIN}
        max={MAX}
        value={width}
        onChange={(value) => setEdits((current) => ({ ...current, [index]: value }))}
        unit="px"
      />
      <div className="breakpoint-slider__scale" aria-hidden="true">
        <span className="breakpoint-slider__band" style={{ left: 0, width: at(768) }}>
          1 col
        </span>
        <span
          className="breakpoint-slider__band is-two"
          style={{ left: at(768), width: `calc(${at(1024)} - ${at(768)})` }}
        >
          2 cols
        </span>
        <span className="breakpoint-slider__band is-three" style={{ left: at(1024), right: 0 }}>
          3 cols
        </span>
        <span className="breakpoint-slider__marker" style={{ left: at(width) }} />
        {QUERIES.map((query) => (
          <span key={query} className="breakpoint-slider__tick" style={{ left: at(query) }}>
            {query}
          </span>
        ))}
      </div>
      <p className="breakpoint-slider__queries">
        {QUERIES.map((query, position) => (
          <Chip key={query} tone={active[position] ? "success" : "muted"}>
            {active[position] ? "✓" : "✗"} (min-width: {query}px) is {String(active[position])}
          </Chip>
        ))}
      </p>
      <Stack>
        <Panel title={`The page at ${width}px`}>
          <Stack>
            <div
              className="breakpoint-slider__header"
              style={{
                flexDirection: active[0] ? "row" : "column",
                justifyContent: active[0] ? "space-between" : "flex-start",
                alignItems: active[0] ? "center" : "flex-start",
              }}
            >
              <span className="breakpoint-slider__brand">Study resources</span>
              <span className="breakpoint-slider__nav">
                <span>HTML</span>
                <span>CSS</span>
                <span>Practice</span>
              </span>
            </div>
            <div
              className="breakpoint-slider__cards"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {CARDS.map((card) => (
                <span key={card} className="breakpoint-slider__card">
                  {card}
                </span>
              ))}
            </div>
            <p className="meta">
              {columns} {columns === 1 ? "column" : "columns"}, header{" "}
              {active[0] ? "in a row" : "stacked"}
            </p>
          </Stack>
        </Panel>
        <Panel title="styles.css">
          <CodeView lines={CODE} marks={marks} label="styles.css" />
        </Panel>
      </Stack>
      <Caption>{captionFor(width, active)}</Caption>
    </div>
  );
}
