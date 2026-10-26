import { Fragment, useEffect, useId, useRef, useState } from "react";
import RequestBadges, {
  badgeText,
  duplicateExplanation,
  shortUrl,
  staleExplanation,
  stateLabel,
} from "./requests.jsx";
import "./network.css";

// Allows line breaks after the separators of a URL so that it wraps between its parts.
function breakable(text) {
  return text.split(/(?<=[/?&=])/).map((part, index) => (
    <Fragment key={index}>
      {index > 0 && <wbr />}
      {part}
    </Fragment>
  ));
}

function formatDuration(ms) {
  if (ms === null || ms === undefined) return "…";
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)} s`;
}

function sourceSummary(apiSource, preset) {
  if (!apiSource || apiSource.kind === "fixtures") {
    return { name: "Fixtures", detail: "answered inside this page from the step's fixture files" };
  }
  if (apiSource.kind === "preset") {
    return { name: preset?.title ?? apiSource.id, detail: preset?.baseUrl ?? "" };
  }
  const base = (apiSource.baseUrl ?? "").trim();
  return { name: "Custom base URL", detail: base || "no base URL entered yet" };
}

function PresetCard({ preset }) {
  return (
    <details className="network-card">
      <summary>About {preset.title}</summary>
      <dl>
        <dt>Base URL</dt>
        <dd>
          <code>{preset.baseUrl}</code>
        </dd>
        {preset.endpoints?.length > 0 && (
          <>
            <dt>Endpoints</dt>
            <dd>
              <ul>
                {preset.endpoints.map((endpoint) => (
                  <li key={endpoint.path}>
                    <code>{endpoint.path}</code> {endpoint.description}
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
        {preset.responseShape && (
          <>
            <dt>Response shape</dt>
            <dd>{preset.responseShape}</dd>
          </>
        )}
        {preset.rateLimit && (
          <>
            <dt>Rate limit</dt>
            <dd>{preset.rateLimit}</dd>
          </>
        )}
      </dl>
      {preset.docsUrl && (
        <p>
          <a href={preset.docsUrl} target="_blank" rel="noreferrer">
            {preset.title} documentation
          </a>
        </p>
      )}
    </details>
  );
}

function CorsCard() {
  return (
    <details className="network-card">
      <summary>About custom servers and CORS</summary>
      <p>
        Your code runs on this site, so a request to another server is a cross-origin request. The
        browser sends it, but it only hands the response to your code when the server answers with
        an <code>Access-Control-Allow-Origin</code> header that allows this site, such as{" "}
        <code>Access-Control-Allow-Origin: *</code>.
      </p>
      <p>
        When that header is missing, the request shows here as a network error and the console names
        CORS. That is a setting on the server, not a bug in your code: add the header to your
        server, or point the base URL at a server that already sends it.
      </p>
    </details>
  );
}

function RequestDetail({ request }) {
  return (
    <dl className="network-detail">
      <dt>URL</dt>
      <dd>
        <code>{request.url}</code>
      </dd>
      <dt>Source</dt>
      <dd>{request.source}</dd>
      <dt>Called from</dt>
      <dd>
        {request.calledFrom ? `${request.calledFrom.file}:${request.calledFrom.line}` : "unknown"}
      </dd>
      {request.contentType && (
        <>
          <dt>Content type</dt>
          <dd>
            <code>{request.contentType}</code>
          </dd>
        </>
      )}
      {request.error && (
        <>
          <dt>Error</dt>
          <dd>{request.error}</dd>
        </>
      )}
      {request.stale && (
        <>
          <dt>Stale</dt>
          <dd>{staleExplanation()}</dd>
        </>
      )}
      {request.duplicateOf && (
        <>
          <dt>Duplicate</dt>
          <dd>{duplicateExplanation(request.duplicateOf)}</dd>
        </>
      )}
      <dt>Body preview</dt>
      <dd>
        {request.bodyPreview ? (
          <pre>{request.bodyPreview}</pre>
        ) : (
          <span className="meta">
            {request.state === "pending" ? "Waiting for the response." : "No body was read."}
          </span>
        )}
      </dd>
    </dl>
  );
}

export default function NetworkPane({ session, onJumpToCode, apiSource, presets = [] }) {
  const { networkRequests, runId } = session;
  const id = useId();
  const [cleared, setCleared] = useState({ runId: null, count: 0 });
  const [expanded, setExpanded] = useState(() => new Set());
  const scroller = useRef(null);
  const followBottom = useRef(true);

  const offset = cleared.runId === runId ? cleared.count : 0;
  const requests = networkRequests.slice(offset);
  const preset =
    apiSource?.kind === "preset"
      ? presets.find((candidate) => candidate.id === apiSource.id)
      : null;
  const source = sourceSummary(apiSource, preset);
  const failedCustom = requests.some(
    (request) => request.source === "custom" && request.state === "network-error",
  );
  const failedPreset = requests.some(
    (request) => request.source === "preset" && request.state === "network-error",
  );

  useEffect(() => {
    const element = scroller.current;
    if (element && followBottom.current) element.scrollTop = element.scrollHeight;
  }, [requests.length]);

  function onScroll() {
    const element = scroller.current;
    followBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 24;
  }

  function toggle(requestId) {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(requestId)) next.delete(requestId);
      else next.add(requestId);
      return next;
    });
  }

  function jump(request) {
    if (request.calledFrom) onJumpToCode(request.calledFrom);
  }

  function onRowKeyDown(event, request) {
    if (event.key === "Enter" && event.target === event.currentTarget) {
      event.preventDefault();
      jump(request);
    }
  }

  const count = requests.length;

  return (
    <section className="pane pane--network" aria-labelledby={`${id}-heading`}>
      <div className="pane__header">
        <h2 id={`${id}-heading`}>Network</h2>
        <span className="meta">
          {count === 0 ? "No requests" : `${count} ${count === 1 ? "request" : "requests"}`}
        </span>
        <button
          type="button"
          className="button button--quiet button--small"
          onClick={() => setCleared({ runId, count: networkRequests.length })}
          disabled={count === 0}
        >
          Clear
        </button>
      </div>

      <p className="network-source">
        <span className="network-source__label">Source:</span> <strong>{source.name}</strong>
        {source.detail && <span className="meta">, {source.detail}</span>}
      </p>

      {count === 0 ? (
        <p className="meta network-empty">
          No requests yet. Each request your code sends to {source.name} appears here and updates as
          it moves from pending to its result.
        </p>
      ) : (
        <div className="network-scroll" ref={scroller} onScroll={onScroll}>
          <table className="network-table">
            <caption className="visually-hidden">
              Requests made by this run, oldest first. Press Enter on a row to show the line that
              made the request.
            </caption>
            <thead>
              <tr>
                <th scope="col">Method</th>
                <th scope="col">URL</th>
                <th scope="col">State</th>
                <th scope="col">Status</th>
                <th scope="col">Time</th>
                <th scope="col" className="network-col-body">
                  Body
                </th>
                <th scope="col">
                  <span className="visually-hidden">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const open = expanded.has(request.id);
                const where = request.calledFrom
                  ? `, called from ${request.calledFrom.file} line ${request.calledFrom.line}`
                  : "";
                return (
                  <Fragment key={request.id}>
                    <tr
                      className={`network-row network-row--${request.state}${request.calledFrom ? " network-row--linked" : ""}`}
                      tabIndex={0}
                      aria-label={`${request.method} ${request.url}, ${stateLabel(request.state)}${badgeText(request)}${where}`}
                      onClick={() => jump(request)}
                      onKeyDown={(event) => onRowKeyDown(event, request)}
                    >
                      <td className="network-method">{request.method}</td>
                      <td className="network-url" title={request.url}>
                        {breakable(shortUrl(request))}
                      </td>
                      <td className="network-state">
                        <span className={`state-badge state-badge--${request.state}`}>
                          {stateLabel(request.state)}
                        </span>
                        <RequestBadges stale={request.stale} duplicateOf={request.duplicateOf} />
                      </td>
                      <td className="network-number network-status">
                        {request.status ?? <span className="network-none">no status</span>}
                      </td>
                      <td className="network-number network-time">
                        {formatDuration(request.duration)}
                      </td>
                      <td className="network-col-body">
                        <span className="network-preview">{request.bodyPreview ?? ""}</span>
                      </td>
                      <td className="network-toggle-cell">
                        <button
                          type="button"
                          className="network-toggle"
                          aria-expanded={open}
                          aria-controls={`${id}-${request.id}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggle(request.id);
                          }}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <svg
                            className="network-toggle__icon"
                            viewBox="0 0 16 16"
                            width="16"
                            height="16"
                            aria-hidden="true"
                          >
                            <path
                              d="M6 3.5 10.5 8 6 12.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="visually-hidden">Details for {shortUrl(request)}</span>
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr className="network-detail-row" id={`${id}-${request.id}`}>
                        <td colSpan={7}>
                          <RequestDetail request={request} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {failedCustom && (
        <p className="network-note" role="note">
          A request to your custom server ended as a network error. If the console mentions CORS,
          the server answered but did not send an <code>Access-Control-Allow-Origin</code> header
          that allows this site, so the browser kept the response from your code. If it does not,
          check that the base URL is right and the server is running.
        </p>
      )}
      {failedPreset && (
        <p className="network-note" role="note">
          A request to {source.name} ended as a network error. Public servers are sometimes slow,
          rate limited, or down; try again in a moment, or switch the source to Fixtures.
        </p>
      )}

      {preset && <PresetCard preset={preset} />}
      {apiSource?.kind === "custom" && <CorsCard />}
    </section>
  );
}
