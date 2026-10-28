import { useSyncExternalStore } from "react";

// Progress lives only in this browser, under one localStorage key, in the shape pinned in
// docs/CONTRACTS.md sections 5.1 and 7.7:
//   { version: 2, completed: { "<topic>/<n>": ISO date }, files: { "<topic>/<n>": { path: source } },
//     pathId, answers: { "<topic>/<n>/<question>": { pick, revealedAt } },
//     preferences: { explanationsOpen }, tour: { stepPage, homeCard } }

export const PROGRESS_KEY = "cs300-lab:progress";
export const PROGRESS_VERSION = 2;
export const NEWER_VERSION_MESSAGE = "This file was exported by a newer version of CS300 Practice.";
const NOT_AN_EXPORT_MESSAGE = "That file is not a CS300 Practice progress export.";
const listeners = new Set();

const DEFAULT_PREFERENCES = { explanationsOpen: false };
const DEFAULT_TOUR = { stepPage: null, homeCard: null };

// Upgrades from each older version to the next.
const UPGRADES = {
  1: (value) => ({
    ...value,
    version: 2,
    answers: {},
    preferences: { ...DEFAULT_PREFERENCES },
    tour: { ...DEFAULT_TOUR },
  }),
};

function empty() {
  return {
    version: PROGRESS_VERSION,
    completed: {},
    files: {},
    pathId: null,
    answers: {},
    preferences: { ...DEFAULT_PREFERENCES },
    tour: { ...DEFAULT_TOUR },
  };
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
  const answers = {};
  for (const [key, record] of Object.entries(isMap(value.answers) ? value.answers : {})) {
    if (!isMap(record) || !Number.isInteger(record.pick) || record.pick < 0) continue;
    answers[key] = {
      pick: record.pick,
      revealedAt: typeof record.revealedAt === "string" ? record.revealedAt : null,
    };
  }
  const preferences = isMap(value.preferences) ? value.preferences : {};
  const tour = isMap(value.tour) ? value.tour : {};
  return {
    version: PROGRESS_VERSION,
    completed,
    files,
    pathId: typeof value.pathId === "string" ? value.pathId : null,
    answers,
    preferences: { explanationsOpen: preferences.explanationsOpen === true },
    tour: {
      stepPage: typeof tour.stepPage === "string" ? tour.stepPage : null,
      homeCard: typeof tour.homeCard === "string" ? tour.homeCard : null,
    },
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

export function answerKey(topicId, n, questionId) {
  return `${stepKey(topicId, n)}/${questionId}`;
}

// Records a pick; `reveal` also marks it revealed, as a quiz is on its first pick. A revealed
// answer keeps its pick.
export function setAnswerPick(key, pick, { reveal = false } = {}) {
  const current = snapshot.answers[key];
  if (current?.revealedAt) return;
  const revealedAt = reveal ? new Date().toISOString() : null;
  commit({ ...snapshot, answers: { ...snapshot.answers, [key]: { pick, revealedAt } } });
}

export function revealAnswer(key) {
  const current = snapshot.answers[key];
  if (!current || current.revealedAt) return;
  commit({
    ...snapshot,
    answers: { ...snapshot.answers, [key]: { ...current, revealedAt: new Date().toISOString() } },
  });
}

// How many of a topic's quizzes are answered and how many of those are right, from the compiled
// topic's step questions.
export function quizScore(progress, topic) {
  let total = 0;
  let answered = 0;
  let right = 0;
  for (const step of topic?.steps ?? []) {
    for (const question of step.questions ?? []) {
      if (question.kind !== "quiz") continue;
      total += 1;
      const record = progress.answers[answerKey(topic.id, step.n, question.id)];
      if (!record?.revealedAt) continue;
      answered += 1;
      if (record.pick === question.answer) right += 1;
    }
  }
  return { total, answered, right };
}

export function setExplanationsOpen(open) {
  commit({ ...snapshot, preferences: { ...snapshot.preferences, explanationsOpen: open } });
}

// Stores today's date under `field` of the tour record: "stepPage" once the step-page tour is
// finished or skipped, "homeCard" once the home-page card is dismissed.
export function markTour(field) {
  commit({ ...snapshot, tour: { ...snapshot.tour, [field]: new Date().toISOString() } });
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
