import { use, useCallback, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { loadIndex, loadTopic } from "./content.js";
import { NotFoundNotice, contentFallback } from "./ContentState.jsx";
import PageTitle from "./PageTitle.jsx";
import { formatDate } from "./format.js";
import EditStep from "../ui/EditStep.jsx";
import StepExplanation from "../ui/StepExplanation.jsx";
import StepNav from "../ui/StepNav.jsx";
import LiveRegion from "../ui/LiveRegion.jsx";
import { LocalDownload, MarkDone } from "../ui/StepActions.jsx";

export default function TopicPage() {
  const { id, n = "1" } = useParams();
  const index = use(loadIndex());
  const indexFallback = contentFallback(index, { standalone: true });
  if (indexFallback) return indexFallback;
  return <TopicContent id={id} n={n} index={index.data} />;
}

function TopicContent({ id, n, index }) {
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
  const titles = new Map((index.topics ?? []).map((candidate) => [candidate.id, candidate.title]));

  return (
    <div className="topic-page">
      <PageTitle>{step ? `Step ${step.n}: ${step.title} · ${topic.title}` : topic.title}</PageTitle>
      <header className="topic-header">
        <p className="eyebrow">
          <Link to="/topics">Topics</Link>
        </p>
        <h1>{topic.title}</h1>
        <p className="topic-header__summary">{topic.summary}</p>
        <p className="meta">
          About {topic.minutes} minutes · Updated{" "}
          <time dateTime={topic.updated}>{formatDate(topic.updated)}</time>
          {topic.changeNote && <> · {topic.changeNote}</>}
        </p>
        {topic.prerequisites?.length > 0 && (
          <p className="meta">
            Before this:{" "}
            {topic.prerequisites.map((prerequisite, i) => (
              <span key={prerequisite}>
                {i > 0 && ", "}
                <Link to={`/topic/${prerequisite}`}>
                  {titles.get(prerequisite) ?? prerequisite}
                </Link>
              </span>
            ))}
          </p>
        )}
      </header>
      {step ? (
        <StepView
          key={`${topic.id}/${step.n}`}
          topic={topic}
          step={step}
          presets={index.presets ?? []}
        />
      ) : (
        <NotFoundNotice what="Step">
          <p>
            This topic has no step {n}. <Link to={`/topic/${topic.id}`}>Start at step 1</Link>.
          </p>
        </NotFoundNotice>
      )}
      <StepNav topic={topic} stepNumber={stepNumber} />
    </div>
  );
}

function StepView({ topic, step, presets }) {
  const [message, setMessage] = useState(null);
  const counter = useRef(0);
  const announce = useCallback((text) => {
    counter.current += 1;
    setMessage({ id: counter.current, text });
  }, []);
  const stepCount = topic.steps.length;

  if (step.mode === "edit" && step.workspace) {
    return (
      <>
        <EditStep
          topic={topic}
          step={step}
          presets={presets}
          announce={announce}
          explanation={<StepExplanation step={step} stepCount={stepCount} />}
        />
        <LiveRegion message={message} />
      </>
    );
  }

  return (
    <div className="step-layout step-layout--single">
      <StepExplanation step={step} stepCount={stepCount}>
        {step.mode === "local" && <LocalDownload topic={topic} step={step} announce={announce} />}
        <MarkDone topic={topic} step={step} announce={announce} />
      </StepExplanation>
      <LiveRegion message={message} />
    </div>
  );
}
