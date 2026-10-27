const SIZE =
  /^(?:(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|%|fr|vw|vh|ch)|0|auto|min-content|max-content)$/;
const FIXED =
  /^(?:(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|%|vw|vh|ch)|0|auto|min-content|max-content)$/;
const MAX_TRACKS = 12;

function split(text) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const char of text) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (depth < 0) return null;
    if (/\s/.test(char) && depth === 0) {
      if (current) parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (depth !== 0) return null;
  if (current) parts.push(current);
  return parts;
}

function count(tokens) {
  let total = 0;
  for (const token of tokens) {
    if (/^\[[\w\s-]*\]$/.test(token)) continue;
    const repeat = /^repeat\((.*)\)$/.exec(token);
    if (repeat) {
      const comma = repeat[1].indexOf(",");
      if (comma === -1) return { error: "invalid" };
      const times = repeat[1].slice(0, comma).trim();
      if (/^auto-(fill|fit)$/.test(times)) return { error: "auto" };
      if (!/^[1-9]\d*$/.test(times)) return { error: "invalid" };
      const inner = split(repeat[1].slice(comma + 1).trim());
      if (!inner || inner.length === 0) return { error: "invalid" };
      const result = count(inner);
      if (result.error) return result;
      total += Number(times) * result.tracks;
      continue;
    }
    const minmax = /^minmax\(([^,()]+),([^,()]+)\)$/.exec(token);
    if (minmax) {
      if (!FIXED.test(minmax[1].trim()) || !SIZE.test(minmax[2].trim())) {
        return { error: "invalid" };
      }
      total += 1;
      continue;
    }
    if (/^fit-content\(([^()]+)\)$/.test(token)) {
      total += 1;
      continue;
    }
    if (!SIZE.test(token)) return { error: "invalid" };
    total += 1;
  }
  return { tracks: total };
}

export function parseTemplate(source) {
  const text = typeof source === "string" ? source.trim() : "";
  if (text === "" || text === "none") return { status: "none", text: "", tracks: 0 };
  const tokens = split(text.replace(/\s*,\s*/g, ","));
  if (!tokens) return { status: "invalid", text };
  const result = count(tokens);
  if (result.error === "auto") return { status: "auto", text };
  if (result.error || result.tracks === 0) return { status: "invalid", text };
  if (result.tracks > MAX_TRACKS) return { status: "many", text };
  return { status: "ok", text, tracks: result.tracks };
}

function parseSide(text) {
  const value = text.trim();
  if (value === "auto") return { kind: "auto" };
  if (/^-?[1-9]\d*$/.test(value)) return { kind: "line", line: Number(value) };
  const span = /^span\s+([1-9]\d*)$/.exec(value);
  if (span) return { kind: "span", span: Number(span[1]) };
  return null;
}

export function parsePlacement(source) {
  const text = typeof source === "string" ? source.trim() : "";
  if (text === "" || text === "auto") return { status: "auto", text: "", span: 1 };
  const sides = text.split("/");
  if (sides.length > 2) return { status: "invalid", text };
  const start = parseSide(sides[0]);
  const end = sides.length === 2 ? parseSide(sides[1]) : { kind: "auto" };
  if (!start || !end) return { status: "invalid", text };
  if (sides.length === 2 && sides[1].trim() === "") return { status: "invalid", text };
  return { status: "ok", text, start, end };
}

function resolveLine(line, explicit) {
  return line > 0 ? line : explicit + 2 + line;
}

export function resolvePlacement(placement, explicit) {
  if (placement.status !== "ok") return { auto: true, span: 1 };
  const { start, end } = placement;
  if (start.kind === "line") {
    const from = resolveLine(start.line, explicit);
    if (end.kind === "line") {
      let to = resolveLine(end.line, explicit);
      const first = Math.min(from, to);
      to = Math.max(from, to);
      if (first === to) to = first + 1;
      if (first < 1) return { outside: true };
      return { auto: false, start: first, end: to };
    }
    const span = end.kind === "span" ? end.span : 1;
    if (from < 1) return { outside: true };
    return { auto: false, start: from, end: from + span };
  }
  if (end.kind === "line") {
    const to = resolveLine(end.line, explicit);
    const span = start.kind === "span" ? start.span : 1;
    if (to - span < 1) return { outside: true };
    return { auto: false, start: to - span, end: to };
  }
  return { auto: true, span: start.kind === "span" ? start.span : 1 };
}

export function placeItems(items, columns, rows) {
  const taken = [];
  const occupied = (row, column, rowSpan, columnSpan) => {
    for (const area of taken) {
      if (
        row < area.rowEnd &&
        row + rowSpan > area.row &&
        column < area.columnEnd &&
        column + columnSpan > area.column
      ) {
        return true;
      }
    }
    return false;
  };
  const place = (item, row, rowSpan, column, columnSpan) => {
    const area = {
      key: item.key,
      row,
      rowEnd: row + rowSpan,
      column,
      columnEnd: column + columnSpan,
    };
    taken.push(area);
    return area;
  };
  const span = (axis) => (axis.auto ? axis.span : axis.end - axis.start);
  const placed = {};

  for (const item of items) {
    if (!item.row.auto && !item.column.auto) {
      placed[item.key] = place(
        item,
        item.row.start,
        span(item.row),
        item.column.start,
        span(item.column),
      );
    }
  }

  const rowCursor = {};
  for (const item of items) {
    if (!item.row.auto && item.column.auto) {
      const width = span(item.column);
      let column = rowCursor[item.row.start] ?? 1;
      while (occupied(item.row.start, column, span(item.row), width)) column += 1;
      placed[item.key] = place(item, item.row.start, span(item.row), column, width);
      rowCursor[item.row.start] = column + width;
    }
  }

  let total = Math.max(columns, 1);
  for (const item of items) {
    total = Math.max(total, item.column.auto ? item.column.span : item.column.end - 1);
  }

  let cursorRow = 1;
  let cursorColumn = 1;
  for (const item of items) {
    if (!item.row.auto) continue;
    const height = span(item.row);
    if (!item.column.auto) {
      if (item.column.start < cursorColumn) cursorRow += 1;
      cursorColumn = item.column.start;
      while (occupied(cursorRow, cursorColumn, height, span(item.column))) cursorRow += 1;
      placed[item.key] = place(item, cursorRow, height, cursorColumn, span(item.column));
      continue;
    }
    const width = item.column.span;
    for (;;) {
      while (
        cursorColumn + width - 1 <= total &&
        occupied(cursorRow, cursorColumn, height, width)
      ) {
        cursorColumn += 1;
      }
      if (cursorColumn + width - 1 <= total) break;
      cursorRow += 1;
      cursorColumn = 1;
    }
    placed[item.key] = place(item, cursorRow, height, cursorColumn, width);
    cursorColumn += width;
  }

  const usedColumns = Math.max(total, ...taken.map((area) => area.columnEnd - 1));
  const usedRows = Math.max(rows, ...taken.map((area) => area.rowEnd - 1));
  return { placed, columns: usedColumns, rows: usedRows };
}
