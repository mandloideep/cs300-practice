function guardSubmits(document) {
  const guard = (event) => {
    if (!event.defaultPrevented) event.preventDefault();
  };
  document.addEventListener("submit", guard);
  return () => document.removeEventListener("submit", guard);
}

export default async function check({ document, network, wait }) {
  const form = document.querySelector("#search-form");
  const input = document.querySelector("#query");
  const searchRequests = () =>
    network.filter((request) => {
      try {
        return new URL(request.url).pathname.endsWith("/search.json");
      } catch {
        return false;
      }
    });
  const release = guardSubmits(document);

  const before = searchRequests().length;
  input.value = "javascript";
  form?.requestSubmit();
  for (
    let elapsed = 0;
    elapsed < 10000 && (searchRequests().length === before || searchRequests().some((request) => request.state === "pending"));
    elapsed += 100
  ) {
    await wait(100);
  }
  await wait(100);
  input.value = "";
  release();

  const latest = searchRequests().at(-1);
  const onFixtures = latest?.source === "fixtures";
  const cards = [...document.querySelectorAll("#results .book-card")];
  const titles = cards.map((card) => card.querySelector("h3")?.textContent);
  const metas = cards.map((card) => card.querySelector(".book-meta")?.textContent ?? "");
  const noMarkupLeaked = document.querySelectorAll("#results strong").length === 0;
  const noUndefined = metas.every((meta) => !meta.includes("undefined"));
  const thirdNormalized =
    !onFixtures ||
    (titles[2] === "<strong>CSS & Layout</strong>" && metas[2].includes("Unknown author") && metas[2].includes("Year unavailable"));

  return [
    {
      id: "request-uses-api-base",
      title: "A search sends one request to /search.json through import.meta.env.API_BASE",
      pass: latest !== undefined && latest.source !== "other" && latest.url.includes("q=javascript"),
      hint:
        latest === undefined
          ? "No request to /search.json was made. requestBooks should fetch import.meta.env.API_BASE + \"/search.json?q=\" + encodeURIComponent(query) and the submit handler should await it."
          : "The request goes to a fixed address instead of the chosen API source. Start the URL with import.meta.env.API_BASE."
    },
    {
      id: "three-cards-from-the-response",
      title: "The response renders as cards with no leaked markup",
      pass: latest?.state === "ok" && cards.length > 0 && (!onFixtures || cards.length === 3) && noMarkupLeaked,
      hint: `The request ended ${latest?.state ?? "without being made"} and the page shows ${cards.length} card(s). Return the normalized books from requestBooks and pass them to renderBooks; every title must go through escapeHTML.`
    },
    {
      id: "records-are-normalized",
      title: "Records are normalized to id, title, author, and year with fallbacks",
      pass: noUndefined && thirdNormalized,
      hint: "Map each record to { id: key, title, author, year }, with \"Unknown author\" when author_name is missing and \"Year unavailable\" when first_publish_year is not an integer."
    }
  ];
}
