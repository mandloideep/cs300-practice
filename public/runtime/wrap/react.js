// The react module the result iframe imports when the inspector is on. It re-exports the real
// module and labels every useState and useReducer setter with the component that owns it, as
// setter.__labOwner = { kind: "setter", component, hook, prop: null }, and keeps the value each
// setter currently holds so the flow trace can show what a call changed.
// Not generated: scripts/build-runtime.mjs leaves public/runtime/wrap/ alone.

import React, * as Real from "../react.js";
import { currentComponent, labelFunction, trackState } from "./owner.js";

export * from "../react.js";

function labelDispatch(pair, hook, reducer) {
  const component = currentComponent();
  if (!component || typeof pair[1] !== "function") return pair;
  const setter = labelFunction(pair[1], { kind: "setter", component, hook, prop: null });
  trackState(setter, pair[0], reducer);
  return [pair[0], setter];
}

export function useState(initialState) {
  return labelDispatch(Real.useState(initialState), "useState", null);
}

export function useReducer(reducer, initialArg, init) {
  return labelDispatch(Real.useReducer(reducer, initialArg, init), "useReducer", reducer);
}

export default { ...React, useState, useReducer };
