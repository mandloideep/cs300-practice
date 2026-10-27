// Bridge fetch shim: the third part of the classic bridge script, installed before any workspace
// code runs. It wraps window.fetch so that every request, whatever its source, becomes a record
// in __LAB__.network and a `network` message to the parent on each state change
// (docs/CONTRACTS.md section 4.3), and it answers requests to https://fixtures.local from the
// step's fixtures with the latency, error, malformed body, and dropped connection controls.
//
// Records are updated in place, so check.js sees a request move from pending to settled.
// The base URL and the controls are read at call time, so a set-api message from the parent
// applies to the next request without re-running the workspace.
//
// Two mistakes are marked on the record, keyed on the line that called fetch (`calledFrom`):
// `duplicateOf` names an identical request from the same line that was still pending when this
// one started, and `stale` is set when a newer request from the same line delivered its result
// first, so this one's response is out of date. A request without a known `calledFrom` gets
// neither. With the inspector on, each start lands in the open flow trace as a `request` entry
// and each settle as a `response` entry (docs/CONTRACTS.md section 4.3).

"use strict";

const lab = globalThis.__LAB__;
const nativeFetch = window.fetch.bind(window);
const FIXTURES_ORIGIN = "https://fixtures.local";
const PREVIEW_LENGTH = 300;
const NULL_BODY_STATUSES = [101, 103, 204, 205, 304];
const STATUS_TEXT = {
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Content",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
};

let requestCount = 0;

function apiBase() {
  return String(lab.env.API_BASE ?? "").replace(/\/+$/, "");
}

// Absolute URLs pass through; anything else is joined to API_BASE, because the result iframe is
// an about:srcdoc document with no origin of its own to resolve against.
function resolveUrl(raw) {
  if (/^[a-z][a-z\d+.-]*:/i.test(raw)) return raw;
  const base = apiBase();
  if (!base) return raw;
  return `${base}/${raw.replace(/^\/+/, "")}`;
}

function sourceOf(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return "other";
  }
  if (parsed.origin === FIXTURES_ORIGIN) return "fixtures";
  const base = apiBase();
  if (!base || base.startsWith(FIXTURES_ORIGIN)) return "other";
  const within = url === base || url.startsWith(`${base}/`) || url.startsWith(`${base}?`);
  if (!within) return "other";
  return lab.env.API_SOURCE === "custom" ? "custom" : "preset";
}

// The first stack frame inside a workspace module: the line that called fetch.
function callSite() {
  const stack = new Error().stack ?? "";
  for (const match of stack.matchAll(/(blob:[^\s)]+?):(\d+):(\d+)/g)) {
    const file = lab.fileForUrl(match[1]);
    if (file && file !== "check.js") return { file, line: Number(match[2]) };
  }
  return null;
}

function publish(record) {
  lab.post({ type: "network", request: { ...record } });
}

// The abort signal of each pending request, so a request the workspace already cancelled does
// not count as pending for duplicate detection before its rejection has landed.
const signals = new WeakMap();

function sameSite(a, b) {
  return Boolean(a && b) && a.file === b.file && a.line === b.line;
}

// A pending request from the same line with the same method and URL, newest first.
function pendingTwin(record) {
  if (!record.calledFrom) return null;
  for (let i = lab.network.length - 1; i >= 0; i -= 1) {
    const other = lab.network[i];
    if (other === record || other.state !== "pending" || signals.get(other)?.aborted) continue;
    if (other.method !== record.method || other.url !== record.url) continue;
    if (sameSite(other.calledFrom, record.calledFrom)) return other;
  }
  return null;
}

// True when a request from the same line that started later has already delivered a result.
function isStale(record) {
  if (!record.calledFrom) return false;
  return lab.network.some(
    (other) =>
      other !== record &&
      other.startTime > record.startTime &&
      other.state !== "pending" &&
      other.state !== "aborted" &&
      sameSite(other.calledFrom, record.calledFrom),
  );
}

function finish(record, changes) {
  Object.assign(record, changes, { duration: Math.round(performance.now() - record.startTime) });
  if (record.state !== "aborted") record.stale = isStale(record);
  publish(record);
  lab.flow?.response({
    requestId: record.id,
    state: record.state,
    status: record.status,
    duration: record.duration,
    stale: record.stale,
    duplicateOf: record.duplicateOf,
  });
}

function abortReason(signal) {
  return signal.reason ?? new DOMException("The operation was aborted.", "AbortError");
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortReason(signal));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortReason(signal));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function matchRoute(method, pathname) {
  const segments = pathname.split("/");
  return (lab.fixtures?.routes ?? []).find((route) => {
    if (String(route.method ?? "GET").toUpperCase() !== method) return false;
    const pattern = String(route.path ?? "").split("/");
    if (pattern.length !== segments.length) return false;
    return pattern.every((part, index) =>
      part.startsWith(":") ? segments[index] !== "" : part === segments[index],
    );
  });
}

