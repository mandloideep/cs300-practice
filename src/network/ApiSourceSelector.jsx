import { useId } from "react";

const ERROR_STATUSES = [
  { value: "", label: "None, answer normally" },
  { value: "400", label: "400 Bad Request" },
  { value: "401", label: "401 Unauthorized" },
  { value: "404", label: "404 Not Found" },
  { value: "429", label: "429 Too Many Requests" },
  { value: "500", label: "500 Internal Server Error" },
  { value: "503", label: "503 Service Unavailable" },
];

function encode(value) {
  if (!value) return "fixtures";
  if (value.kind === "preset") return `preset:${value.id}`;
  return value.kind;
}

export default function ApiSourceSelector({
  presets = [],
  value,
  onChange,
  fixturesAvailable,
  fixtureControls,
  onFixtureControlsChange,
}) {
  const id = useId();
  const selected = encode(value);
  const preset =
    value?.kind === "preset" ? presets.find((candidate) => candidate.id === value.id) : null;

  function choose(event) {
    const next = event.target.value;
    if (next === "fixtures") onChange({ kind: "fixtures" });
    else if (next === "custom") onChange({ kind: "custom" });
    else onChange({ kind: "preset", id: next.slice("preset:".length) });
  }

  function setControl(key, next) {
    onFixtureControlsChange({ ...fixtureControls, [key]: next });
  }

  return (
    <fieldset className="api-source">
      <legend>API source</legend>
      <div className="api-source__row">
        <label htmlFor={`${id}-source`}>Requests go to</label>
        <select id={`${id}-source`} value={selected} onChange={choose}>
          {fixturesAvailable && (
            <option value="fixtures">Fixtures (answered in the browser)</option>
          )}
          {presets.map((candidate) => (
            <option key={candidate.id} value={`preset:${candidate.id}`}>
              {candidate.title}
            </option>
          ))}
          <option value="custom">Custom base URL</option>
        </select>
      </div>

      {value?.kind === "custom" && (
        <div className="api-source__row">
          <label htmlFor={`${id}-custom`}>Base URL</label>
          <input
            id={`${id}-custom`}
            type="url"
            inputMode="url"
            placeholder="https://example.com/api"
            value={value.baseUrl ?? ""}
            onChange={(event) => onChange({ kind: "custom", baseUrl: event.target.value })}
            aria-describedby={`${id}-custom-help`}
          />
          <p id={`${id}-custom-help`} className="meta">
            Saved in this browser for this step. The server must send CORS headers that allow
            requests from this site, or the browser refuses the response.
          </p>
        </div>
      )}

      {preset && (
        <details className="api-source__card">
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
      )}

      {value?.kind === "fixtures" && fixturesAvailable && fixtureControls && (
        <div className="api-source__controls">
          <div className="api-source__row">
            <label htmlFor={`${id}-latency`}>Latency (ms)</label>
            <input
              id={`${id}-latency`}
              type="number"
              min="0"
              max="10000"
              step="100"
              value={fixtureControls.latencyMs}
              onChange={(event) =>
                setControl("latencyMs", Math.max(0, Number(event.target.value) || 0))
              }
            />
          </div>
          <div className="api-source__row">
            <label htmlFor={`${id}-status`}>HTTP error</label>
            <select
              id={`${id}-status`}
              value={fixtureControls.errorStatus ?? ""}
              onChange={(event) =>
                setControl("errorStatus", event.target.value ? Number(event.target.value) : null)
              }
            >
              {ERROR_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className="api-source__check">
            <input
              id={`${id}-malformed`}
              type="checkbox"
              checked={fixtureControls.malformedBody}
              onChange={(event) => setControl("malformedBody", event.target.checked)}
            />
            <label htmlFor={`${id}-malformed`}>Malformed body</label>
          </div>
          <div className="api-source__check">
            <input
              id={`${id}-drop`}
              type="checkbox"
              checked={fixtureControls.dropConnection}
              onChange={(event) => setControl("dropConnection", event.target.checked)}
            />
            <label htmlFor={`${id}-drop`}>Drop the connection</label>
          </div>
        </div>
      )}
    </fieldset>
  );
}
