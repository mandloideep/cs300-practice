import "../styles/content.css";

export default function StepExplanation({ step, stepCount, children }) {
  return (
    <section className="pane pane--explanation" aria-labelledby="step-heading">
      <p className="eyebrow">
        Step {step.n} of {stepCount}
      </p>
      <h2 id="step-heading" className="step-title">
        {step.title}
      </h2>
      <div className="step-content" dangerouslySetInnerHTML={{ __html: step.html ?? "" }} />
      {children}
    </section>
  );
}
