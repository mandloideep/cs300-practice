function guardSubmits(document) {
  const guard = (event) => {
    if (!event.defaultPrevented) event.preventDefault();
  };
  document.addEventListener("submit", guard);
  return () => document.removeEventListener("submit", guard);
}

export default async function check({ document, network, wait }) {
  const form = document.querySelector("#search-form");
  const input = document.querySelector("#q");
  const list = document.querySelector("#products");
  const status = () => document.querySelector("#status")?.textContent.trim();
  const release = guardSubmits(document);
  const searchRequests = () =>
    network.filter((request) => {
      try {
        return new URL(request.url).pathname.endsWith("/products/search");
      } catch {
        return false;
      }
    });

  const before = searchRequests().length;
  input.value = "phone";
  form?.requestSubmit();
  const busyRightAfter = list?.getAttribute("aria-busy");
  form?.requestSubmit();
  await wait(0);
  const requestsAfterTwoSubmits = searchRequests().length - before;
  for (
    let elapsed = 0;
    elapsed < 8000 && (searchRequests().length === before || searchRequests().some((request) => request.state === "pending"));
    elapsed += 100
  ) {
    await wait(100);
  }
  await wait(100);
  const busyAfter = list?.getAttribute("aria-busy");
  const latest = searchRequests().at(-1);
  const items = document.querySelectorAll("#products li").length;
  const outcome = status();
  release();
  const messageMatchesState =
    (latest?.state === "ok" && ((items > 0 && outcome === `${items} products loaded.`) || (items === 0 && outcome === 'No products match "phone".'))) ||
    (latest?.state === "http-error" && outcome === `Could not load products. The server answered with status ${latest.status}.`) ||
    (latest?.state === "parse-error" && outcome === "The server answered, but not with JSON this page can read.") ||
    (latest?.state === "network-error" && outcome === "Could not reach the server. Check the connection and the API source, then try again.");

  return [
    {
      id: "second-submit-is-ignored",
      title: "A second submit while a request is pending sends no second request",
      pass: requestsAfterTwoSubmits === 1,
      hint: `Two submits in a row made ${requestsAfterTwoSubmits} request(s). Keep a loading flag: return early when it is true, set it before the await, and clear it in finally.`
    },
    {
      id: "busy-flag-follows-the-request",
      title: "aria-busy on the list is true while the request is pending and false afterwards",
      pass: busyRightAfter === "true" && busyAfter === "false",
      hint: `Right after the submit aria-busy was ${busyRightAfter} and afterwards it was ${busyAfter}. Set it to "true" beside button.disabled = true and back to "false" in finally.`
    },
    {
      id: "failure-messages",
      title: "The status line matches the outcome of the request",
      pass: messageMatchesState,
      hint: `The request ended ${latest?.state ?? "without being made"} and the status reads "${outcome}". Write one sentence per kind of error with instanceof TypeError and instanceof SyntaxError, and keep the status sentence for an HTTP error.`
    }
  ];
}
