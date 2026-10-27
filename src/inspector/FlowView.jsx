import { useEffect, useRef, useState } from "react";
import { jumpTarget } from "./jump.js";
import RequestBadges, { badgeText, shortUrl, stateLabel } from "../network/requests.jsx";

const HISTORY_LENGTH = 8;

function formatValue(value) {
  if (typeof value === "string") {
    return /^(?:<.*>|\[(?:Function|Array|Object|Circular|Map|Set|Event).*\]|NaN|-?Infinity|undefined)$/.test(
      value,
    )
      ? value
      : JSON.stringify(value);
  }
  if (value === undefined) return "undefined";
  const text = JSON.stringify(value) ?? String(value);
  return text.length > 60 ? `${text.slice(0, 59)}…` : text;
}

function pluralize(count, noun) {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

export function traceStepCount(trace) {
  return (trace.event ? 1 : 0) + trace.entries.length + 1;
}

// Turns a trace into rows, each with the text to show and the components it involves, resolved
// to instance ids through the latest commit (by name) and the closing commit (by render flag).
// `requests` maps request ids to network records, for the line and the badges of a request or
// response entry.
export function traceRows(trace, latestCommit, closingCommit, requests = new Map()) {
  const byName = new Map();
  for (const component of latestCommit?.components ?? []) {
    if (!byName.has(component.name)) byName.set(component.name, []);
    byName.get(component.name).push(component);
  }
  const instances = (...names) => names.filter(Boolean).flatMap((name) => byName.get(name) ?? []);
  const row = (key, kind, components, content, text, target) => ({
    key,
    kind,
    componentIds: [...new Set(components.map((component) => component.id))],
    target:
      target ?? (components[0] ? jumpTarget(components[0].declaredAt, components[0].usedAt) : null),
    content,
    text,
  });
  const requestTarget = (record) =>
    record?.calledFrom ? { ...record.calledFrom, highlight: [record.calledFrom] } : null;
  const flags = (record, entry) => ({
    stale: record?.stale ?? entry.stale ?? false,
    duplicateOf: record?.duplicateOf ?? entry.duplicateOf ?? null,
  });

  const rows = [];
  if (trace.event) {
    const { type, target, handlerOwner } = trace.event;
    const where = handlerOwner ? (
      <>
        , handled in <code>{handlerOwner}</code>
      </>
    ) : (
      ", handled outside React"
    );
    rows.push(
      row(
        "event",
        "event",
        instances(handlerOwner),
        <>
          <code>{type ?? "event"}</code> on <code>{target ?? "the page"}</code>
          {where}
        </>,
        `${type ?? "event"} on ${target ?? "the page"}${handlerOwner ? `, handled in ${handlerOwner}` : ", handled outside React"}`,
      ),
    );
  }

  trace.entries.forEach((entry, index) => {
    if (entry.kind === "prop-call") {
      const args = entry.args.map(formatValue).join(", ");
      rows.push(
        row(
          `entry-${index}`,
          "prop-call",
          instances(entry.passedBy, entry.calledIn),
          <>
            <code>{entry.prop}</code>, passed by <code>{entry.passedBy}</code> to{" "}
            <code>{entry.calledIn ?? "a child"}</code>, called
            {args && (
              <>
                {" "}
                with <code>{args}</code>
              </>
            )}
          </>,
          `${entry.prop}, passed by ${entry.passedBy} to ${entry.calledIn ?? "a child"}, called${args ? ` with ${args}` : ""}`,
        ),
      );
    } else if (entry.kind === "setter") {
      const slot = entry.hook == null ? "state" : `state ${entry.hook}`;
      const verb = entry.hookName === "useReducer" ? "dispatch" : "setter";
      rows.push(
        row(
          `entry-${index}`,
          "setter",
          instances(entry.component),
          <>
            <code>{entry.hookName}</code> {verb} in <code>{entry.component}</code> changed {slot}{" "}
            from <code>{formatValue(entry.previous)}</code> to{" "}
            <code>{formatValue(entry.next)}</code>
          </>,
          `${entry.hookName} ${verb} in ${entry.component} changed ${slot} from ${formatValue(entry.previous)} to ${formatValue(entry.next)}`,
        ),
      );
    } else if (entry.kind === "request") {
      const record = requests.get(entry.requestId);
      const url = record ? shortUrl(record) : entry.url;
      const marks = flags(record, entry);
      rows.push(
        row(
          `entry-${index}`,
          "request",
          instances(entry.calledIn),
          <>
            fetch started: <code>{entry.method}</code> <code>{url}</code>
            {entry.calledIn && (
              <>
                {" "}
                in <code>{entry.calledIn}</code>
              </>
            )}{" "}
            <RequestBadges {...marks} />
          </>,
          `fetch started: ${entry.method} ${url}${entry.calledIn ? ` in ${entry.calledIn}` : ""}${badgeText(marks)}`,
          requestTarget(record),
        ),
      );
    } else if (entry.kind === "response") {
      const record = requests.get(entry.requestId);
      const marks = flags(record, entry);
      const what = record ? `${record.method} ${shortUrl(record)}` : `request ${entry.requestId}`;
      const outcome = `${stateLabel(entry.state)}${entry.status ? ` ${entry.status}` : ""} in ${entry.duration} ms`;
      rows.push(
        row(
          `entry-${index}`,
          "response",
          [],
          <>
            fetch settled: <code>{what}</code> {outcome} <RequestBadges {...marks} />
          </>,
          `fetch settled: ${what} ${outcome}${badgeText(marks)}`,
          requestTarget(record),
        ),
      );
    }
  });

  const rendered = closingCommit
    ? closingCommit.components.filter((component) => component.rendered)
    : instances(...new Set(trace.rendered));
  const counts = new Map();
  for (const name of trace.rendered) counts.set(name, (counts.get(name) ?? 0) + 1);
  const names = [...counts].map(([name, count]) => (count > 1 ? `${name} ×${count}` : name));
  rows.push(
    row(
      "rendered",
      "rendered",
      rendered,
      names.length > 0 ? (
        <>
          {names.map((name, index) => (
            <span key={name}>
              {index > 0 && ", "}
              <code>{name}</code>
            </span>
          ))}{" "}
          re-rendered
          {trace.commitSeq != null && <> in commit {trace.commitSeq}</>}
        </>
      ) : (
        "Nothing re-rendered"
      ),
      names.length > 0
        ? `${names.join(", ")} re-rendered${trace.commitSeq != null ? ` in commit ${trace.commitSeq}` : ""}`
        : "Nothing re-rendered",
    ),
  );
  return rows;
}

export function traceSummary(trace) {
  let start = "effect or timer";
  if (trace.event) start = `${trace.event.type ?? "event"} on ${trace.event.target ?? "the page"}`;
  else if (trace.entries[0]?.kind === "response") start = "a response settled";
  return `${start} · ${pluralize(traceStepCount(trace), "step")}`;
}

const KIND_LABELS = {
  event: "Event",
  "prop-call": "Prop call",
  setter: "State",
  request: "Request",
  response: "Response",
  rendered: "Render",
};

export default function FlowView({
  traces,
  inspectorCommits,
  latestCommit,
  networkRequests = [],
  runId,
  onHighlight,
  onJumpToCode,
  announce,
}) {
  const [selected, setSelected] = useState({ runId: null, id: null });
  const announcedRef = useRef({ runId: null, count: 0 });

  const latest = traces.at(-1) ?? null;
  const chosen =
    (selected.runId === runId && traces.find((trace) => trace.id === selected.id)) || latest;

  useEffect(() => {
    const announced = announcedRef.current;
    if (announced.runId !== runId) {
      announced.runId = runId;
      announced.count = 0;
    }
    if (traces.length > announced.count) {
      announced.count = traces.length;
      if (latest) announce?.(`Flow trace recorded: ${pluralize(traceStepCount(latest), "step")}`);
    }
  }, [traces, latest, runId, announce]);

  if (!chosen) {
    return (
      <p className="meta inspector-empty">
        Interact with the result, for example by clicking a button, to record a flow trace.
      </p>
    );
  }

  const closingCommit =
    chosen.commitSeq == null
      ? null
      : (inspectorCommits.find((commit) => commit.seq === chosen.commitSeq) ?? null);
  const rows = traceRows(
    chosen,
    latestCommit,
    closingCommit,
    new Map(networkRequests.map((request) => [request.id, request])),
  );
  const history = traces.slice(-HISTORY_LENGTH).reverse();

  return (
    <div className="flow">
      <h3 className="inspector-subheading">
        {chosen === latest ? "Latest trace" : `Trace ${chosen.seq}`}
        <span className="flow__meta">
          {" "}
          · {pluralize(traceStepCount(chosen), "step")} · {chosen.duration} ms
        </span>
      </h3>
      <ol className="flow-timeline" aria-label={`Flow trace ${chosen.seq}`}>
        {rows.map((row) => (
          <li key={row.key} className={`flow-row flow-row--${row.kind}`}>
            <button
              type="button"
              className="flow-row__button"
              onMouseEnter={() => onHighlight(row.componentIds)}
              onMouseLeave={() => onHighlight([])}
              onFocus={() => onHighlight(row.componentIds)}
              onBlur={() => onHighlight([])}
              onClick={() => {
                if (row.target) onJumpToCode(row.target);
              }}
              aria-label={`${KIND_LABELS[row.kind]}: ${row.text}`}
            >
              <span className="flow-row__kind">{KIND_LABELS[row.kind]}</span>
              <span className="flow-row__text">{row.content}</span>
            </button>
          </li>
        ))}
      </ol>
      {traces.length > 1 && (
        <>
          <h3 className="inspector-subheading">History</h3>
          <ol className="flow-history" aria-label="Earlier traces">
            {history.map((trace) => (
              <li key={trace.id}>
                <button
                  type="button"
                  className="flow-history__button"
                  aria-current={trace === chosen ? "true" : undefined}
                  onClick={() => setSelected({ runId, id: trace.id })}
                >
                  <span className="flow-history__seq">Trace {trace.seq}</span>{" "}
                  <span className="meta">{traceSummary(trace)}</span>
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="meta inspector-help">
        Hover or focus a step to highlight the components involved in the result. Select a step to
        open the code of its component.
      </p>
    </div>
  );
}
