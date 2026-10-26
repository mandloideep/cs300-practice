import { useSyncExternalStore } from "react";

// Progress lives only in this browser, under one localStorage key, in the shape pinned in
// docs/CONTRACTS.md section 5.1:
//   { version: 1, completed: { "<topic>/<n>": ISO date }, files: { "<topic>/<n>": { path: source } }, pathId }

export const PROGRESS_KEY = "cs300-lab:progress";
export const PROGRESS_VERSION = 1;
export const NEWER_VERSION_MESSAGE = "This file was exported by a newer version of the lab.";
const NOT_AN_EXPORT_MESSAGE = "That file is not a CS300 Lab progress export.";
const listeners = new Set();

// Upgrades from each older version to the next; version 1 is the first, so none exist yet.
const UPGRADES = {};

function empty() {
  return { version: PROGRESS_VERSION, completed: {}, files: {}, pathId: null };
}

function isMap(candidate) {
  return Boolean(candidate) && typeof candidate === "object" && !Array.isArray(candidate);
}

function normalize(value) {
  if (!isMap(value)) return empty();
  const completed = {};
  for (const [key, date] of Object.entries(isMap(value.completed) ? value.completed : {})) {
    if (typeof date === "string") completed[key] = date;
  }
  const files = {};
  for (const [key, sources] of Object.entries(isMap(value.files) ? value.files : {})) {
    if (!isMap(sources)) continue;
    const kept = Object.fromEntries(
      Object.entries(sources).filter(([, source]) => typeof source === "string"),
    );
    if (Object.keys(kept).length > 0) files[key] = kept;
  }
  return {
    version: PROGRESS_VERSION,
    completed,
    files,
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

export function isStepComplete(progress, topicId, n) {
  return Boolean(progress.completed[stepKey(topicId, n)]);
}

// How many of a topic's steps are complete, from the topic entry of the content index.
export function topicCompletion(progress, topic) {
  const steps = topic?.steps ?? [];
  const done = steps.filter((step) => isStepComplete(progress, topic.id, step.n)).length;
  return { done, total: steps.length, complete: steps.length > 0 && done === steps.length };
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

// Reads an exported file without storing it: the snapshot it holds, upgraded to the current
// version, and how many completed steps and edited steps that is. Throws with a readable message.
export function parseProgress(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  if (!isMap(parsed) || !Number.isInteger(parsed.version) || parsed.version < 1) {
    throw new Error(NOT_AN_EXPORT_MESSAGE);
  }
  if (parsed.version > PROGRESS_VERSION) {
    throw new Error(NEWER_VERSION_MESSAGE);
  }
  let upgraded = parsed;
  for (let version = parsed.version; version < PROGRESS_VERSION; version += 1) {
    upgraded = UPGRADES[version](upgraded);
  }
  const next = normalize(upgraded);
  return {
    snapshot: next,
    completedSteps: Object.keys(next.completed).length,
    editedSteps: Object.keys(next.files).length,
  };
}

// Replaces the stored progress with a snapshot from parseProgress.
export function replaceProgress(next) {
  commit(next);
  return snapshot;
}

export function importProgress(text) {
  return replaceProgress(parseProgress(text).snapshot);
}
