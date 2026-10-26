import { use } from "react";
import { Link } from "react-router";
import { loadIndex } from "./content.js";
import { contentFallback } from "./ContentState.jsx";
import PageTitle from "./PageTitle.jsx";
import { countLabel } from "./format.js";

export default function Home() {
  const index = use(loadIndex());

  return (
    <>
      <PageTitle />
      <div className="page-intro">
        <h1>CS300 Lab</h1>
        <p>
          Read a short explanation, edit the code, run it, and watch what React does. Everything
          runs in your browser.
        </p>
      </div>
      {contentFallback(index) ?? <HomeContent index={index.data} />}
    </>
  );
}

function HomeContent({ index }) {
  const paths = index.paths ?? [];
  return (
    <>
      <section aria-labelledby="paths-heading">
        <h2 id="paths-heading">Semester paths</h2>
        {paths.length === 0 ? (
          <p className="meta">No paths are published yet.</p>
        ) : (
          <ul className="card-list">
            {paths.map((path) => (
              <li key={path.id}>
                <article className="card">
                  <h3>
                    <Link to={`/path/${path.id}`}>{path.title}</Link>
                  </h3>
                  <p className="meta">{countLabel(path.units?.length ?? 0, "unit")}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="topics-heading">
        <h2 id="topics-heading">Topics</h2>
        <p>
          <Link to="/topics">Browse all {countLabel(index.topics?.length ?? 0, "topic")}</Link>
        </p>
      </section>
    </>
  );
}
