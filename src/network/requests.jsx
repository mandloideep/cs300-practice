import "./network.css";

// How a request record is shown, shared by the network pane and the flow view: state labels,
// the short form of a URL, and the "stale" and "duplicate" badges with their one-line
// explanations (docs/CONTRACTS.md section 4.3).

export const STATE_LABELS = {
  pending: "pending",
  ok: "ok",
  "http-error": "HTTP error",
  "network-error": "network error",
  "parse-error": "parse error",
  aborted: "aborted",
};

export function stateLabel(state) {
  return STATE_LABELS[state] ?? state;
}

// The path and query of a request's URL, with the host too when it is outside the chosen base.
export function shortUrl(request) {
  try {
    const url = new URL(request.url);
    const path = url.pathname + url.search;
    return request.source === "other" ? url.host + path : path;
  } catch {
    return request.url;
  }
}

export function staleExplanation() {
  return "A newer request from the same line finished first, so this response is out of date and overwrites a fresher result.";
}

export function duplicateExplanation(duplicateOf) {
  return `Started while an identical request from the same line (${duplicateOf}) was still pending, so the same data was requested twice.`;
}

// The text a row's accessible name adds for its badges, or an empty string.
export function badgeText({ stale, duplicateOf }) {
  const parts = [];
  if (stale) parts.push("stale");
  if (duplicateOf) parts.push(`duplicate of ${duplicateOf}`);
  return parts.length > 0 ? `, ${parts.join(", ")}` : "";
}

// "stale" and "duplicate" badges for a request, each with its explanation as a tooltip and as
// visually hidden text.
export default function RequestBadges({ stale, duplicateOf }) {
  if (!stale && !duplicateOf) return null;
  return (
    <>
      {stale && (
        <span className="state-badge state-badge--stale" title={staleExplanation()}>
          stale
          <span className="visually-hidden">: {staleExplanation()}</span>
        </span>
      )}
      {duplicateOf && (
        <span
          className="state-badge state-badge--duplicate"
          title={duplicateExplanation(duplicateOf)}
        >
          duplicate
          <span className="visually-hidden">: {duplicateExplanation(duplicateOf)}</span>
        </span>
      )}
    </>
  );
}
