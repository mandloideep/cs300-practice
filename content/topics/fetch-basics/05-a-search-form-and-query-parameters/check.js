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
  const settle = async (before) => {
    for (
      let elapsed = 0;
      elapsed < 8000 && (searchRequests().length === before || searchRequests().some((request) => request.state === "pending"));
      elapsed += 100
    ) {
      await wait(100);
    }
    await wait(50);
  };

  const countAtStart = searchRequests().length;
  input.value = "   ";
  form?.requestSubmit();
  await wait(100);
  const emptyRefused = searchRequests().length === countAtStart && status() === "Type something to search for.";

  input.value = "mac & cheese";
  form?.requestSubmit();
  await settle(countAtStart);
  const latest = searchRequests().at(-1);
  const encoded = latest !== undefined && latest.url.includes("q=mac%20%26%20cheese");
  const items = document.querySelectorAll("#products li").length;
  const outcome = status();
  const goodOutcome =
    latest?.state === "ok" &&
    ((items > 0 && outcome === `${items} products loaded.`) || (items === 0 && outcome === 'No products match "mac & cheese".'));
  release();

  return [
    {
      id: "query-is-encoded",
      title: "The search URL carries the query through encodeURIComponent",
      pass: encoded,
      hint:
        latest === undefined
          ? "No request to /products/search was made. Build the URL from import.meta.env.API_BASE, /products/search, and the encoded query."
          : `The request URL was ${latest.url}; the query should appear as q=mac%20%26%20cheese. Wrap the query in encodeURIComponent.`
    },
    {
      id: "empty-query-refused",
      title: "An empty query is refused before any request",
      pass: emptyRefused,
      hint: 'Submitting spaces should make no request and set the status to "Type something to search for.". Trim the FormData value and return early when it is empty.'
    },
    {
      id: "results-or-empty-message",
      title: "The answer renders as products or as a no match message",
      pass: goodOutcome,
      hint: `The request ended ${latest?.state ?? "without being made"}, the list has ${items} item(s), and the status reads "${outcome}". Pass data.products to renderProducts, or write No products match with the query when the array is empty.`
    }
  ];
}
