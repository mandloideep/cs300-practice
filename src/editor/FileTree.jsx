import { useEffect, useId, useMemo, useRef, useState } from "react";
import { tabId } from "./setup.js";
import { DOWNLOAD_NOTE } from "./fileRoles.js";

// The project of a step as a tree, per docs/CONTRACTS.md section 8.2: the entries of
// projectLayout in their folders, the active file selected, an edited file marked, and the
// entries only the download has under one collapsed node, "On your computer". It follows the
// WAI-ARIA tree pattern as one tab stop: Up and Down move, Left collapses or goes to the parent,
// Right expands or goes to the first child, Home and End jump, Enter and Space open, and a letter
// moves to the next entry that starts with it. Opening a workspace file selects it in the editor;
// opening any entry shows its description in the line under the tree.

const GROUP = "download:";
const GROUP_NAME = "On your computer";
const GROUP_DESCRIPTION =
  "The files the project you download has beyond the ones here, including the ones npm creates.";
const FOLDER_FALLBACK = "A folder of this step's project.";

function buildNodes(layout, showDownload) {
  const nodes = [];
  const keyOf = (entry) => (entry.source === "download" ? `${GROUP}${entry.path}` : entry.path);
  const parentOf = (entry) => {
    const slash = entry.path.lastIndexOf("/");
    if (slash === -1) return entry.source === "download" ? GROUP : null;
    const parentPath = entry.path.slice(0, slash);
    return entry.source === "download" ? `${GROUP}${parentPath}` : parentPath;
  };
  const workspace = layout.filter((entry) => entry.source === "workspace");
  const download = showDownload ? layout.filter((entry) => entry.source === "download") : [];
  for (const entry of workspace) {
    nodes.push({ ...entry, key: keyOf(entry), level: entry.depth + 1, parent: parentOf(entry) });
  }
  if (download.length > 0) {
    nodes.push({
      key: GROUP,
      path: null,
      name: GROUP_NAME,
      kind: "folder",
      source: "group",
      description: GROUP_DESCRIPTION,
      createdBy: null,
      level: 1,
      parent: null,
    });
    for (const entry of download) {
      nodes.push({ ...entry, key: keyOf(entry), level: entry.depth + 2, parent: parentOf(entry) });
    }
  }
  const children = new Map();
  for (const node of nodes) {
    if (!children.has(node.parent)) children.set(node.parent, []);
    children.get(node.parent).push(node.key);
  }
  return nodes.map((node) => {
    const siblings = children.get(node.parent);
    return {
      ...node,
      hasChildren: children.has(node.key),
      setSize: siblings.length,
      position: siblings.indexOf(node.key) + 1,
    };
  });
}

function ancestorsOf(byKey, key) {
  const list = [];
  let parent = byKey.get(key)?.parent ?? null;
  while (parent !== null) {
    list.push(parent);
    parent = byKey.get(parent)?.parent ?? null;
  }
  return list;
}

function describe(node) {
  if (!node) return null;
  if (node.source === "group") return `${node.name}: ${node.description}`;
  const label = node.kind === "folder" ? `${node.path}/` : node.path;
  const sentences = [node.description ?? FOLDER_FALLBACK];
  if (node.source === "download") {
    sentences.push(DOWNLOAD_NOTE);
    if (node.createdBy) sentences.push(`Running ${node.createdBy} creates it.`);
  }
  return `${label}: ${sentences.join(" ")}`;
}

