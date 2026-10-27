import { Caption, Chip, Panel } from "../kit.jsx";
import { describe, isValidPattern, matchRoute, pathnameOf, score, segmentsOf } from "./match.js";
import "./styles.css";

export const id = "router-match";

export const defaults = {
  url: "/products/16",
  routes: [
    { path: "/", element: "HomePage" },
    { path: "/products", element: "ProductsPage" },
    { path: "/products/:id", element: "ProductPage" },
    { path: "*", element: "NotFoundPage" },
  ],
};

function elementFor(path) {
  if (path === "*") return "NotFoundPage";
  if (path === "/") return "HomePage";
  const known = defaults.routes.find((route) => route.path === path);
  if (known) return known.element;
  const fixed = segmentsOf(path).filter((segment) => /^[A-Za-z]/.test(segment));
  const last = fixed[fixed.length - 1] ?? "Some";
  return `${last[0].toUpperCase()}${last.slice(1).replace(/[^\w]/g, "")}Page`;
}

function readRoutes(props) {
  if (!Array.isArray(props.routes)) return defaults.routes;
  const routes = props.routes
    .map((entry) => {
      const path = typeof entry === "string" ? entry : entry?.path;
      if (typeof path !== "string" || !isValidPattern(path)) return null;
      const element =
        typeof entry === "object" &&
        typeof entry.element === "string" &&
        /^[A-Z][A-Za-z0-9]{0,23}$/.test(entry.element)
          ? entry.element
          : elementFor(path);
      return { path, element };
    })
    .filter(Boolean);
  const unique = new Set(routes.map((route) => route.path)).size === routes.length;
  return routes.length >= 2 && routes.length <= 6 && unique ? routes : defaults.routes;
}

function readUrl(props) {
  const url = typeof props.url === "string" ? props.url.trim() : "";
  return url.startsWith("/") && url.length <= 60 && !/\s/.test(url) ? url : defaults.url;
}

function settings(props) {
  return { url: readUrl(props), routes: readRoutes(props) };
}

export function stepCount(props) {
  return settings(props).routes.length + 4;
}

function paramsText(params) {
  const entries = Object.entries(params);
  if (entries.length === 0) return "{}";
  return `{ ${entries.map(([key, value]) => `${/^\w+$/.test(key) ? key : `"${key}"`}: ${JSON.stringify(value)}`).join(", ")} }`;
}

