import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeEditor from "../editor/CodeEditor.jsx";
import { useRunSession } from "../runner/useRunSession.js";
import {
  clearEditedFiles,
  getEditedFiles,
  markStepComplete,
  saveEditedFiles,
} from "../progress/store.js";
import InspectorPane from "../inspector/InspectorPane.jsx";
import NetworkPane from "../network/NetworkPane.jsx";
import ApiSourceSelector from "../network/ApiSourceSelector.jsx";
import Dialog, { ConfirmDialog } from "./Dialog.jsx";
import ResultPane from "./ResultPane.jsx";
import ConsolePane from "./ConsolePane.jsx";
import CheckPanel, { checkSummaryText, summarizeChecks } from "./CheckPanel.jsx";
import { WorkspaceDownload } from "./StepActions.jsx";

const SolutionDiff = lazy(() => import("../editor/SolutionDiff.jsx"));

const DEFAULT_FIXTURE_CONTROLS = {
  latencyMs: 0,
  errorStatus: null,
  malformedBody: false,
  dropConnection: false,
};

export function customBaseKey(topicId, n) {
  return `cs300-lab:custom-base:${topicId}/${n}`;
}

function readCustomBase(topicId, n) {
  try {
    return window.localStorage.getItem(customBaseKey(topicId, n)) ?? "";
  } catch {
    return "";
  }
}

function initialApiSource(step, topicId) {
  const choice = step.api?.default;
  if (choice === "custom") return { kind: "custom", baseUrl: readCustomBase(topicId, step.n) };
  if (choice && choice !== "fixtures") return { kind: "preset", id: choice };
  return { kind: "fixtures" };
}

function initialFiles(step, topicId) {
  const saved = getEditedFiles(topicId, step.n) ?? {};
  const files = { ...step.workspace };
  for (const [path, source] of Object.entries(saved)) {
    if (path in files && typeof source === "string") files[path] = source;
  }
  return files;
}

function initialActiveFile(step) {
  const target = step.edits?.find((edit) => edit.file in step.workspace)?.file;
  return target ?? (step.entry in step.workspace ? step.entry : Object.keys(step.workspace)[0]);
}

function changedFiles(files, starter) {
  return Object.fromEntries(
    Object.entries(files).filter(([path, source]) => source !== starter[path]),
  );
}

