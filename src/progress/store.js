import { useSyncExternalStore } from "react";

// Progress lives only in this browser, under one localStorage key:
//   { version: 1, completed: { "<topic>/<n>": ISO date }, files: { "<topic>/<n>": { path: source } }, pathId }

export const PROGRESS_KEY = "cs300-lab:progress";
const VERSION = 1;
const listeners = new Set();

function empty() {
  return { version: VERSION, completed: {}, files: {}, pathId: null };
}

function normalize(value) {
  if (!value || typeof value !== "object") return empty();
  const isMap = (candidate) =>
    candidate && typeof candidate === "object" && !Array.isArray(candidate);
  return {
    version: VERSION,
    completed: isMap(value.completed) ? value.completed : {},
    files: isMap(value.files) ? value.files : {},
    pathId: typeof value.pathId === "string" ? value.pathId : null,
  };
}

function readStorage() {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return raw ? normalize(JSON.parse(raw)) : empty();
  } catch {
    return empty();
  }
}

let snapshot = readStorage();

function commit(next) {
  snapshot = normalize(next);
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage can be full or blocked; progress then lasts for this visit only.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (event) => {
    if (event.key === PROGRESS_KEY) {
      snapshot = readStorage();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function stepKey(topicId, n) {
  return `${topicId}/${n}`;
}

export function getProgress() {
  return snapshot;
}

export function useProgress() {
  return useSyncExternalStore(subscribe, getProgress, getProgress);
}

export function markStepComplete(topicId, n) {
  const key = stepKey(topicId, n);
  if (snapshot.completed[key]) return;
  commit({ ...snapshot, completed: { ...snapshot.completed, [key]: new Date().toISOString() } });
}

export function getEditedFiles(topicId, n) {
  return snapshot.files[stepKey(topicId, n)] ?? null;
}

export function saveEditedFiles(topicId, n, files) {
  commit({ ...snapshot, files: { ...snapshot.files, [stepKey(topicId, n)]: files } });
}

export function clearEditedFiles(topicId, n) {
  const key = stepKey(topicId, n);
  if (!(key in snapshot.files)) return;
  const files = { ...snapshot.files };
  delete files[key];
  commit({ ...snapshot, files });
}

export function setChosenPath(pathId) {
  commit({ ...snapshot, pathId });
}

export function exportProgress() {
  return JSON.stringify({ ...snapshot, exportedAt: new Date().toISOString() }, null, 2);
}

// Replaces the stored progress with an exported file's contents; throws with a readable message.
export function importProgress(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  if (!parsed || typeof parsed !== "object" || parsed.version !== VERSION) {
    throw new Error("That file is not a CS300 Lab progress export.");
  }
  commit(parsed);
  return snapshot;
}
