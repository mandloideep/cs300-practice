import { useState } from "react";

const LEVEL_LABELS = { log: "log", info: "info", warn: "warning", error: "error", debug: "debug" };

function firstWorkspaceFrame(stack) {
  const match = String(stack ?? "").match(/((?:src\/)?[\w./-]+\.(?:jsx?|mjs)):(\d+)(?::(\d+))?/);
  return match ? { file: match[1], line: Number(match[2]) } : null;
}

export default function ConsolePane({ session, onJumpToCode, files }) {
  const { consoleEntries, errors, runId } = session;
  const [cleared, setCleared] = useState({ runId: null, entries: 0, errors: 0 });
  const offset = cleared.runId === runId ? cleared : { entries: 0, errors: 0 };
  const entries = consoleEntries.slice(offset.entries);
  const shownErrors = errors.slice(offset.errors);
  const total = entries.length + shownErrors.length;

  function location(error) {
    if (error.file && files && error.file in files && error.line) {
      return { file: error.file, line: error.line };
    }
    const frame = firstWorkspaceFrame(error.stack);
    return frame && files && frame.file in files ? frame : null;
  }

  return (
    <section className="pane pane--console" aria-labelledby="console-heading">
      <div className="pane__header">
        <h2 id="console-heading">Console</h2>
        <span className="meta">
          {total === 0 ? "Empty" : `${total} ${total === 1 ? "message" : "messages"}`}
        </span>
        <button
          type="button"
          className="button button--quiet button--small"
          onClick={() =>
            setCleared({ runId, entries: consoleEntries.length, errors: errors.length })
          }
          disabled={total === 0}
        >
          Clear
        </button>
      </div>
      {total === 0 ? (
        <p className="meta console__empty">
          Messages from console.log, warnings, and errors appear here.
        </p>
      ) : (
        <ol className="console-list">
          {shownErrors.map((error, index) => {
            const where = location(error);
            return (
              <li key={`error-${index}`} className="console-entry console-entry--error">
                <span className="level-badge level-badge--error">uncaught</span>
                <div className="console-entry__body">
                  <pre>{String(error.message ?? "").replace(/^Uncaught /, "")}</pre>
                  {where && (
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => onJumpToCode(where)}
                    >
                      {where.file}:{where.line}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
          {entries.map((entry, index) => (
            <li key={`entry-${index}`} className={`console-entry console-entry--${entry.level}`}>
              <span className={`level-badge level-badge--${entry.level}`}>
                {LEVEL_LABELS[entry.level] ?? entry.level}
              </span>
              <div className="console-entry__body">
                <pre>{entry.text}</pre>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
