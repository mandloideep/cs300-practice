import { use, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { loadIndex } from "./content.js";
import { contentFallback } from "./ContentState.jsx";
import PageTitle from "./PageTitle.jsx";
import { countLabel } from "./format.js";
import { TopicsByArea } from "./Catalog.jsx";
import { UnitList } from "./PathPage.jsx";
import {
  exportProgress,
  markTour,
  parseProgress,
  replaceProgress,
  setChosenPath,
  topicCompletion,
  useProgress,
} from "../progress/store.js";
import { ConfirmDialog } from "../ui/Dialog.jsx";

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
      {contentFallback(index) ?? (
        <>
          <WelcomeCard index={index.data} />
          <HomeContent index={index.data} />
        </>
      )}
      <ProgressTransfer />
    </>
  );
}

export const WELCOME_TOPIC = "using-the-lab";

// The card for new visitors (docs/CONTRACTS.md section 7.6): it points at the topic that teaches
// the lab until every step of it is complete or the student hides the card.
function WelcomeCard({ index }) {
  const progress = useProgress();
  const topic = index.topics?.find((candidate) => candidate.id === WELCOME_TOPIC);
  if (!topic || progress.tour.homeCard || topicCompletion(progress, topic).complete) return null;

  function dismiss() {
    markTour("homeCard");
    document.getElementById("main-content")?.focus();
  }

  return (
    <section className="card welcome-card" aria-labelledby="welcome-heading">
      <h2 id="welcome-heading">New to the lab?</h2>
      <p>
        Start with {topic.title}. In about {topic.minutes} minutes it walks you through a step page,
        from your first edit to a passing check.
      </p>
      <div className="button-row">
        <Link className="button button--primary" to={`/topic/${topic.id}`}>
          Start {topic.title}
        </Link>
        <button type="button" className="button" onClick={dismiss}>
          Hide this card
        </button>
      </div>
    </section>
  );
}

function HomeContent({ index }) {
  const progress = useProgress();
  const paths = index.paths ?? [];
  const chosen = paths.find((path) => path.id === progress.pathId);

  function choose(pathId, focusId) {
    setChosenPath(pathId);
    requestAnimationFrame(() => document.getElementById(focusId)?.focus());
  }

  if (chosen) {
    return (
      <section aria-labelledby="current-path-heading">
        <p className="eyebrow">Your path</p>
        <h2 id="current-path-heading" tabIndex={-1}>
          <Link to={`/path/${chosen.id}`}>{chosen.title}</Link>
        </h2>
        <UnitList path={chosen} index={index} headingLevel={3} />
        <p>
          <Link to="/topics">Browse all {countLabel(index.topics?.length ?? 0, "topic")}</Link>
          {" · "}
          <button
            type="button"
            className="link-button"
            onClick={() => choose(null, "paths-heading")}
          >
            Stop following {chosen.title}
          </button>
        </p>
      </section>
    );
  }

  return (
    <>
      {paths.length > 0 && (
        <section aria-labelledby="paths-heading">
          <h2 id="paths-heading" tabIndex={-1}>
            Semester paths
          </h2>
          <p className="meta">Follow a path to see its weeks on this page each time you visit.</p>
          <ul className="card-list">
            {paths.map((path) => (
              <li key={path.id}>
                <article className="card">
                  <h3>
                    <Link to={`/path/${path.id}`}>{path.title}</Link>
                  </h3>
                  <p className="meta">{countLabel(path.units?.length ?? 0, "unit")}</p>
                  <button
                    type="button"
                    className="button button--small"
                    onClick={() => choose(path.id, "current-path-heading")}
                  >
                    Follow {path.title}
                  </button>
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section aria-labelledby="catalog-heading">
        <h2 id="catalog-heading">All topics</h2>
        <TopicsByArea index={index} headingLevel={3} />
      </section>
    </>
  );
}

function ProgressTransfer() {
  const progress = useProgress();
  const inputRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(null);
  const id = useId();
  const completedCount = Object.keys(progress.completed).length;
  const editedCount = Object.keys(progress.files).length;

  function onExport() {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cs300-lab-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage({ kind: "ok", text: "Your progress was saved as a JSON file." });
  }

  async function onImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = parseProgress(await file.text());
      setMessage(null);
      setPending({ ...parsed, fileName: file.name });
    } catch (error) {
      setMessage({ kind: "error", text: error.message });
    }
  }

  function confirmImport() {
    const next = replaceProgress(pending.snapshot);
    setPending(null);
    setMessage({
      kind: "ok",
      text: `Imported progress with ${countLabel(Object.keys(next.completed).length, "completed step")}.`,
    });
  }

  function cancelImport() {
    setPending(null);
    setMessage({ kind: "ok", text: "Nothing was imported. Your progress is unchanged." });
  }

  return (
    <section className="progress-transfer" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>Your progress</h2>
      <p className="meta">
        Progress stays in this browser only: {countLabel(completedCount, "completed step")} and the
        files you edited in {countLabel(editedCount, "step")}. Export it to move it to another
        browser or device.
      </p>
      <div className="button-row">
        <button type="button" className="button" onClick={onExport}>
          Export progress
        </button>
        <button type="button" className="button" onClick={() => inputRef.current?.click()}>
          Import progress
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={onImport}
        />
      </div>
      <p
        role="status"
        className={message?.kind === "error" ? "form-message form-message--error" : "form-message"}
      >
        {message?.text}
      </p>
      <ConfirmDialog
        open={Boolean(pending)}
        title="Replace your progress?"
        description={
          pending &&
          `${pending.fileName} holds ${countLabel(pending.completedSteps, "completed step")} and edited files for ${countLabel(pending.editedSteps, "step")}. Importing it replaces what this browser has now: ${countLabel(completedCount, "completed step")} and edited files for ${countLabel(editedCount, "step")}.`
        }
        confirmLabel="Replace progress"
        onConfirm={confirmImport}
        onCancel={cancelImport}
      />
    </section>
  );
}
