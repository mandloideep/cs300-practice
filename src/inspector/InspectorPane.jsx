import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DomView from "./DomView.jsx";
import FlowView from "./FlowView.jsx";
import { jumpTarget } from "./jump.js";
import LiveRegion from "../ui/LiveRegion.jsx";
import { isReactWorkspace } from "../runner/useRunSession.js";
import "./inspector.css";

// The React views need the inspector hook, which the runner installs only for a workspace that
// imports React; the DOM view works for every workspace and is the only view a vanilla
// workspace shows beside the network pane (docs/CONTRACTS.md section 4.3).
const REACT_VIEWS = [
  { id: "boundaries", label: "Boundaries" },
  { id: "flash", label: "Re-render flash" },
  { id: "tree", label: "Tree and state" },
  { id: "flow", label: "Flow trace" },
];
const DOM_VIEW = { id: "dom", label: "DOM" };
const DEFAULT_REACT_VIEWS = ["boundaries", "flash", "tree"];
const DEFAULT_VANILLA_VIEWS = ["dom"];

function formatValue(value) {
  if (typeof value === "string") {
    return /^(?:<.*>|\[(?:Function|Array|Object|Circular|Map|Set).*\]|NaN|-?Infinity|undefined)$/.test(
      value,
    )
      ? value
      : JSON.stringify(value);
  }
  if (value === undefined) return "undefined";
  const text = JSON.stringify(value) ?? String(value);
  return text.length > 80 ? `${text.slice(0, 79)}…` : text;
}

function location(where) {
  return where ? `${where.file}:${where.line}` : null;
}

// Nests the flat component list of a commit by parentId, keeping tree order.
function buildTree(components) {
  const byParent = new Map();
  for (const component of components) {
    const key = component.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(component);
  }
  const known = new Set(components.map((component) => component.id));
  const roots = components.filter(
    (component) => component.parentId == null || !known.has(component.parentId),
  );
  const attach = (component) => ({
    ...component,
    children: (byParent.get(component.id) ?? []).map(attach),
  });
  return roots.map(attach);
}