export default function RouterMatch({ props, step }) {
  const { url, routes } = settings(props);
  const total = routes.length + 4;
  const current = Math.max(0, Math.min(total - 1, step));
  const pathname = pathnameOf(url);
  const segments = segmentsOf(pathname);
  const results = routes.map((route, index) => ({
    ...route,
    index,
    result: matchRoute(route.path, pathname),
    score: score(route.path),
  }));
  const ranked = results
    .filter((route) => route.result.match)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const winner = ranked[0] ?? null;
  const checking = current - 2;
  const rankStage = routes.length + 2;
  const finalStage = routes.length + 3;
  const ranking = current >= rankStage;
  const dropped = url !== pathname;

  function caption() {
    if (current === 0) {
      return `The address bar says ${url}. Routes holds ${routes.length} Route elements, and the router has to pick one of them to render.`;
    }
    if (current === 1) {
      const pieces = segments.length === 0 ? "no segments at all" : segments.join(", ");
      return `The router matches only the path${dropped ? ", so the query string and hash are ignored" : ""}. It splits ${pathname} at each slash into ${segments.length === 0 ? pieces : `${segments.length} segment${segments.length === 1 ? "" : "s"}: ${pieces}`}.`;
    }
    if (current < rankStage) {
      const route = results[checking];
      if (route.result.match) {
        const keys = Object.keys(route.result.params);
        return `${route.path} matches. ${keys.length > 0 ? `It would pull out ${paramsText(route.result.params)}.` : "It has no parameters."} The router does not stop here: it checks every route.`;
      }
      return `${route.path} does not match: ${route.result.reason}.`;
    }
    if (current === rankStage) {
      if (!winner) {
        return "No route matched. The router renders nothing here and warns in the console that no routes matched this location.";
      }
      if (ranked.length === 1) {
        return `Only ${winner.path} matched, so it wins.`;
      }
      return `${ranked.length} routes matched. The most specific one wins, whatever its place in the list: fixed segments beat parameters, and * loses to everything. ${winner.path} wins.`;
    }
    if (!winner) {
      return 'Add a catch-all route, path="*", so that an unknown address shows a not-found page instead of nothing.';
    }
    const keys = Object.keys(winner.result.params);
    return keys.length > 0
      ? `Routes renders <${winner.element} />. Inside it, useParams() returns ${paramsText(winner.result.params)}. Every value is a string, so convert ids with Number before comparing.`
      : `Routes renders <${winner.element} />. This route has no parameters, so useParams() returns {}.`;
  }

  function status(route) {
    if (current < 2 || route.index > checking) return null;
    if (!route.result.match) return <Chip tone="muted">✗ {route.result.reason}</Chip>;
    if (!ranking) {
      return <Chip tone="success">✓ matches {paramsText(route.result.params)}</Chip>;
    }
    const place = ranked.indexOf(route);
    return (
      <>
        <Chip tone={place === 0 ? "accent" : "success"}>
          {place === 0 ? "★ wins" : `✓ matches, rank ${place + 1}`}
        </Chip>
        <span className="meta">{describe(route.path)}</span>
      </>
    );
  }

  return (
    <div className="router-match">
      <p className="router-match__address">
        <span className="visually-hidden">Address: </span>
        <span className="demo-mono">
          <span className={current >= 1 ? "router-match__path is-read" : "router-match__path"}>
            {pathname}
          </span>
          {dropped && (
            <span
              className={current >= 1 ? "router-match__extra is-dropped" : "router-match__extra"}
            >
              {url.slice(pathname.length)}
            </span>
          )}
        </span>
      </p>
      {current >= 1 && (
        <ol className="router-match__segments" aria-label="Path segments">
          {segments.length === 0 ? (
            <li>
              <Chip tone="muted">no segments: the root</Chip>
            </li>
          ) : (
            segments.map((segment, index) => (
              <li key={index}>
                <Chip>{segment}</Chip>
              </li>
            ))
          )}
        </ol>
      )}
      <Panel title="<Routes>">
        <ol className="router-match__routes" aria-label="Routes in the order written">
          {results.map((route) => {
            const isChecking = current >= 2 && current < rankStage && route.index === checking;
            const isWinner = ranking && winner === route;
            const classes = [
              "router-match__route",
              isChecking && "is-checking",
              isWinner && "is-winner",
              current >= 2 && route.index <= checking && !route.result.match && "is-miss",
            ].filter(Boolean);
            return (
              <li key={route.path} className={classes.join(" ")}>
                <span className="router-match__pattern">
                  <span className="demo-mono">path=&quot;{route.path}&quot;</span>
                  <span className="demo-mono router-match__element">{`<${route.element} />`}</span>
                </span>
                <span className="router-match__status">{status(route)}</span>
              </li>
            );
          })}
        </ol>
      </Panel>
      {current === finalStage && (
        <Panel title="Rendered" sunken>
          {winner ? (
            <p className="router-match__result">
              <Chip tone="accent">{`<${winner.element} />`}</Chip>
              <span className="demo-mono">useParams() → {paramsText(winner.result.params)}</span>
            </p>
          ) : (
            <p className="router-match__result">
              <Chip tone="danger">nothing</Chip>
              <span className="demo-mono">No routes matched location &quot;{pathname}&quot;</span>
            </p>
          )}
        </Panel>
      )}
      <Caption>{caption()}</Caption>
    </div>
  );
}
