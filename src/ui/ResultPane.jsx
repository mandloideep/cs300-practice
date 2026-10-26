const STATUS_LABELS = {
  idle: "Not run yet",
  compiling: "Compiling",
  running: "Running",
  settled: "Ready",
  "compile-error": "Did not compile",
};

export default function ResultPane({ session, onJumpToCode }) {
  const { status, diagnostics, iframeRef } = session;
  const failed = status === "compile-error";

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
      <iframe
        ref={iframeRef}
        title="Result of your code"
        className="result-frame"
        hidden={failed}
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      />
    </section>
  );
}
