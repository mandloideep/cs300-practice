import { useEffect, useImperativeHandle, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { Annotation, EditorSelection, EditorState } from "@codemirror/state";
import { editableExtensions, tabId } from "./setup.js";
import FileTabs from "./FileTabs.jsx";

const external = Annotation.define();

// One EditorView for the workspace; each file keeps its own EditorState, so undo history and
// cursor position survive switching tabs.
export default function CodeEditor({
  ref,
  files,
  activeFile,
  onActiveFileChange,
  onChange,
  onRun,
  modifiedFiles,
  idPrefix = "editor",
}) {
  const hostRef = useRef(null);
  const viewRef = useRef(null);
  const statesRef = useRef(new Map());
  const callbacks = useRef({ onChange, onRun });
  const activeRef = useRef(activeFile);

  useEffect(() => {
    callbacks.current = { onChange, onRun };
  });

  function createState(path, doc) {
    return EditorState.create({
      doc,
      extensions: [
        editableExtensions(path, { onRun: () => callbacks.current.onRun?.() }),
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
    jumpTo({ file, line }) {
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
      <p className="code-editor__hint meta">
        Tab indents. To leave the editor, press <kbd>Esc</kbd> and then <kbd>Tab</kbd>. Run with{" "}
        <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or <kbd>⌘</kbd>+<kbd>Enter</kbd>.
      </p>
    </div>
  );
}
