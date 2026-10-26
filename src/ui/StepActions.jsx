import { isStepComplete, markStepComplete, useProgress } from "../progress/store.js";
import {
  saveZip,
  workspaceProjectFiles,
  workspaceProjectName,
  zipFiles,
} from "./workspaceProject.js";

export function downloadWorkspace(files, name) {
  saveZip(zipFiles(files, name), `${name}.zip`);
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

// The toolbar button of an edit step: the student's current files as a plain Vite project.
export function WorkspaceDownload({ topic, step, files, announce, className = "button" }) {
  const name = workspaceProjectName(topic.id, step.n);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        downloadWorkspace(workspaceProjectFiles({ topic, step, files }), name);
        announce(`Downloading ${name}.zip, a Vite project with your files for this step.`);
      }}
    >
      Download this workspace
    </button>
  );
}

export function MarkDone({ topic, step, announce }) {
  const progress = useProgress();
  const done = isStepComplete(progress, topic.id, step.n);

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
