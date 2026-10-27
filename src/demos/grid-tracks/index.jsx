import { useState } from "react";
import { Caption, Choice, CodeView, Panel, Row, Stack, TextField } from "../kit.jsx";
import { parsePlacement, parseTemplate, placeItems, resolvePlacement } from "./grid.js";
import "./styles.css";

export const id = "grid-tracks";

export const defaults = { columns: "8rem 1fr", rows: "auto 1fr auto" };

const ITEMS = [
  { key: "header", selector: ".site-header" },
  { key: "aside", selector: ".sidebar" },
  { key: "main", selector: ".catalog" },
  { key: "footer", selector: ".site-footer" },
];

const SPAN = { column: "1 / -1" };

const STAGES = [
  { focus: "auto", rows: false, place: {} },
  { focus: "lines", rows: false, place: {} },
  { focus: "header", rows: false, place: { header: SPAN } },
  { focus: "footer", rows: false, place: { header: SPAN, footer: SPAN } },
  { focus: "rows", rows: true, place: { header: SPAN, footer: SPAN } },
  {
    focus: "aside",
    rows: true,
    place: {
      header: SPAN,
      footer: SPAN,
      aside: { column: "2", row: "2" },
      main: { column: "1", row: "2" },
    },
  },
];

function settings(props) {
  const usable = (value, fallback) =>
    typeof value === "string" && parseTemplate(value).status === "ok" ? value.trim() : fallback;
  const columns = usable(props.columns, defaults.columns);
  return {
    columns: parseTemplate(columns).tracks >= 2 ? columns : defaults.columns,
    rows: usable(props.rows, defaults.rows),
  };
}

export function stepCount() {
  return STAGES.length;
}

function presetFor(stage, setup) {
  const place = {};
  for (const { key } of ITEMS) {
    place[key] = { column: stage.place[key]?.column ?? "", row: stage.place[key]?.row ?? "" };
  }
  return { columns: setup.columns, rows: stage.rows ? setup.rows : "", place };
}

function merge(preset, edit = {}) {
  const place = {};
  for (const { key } of ITEMS) place[key] = { ...preset.place[key], ...edit.place?.[key] };
  return {
    columns: edit.columns ?? preset.columns,
    rows: edit.rows ?? preset.rows,
    place,
  };
}

function same(a, b) {
  if (a.columns.trim() !== b.columns.trim() || a.rows.trim() !== b.rows.trim()) return false;
  return ITEMS.every(
    ({ key }) =>
      a.place[key].column.trim() === b.place[key].column.trim() &&
      a.place[key].row.trim() === b.place[key].row.trim(),
  );
}

const TEMPLATE_NOTES = {
  invalid: (name) => `That ${name} value is not one this explainer can read, so it is left out.`,
  auto: (name) =>
    `${name} with auto-fill or auto-fit depends on the width, so this explainer leaves it out.`,
  many: (name) => `${name} makes more than 12 tracks, which this explainer leaves out.`,
};

function layout(values) {
  const columns = parseTemplate(values.columns);
  const rows = parseTemplate(values.rows);
  const notes = [];
  const explicitColumns = columns.status === "ok" ? columns.tracks : 0;
  const explicitRows = rows.status === "ok" ? rows.tracks : 0;
  if (TEMPLATE_NOTES[columns.status]) {
    notes.push(TEMPLATE_NOTES[columns.status]("grid-template-columns"));
  }
  if (TEMPLATE_NOTES[rows.status]) notes.push(TEMPLATE_NOTES[rows.status]("grid-template-rows"));
  const items = ITEMS.map(({ key }) => {
    const axis = (name, explicit) => {
      const parsed = parsePlacement(values.place[key][name]);
      if (parsed.status === "invalid") {
        notes.push(`grid-${name}: ${parsed.text} on the ${key} is not valid, so it is ignored.`);
      }
      const resolved = resolvePlacement(parsed, explicit);
      if (resolved.outside) {
        notes.push(
          `grid-${name}: ${parsed.text} on the ${key} reaches before line 1, which this explainer does not draw.`,
        );
        return { auto: true, span: 1 };
      }
      return resolved;
    };
    return { key, column: axis("column", explicitColumns), row: axis("row", explicitRows) };
  });
  const result = placeItems(items, explicitColumns, explicitRows);
  return {
    columnTemplate: columns,
    rowTemplate: rows,
    explicitColumns,
    explicitRows,
    items,
    notes,
    ...result,
  };
}

function trackWords(from, to, noun) {
  return to - from === 1 ? `${noun} ${from}` : `${noun}s ${from} to ${to - 1}`;
}

function describe(grid) {
  const where = ITEMS.map(({ key }) => {
    const area = grid.placed[key];
    return `${key} in ${trackWords(area.column, area.columnEnd, "column")}, ${trackWords(area.row, area.rowEnd, "row")}`;
  });
  return `The grid has ${grid.columns} ${grid.columns === 1 ? "column" : "columns"} and ${grid.rows} ${grid.rows === 1 ? "row" : "rows"}: ${where.join("; ")}.`;
}

