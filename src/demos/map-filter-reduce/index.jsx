import { useState } from "react";
import { Box, Caption, Cells, Chip, Choice, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "map-filter-reduce";

export const defaults = { items: [85, 92, 73, 96, 81], method: "map" };

const METHODS = ["map", "filter", "reduce"];
const PASS = 80;

function settings(props) {
  const items =
    Array.isArray(props.items) &&
    props.items.length >= 1 &&
    props.items.length <= 8 &&
    props.items.every((item) => Number.isInteger(item) && Math.abs(item) < 100000)
      ? props.items
      : defaults.items;
  const method = METHODS.includes(props.method) ? props.method : defaults.method;
  return { items, method };
}

const SPEC = {
  map: {
    result: "doubled",
    line: (list) => `const doubled = ${list}.map((score) => score * 2);`,
  },
  filter: {
    result: "passing",
    line: (list) => `const passing = ${list}.filter((score) => score >= ${PASS});`,
  },
  reduce: {
    result: "total",
    line: (list) => `const total = ${list}.reduce((sum, score) => sum + score, 0);`,
  },
};

function run(items, method) {
  const calls = [];
  let sum = 0;
  const out = [];
  items.forEach((score) => {
    if (method === "map") {
      out.push(score * 2);
      calls.push({ call: `score is ${score}`, body: `${score} * 2`, value: String(score * 2) });
    } else if (method === "filter") {
      const keep = score >= PASS;
      if (keep) out.push(score);
      calls.push({
        call: `score is ${score}`,
        body: `${score} >= ${PASS}`,
        value: String(keep),
        keep,
      });
    } else {
      const next = sum + score;
      calls.push({
        call: `sum is ${sum}, score is ${score}`,
        body: `${sum} + ${score}`,
        value: String(next),
        before: sum,
      });
      sum = next;
    }
    calls[calls.length - 1].out = [...out];
    calls[calls.length - 1].sum = sum;
  });
  return { calls, out, sum };
}

function captions(items, method) {
  const { calls, out, sum } = run(items, method);
  const n = items.length;
  const intro = {
    map: `map calls the callback once for each of the ${n} scores and collects every return value into a new array of the same length.`,
    filter: `filter calls the callback once for each of the ${n} scores and keeps the scores for which it returns true.`,
    reduce: `reduce carries a running total, sum, that starts at 0. It calls the callback once per score and the return value becomes the next sum.`,
  }[method];
  const steps = calls.map((entry, index) => {
    const score = items[index];
    if (method === "map")
      return `Score ${index + 1}: the callback gets ${score} and returns ${entry.value}, which goes into the new array at index ${index}.`;
    if (method === "filter")
      return entry.keep
        ? `Score ${index + 1}: ${score} >= ${PASS} is true, so ${score} is kept.`
        : `Score ${index + 1}: ${score} >= ${PASS} is false, so ${score} is left out of the new array.`;
    return `Score ${index + 1}: the callback gets sum ${entry.before} and score ${score}, and returns ${entry.value}, the new sum.`;
  });
  const done = {
    map: `doubled is a new array of ${out.length}. scores is unchanged: map never touches the array it was called on.`,
    filter: `passing is a new array of ${out.length} out of ${n}. scores is unchanged: filter never touches the array it was called on.`,
    reduce: `After the last score, reduce returns the final sum, ${sum}, a single number instead of an array. scores is unchanged.`,
  }[method];
  return { calls, out, sum, list: [intro, ...steps, done] };
}

export function stepCount(props) {
  return settings(props).items.length + 2;
}

export default function MapFilterReduce({ props, step }) {
  const setup = settings(props);
  const [method, setMethod] = useState(setup.method);
  const { items } = setup;
  const { calls, list } = captions(items, method);
  const caption = stageAt(list, step);
  const index = Math.max(0, Math.min(items.length + 1, step));
  const current = index >= 1 && index <= items.length ? index - 1 : -1;
  const finished = index === items.length + 1;
  const latest = current >= 0 ? calls[current] : finished ? calls[calls.length - 1] : null;
  const marks = {};
  if (method === "filter") {
    calls.forEach((entry, at) => {
      if (at < current || finished) marks[at] = entry.keep ? "success" : "muted";
    });
  }

  return (
    <div className="map-filter-reduce">
      <Choice
        legend="Method"
        options={METHODS.map((name) => ({
          value: name,
          label: <span className="demo-mono">{name}</span>,
        }))}
        value={method}
        onChange={setMethod}
      />
      <CodeView
        lines={[`const scores = [${items.join(", ")}];`, SPEC[method].line("scores")]}
        active={finished ? -1 : 1}
        label="main.js"
      />
      <div className="map-filter-reduce__flow">
        <Panel title="scores">
          <Cells items={items.map(String)} active={current} marks={marks} label="scores" />
        </Panel>
        <Panel title="Callback" sunken>
          {current >= 0 ? (
            <p className="map-filter-reduce__call">
              <span>{calls[current].call}</span>
              <span className="demo-mono">
                {calls[current].body} <span aria-hidden="true">→</span>{" "}
                <strong>{calls[current].value}</strong>
              </span>
              {method === "filter" && (
                <Chip tone={calls[current].keep ? "success" : "muted"}>
                  {calls[current].keep ? "kept" : "left out"}
                </Chip>
              )}
            </p>
          ) : (
            <p className="demo-empty">
              {finished ? "Every score has been visited." : "Not called yet."}
            </p>
          )}
        </Panel>
        <Panel title={SPEC[method].result}>
          {method === "reduce" ? (
            <Box label="sum" tone={finished ? "success" : current >= 0 ? "accent" : undefined}>
              <span className="demo-mono map-filter-reduce__sum">{latest ? latest.sum : 0}</span>
            </Box>
          ) : latest && latest.out.length > 0 ? (
            <Cells
              items={latest.out.map(String)}
              active={
                current >= 0 && (method === "map" || calls[current].keep)
                  ? latest.out.length - 1
                  : -1
              }
              marks={finished ? Object.fromEntries(latest.out.map((_, at) => [at, "success"])) : {}}
              label={SPEC[method].result}
            />
          ) : (
            <p className="demo-empty">{latest ? "Nothing kept yet." : "Empty so far."}</p>
          )}
        </Panel>
      </div>
      <Caption>{caption}</Caption>
    </div>
  );
}