export default function EditStep({ topic, step, presets, announce, explanation }) {
  const starter = step.workspace;
  const [files, setFiles] = useState(() => initialFiles(step, topic.id));
  const [activeFile, setActiveFile] = useState(() => initialActiveFile(step));
  const [apiSource, setApiSource] = useState(() => initialApiSource(step, topic.id));
  const [fixtureControls, setFixtureControls] = useState(DEFAULT_FIXTURE_CONTROLS);
  const [runRequest, setRunRequest] = useState(1);
  const [dialog, setDialog] = useState(null);
  const editorRef = useRef(null);
  const session = useRunSession({ step, files, apiSource, fixtureControls });
  const { run, status, diagnostics, checkResults } = session;

  const modifiedFiles = useMemo(
    () => new Set(Object.keys(files).filter((path) => files[path] !== starter[path])),
    [files, starter],
  );

  const requestRun = useCallback(() => setRunRequest((count) => count + 1), []);

  useEffect(() => {
    if (runRequest > 0) run();
  }, [runRequest, run]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const changed = changedFiles(files, starter);
      if (Object.keys(changed).length === 0) clearEditedFiles(topic.id, step.n);
      else saveEditedFiles(topic.id, step.n, changed);
    }, 300);
    return () => clearTimeout(timer);
  }, [files, starter, topic.id, step.n]);

  useEffect(() => {
    if (apiSource.kind !== "custom") return;
    try {
      window.localStorage.setItem(customBaseKey(topic.id, step.n), apiSource.baseUrl ?? "");
    } catch {
      // Without storage the base URL lasts for this visit only.
    }
  }, [apiSource, topic.id, step.n]);

  useEffect(() => {
    if (status === "compiling") announce("Running your code.");
    else if (status === "compile-error") {
      const first = diagnostics[0];
      announce(
        first
          ? `Your code did not compile. ${first.file} line ${first.line}: ${first.message}`
          : "Your code did not compile.",
      );
    } else if (status === "settled") announce("The result is ready.");
  }, [status, diagnostics, announce]);

  useEffect(() => {
    if (!checkResults) return;
    const summary = summarizeChecks(step, checkResults);
    announce(checkSummaryText(summary));
    if (summary.complete) markStepComplete(topic.id, step.n);
  }, [checkResults, step, topic.id, announce]);

  const onChange = useCallback((path, source) => {
    setFiles((previous) =>
      previous[path] === source ? previous : { ...previous, [path]: source },
    );
  }, []);

  const chooseApiSource = useCallback(
    (next) => {
      if (next.kind === "custom" && next.baseUrl === undefined) {
        setApiSource({ kind: "custom", baseUrl: readCustomBase(topic.id, step.n) });
      } else {
        setApiSource(next);
      }
    },
    [topic.id, step.n],
  );

  const jumpToCode = useCallback((location) => editorRef.current?.jumpTo(location), []);

  function resetToStarter() {
    setDialog(null);
    setFiles({ ...starter });
    clearEditedFiles(topic.id, step.n);
    announce("The files are back to the starter.");
    requestRun();
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  function loadSolution() {
    setDialog(null);
    setFiles({ ...step.solution });
    announce("The solution is loaded into the editor.");
    requestRun();
  }

  const running = status === "compiling";

  return (
    <div className="step-layout">
      {explanation}
      <div className="step-work">
        <section className="pane pane--editor" aria-labelledby="editor-heading">
          <div className="pane__header">
            <h2 id="editor-heading">Editor</h2>
            <span className="meta">
              {modifiedFiles.size === 0
                ? "Starter files"
                : `${modifiedFiles.size} ${modifiedFiles.size === 1 ? "file" : "files"} edited`}
            </span>
          </div>
          <CodeEditor
            ref={editorRef}
            files={files}
            activeFile={activeFile}
            onActiveFileChange={setActiveFile}
            onChange={onChange}
            onRun={requestRun}
            modifiedFiles={modifiedFiles}
          />
          <p className="editor-hint meta" id="editor-keyboard-hint">
            Inside the editor, <kbd>Tab</kbd> indents. To move on to the buttons below, press{" "}
            <kbd>Esc</kbd> and then <kbd>Tab</kbd>. Run with <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or{" "}
            <kbd>⌘</kbd>+<kbd>Enter</kbd>.
          </p>
          <div className="toolbar" role="toolbar" aria-label="Workspace actions">
            <button
              type="button"
              className="button button--primary"
              onClick={requestRun}
              disabled={running}
            >
              Run
            </button>
            <button
              type="button"
              className="button"
              onClick={() => session.runChecks()}
              disabled={status !== "settled"}
            >
              Run checks
            </button>
            <button type="button" className="button" onClick={() => setDialog("solution")}>
              Show solution
            </button>
            <button
              type="button"
              className="button"
              onClick={() => setDialog("reset")}
              disabled={modifiedFiles.size === 0}
            >
              Reset to starter
            </button>
            <WorkspaceDownload topic={topic} step={step} files={files} announce={announce} />
          </div>
          {step.api && (
            <ApiSourceSelector
              presets={presets}
              value={apiSource}
              onChange={chooseApiSource}
              fixturesAvailable={Boolean(step.fixtures)}
              fixtureControls={fixtureControls}
              onFixtureControlsChange={setFixtureControls}
            />
          )}
        </section>
        <ResultPane session={session} onJumpToCode={jumpToCode} />
        <ConsolePane session={session} onJumpToCode={jumpToCode} files={files} />
        <InspectorPane session={session} step={step} onJumpToCode={jumpToCode} />
        {(step.api || step.fixtures) && (
          <NetworkPane
            session={session}
            onJumpToCode={jumpToCode}
            apiSource={apiSource}
            presets={presets}
          />
        )}
        <CheckPanel step={step} session={session} />
      </div>

      <ConfirmDialog
        open={dialog === "reset"}
        title="Reset to the starter files?"
        description="This replaces every file in the editor with the starter for this step. Your edits to this step are deleted from this browser."
        confirmLabel="Reset files"
        onConfirm={resetToStarter}
        onCancel={() => setDialog(null)}
      />
      <Dialog
        open={dialog === "solution"}
        onClose={() => setDialog(null)}
        title="Your files and the solution"
        description="Compare your files with the solution side by side. Loading the solution replaces your files in the editor."
        wide
        actions={
          <>
            <button type="button" className="button button--primary" onClick={loadSolution}>
              Load solution
            </button>
            <button type="button" className="button" onClick={() => setDialog(null)}>
              Keep my files
            </button>
          </>
        }
      >
        <Suspense fallback={<p className="meta">Loading the comparison…</p>}>
          <SolutionDiff files={files} solution={step.solution} initialFile={activeFile} />
        </Suspense>
      </Dialog>
    </div>
  );
}
