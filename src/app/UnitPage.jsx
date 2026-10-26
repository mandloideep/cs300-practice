import { use } from "react";
import { Link, useParams } from "react-router";
import { loadIndex } from "./content.js";
import { NotFoundNotice, contentFallback } from "./ContentState.jsx";
import PageTitle from "./PageTitle.jsx";
import ProgressNote from "../progress/ProgressNote.jsx";
import TopicProgress from "../progress/TopicProgress.jsx";
import { isStepComplete, useProgress } from "../progress/store.js";
import { countLabel } from "./format.js";

export default function UnitPage() {
  const { pathId, unit: unitId } = useParams();
  const index = use(loadIndex());
  const progress = useProgress();
  const fallback = contentFallback(index, { standalone: true });
  if (fallback) return fallback;

  const path = index.data.paths?.find((candidate) => candidate.id === pathId);
  const unit = path?.units?.find((candidate) => candidate.id === unitId);
  if (!unit) {
    return (
      <NotFoundNotice what="Unit" standalone>
        <p>
          There is no unit <code>{unitId}</code> in path <code>{pathId}</code>.{" "}
          {path ? (
            <Link to={`/path/${path.id}`}>See {path.title}</Link>
          ) : (
            <Link to="/">Go home</Link>
          )}
          .
        </p>
      </NotFoundNotice>
    );
  }

  const topicsById = new Map((index.data.topics ?? []).map((topic) => [topic.id, topic]));
  const required = (unit.topics ?? []).filter((topic) => topic.required);
  const optional = (unit.topics ?? []).filter((topic) => !topic.required);
  const summary = unitSummary(required, topicsById, progress);

  return (
    <>
      <PageTitle>{`${unit.title} · ${path.title}`}</PageTitle>
      <div className="page-intro">
        <p className="eyebrow">
          <Link to={`/path/${path.id}`}>{path.title}</Link>
        </p>
        <h1>{unit.title}</h1>
        {unit.intro && <p>{unit.intro}</p>}
      </div>
      <UnitProgress summary={summary} />
      <TopicLinks
        id="required-topics"
        heading="Required topics"
        topics={required}
        topicsById={topicsById}
        progress={progress}
      />
      <TopicLinks
        id="optional-topics"
        heading="Optional topics"
        topics={optional}
        topicsById={topicsById}
        progress={progress}
      />
      {unit.localNotes?.length > 0 && (
        <section className="notice" aria-labelledby="local-notes-heading">
          <h2 id="local-notes-heading">On your own computer</h2>
          <ul>
            {unit.localNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

// The required steps of a unit in order, how many are complete, and the first one that is not.
export function unitSummary(required, topicsById, progress) {
  let done = 0;
  let total = 0;
  let next = null;
  for (const entry of required) {
    const topic = topicsById.get(entry.id);
    for (const step of topic?.steps ?? []) {
      total += 1;
      if (isStepComplete(progress, topic.id, step.n)) done += 1;
      else if (!next) next = { topic, step };
    }
  }
  return { done, total, next };
}

function UnitProgress({ summary }) {
  const { done, total, next } = summary;
  if (total === 0) return null;
  const complete = done === total;
  const label = complete
    ? "Every required step complete"
    : `${done} of ${countLabel(total, "required step")} complete`;

  return (
    <section
      className={complete ? "unit-progress is-complete" : "unit-progress"}
      aria-labelledby="unit-progress-heading"
    >
      <h2 id="unit-progress-heading">Your progress</h2>
      <ProgressNote done={done} total={total} label={label} name="Required steps in this unit" />
      {next && (
        <Link
          className="button button--primary unit-progress__continue"
          to={`/topic/${next.topic.id}/${next.step.n}`}
        >
          Continue: {next.topic.title}, step {next.step.n}
        </Link>
      )}
    </section>
  );
}

function TopicLinks({ id, heading, topics, topicsById, progress }) {
  if (topics.length === 0) return null;
  return (
    <section aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{heading}</h2>
      <ol className="card-list">
        {topics.map((entry) => {
          const topic = topicsById.get(entry.id);
          return (
            <li key={entry.id}>
              <article className="card">
                <h3>
                  <Link to={`/topic/${entry.id}`}>{topic?.title ?? entry.id}</Link>
                </h3>
                {topic?.summary && <p>{topic.summary}</p>}
                {topic && (
                  <p className="meta">
                    {countLabel(topic.steps?.length ?? 0, "step")} · about {topic.minutes} minutes
                  </p>
                )}
                {topic && <TopicProgress topic={topic} progress={progress} />}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
