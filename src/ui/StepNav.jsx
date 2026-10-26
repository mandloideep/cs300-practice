import { Link } from "react-router";
import { isStepComplete, useProgress } from "../progress/store.js";

export default function StepNav({ topic, stepNumber }) {
  const progress = useProgress();
  const steps = topic.steps ?? [];
  const previous = steps.find((step) => step.n === stepNumber - 1);
  const next = steps.find((step) => step.n === stepNumber + 1);
  const done = steps.filter((step) => isStepComplete(progress, topic.id, step.n)).length;

  return (
    <nav className="step-nav" aria-label="Steps in this topic">
      <div className="step-nav__buttons">
        {previous ? (
          <Link className="button" to={`/topic/${topic.id}/${previous.n}`} rel="prev">
            ← Step {previous.n}: {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="button button--primary" to={`/topic/${topic.id}/${next.n}`} rel="next">
            Step {next.n}: {next.title} →
          </Link>
        ) : (
          <Link className="button button--primary" to="/topics">
            Back to all topics
          </Link>
        )}
      </div>
      <h2 className="step-nav__heading">
        Steps{" "}
        <span className="meta">
          ({done} of {steps.length} complete)
        </span>
      </h2>
      <ol className="step-nav__list">
        {steps.map((step) => {
          const complete = isStepComplete(progress, topic.id, step.n);
          const current = step.n === stepNumber;
          return (
            <li key={step.n} className={complete ? "is-complete" : undefined}>
              <span className="step-nav__mark" aria-hidden="true">
                {complete ? "✓" : step.n}
              </span>
              <Link to={`/topic/${topic.id}/${step.n}`} aria-current={current ? "step" : undefined}>
                {step.title}
              </Link>
              {complete && <span className="visually-hidden"> (complete)</span>}
              <span className="meta step-nav__mode">{MODE_LABELS[step.mode] ?? step.mode}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export const MODE_LABELS = { edit: "Edit and run", read: "Read", local: "On your computer" };
