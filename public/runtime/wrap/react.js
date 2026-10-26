// The react module the result iframe imports when the inspector is on. It re-exports the real
// module and labels every useState and useReducer setter with the component that owns it, as
// setter.__labOwner = { kind: "setter", component, hook, prop: null }.
// Not generated: scripts/build-runtime.mjs leaves public/runtime/wrap/ alone.

import React, * as Real from "../react.js";
import { currentComponent, labelFunction } from "./owner.js";

export * from "../react.js";

function labelDispatch(pair, hook) {
  const component = currentComponent();
  if (!component || typeof pair[1] !== "function") return pair;
  return [pair[0], labelFunction(pair[1], { kind: "setter", component, hook, prop: null })];
}

export function useState(initialState) {
  return labelDispatch(Real.useState(initialState), "useState");
}

export function useReducer(reducer, initialArg, init) {
  return labelDispatch(Real.useReducer(reducer, initialArg, init), "useReducer");
}

export default { ...React, useState, useReducer };
