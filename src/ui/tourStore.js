import { useSyncExternalStore } from "react";

// Whether the step-page tour can run on the current page (an edit step is mounted), whether it is
// open, and which stop it shows. The site header reads it for its Tour button; src/ui/Tour.jsx
// draws the stops.

let state = { available: 0, open: false, stop: 0 };
const listeners = new Set();

function update(next) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useTour() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Called by a step page that has every pane the tour points at; returns the cleanup.
export function offerTour() {
  update({ available: state.available + 1 });
  return () => update({ available: state.available - 1, open: false, stop: 0 });
}

export function openTour() {
  update({ open: true, stop: 0 });
}

export function closeTour() {
  update({ open: false, stop: 0 });
}

export function showStop(stop) {
  update({ stop });
}
