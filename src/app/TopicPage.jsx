import { use } from "react";
import { Link, useParams } from "react-router";
import { loadIndex, loadTopic } from "./content.js";
import { NotFoundNotice, contentFallback } from "./ContentState.jsx";
import PageTitle from "./PageTitle.jsx";

export default function TopicPage() {
  const { id, n = "1" } = useParams();
  const index = use(loadIndex());
  const indexFallback = contentFallback(index, { standalone: true });
  if (indexFallback) return indexFallback;
  const result = use(loadTopic(id));

  if (result.status === "missing") {
    return (
      <NotFoundNotice what="Topic" standalone>
        <p>
          There is no topic with the id <code>{id}</code>.{" "}
          <Link to="/topics">Browse all topics</Link>.
        </p>
      </NotFoundNotice>
    );
  }
  const fallback = contentFallback(result, { standalone: true });
  if (fallback) return fallback;

  const topic = result.data;
  const steps = topic.steps ?? [];
  const stepNumber = Number(n);
  const step = steps.find((candidate) => candidate.n === stepNumber);

  return (
    <>
      <PageTitle>{step ? `${step.title} · ${topic.title}` : topic.title}</PageTitle>
      <div className="page-intro">
        <p className="eyebrow">Topic</p>
        <h1>{topic.title}</h1>
        <p>{topic.summary}</p>
      </div>
      {step ? (
        <section aria-labelledby="step-heading">
          <p className="eyebrow">
            Step {step.n} of {steps.length}
          </p>
          <h2 id="step-heading">{step.title}</h2>
          <p className="meta">The step workspace appears here.</p>
        </section>
      ) : (
        <NotFoundNotice what="Step">
          <p>
            This topic has no step {n}. <Link to={`/topic/${topic.id}`}>Start at step 1</Link>.
          </p>
        </NotFoundNotice>
      )}
      <nav aria-label="Steps in this topic">
        <h2>Steps</h2>
        <ol className="step-list">
          {steps.map((candidate) => (
            <li key={candidate.n}>
              <Link
                to={`/topic/${topic.id}/${candidate.n}`}
                aria-current={candidate.n === stepNumber ? "step" : undefined}
              >
                {candidate.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
