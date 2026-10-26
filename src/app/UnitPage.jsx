import { use } from "react";
import { Link, useParams } from "react-router";
import { loadIndex } from "./content.js";
import { NotFoundNotice, contentFallback } from "./ContentState.jsx";
import PageTitle from "./PageTitle.jsx";
import { TopicProgress } from "./Catalog.jsx";
import { useProgress } from "../progress/store.js";

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
      <TopicLinks
        heading="Required topics"
        topics={required}
        topicsById={topicsById}
        progress={progress}
      />
      <TopicLinks
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

function TopicLinks({ heading, topics, topicsById, progress }) {
  if (topics.length === 0) return null;
  return (
    <section>
      <h2>{heading}</h2>
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
                    {topic.steps?.length ?? 0} steps · about {topic.minutes} minutes
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