function captionFor(stage, values, grid, edited) {
  const notes = grid.notes.length ? `${grid.notes.join(" ")} ` : "";
  if (edited) return `${notes}${describe(grid)}`;
  const n = grid.explicitColumns;
  switch (stage.focus) {
    case "auto":
      return `grid-template-columns: ${values.columns} makes ${n} columns. With no placement of their own, the four items fill the cells in order: left to right, then top to bottom.`;
    case "lines":
      return `Grid counts lines, not columns: ${n} columns have ${n + 1} lines, numbered from 1 at the left. -1 always means the last line, however many columns there are.`;
    case "header":
      return "grid-column: 1 / -1 on the header means start at line 1 and end at the last line, so the header spans the whole row. The other items flow into the cells after it.";
    case "footer":
      return "The footer gets the same 1 / -1. The header and the footer now span the page, and the aside and main share the row between them.";
    case "rows":
      return values.rows === "auto 1fr auto"
        ? "grid-template-rows: auto 1fr auto sizes the rows: the header and footer rows fit their content, and 1fr gives the middle row all the height that is left."
        : `grid-template-rows: ${values.rows} sizes the rows, from the top.`;
    default:
      return "Line numbers place an item anywhere: grid-column: 2 and grid-row: 2 put the aside in the right column, and main moves to the left, without touching the HTML.";
  }
}

function axisValue(axis) {
  return axis.auto ? `auto / span ${axis.span}` : `${axis.start} / ${axis.end}`;
}

export default function GridTracks({ props, step }) {
  const setup = settings(props);
  const index = Math.max(0, Math.min(STAGES.length - 1, step));
  const stage = STAGES[index];
  const [edits, setEdits] = useState({});
  const [picked, setPicked] = useState({});
  const preset = presetFor(stage, setup);
  const values = merge(preset, edits[index]);
  const grid = layout(values);
  const edited = !same(values, preset);
  const fallbackPick = ITEMS.some(({ key }) => key === stage.focus) ? stage.focus : "header";
  const chosen = picked[index] ?? fallbackPick;

  const edit = (change) =>
    setEdits((current) => {
      const before = current[index] ?? {};
      return { ...current, [index]: change(before) };
    });
  const setTemplate = (name) => (value) => edit((before) => ({ ...before, [name]: value }));
  const setPlace = (name) => (value) =>
    edit((before) => ({
      ...before,
      place: {
        ...before.place,
        [chosen]: { ...before.place?.[chosen], [name]: value },
      },
    }));

  const code = ["body {", "  display: grid;"];
  if (grid.columnTemplate.status === "ok")
    code.push(`  grid-template-columns: ${values.columns.trim()};`);
  if (grid.rowTemplate.status === "ok") code.push(`  grid-template-rows: ${values.rows.trim()};`);
  code.push("  gap: 0.5rem;", "}");
  let active = -1;
  for (const { key, selector } of ITEMS) {
    const parts = ["column", "row"]
      .filter((name) => values.place[key][name].trim() !== "")
      .map((name) => `grid-${name}: ${values.place[key][name].trim()};`);
    if (parts.length) {
      if (key === stage.focus) active = code.length + 1;
      code.push(`${selector} {`, ...parts.map((part) => `  ${part}`), "}");
    }
  }
  if (stage.focus === "auto" || stage.focus === "lines") active = 2;
  if (stage.focus === "rows") active = code.findIndex((line) => line.includes("template-rows"));

  const columnLines = Array.from({ length: grid.columns + 1 }, (_, line) => line + 1);
  const rowLines = Array.from({ length: grid.rows + 1 }, (_, line) => line + 1);
  const lastColumn = grid.explicitColumns ? grid.explicitColumns + 1 : null;

  return (
    <div className="grid-tracks">
      <Row>
        <Panel title="The page as a grid">
          <div className="grid-tracks__frame" aria-hidden="true">
            <div
              className={`grid-tracks__grid${stage.focus === "lines" ? " is-lines" : ""}`}
              style={{
                gridTemplateColumns:
                  grid.columnTemplate.status === "ok" ? values.columns : undefined,
                gridTemplateRows: grid.rowTemplate.status === "ok" ? values.rows : undefined,
              }}
            >
              {grid.items.map((item) => (
                <span
                  key={item.key}
                  className={`grid-tracks__item grid-tracks__item--${item.key}`}
                  style={{ gridColumn: axisValue(item.column), gridRow: axisValue(item.row) }}
                >
                  {item.key}
                </span>
              ))}
              {columnLines.map((line) => (
                <span
                  key={`c${line}`}
                  className={`grid-tracks__vline${line > 1 && line <= grid.columns ? " is-gap" : ""}`}
                  style={{ gridColumnStart: line, gridColumnEnd: "auto" }}
                >
                  <span className="grid-tracks__number">
                    {line}
                    {line === lastColumn && <span className="grid-tracks__negative"> (-1)</span>}
                  </span>
                </span>
              ))}
              {rowLines.map((line) => (
                <span
                  key={`r${line}`}
                  className={`grid-tracks__hline${line > 1 && line <= grid.rows ? " is-gap" : ""}`}
                  style={{ gridRowStart: line, gridRowEnd: "auto" }}
                >
                  <span className="grid-tracks__number">{line}</span>
                </span>
              ))}
            </div>
          </div>
        </Panel>
        <Stack>
          <div className="grid-tracks__controls">
            <TextField
              label="grid-template-columns"
              value={values.columns}
              onChange={setTemplate("columns")}
            />
            <TextField
              label="grid-template-rows"
              value={values.rows}
              onChange={setTemplate("rows")}
            />
          </div>
          <Choice
            legend="Place an item"
            options={ITEMS.map(({ key }) => ({ value: key, label: key }))}
            value={chosen}
            onChange={(value) => setPicked((current) => ({ ...current, [index]: value }))}
          />
          <div className="grid-tracks__controls">
            <TextField
              label={`grid-column of ${chosen}`}
              value={values.place[chosen].column}
              onChange={setPlace("column")}
            />
            <TextField
              label={`grid-row of ${chosen}`}
              value={values.place[chosen].row}
              onChange={setPlace("row")}
            />
          </div>
          <CodeView lines={code} active={active} label="styles.css" />
        </Stack>
      </Row>
      <Caption>{captionFor(stage, values, grid, edited)}</Caption>
    </div>
  );
}
