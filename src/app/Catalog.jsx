import { use } from "react";
import { Link } from "react-router";
import { loadIndex } from "./content.js";
import { contentFallback } from "./ContentState.jsx";
import PageTitle from "./PageTitle.jsx";
import { countLabel } from "./format.js";
import { stepKey, useProgress } from "../progress/store.js";

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

export function TopicsByArea({ index, headingLevel = 2 }) {
  const progress = useProgress();
  const topics = index.topics ?? [];
  const AreaHeading = `h${headingLevel}`;
  const TopicHeading = `h${headingLevel + 1}`;
  const titles = new Map(topics.map((topic) => [topic.id, topic.title]));
  const depth = prerequisiteDepth(topics);
  const areas = (index.areas ?? [])
    .map((area) => ({
      ...area,
      topics: topics
        .filter((topic) => topic.area === area.id)
        .sort((a, b) => depth.get(a.id) - depth.get(b.id) || a.title.localeCompare(b.title)),
    }))
    .filter((area) => area.topics.length > 0);

  if (areas.length === 0) {
    return <p className="meta">No topics are published yet.</p>;
  }

  return areas.map((area) => (
    <section key={area.id} aria-labelledby={`area-${area.id}`}>
      <AreaHeading id={`area-${area.id}`}>{area.title}</AreaHeading>
      <ul className="card-list">
        {area.topics.map((topic) => (
          <li key={topic.id}>
            <article className="card">
              <TopicHeading>
                <Link to={`/topic/${topic.id}`}>{topic.title}</Link>
              </TopicHeading>
              <p>{topic.summary}</p>
              <p className="meta">
                {countLabel(topic.steps?.length ?? 0, "step")} · about {topic.minutes} minutes
              </p>
              <TopicProgress topic={topic} progress={progress} />
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

export function TopicProgress({ topic, progress }) {
  const steps = topic.steps ?? [];
  const done = steps.filter((step) => progress.completed[stepKey(topic.id, step.n)]).length;
  if (done === 0) return null;
  return (
    <p className={done === steps.length ? "meta progress-note is-complete" : "meta progress-note"}>
      {done === steps.length ? "✓ Complete" : `${done} of ${steps.length} steps complete`}
    </p>
  );
}

// How many prerequisite steps lead to each topic, so a topic is listed after the ones it needs.
function prerequisiteDepth(topics) {
  const byId = new Map(topics.map((topic) => [topic.id, topic]));
  const depth = new Map();
  const visit = (id, seen = new Set()) => {
    if (depth.has(id)) return depth.get(id);
    if (seen.has(id) || !byId.has(id)) return 0;
    seen.add(id);
    const value =
      Math.max(-1, ...(byId.get(id).prerequisites ?? []).map((p) => visit(p, seen))) + 1;
    depth.set(id, value);
    return value;
  };
  topics.forEach((topic) => visit(topic.id));
  return depth;
}
