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

// Returns a function that calls `fn` and carries `fn.__labOwner`-style metadata in `__labOwner`.
// One wrapper exists per original function and label, so identity is stable across renders and
// memo comparisons still see the same function when the original is the same.
export function labelFunction(fn, owner) {
  const key = `${owner.kind}|${owner.component}|${owner.prop ?? ""}`;
  let byLabel = labeled.get(fn);
  if (!byLabel) {
    byLabel = new Map();
    labeled.set(fn, byLabel);
  }
  let wrapper = byLabel.get(key);
  if (!wrapper) {
    wrapper = function (...args) {
      return fn.apply(this, args);
    };
    Object.defineProperty(wrapper, "name", { value: fn.name, configurable: true });
    Object.defineProperty(wrapper, "length", { value: fn.length, configurable: true });
    Object.defineProperty(wrapper, "__labOwner", { value: Object.freeze({ ...owner }) });
    Object.defineProperty(wrapper, "__labOriginal", { value: fn });
    byLabel.set(key, wrapper);
  }
  return wrapper;
}
