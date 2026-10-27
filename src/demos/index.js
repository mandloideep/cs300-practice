// The explainer registry the step page mounts from, per docs/CONTRACTS.md section 7.1.
// registry.json lists every explainer id with its title and description, built or not; an
// explainer is built once src/demos/<id>/index.jsx exists, and only then does a step's demo
// placeholder trade its text fallback for the component. Each module loads on first use.

import registry from "./registry.json";

const modules = import.meta.glob("./*/index.jsx");
const loaded = new Map();

export const demoEntries = registry;

export function demoEntry(id) {
  return registry.find((entry) => entry.id === id) ?? null;
}

export function hasDemo(id) {
  return Boolean(demoEntry(id)) && `./${id}/index.jsx` in modules;
}

// The ids that have a component, in registry order.
export function builtDemoIds() {
  return registry.map((entry) => entry.id).filter(hasDemo);
}

// A stable promise of the explainer module, for React's use().
export function loadDemo(id) {
  if (!hasDemo(id)) return null;
  if (!loaded.has(id)) loaded.set(id, modules[`./${id}/index.jsx`]());
  return loaded.get(id);
}

// The props a placeholder carries in data-props; anything unreadable counts as no props.
export function readProps(text) {
  if (!text) return {};
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
