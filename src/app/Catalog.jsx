import { use } from "react";
import { Link } from "react-router";
import { loadIndex } from "./content.js";
import { contentFallback } from "./ContentState.jsx";
import PageTitle from "./PageTitle.jsx";
import { countLabel } from "./format.js";

export default function Catalog() {
  const index = use(loadIndex());

  return (
    <>
      <PageTitle>Topics</PageTitle>
      <div className="page-intro">
        <h1>Topics</h1>
        <p>Each topic is one skill, taught in small steps you edit and run.</p>
      </div>
      {contentFallback(index) ?? <TopicsByArea index={index.data} />}
    </>
  );
}

function TopicsByArea({ index }) {
  const topics = index.topics ?? [];
  const titles = new Map(topics.map((topic) => [topic.id, topic.title]));
  const areas = (index.areas ?? [])
    .map((area) => ({ ...area, topics: topics.filter((topic) => topic.area === area.id) }))
    .filter((area) => area.topics.length > 0);

  if (areas.length === 0) {
    return <p className="meta">No topics are published yet.</p>;
  }

  return areas.map((area) => (
    <section key={area.id} aria-labelledby={`area-${area.id}`}>
      <h2 id={`area-${area.id}`}>{area.title}</h2>
      <ul className="card-list">
        {area.topics.map((topic) => (
          <li key={topic.id}>
            <article className="card">
              <h3>
                <Link to={`/topic/${topic.id}`}>{topic.title}</Link>
              </h3>
              <p>{topic.summary}</p>
              <p className="meta">
                {countLabel(topic.steps?.length ?? 0, "step")} · about {topic.minutes} minutes
              </p>
              {topic.prerequisites?.length > 0 && (
                <p className="meta">
                  Before this:{" "}
                  {topic.prerequisites.map((id, i) => (
                    <span key={id}>
                      {i > 0 && ", "}
                      <Link to={`/topic/${id}`}>{titles.get(id) ?? id}</Link>
                    </span>
                  ))}
                </p>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  ));
}