export default function FileTree({
  layout,
  activeFile,
  onSelect,
  modifiedFiles,
  showDownload = true,
  idPrefix = "files",
  label = "Files",
  markLabel = "edited",
  id,
}) {
  const nodes = useMemo(() => buildNodes(layout, showDownload), [layout, showDownload]);
  const byKey = useMemo(() => new Map(nodes.map((node) => [node.key, node])), [nodes]);
  const [collapsed, setCollapsed] = useState(() => new Set([GROUP]));
  const [picked, setPicked] = useState(activeFile);
  const [focusKey, setFocusKey] = useState(activeFile);
  const [seenActive, setSeenActive] = useState(activeFile);
  const listRef = useRef(null);
  const moveFocus = useRef(false);
  const descriptionId = useId();

  if (seenActive !== activeFile) {
    setSeenActive(activeFile);
    setPicked(activeFile);
    setFocusKey(activeFile);
    const hidden = ancestorsOf(byKey, activeFile).filter((key) => collapsed.has(key));
    if (hidden.length > 0) {
      setCollapsed((previous) => new Set([...previous].filter((key) => !hidden.includes(key))));
    }
  }

  const visible = nodes.filter((node) =>
    ancestorsOf(byKey, node.key).every((key) => !collapsed.has(key)),
  );
  const visibleKeys = visible.map((node) => node.key);
  const tabStop = visibleKeys.includes(focusKey)
    ? focusKey
    : (ancestorsOf(byKey, focusKey).find((key) => visibleKeys.includes(key)) ??
      (visibleKeys.includes(activeFile) ? activeFile : visibleKeys[0]));

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    listRef.current?.querySelector(`[data-key="${CSS.escape(tabStop)}"]`)?.focus();
  }, [tabStop]);

  function focusNode(key) {
    moveFocus.current = true;
    setFocusKey(key);
  }

  function setOpen(key, open) {
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (open) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function activate(node) {
    setFocusKey(node.key);
    if (node.hasChildren) {
      setOpen(node.key, collapsed.has(node.key));
      if (node.description) setPicked(node.key);
      return;
    }
    setPicked(node.key);
    if (node.source === "workspace" && node.kind === "file") onSelect(node.path);
  }

  function onKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const index = visibleKeys.indexOf(tabStop);
    const node = byKey.get(tabStop);
    if (!node) return;
    const expanded = node.hasChildren && !collapsed.has(node.key);
    let handled = true;
    if (event.key === "ArrowDown") {
      if (index < visibleKeys.length - 1) focusNode(visibleKeys[index + 1]);
    } else if (event.key === "ArrowUp") {
      if (index > 0) focusNode(visibleKeys[index - 1]);
    } else if (event.key === "Home") {
      focusNode(visibleKeys[0]);
    } else if (event.key === "End") {
      focusNode(visibleKeys[visibleKeys.length - 1]);
    } else if (event.key === "ArrowRight") {
      if (node.hasChildren && !expanded) setOpen(node.key, true);
      else if (expanded) focusNode(visibleKeys[index + 1]);
    } else if (event.key === "ArrowLeft") {
      if (expanded) setOpen(node.key, false);
      else if (node.parent !== null) focusNode(node.parent);
    } else if (event.key === "Enter" || event.key === " ") {
      activate(node);
    } else if (event.key.length === 1 && /\S/.test(event.key)) {
      const letter = event.key.toLowerCase();
      const order = [...visibleKeys.slice(index + 1), ...visibleKeys.slice(0, index + 1)];
      const match = order.find((key) => byKey.get(key).name.toLowerCase().startsWith(letter));
      if (match) focusNode(match);
    } else {
      handled = false;
    }
    if (handled) event.preventDefault();
  }

  const described = byKey.get(picked) ?? byKey.get(activeFile) ?? null;

  return (
    <div className="file-tree" id={id}>
      <ul
        ref={listRef}
        className="file-tree__list"
        role="tree"
        aria-label={label}
        aria-describedby={descriptionId}
      >
        {visible.map((node) => {
          const folder = node.kind === "folder";
          const expanded = node.hasChildren ? !collapsed.has(node.key) : undefined;
          const isActive = node.source === "workspace" && node.path === activeFile;
          const modified = node.source === "workspace" && modifiedFiles?.has(node.path);
          const classes = [
            "file-tree__node",
            `file-tree__node--${node.source}`,
            folder && "file-tree__node--folder",
            isActive && "is-active",
            node.key === picked && !isActive && "is-picked",
          ].filter(Boolean);
          return (
            <li
              key={node.key}
              id={`${idPrefix}-node-${tabId(node.key)}`}
              role="treeitem"
              aria-level={node.level}
              aria-setsize={node.setSize}
              aria-posinset={node.position}
              aria-expanded={expanded}
              aria-selected={folder ? undefined : isActive}
              tabIndex={node.key === tabStop ? 0 : -1}
              data-key={node.key}
              data-path={node.path ?? undefined}
              data-source={node.source}
              data-kind={node.kind}
              data-created-by={node.createdBy ?? undefined}
              className={classes.join(" ")}
              style={{ "--tree-level": node.level - 1 }}
              onClick={() => activate(node)}
              onKeyDown={onKeyDown}
              onFocus={() => setFocusKey(node.key)}
            >
              <span className="file-tree__icon" aria-hidden="true">
                {node.hasChildren ? (expanded ? "▾" : "▸") : folder ? "▪" : ""}
              </span>
              <span className="file-tree__name">{node.name}</span>
              {folder && node.source !== "group" && (
                <span className="file-tree__slash" aria-hidden="true">
                  /
                </span>
              )}
              {modified && (
                <>
                  <span className="file-tree__modified" aria-hidden="true" title={markLabel}>
                    •
                  </span>
                  <span className="visually-hidden"> ({markLabel})</span>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <p id={descriptionId} className="file-tree__description meta" aria-live="polite">
        {describe(described)}
      </p>
    </div>
  );
}
