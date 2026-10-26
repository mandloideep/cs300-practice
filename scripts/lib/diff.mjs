// A small line-based unified diff for validation reports. Step files are short, so a plain
// longest-common-subsequence table is fast enough and keeps the pipeline dependency free here.

function splitLines(text) {
  if (text === "") return [];
  const lines = text.split("\n");
  if (lines.at(-1) === "") lines.pop();
  else lines[lines.length - 1] += "\n\\ No newline at end of file";
  return lines;
}

function operations(a, b) {
  const table = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] =
        a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      ops.push({ type: " ", line: a[i], ai: i++, bj: j++ });
    } else if (i < a.length && (j === b.length || table[i + 1][j] >= table[i][j + 1])) {
      ops.push({ type: "-", line: a[i], ai: i++, bj: j });
    } else {
      ops.push({ type: "+", line: b[j], ai: i, bj: j++ });
    }
  }
  return ops;
}

export function unifiedDiff(aText, bText, aLabel, bLabel, context = 3) {
  const ops = operations(splitLines(aText), splitLines(bText));
  const changed = ops
    .map((op, index) => (op.type === " " ? -1 : index))
    .filter((index) => index >= 0);
  if (changed.length === 0) return "";
  const hunks = [];
  for (const index of changed) {
    const start = Math.max(0, index - context);
    const end = Math.min(ops.length - 1, index + context);
    const last = hunks.at(-1);
    if (last && start <= last.end + 1) last.end = Math.max(last.end, end);
    else hunks.push({ start, end });
  }
  const out = [`--- ${aLabel}`, `+++ ${bLabel}`];
  for (const { start, end } of hunks) {
    const slice = ops.slice(start, end + 1);
    const aCount = slice.filter((op) => op.type !== "+").length;
    const bCount = slice.filter((op) => op.type !== "-").length;
    const aStart = slice[0].ai + (aCount ? 1 : 0);
    const bStart = slice[0].bj + (bCount ? 1 : 0);
    out.push(`@@ -${aStart},${aCount} +${bStart},${bCount} @@`);
    for (const op of slice) out.push(op.type + op.line);
  }
  return out.join("\n");
}
