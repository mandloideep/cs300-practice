import { StrictMode, Suspense, use } from "react";
import { createRoot } from "react-dom/client";
import DemoFrame from "../DemoFrame.jsx";
import { builtDemoIds, demoEntries, demoEntry, hasDemo, loadDemo, readProps } from "../index.js";
import "../../styles/tokens.css";
import "../../styles/global.css";
import "../../styles/workspace.css";
import "../../styles/content.css";

// Development-only page that mounts explainers outside a step, for tests/demos.spec.js and for
// authors: ?id=<id> mounts one explainer, ?props=<json> passes it props, and ?width=<px> sets
// the column width; with no id it lists every registered explainer and whether it is built.

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const width = Number(params.get("width")) || null;

function Gallery() {
  const built = new Set(builtDemoIds());
  return (
    <>
      <h1>Explainers</h1>
      <p className="meta">
        {built.size} of {demoEntries.length} registered explainers are built.
      </p>
      <ul className="step-list">
        {demoEntries.map((entry) => (
          <li key={entry.id}>
            {built.has(entry.id) ? (
              <a href={`?id=${entry.id}`}>{entry.title}</a>
            ) : (
              <span>{entry.title}</span>
            )}{" "}
            <code>{entry.id}</code> {built.has(entry.id) ? "" : "(planned)"}
          </li>
        ))}
      </ul>
    </>
  );
}

function One({ id }) {
  const module = use(loadDemo(id));
  return <DemoFrame entry={demoEntry(id)} module={module} props={readProps(params.get("props"))} />;
}

function Page() {
  if (!id) return <Gallery />;
  if (!hasDemo(id)) return <p>No explainer is built for {id}.</p>;
  return (
    <>
      <h1 className="visually-hidden">{demoEntry(id).title}</h1>
      <div className="step-content" style={width ? { width: `${width}px` } : undefined}>
        <div className="demo">
          <Suspense fallback={<p className="meta">Loading…</p>}>
            <One id={id} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <main className="site-main">
      <Page />
    </main>
  </StrictMode>,
);
