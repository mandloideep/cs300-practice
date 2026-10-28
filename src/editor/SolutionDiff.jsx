import { useEffect, useRef, useState } from "react";
import { MergeView } from "@codemirror/merge";
import { readOnlyExtensions } from "./setup.js";
import FileTree from "./FileTree.jsx";

// Side-by-side, read-only diff of the student's files (left) against the solution (right), with
// the step's files as a tree that marks the ones that differ; the diff compares workspace files
// only, so the tree leaves the download's files out.
export default function SolutionDiff({ files, solution, initialFile, layout }) {
  const paths = Object.keys(solution);
  const changed = new Set(paths.filter((path) => files[path] !== solution[path]));
  const [activeFile, setActiveFile] = useState(() =>
    changed.has(initialFile) ? initialFile : ([...changed][0] ?? initialFile ?? paths[0]),
  );
  const hostRef = useRef(null);
  const studentDoc = files[activeFile] ?? "";
  const solutionDoc = solution[activeFile] ?? "";

  useEffect(() => {
    const view = new MergeView({
      a: { doc: studentDoc, extensions: readOnlyExtensions(activeFile, `Your file ${activeFile}`) },
      b: { doc: solutionDoc, extensions: readOnlyExtensions(activeFile, `Solution ${activeFile}`) },
      parent: hostRef.current,
      collapseUnchanged: { margin: 3, minSize: 6 },
      gutter: true,
    });
    return () => view.destroy();
  }, [activeFile, studentDoc, solutionDoc]);

  return (
    <div className="solution-diff">
      <FileTree
        layout={layout}
        activeFile={activeFile}
        onSelect={setActiveFile}
        modifiedFiles={changed}
        showDownload={false}
        idPrefix="solution"
        label="Files to compare"
        markLabel="differs from the solution"
      />
      <div className="solution-diff__compare">
        <div className="solution-diff__labels" aria-hidden="true">
          <span>Your file</span>
          <span>Solution</span>
        </div>
        <div
          id="solution-diff-panel"
          role="group"
          aria-label={`${activeFile}: your file and the solution`}
          aria-describedby="solution-diff-summary"
          className="solution-diff__panel"
          ref={hostRef}
        />
        <p id="solution-diff-summary" className="meta">
          {changed.size === 0
            ? "Your files already match the solution."
            : changed.has(activeFile)
              ? `${activeFile} differs from the solution. Your version is on the left, the solution on the right.`
              : `${activeFile} matches the solution.`}
        </p>
      </div>
    </div>
  );
}