function contentTypeFor(name) {
  if (/\.json$/i.test(name)) return "application/json; charset=utf-8";
  if (/\.html?$/i.test(name)) return "text/html; charset=utf-8";
  if (/\.txt$/i.test(name)) return "text/plain; charset=utf-8";
  return "application/json; charset=utf-8";
}

function malformed(text) {
  let broken = text.slice(0, Math.max(1, Math.floor(text.length / 2)));
  try {
    JSON.parse(broken);
    broken += ",";
  } catch {
    // Already not valid JSON, which is the point.
  }
  return broken;
}

async function answerFromFixtures(method, url, signal) {
  const controls = lab.fixtureControls ?? {};
  const { pathname } = new URL(url);
  const route = matchRoute(method, pathname);
  const latency =
    Math.max(0, Number(controls.latencyMs) || 0) + Math.max(0, Number(route?.delay) || 0);
  await sleep(latency, signal);
  if (controls.dropConnection) throw new TypeError("Failed to fetch");

  let status = 404;
  let body = JSON.stringify({ error: `No fixture route for ${method} ${pathname}` });
  let contentType = "application/json; charset=utf-8";
  if (route) {
    status = Number(route.status ?? 200);
    if (typeof route.body === "string") {
      const text = lab.fixtures?.bodies?.[route.body];
      if (text === undefined) {
        status = 500;
        body = JSON.stringify({ error: `The fixture body file ${route.body} is missing` });
      } else {
        body = text;
        contentType = contentTypeFor(route.body);
      }
    } else {
      body = route.body === undefined ? "" : JSON.stringify(route.body);
    }
  }
  if (controls.errorStatus) {
    status = Number(controls.errorStatus);
    body = JSON.stringify({
      error: `The fixture controls answered ${status} ${STATUS_TEXT[status] ?? ""}`.trim(),
    });
    contentType = "application/json; charset=utf-8";
  }
  if (controls.malformedBody) {
    body = malformed(body);
    contentType = "application/json; charset=utf-8";
  }

  return new Response(NULL_BODY_STATUSES.includes(status) ? null : body, {
    status,
    statusText: STATUS_TEXT[status] ?? "",
    headers: { "Content-Type": contentType },
  });
}

// Reading the body takes a few tasks, so the open flow trace is held until it is done and the
// setter that follows `await response.json()` still lands in it.
function watchJson(record, response) {
  const readJson = response.json.bind(response);
  response.json = async function json() {
    const reading = readJson();
    lab.flow?.hold(reading);
    try {
      return await reading;
    } catch (error) {
      if (error?.name === "SyntaxError") {
        record.state = "parse-error";
        record.error = error.message;
        publish(record);
      }
      throw error;
    }
  };
}

async function preview(record, response) {
  try {
    const text = await response.clone().text();
    record.bodyPreview = text.slice(0, PREVIEW_LENGTH);
    publish(record);
  } catch {
    // The body could not be read twice, for example after an abort; the row keeps no preview.
  }
}

function shimmedFetch(input, init = {}) {
  const isRequest = input instanceof Request;
  const rawUrl = isRequest ? input.url : String(input);
  const url = resolveUrl(rawUrl);
  const method = String(init.method ?? (isRequest ? input.method : "GET")).toUpperCase();
  const signal = init.signal ?? (isRequest ? input.signal : undefined);
  const record = {
    id: `r${++requestCount}`,
    method,
    url,
    source: sourceOf(url),
    state: "pending",
    status: null,
    startTime: performance.now(),
    duration: null,
    bodyPreview: null,
    contentType: null,
    calledFrom: callSite(),
    error: null,
    stale: false,
    duplicateOf: null,
  };
  record.duplicateOf = pendingTwin(record)?.id ?? null;
  if (signal) signals.set(record, signal);
  lab.network.push(record);
  publish(record);
  lab.flow?.request({
    requestId: record.id,
    method,
    url,
    calledIn: lab.currentComponent?.() ?? null,
  });

  let answer;
  try {
    if (record.source === "fixtures") answer = answerFromFixtures(method, url, signal);
    else if (url === rawUrl) answer = nativeFetch(input, init);
    else answer = nativeFetch(isRequest ? new Request(url, input) : url, init);
  } catch (error) {
    answer = Promise.reject(error);
  }

  return answer.then(
    (response) => {
      finish(record, {
        state: response.ok ? "ok" : "http-error",
        status: response.status,
        contentType: response.headers.get("content-type"),
      });
      watchJson(record, response);
      preview(record, response);
      return response;
    },
    (error) => {
      const aborted = signal?.aborted || error?.name === "AbortError";
      finish(record, {
        state: aborted ? "aborted" : "network-error",
        error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      });
      throw error;
    },
  );
}

Object.defineProperty(window, "fetch", {
  value: function fetch(input, init) {
    return shimmedFetch(input, init);
  },
  writable: true,
  configurable: true,
});
