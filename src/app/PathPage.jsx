import { use } from "react";
import { Link, useParams } from "react-router";
import { loadIndex } from "./content.js";
import { NotFoundNotice, contentFallback } from "./ContentState.jsx";
import PageTitle from "./PageTitle.jsx";
import { countLabel } from "./format.js";
import ProgressNote from "../progress/ProgressNote.jsx";
import { setChosenPath, topicCompletion, useProgress } from "../progress/store.js";

export default function PathPage() {
  const { pathId } = useParams();
  const index = use(loadIndex());
  const progress = useProgress();
  const fallback = contentFallback(index, { standalone: true });
  if (fallback) return fallback;

  const path = index.data.paths?.find((candidate) => candidate.id === pathId);
  if (!path) {
    return (
      <NotFoundNotice what="Path" standalone>
        <p>
          There is no path with the id <code>{pathId}</code>. <Link to="/">Go home</Link>.
        </p>
      </NotFoundNotice>
    );
  }
  const following = progress.pathId === path.id;

  return (
    <>
      <PageTitle>{path.title}</PageTitle>
      <div className="page-intro">
        <p className="eyebrow">Path</p>
        <h1>{path.title}</h1>
        {following ? (
          <p className="meta">You follow this path, so its weeks appear on the home page.</p>
        ) : (
          <button type="button" className="button" onClick={() => setChosenPath(path.id)}>
            Follow {path.title}
          </button>
        )}
      </div>
      <UnitList path={path} index={index.data} headingLevel={2} />
    </>
  );
}

export function unitProgress(unit, index, progress) {
  const topics = new Map((index.topics ?? []).map((topic) => [topic.id, topic]));
  let done = 0;
  let total = 0;
  for (const entry of unit.topics ?? []) {
    if (!entry.required || !topics.has(entry.id)) continue;
    const completion = topicCompletion(progress, topics.get(entry.id));
    total += completion.total;
    done += completion.done;
  }
  return { done, total };
}

export function UnitList({ path, index, headingLevel = 2 }) {
  const progress = useProgress();
  const Heading = `h${headingLevel}`;

  return (
    <ol className="card-list">
      {(path.units ?? []).map((unit) => {
        const { done, total } = unitProgress(unit, index, progress);
        return (
          <li key={unit.id}>
            <article className="card">
              <Heading>
                <Link to={`/path/${path.id}/${unit.id}`}>{unit.title}</Link>
              </Heading>
              <p className="meta">{countLabel(unit.topics?.length ?? 0, "topic")}</p>
              {total > 0 && (
                <ProgressNote
                  done={done}
                  total={total}
                  label={
                    done === total
                      ? "Every required step complete"
                      : `${done} of ${total} required steps complete`
                  }
                  name={`${unit.title} progress`}
                />
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
