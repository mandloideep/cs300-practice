// Shared by the inspector wrappers: who is rendering right now, and labeled function wrappers.
// Not generated: scripts/build-runtime.mjs leaves public/runtime/wrap/ alone.

import { __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE as internals } from "../react.js";

// The component currently rendering, from React's development owner tracking.
export function currentComponent() {
  const owner = internals.A?.getOwner?.();
  const type = owner?.type;
  if (typeof type === "function") return type.displayName || type.name || "Anonymous";
  if (type && typeof type === "object") {
    const inner = type.render ?? type.type;
    return type.displayName || inner?.displayName || inner?.name || "Anonymous";
  }
  return null;
}

const labeled = new WeakMap();
const tracked = new WeakMap();

// Remembers the state value a setter wrapper currently holds, as of the render that produced it,
// so a call can report the value before and after. `reducer` is set for useReducer dispatchers.
export function trackState(wrapper, value, reducer = null) {
  const entry = tracked.get(wrapper);
  if (entry) {
    entry.value = value;
    entry.reducer = reducer;
  } else {
    tracked.set(wrapper, { value, reducer });
  }
}

function nextState(entry, argument) {
  try {
    if (entry.reducer) return entry.reducer(entry.value, argument);
    return typeof argument === "function" ? argument(entry.value) : argument;
  } catch {
    return undefined;
  }
}

// The flow recorder of the bridge, present only while the inspector is on in this document.
function flow() {
  return globalThis.__LAB__?.flow ?? null;
}

// Returns a function that calls `fn` and carries `fn.__labOwner`-style metadata in `__labOwner`.
// One wrapper exists per original function and label, so identity is stable across renders and
// memo comparisons still see the same function when the original is the same. Each call is
// reported to the bridge's flow recorder with the owner label, the arguments, and, for a setter,
// the value before and after.
export function labelFunction(fn, owner) {
  const key = `${owner.kind}|${owner.component}|${owner.prop ?? ""}|${owner.to ?? ""}`;
  let byLabel = labeled.get(fn);
  if (!byLabel) {
    byLabel = new Map();
    labeled.set(fn, byLabel);
  }
  let wrapper = byLabel.get(key);
  if (!wrapper) {
    wrapper = function (...args) {
      const recorder = flow();
      if (!recorder) return fn.apply(this, args);
      let change = null;
      const entry = owner.kind === "setter" ? tracked.get(wrapper) : null;
      if (entry) {
        const previous = entry.value;
        entry.value = nextState(entry, args[0]);
        change = { previous, next: entry.value };
      }
      const token = recorder.enter(owner, fn, args, change);
      try {
        return fn.apply(this, args);
      } finally {
        recorder.exit(token);
      }
    };
    Object.defineProperty(wrapper, "name", { value: fn.name, configurable: true });
    Object.defineProperty(wrapper, "length", { value: fn.length, configurable: true });
    Object.defineProperty(wrapper, "__labOwner", { value: Object.freeze({ ...owner }) });
    Object.defineProperty(wrapper, "__labOriginal", { value: fn });
    byLabel.set(key, wrapper);
  }
  return wrapper;
}
