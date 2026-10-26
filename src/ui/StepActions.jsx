import { strToU8, zipSync } from "fflate";
import { markStepComplete, stepKey, useProgress } from "../progress/store.js";

export function downloadWorkspace(files, name) {
  const entries = Object.fromEntries(
    Object.entries(files).map(([path, source]) => [`${name}/${path}`, strToU8(source)]),
  );
  const blob = new Blob([zipSync(entries)], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.zip`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function LocalDownload({ topic, step, announce }) {
  if (!step.local) return null;
  const name = `${topic.id}-step-${step.n}`;
  const count = Object.keys(step.local).length;

  return (
    <div className="local-download">
      <button
        type="button"
        className="button button--primary"
        onClick={() => {
          downloadWorkspace(step.local, name);
          announce(`Downloading ${name}.zip.`);
        }}
      >
        Download this workspace
      </button>
      <p className="meta">
        {name}.zip, {count} {count === 1 ? "file" : "files"}. Unzip it, then run{" "}
        <code>npm install</code> and <code>npm run dev</code> in the folder.
      </p>
    </div>
  );
}

export function MarkDone({ topic, step, announce }) {
  const progress = useProgress();
  const done = Boolean(progress.completed[stepKey(topic.id, step.n)]);

  return (
    <div className="mark-done">
      {done ? (
        <p className="status-pill status-pill--settled">Step complete</p>
      ) : (
        <button
          type="button"
          className="button"
          onClick={() => {
            markStepComplete(topic.id, step.n);
            announce("Step marked as complete.");
          }}
        >
          {step.mode === "local" ? "I did this on my computer" : "Mark this step as read"}
        </button>
      )}
    </div>
  );
}
