// The react/jsx-dev-runtime module the result iframe imports when the inspector is on.
// It records the { fileName, lineNumber } source Sucrase passes to jsxDEV, which React 19 no
// longer stores, so the inspector hook can report the JSX line that used each component, and it
// labels every function passed as a prop to a component with the component that passed it and
// the prop name, as fn.__labOwner = { kind: "prop", component, prop, to }.
// Not generated: scripts/build-runtime.mjs leaves public/runtime/wrap/ alone.

import { Fragment, jsxDEV as realJsxDEV } from "../react-jsx-dev-runtime.js";
import { currentComponent, labelFunction } from "./owner.js";

export { Fragment };

const SKIPPED_PROPS = new Set(["children", "ref", "key"]);

function typeName(type) {
  if (typeof type === "function") return type.displayName || type.name || "Anonymous";
  return type?.displayName || type?.render?.name || type?.type?.name || "Anonymous";
}

// Functions with a capitalized name are components passed as props, and classes cannot be
// called without new; both keep their identity.
function isPlainCallback(fn) {
  if (/^[A-Z]/.test(fn.name)) return false;
  if (fn.prototype?.isReactComponent) return false;
  return !/^class[\s{]/.test(Function.prototype.toString.call(fn));
}

function labelProps(type, config) {
  const component = currentComponent();
  if (!component || !config) return config;
  let copy = null;
  for (const [prop, value] of Object.entries(config)) {
    if (typeof value !== "function" || SKIPPED_PROPS.has(prop) || !isPlainCallback(value)) continue;
    copy ??= { ...config };
    copy[prop] = labelFunction(value, { kind: "prop", component, prop, to: typeName(type) });
  }
  return copy ?? config;
}

export function jsxDEV(type, config, maybeKey, isStaticChildren, source, self) {
  const props = typeof type === "string" ? config : labelProps(type, config);
  const element = realJsxDEV(type, props, maybeKey, isStaticChildren, source, self);
  const sources = globalThis.__LAB__?.inspectorSources;
  if (sources && source && element?._debugStack && typeof element._debugStack === "object") {
    sources.set(element._debugStack, source);
  }
  return element;
}
