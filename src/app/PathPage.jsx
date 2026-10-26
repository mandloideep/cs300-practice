import { use } from "react";
import { Link, useParams } from "react-router";
import { loadIndex } from "./content.js";
import { NotFoundNotice, contentFallback } from "./ContentState.jsx";
import PageTitle from "./PageTitle.jsx";
import { countLabel } from "./format.js";

export default function PathPage() {
  const { pathId } = useParams();
  const index = use(loadIndex());
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

  return (
    <>
      <PageTitle>{path.title}</PageTitle>
      <div className="page-intro">
        <p className="eyebrow">Path</p>
        <h1>{path.title}</h1>
      </div>
      <ol className="card-list">
        {(path.units ?? []).map((unit) => (
          <li key={unit.id}>
            <article className="card">
              <h2>
                <Link to={`/path/${path.id}/${unit.id}`}>{unit.title}</Link>
              </h2>
              <p className="meta">{countLabel(unit.topics?.length ?? 0, "topic")}</p>
            </article>
          </li>
        ))}
      </ol>
    </>
  );
}
