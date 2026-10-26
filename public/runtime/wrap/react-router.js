// The react-router module the result iframe imports. It re-exports the real module and
// substitutes BrowserRouter and createBrowserRouter with versions that run on a memory history,
// because the sandboxed about:srcdoc document cannot push a same-origin URL. Both substitutes
// report every location to the bridge's router channel (__LAB__.router), which posts it to the
// parent as a `location` message, and they take the parent's `navigate` messages from the same
// channel, so the result pane's Back, Forward, and path field move this history
// (docs/CONTRACTS.md sections 4.3 and 4.4). Everything else, including useNavigate,
// useSearchParams, and MemoryRouter itself, is the real module untouched.
// Not generated: scripts/build-runtime.mjs leaves public/runtime/wrap/ alone.

import * as React from "../react.js";
import {
  Router,
  UNSAFE_createMemoryHistory as createMemoryHistory,
  createMemoryRouter,
} from "../react-router.js";

export * from "../react-router.js";

function channel() {
  return globalThis.__LAB__?.router ?? null;
}

// Follows the index and length of a memory history from the action and key of each location it
// reaches, because the router exposes neither. Every entry has its own key, so a POP finds the
// index it returns to by key, and a repeated report of the same entry changes nothing.
function createHistoryTracker() {
  const indexes = new Map();
  let lastKey = null;
  let index = -1;
  let length = 0;
  return function track(location, action) {
    if (location.key !== lastKey) {
      if (index < 0 || action === "PUSH") {
        index += 1;
        length = index + 1;
      } else if (action === "POP") {
        index = indexes.get(location.key) ?? index;
      }
      indexes.set(location.key, index);
      lastKey = location.key;
    }
    return {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      index,
      length,
    };
  };
}

// The same component MemoryRouter is, with the history kept here so that the bridge can move it
// and every location change is reported; the tree shows BrowserRouter above Router, as it would
// with the real one.
export function BrowserRouter({ basename, children, useTransitions }) {
  const own = React.useRef(null);
  if (own.current === null) {
    own.current = {
      history: createMemoryHistory({ v5Compat: true }),
      track: createHistoryTracker(),
    };
  }
  const { history, track } = own.current;
  const [state, setStateImpl] = React.useState({
    action: history.action,
    location: history.location,
  });
  const setState = React.useCallback(
    (next) => {
      if (useTransitions === false) setStateImpl(next);
      else React.startTransition(() => setStateImpl(next));
    },
    [useTransitions],
  );
  React.useLayoutEffect(() => history.listen(setState), [history, setState]);

  React.useEffect(() => {
    channel()?.report(track(state.location, state.action));
  }, [track, state]);

  React.useEffect(
    () =>
      channel()?.attach({
        navigate: (to) => (typeof to === "number" ? history.go(to) : history.push(to)),
      }),
    [history],
  );

  return React.createElement(Router, {
    basename,
    children,
    location: state.location,
    navigationType: state.action,
    navigator: history,
    useTransitions,
  });
}

export function createBrowserRouter(routes, opts) {
  const router = createMemoryRouter(routes, opts);
  const track = createHistoryTracker();
  const report = (state) => channel()?.report(track(state.location, state.historyAction));
  report(router.state);
  router.subscribe(report);
  channel()?.attach({ navigate: (to) => router.navigate(to) });
  return router;
}
