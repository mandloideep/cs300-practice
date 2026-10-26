import { useEffect, useImperativeHandle, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { Annotation, EditorSelection, EditorState } from "@codemirror/state";
import { editableExtensions, tabId } from "./setup.js";
import { flashLines, refreshResultLink, resultLink } from "./resultLink.js";
import FileTabs from "./FileTabs.jsx";

const external = Annotation.define();

// One EditorView for the workspace; each file keeps its own EditorState, so undo history and
// cursor position survive switching tabs. With a run `session`, the editor is linked to the
// result: component names under the cursor or pointer highlight their boxes, and jumps flash
// their lines.
export default function CodeEditor({
  ref,
  files,
  activeFile,
  onActiveFileChange,
  onChange,
  onRun,
  modifiedFiles,
  session = null,
  idPrefix = "editor",
}) {
  const hostRef = useRef(null);
  const viewRef = useRef(null);
  const statesRef = useRef(new Map());
  const callbacks = useRef({ onChange, onRun });
  const activeRef = useRef(activeFile);
  const link = useRef({ components: [], onHighlight: null });
  const latestCommit = session?.latestCommit ?? null;
  const send = session?.send ?? null;

  useEffect(() => {
    callbacks.current = { onChange, onRun };
  });

  useEffect(() => {
    link.current = {
      components: latestCommit?.components ?? [],
      onHighlight: send
        ? (componentIds) => send({ type: "inspector-highlight", componentIds })
        : null,
    };
    refreshResultLink(viewRef.current);
  }, [latestCommit, send]);

  function createState(path, doc) {
    return EditorState.create({
      doc,
      extensions: [
        editableExtensions(path, { onRun: () => callbacks.current.onRun?.() }),
        resultLink({ file: path, link }),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          if (update.transactions.some((tr) => tr.annotation(external))) return;
          callbacks.current.onChange?.(path, update.state.doc.toString());
        }),
      ],
    });
  }

  useEffect(() => {
    const view = new EditorView({ parent: hostRef.current });
    viewRef.current = view;
    const states = statesRef.current;
    return () => {
      view.destroy();
      viewRef.current = null;
      states.clear();
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const states = statesRef.current;
    if (activeRef.current && states.has(activeRef.current)) {
      states.set(activeRef.current, view.state);
    }
    for (const path of [...states.keys()]) {
      if (!(path in files)) states.delete(path);
    }
    for (const [path, doc] of Object.entries(files)) {
      const existing = states.get(path);
      if (!existing) {
        states.set(path, createState(path, doc));
      } else if (existing.doc.toString() !== doc) {
        if (path === activeFile && activeRef.current === activeFile) {
          view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: doc },
            annotations: external.of(true),
          });
          states.set(path, view.state);
        } else {
          states.set(path, createState(path, doc));
        }
      }
    }
    const next = states.get(activeFile);
    if (next && view.state !== next) view.setState(next);
    activeRef.current = activeFile;
  }, [files, activeFile]);

  useImperativeHandle(ref, () => ({
    focus() {
      viewRef.current?.focus();
    },
    // `highlight` optionally lists further { file, line } locations to flash along with the
    // target; only the ones in the file the editor lands on are shown.
    jumpTo({ file, line, highlight }) {
      const landing = file && file in files ? file : activeRef.current;
      const apply = () => {
        const view = viewRef.current;
        if (!view) return;
        const lineCount = view.state.doc.lines;
        const target = view.state.doc.line(Math.min(Math.max(1, Number(line) || 1), lineCount));
        view.dispatch({
          selection: EditorSelection.range(target.from, target.to),
          effects: EditorView.scrollIntoView(target.from, { y: "center" }),
        });
        view.focus();
        const lines = (highlight ?? [{ file: landing, line }])
          .filter((location) => location && location.file === landing)
          .map((location) => Number(location.line));
        flashLines(view, lines.length > 0 ? lines : [target.number]);
      };
      if (file && file !== activeRef.current && file in files) {
        onActiveFileChange(file);
        requestAnimationFrame(apply);
      } else {
        apply();
      }
    },
  }));

  const panelId = `${idPrefix}-panel`;

  return (
    <div className="code-editor">
      <FileTabs
        files={Object.keys(files)}
        activeFile={activeFile}
        onSelect={onActiveFileChange}
        modifiedFiles={modifiedFiles}
        panelId={panelId}
        idPrefix={idPrefix}
      />
      <div
        id={panelId}
        className="code-editor__panel"
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-${tabId(activeFile)}`}
        ref={hostRef}
      />
    </div>
  );
}
