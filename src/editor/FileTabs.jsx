import { useRef } from "react";
import { tabId } from "./setup.js";

// Tabs follow the WAI-ARIA tabs pattern: one tab stop, arrow keys move between files.
export default function FileTabs({
  files,
  activeFile,
  onSelect,
  modifiedFiles,
  panelId,
  idPrefix,
}) {
  const listRef = useRef(null);

  function onKeyDown(event) {
    const index = files.indexOf(activeFile);
    let next = null;
    if (event.key === "ArrowRight") next = (index + 1) % files.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + files.length) % files.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = files.length - 1;
    if (next === null) return;
    event.preventDefault();
    onSelect(files[next]);
    requestAnimationFrame(() => {
      listRef.current?.querySelector(`[data-path="${CSS.escape(files[next])}"]`)?.focus();
    });
  }

  return (
    <div className="file-tabs" role="tablist" aria-label="Files" ref={listRef}>
      {files.map((path) => {
        const selected = path === activeFile;
        const modified = modifiedFiles?.has(path);
        return (
          <button
            key={path}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tabId(path)}`}
            data-path={path}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            className="file-tabs__tab"
            onClick={() => onSelect(path)}
            onKeyDown={onKeyDown}
          >
            {path}
            {modified && (
              <span className="file-tabs__modified" aria-label="edited" title="Edited">
                •
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
