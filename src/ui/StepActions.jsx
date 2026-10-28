import { isStepComplete, markStepComplete, useProgress } from "../progress/store.js";
import {
  isVanillaWorkspace,
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
        {name}.zip, {count} {count === 1 ? "file" : "files"}.{" "}
        {"package.json" in step.local ? (
          <>
            Unzip it, then run <code>npm install</code> and <code>npm run dev</code> in the folder.
          </>
        ) : "index.html" in step.local ? (
          <>
            Unzip it and open its <code>index.html</code> in your browser; there is nothing to
            install.
          </>
        ) : (
          "Unzip it; there is nothing to install."
        )}
      </p>
    </div>
  );
}

// The toolbar button of an edit step: the student's current files as a plain Vite project, or
// as a folder to open or serve when the workspace is plain HTML, CSS, and JavaScript.
export function WorkspaceDownload({
  topic,
  step,
  files,
  api = null,
  announce,
  className = "button",
}) {
  const name = workspaceProjectName(topic.id, step.n);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        downloadWorkspace(workspaceProjectFiles({ topic, step, files, api }), name);
        announce(
          isVanillaWorkspace(step, files)
            ? `Downloading ${name}.zip, a folder with your files for this step; open its index.html or serve the folder.`
            : `Downloading ${name}.zip, a Vite project with your files for this step.`,
        );
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
