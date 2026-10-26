import { useCallback, useEffect, useId, useRef, useState } from "react";
import LiveRegion from "./LiveRegion.jsx";

const STATUS_LABELS = {
  idle: "Not run yet",
  compiling: "Compiling",
  running: "Running",
  settled: "Ready",
  "compile-error": "Did not compile",
};

export function fullPath(location) {
  return `${location.pathname}${location.search}${location.hash}`;
}

// A typed path is sent as the router would resolve it from the address bar: absolute, and never
// empty.
function normalizePath(text) {
  const trimmed = text.trim();
  if (trimmed === "") return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

// Drawn above the iframe once a run has posted a location: the path of the router's memory
// history with Back and Forward, and a field that navigates to a typed path on Enter.
function AddressBar({ location, send }) {
  const id = useId();
  const path = fullPath(location);
  const [draft, setDraft] = useState(path);
  const [known, setKnown] = useState(path);
  if (known !== path) {
    setKnown(path);
    setDraft(path);
  }

  function submit(event) {
    event.preventDefault();
    send({ type: "navigate", to: normalizePath(draft) });
  }

  return (
    <form className="address-bar" aria-label="Address bar of the result" onSubmit={submit}>
      <button
        type="button"
        className="button button--small"
        onClick={() => send({ type: "navigate", delta: -1 })}
        disabled={location.index <= 0}
      >
        Back
      </button>
      <button
        type="button"
        className="button button--small"
        onClick={() => send({ type: "navigate", delta: 1 })}
        disabled={location.index >= location.length - 1}
      >
        Forward
      </button>
      <label htmlFor={`${id}-path`} className="visually-hidden">
        Path
      </label>
      <input
        id={`${id}-path`}
        className="address-bar__path"
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        spellCheck={false}
        autoComplete="off"
        aria-describedby={`${id}-hint`}
      />
      <span id={`${id}-hint`} className="visually-hidden">
        Type a path and press Enter to go there. The result is now at {path}, entry{" "}
        {location.index + 1} of {location.length} in its history.
      </span>
    </form>
  );
}

// `announce` is optional: when the step page passes its live-region function the pane shares
// that region, and otherwise it renders a polite region of its own for address changes.
export default function ResultPane({ session, onJumpToCode, announce }) {
  const { status, diagnostics, iframeRef, location, send, runId } = session;
  const failed = status === "compile-error";
  const [ownMessage, setOwnMessage] = useState(null);
  const ownCounter = useRef(0);
  const announced = useRef({ runId: null, count: 0 });

  const ownAnnounce = useCallback((text) => {
    ownCounter.current += 1;
    setOwnMessage({ id: ownCounter.current, text });
  }, []);
  const announceAddress = announce ?? ownAnnounce;

  useEffect(() => {
    const seen = announced.current;
    if (seen.runId !== runId) {
      seen.runId = runId;
      seen.count = 0;
    }
    if (!location) return;
    seen.count += 1;
    if (seen.count > 1) announceAddress(`The result is now at ${fullPath(location)}.`);
  }, [location, runId, announceAddress]);

  return (
    <section className="pane pane--result" aria-labelledby="result-heading">
      <div className="pane__header">
        <h2 id="result-heading">Result</h2>
        <span className={`status-pill status-pill--${status}`}>
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>
      {failed && (
        <div className="diagnostics" role="alert">
          <p>
            <strong>Your code did not compile.</strong> Fix the first problem and run again.
          </p>
          <ul>
            {diagnostics.map((diagnostic, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => onJumpToCode({ file: diagnostic.file, line: diagnostic.line })}
                >
                  {diagnostic.file}:{diagnostic.line}
                  {diagnostic.column ? `:${diagnostic.column}` : ""}
                </button>{" "}
                <span>{diagnostic.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {location && !failed && <AddressBar location={location} send={send} />}
      <iframe
        ref={iframeRef}
        title="Result of your code"
        className="result-frame"
        hidden={failed}
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      />
      {!announce && <LiveRegion message={ownMessage} />}
    </section>
  );
}
