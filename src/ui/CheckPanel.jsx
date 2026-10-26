export function requiredIds(step, results) {
  return step.required ?? (results ?? []).map((result) => result.id);
}

export function summarizeChecks(step, results) {
  if (!results) return null;
  const required = new Set(requiredIds(step, results));
  const passed = results.filter((result) => result.pass).length;
  const requiredResults = results.filter((result) => required.has(result.id));
  const requiredPassed = requiredResults.filter((result) => result.pass).length;
  const complete = requiredResults.length > 0 && requiredPassed === requiredResults.length;
  return {
    total: results.length,
    passed,
    requiredTotal: requiredResults.length,
    requiredPassed,
    complete,
  };
}

export function checkSummaryText(summary) {
  if (!summary) return "";
  const base = `${summary.passed} of ${summary.total} checks pass.`;
  if (summary.complete) return `${base} Every required check passes, so this step is complete.`;
  return `${base} ${summary.requiredPassed} of ${summary.requiredTotal} required checks pass.`;
}

export default function CheckPanel({ step, session }) {
  const { checkResults, status } = session;
  const summary = summarizeChecks(step, checkResults);
  const required = new Set(requiredIds(step, checkResults));

  return (
    <section className="pane pane--checks" aria-labelledby="checks-heading">
      <div className="pane__header">
        <h2 id="checks-heading">Checks</h2>
        {summary && (
          <span className={summary.complete ? "status-pill status-pill--settled" : "status-pill"}>
            {summary.complete ? "Step complete" : `${summary.passed} of ${summary.total} pass`}
          </span>
        )}
      </div>
      {!checkResults ? (
        <p className="meta">
          {status === "compile-error"
            ? "The checks run once your code compiles."
            : "The checks run after the result is ready."}
        </p>
      ) : (
        <>
          <p className="check-summary">{checkSummaryText(summary)}</p>
          <ul className="check-list">
            {checkResults.map((result) => (
              <li
                key={result.id}
                className={result.pass ? "check check--pass" : "check check--fail"}
              >
                <span className="check__icon" aria-hidden="true">
                  {result.pass ? "✓" : "✗"}
                </span>
                <div>
                  <p className="check__title">
                    <span className="visually-hidden">
                      {result.pass ? "Passed: " : "Not yet: "}
                    </span>
                    {result.title}
                    {required.has(result.id) && <span className="required-badge">required</span>}
                  </p>
                  {!result.pass && result.hint && <p className="check__hint">{result.hint}</p>}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