function Values({ title, entries, previous }) {
  if (entries.length === 0) return null;
  return (
    <dl className="inspector-values" aria-label={title}>
      {entries.map(([key, value]) => {
        const text = formatValue(value);
        const changed = previous !== undefined && previous.get(key) !== text;
        return (
          <div key={key} className="inspector-values__row">
            <dt>{key}</dt>
            <dd>
              <code key={changed ? text : "same"} className={changed ? "is-changed" : undefined}>
                {text}
              </code>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function valueMap(entries) {
  return new Map(entries.map(([key, value]) => [key, formatValue(value)]));
}

function propEntries(component) {
  return Object.entries(component.props ?? {});
}

function stateEntries(component) {
  return (component.state ?? []).map((entry) => [`state ${entry.hook}`, entry.value]);
}

function ComponentRow({ component, previousById, selectedId, onHighlight, onJumpToCode }) {
  const previous = previousById.get(component.id);
  const declared = location(component.declaredAt);
  const used = location(component.usedAt);
  const noDom = component.rects.length === 0;

  return (
    <li className="inspector-node">
      <div
        className="inspector-row"
        aria-current={component.id === selectedId ? "true" : undefined}
        onMouseEnter={() => onHighlight(component.id)}
        onMouseLeave={() => onHighlight(null)}
      >
        <button
          type="button"
          className="inspector-row__name"
          onFocus={() => onHighlight(component.id)}
          onBlur={() => onHighlight(null)}
          onClick={() => {
            const target = jumpTarget(component.declaredAt, component.usedAt);
            if (target) onJumpToCode(target);
          }}
          aria-label={`${component.name}${declared ? `, declared at ${declared}` : ""}${component.rendered ? ", rendered in the latest commit" : ""}${noDom ? ", no DOM of its own" : ""}`}
        >
          <span className="inspector-row__tag">&lt;{component.name}&gt;</span>
          {component.rendered && (
            <span className="inspector-dot" title="Rendered in the latest commit" />
          )}
        </button>
        {noDom && (
          <span className="inspector-chip" title="This component renders no DOM element of its own">
            no DOM
          </span>
        )}
        {used && (
          <button
            type="button"
            className="link-button inspector-row__used"
            onClick={() => onJumpToCode(component.usedAt)}
          >
            used at {used}
          </button>
        )}
      </div>
      <Values
        title={`${component.name} props`}
        entries={propEntries(component)}
        previous={previous && valueMap(propEntries(previous))}
      />
      <Values
        title={`${component.name} state`}
        entries={stateEntries(component)}
        previous={previous && valueMap(stateEntries(previous))}
      />
      {component.children?.length > 0 && (
        <ul className="inspector-tree">
          {component.children.map((child) => (
            <ComponentRow
              key={child.id}
              component={child}
              previousById={previousById}
              selectedId={selectedId}
              onHighlight={onHighlight}
              onJumpToCode={onJumpToCode}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// `announce` is optional: when the step page passes its live-region function the pane shares
// that region, and otherwise it renders a polite region of its own for the flow announcements.
export default function InspectorPane({ session, step, onJumpToCode, announce }) {
  const {
    inspectorCommits,
    latestCommit,
    flowTraces = [],
    networkRequests = [],
    runId,
    status,
    send,
    ready = false,
    domSnapshot = null,
  } = session;
  const react = useMemo(() => isReactWorkspace(step.workspace), [step.workspace]);
  const [views, setViews] = useState(
    () => step.inspector?.views ?? (react ? DEFAULT_REACT_VIEWS : DEFAULT_VANILLA_VIEWS),
  );
  const [selected, setSelected] = useState({ runId: null, id: null });
  const [ownMessage, setOwnMessage] = useState(null);
  const ownCounter = useRef(0);
  const selectedId = selected.runId === runId ? selected.id : null;
  const paneRef = useRef(null);
  const jumpRef = useRef(onJumpToCode);
  const hasCommits = inspectorCommits.length > 0;

  const ownAnnounce = useCallback((text) => {
    ownCounter.current += 1;
    setOwnMessage({ id: ownCounter.current, text });
  }, []);
  const announceTrace = announce ?? ownAnnounce;

  useEffect(() => {
    jumpRef.current = onJumpToCode;
  });

  // The bridge listens from the moment it posts `ready`, so the open views reach it before the
  // first commit and before the DOM observer would have anything to report.
  useEffect(() => {
    if (ready) send({ type: "inspector-config", views });
  }, [ready, runId, views, send]);

  useEffect(() => {
    function onMessage(event) {
      const message = event.data;
      if (message?.source !== "cs300-lab" || message.type !== "inspector-select") return;
      if (!runId || message.runId !== runId) return;
      setSelected({ runId, id: message.componentId });
      const target = jumpTarget(message.usedAt, message.declaredAt);
      if (target) jumpRef.current(target);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [runId]);

  useEffect(() => {
    if (!selectedId) return;
    paneRef.current
      ?.querySelector('.inspector-row[aria-current="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  const components = useMemo(() => latestCommit?.components ?? [], [latestCommit]);
  const tree = useMemo(() => buildTree(components), [components]);
  const previousById = useMemo(() => {
    const previous = inspectorCommits.at(-2)?.components ?? [];
    return new Map(previous.map((component) => [component.id, component]));
  }, [inspectorCommits]);
  const watched = step.inspector?.watch ?? [];
  const pinned = components.filter((component) => watched.includes(component.name));

  function toggle(view) {
    setViews((current) =>
      current.includes(view) ? current.filter((v) => v !== view) : [...current, view],
    );
  }

  function highlight(componentId) {
    send({ type: "inspector-highlight", componentId });
  }

  const highlightMany = useCallback(
    (componentIds) => send({ type: "inspector-highlight", componentIds }),
    [send],
  );

  const rowProps = { previousById, selectedId, onHighlight: highlight, onJumpToCode };
  const showTree = react && views.includes("tree");
  const showFlow = react && views.includes("flow");
  const showDom = views.includes("dom");
  const toggles = react ? [...REACT_VIEWS, DOM_VIEW] : [DOM_VIEW];

  let empty = null;
  if (react && !hasCommits) {
    if (status === "idle" || status === "compiling" || status === "running") {
      empty = "Run the code to see its components.";
    } else if (status === "compile-error") {
      empty = "Fix the compile error to see the components.";
    } else {
      empty =
        "No React components rendered. The inspector shows React components; this workspace is plain HTML, CSS, and JavaScript, or its code has not rendered anything yet.";
    }
  }

  let meta;
  if (react) {
    meta = hasCommits
      ? `${components.length} ${components.length === 1 ? "component" : "components"} · commit ${latestCommit.seq}`
      : "No components yet";
  } else if (domSnapshot) {
    const count = domSnapshot.nodes.filter((node) => node.changed !== "removed").length;
    meta = `${count} ${count === 1 ? "element" : "elements"} · snapshot ${domSnapshot.seq}`;
  } else {
    meta = "No elements yet";
  }

  const domSection = showDom && (
    <section className="inspector-dom" aria-label="DOM">
      {react && <h3 className="inspector-subheading">DOM</h3>}
      <DomView snapshot={domSnapshot} status={status} send={send} onJumpToCode={onJumpToCode} />
    </section>
  );

  return (
    <section ref={paneRef} className="pane pane--inspector" aria-labelledby="inspector-heading">
      <div className="pane__header">
        <h2 id="inspector-heading">Inspector</h2>
        <span className="meta">{meta}</span>
      </div>

      <div className="inspector-views" role="group" aria-label="Inspector views">
        {toggles.map((view) => (
          <button
            key={view.id}
            type="button"
            className="inspector-toggle"
            aria-pressed={views.includes(view.id)}
            onClick={() => toggle(view.id)}
          >
            {view.label}
          </button>
        ))}
        <button
          type="button"
          className="inspector-toggle"
          aria-pressed="false"
          disabled
          aria-describedby="inspector-network-note"
        >
          Network
        </button>
        <span id="inspector-network-note" className="meta inspector-views__note">
          Requests appear in the Network pane.
        </span>
      </div>

      {!react ? (
        showDom ? (
          domSection
        ) : (
          <p className="meta inspector-empty">
            Turn on DOM to see the elements of the page as the browser holds them.
          </p>
        )
      ) : empty ? (
        <>
          <p className="meta inspector-empty">{empty}</p>
          {domSection}
        </>
      ) : !showTree && !showFlow ? (
        <>
          <p className="meta inspector-empty">
            Turn on Tree and state to see each component with its props and state, or Flow trace to
            follow what a click sets in motion.
          </p>
          {domSection}
        </>
      ) : (
        <>
          {showFlow && (
            <section className="inspector-flow" aria-label="Flow trace">
              <FlowView
                traces={flowTraces}
                inspectorCommits={inspectorCommits}
                latestCommit={latestCommit}
                networkRequests={networkRequests}
                runId={runId}
                onHighlight={highlightMany}
                onJumpToCode={onJumpToCode}
                announce={announceTrace}
              />
            </section>
          )}
          {showTree && pinned.length > 0 && (
            <div className="inspector-pinned">
              <h3 className="inspector-subheading">Watching</h3>
              <ul className="inspector-tree inspector-tree--root">
                {pinned.map((component) => (
                  <ComponentRow
                    key={component.id}
                    component={{ ...component, children: [] }}
                    {...rowProps}
                  />
                ))}
              </ul>
            </div>
          )}
          {showTree && (
            <>
              <h3 className="inspector-subheading">Component tree</h3>
              <ul className="inspector-tree inspector-tree--root">
                {tree.map((component) => (
                  <ComponentRow key={component.id} component={component} {...rowProps} />
                ))}
              </ul>
              <p className="meta inspector-help">
                Select a component to open its declaration. Click a label in the result to jump to
                the JSX that used it.
              </p>
            </>
          )}
          {domSection}
        </>
      )}
      {!announce && <LiveRegion message={ownMessage} />}
    </section>
  );
}
