import { use } from "react";
import { Link, useParams } from "react-router";
import { loadIndex } from "./content.js";
import { NotFoundNotice, contentFallback } from "./ContentState.jsx";
import PageTitle from "./PageTitle.jsx";

export default function UnitPage() {
  const { pathId, unit: unitId } = useParams();
  const index = use(loadIndex());
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

  const titles = new Map((index.data.topics ?? []).map((topic) => [topic.id, topic.title]));
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
      <TopicLinks heading="Required topics" topics={required} titles={titles} />
      <TopicLinks heading="Optional topics" topics={optional} titles={titles} />
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

function TopicLinks({ heading, topics, titles }) {
  if (topics.length === 0) return null;
  return (
    <section>
      <h2>{heading}</h2>
      <ol className="step-list">
        {topics.map((topic) => (
          <li key={topic.id}>
            <Link to={`/topic/${topic.id}`}>{titles.get(topic.id) ?? topic.id}</Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
