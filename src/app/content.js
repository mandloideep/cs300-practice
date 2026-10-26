// Loads the compiled content written by scripts/build-content.mjs into public/content/.
// Every loader resolves (never rejects) to one of:
//   { status: "ok", data }
//   { status: "missing" }            the file does not exist yet, for example before the content build ran
//   { status: "error", message }     the file exists but could not be read or parsed
// Results are cached per URL so that React's `use()` receives a stable promise.

const contentBase = import.meta.env.BASE_URL + "content/";
const cache = new Map();

async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json" } });
  } catch (error) {
    return { status: "error", message: `Could not reach ${url}: ${error.message}` };
  }
  if (response.status === 404) {
    return { status: "missing" };
  }
  if (!response.ok) {
    return {
      status: "error",
      message: `${url} answered ${response.status} ${response.statusText}`,
    };
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    return { status: "missing" };
  }
  try {
    return { status: "ok", data: await response.json() };
  } catch (error) {
    return { status: "error", message: `${url} is not valid JSON: ${error.message}` };
  }
}

function load(path) {
  const url = contentBase + path;
  if (!cache.has(url)) {
    cache.set(url, fetchJson(url));
  }
  return cache.get(url);
}

export function loadIndex() {
  return load("index.json");
}

export function loadTopic(id) {
  return load(`topics/${encodeURIComponent(id)}.json`);
}
