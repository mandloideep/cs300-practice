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
  const button = form?.querySelector("button");
  const results = document.querySelector("#results");
  const message = () => document.querySelector("#message")?.textContent.trim();
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
  const messageRightAfter = message();
  const disabledRightAfter = button?.disabled === true;
  const busyRightAfter = results?.getAttribute("aria-busy") === "true";
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
  const cards = document.querySelectorAll("#results .book-card").length;
  const outcome = message();
  const outcomeShown =
    (latest?.state === "ok" && cards > 0 && outcome === `${cards} books found.`) ||
    (latest?.state === "ok" && cards === 0 && outcome === "No books found. Try another search.") ||
    (latest !== undefined && latest.state !== "ok" && outcome === "We could not load books. Check the API source or the connection, then try again.");

  return [
    {
      id: "loading-shows-first",
      title: "The loading state shows before the request settles",
      pass: messageRightAfter === "Searching..." && disabledRightAfter && busyRightAfter,
      hint: `Right after the submit the message reads "${messageRightAfter}", the button is ${disabledRightAfter ? "disabled" : "enabled"}, and aria-busy is ${busyRightAfter}. searchBooks should set all three before the await.`
    },
    {
      id: "outcome-is-shown",
      title: "The message matches the outcome of the request",
      pass: outcomeShown,
      hint: `The request ended ${latest?.state ?? "without being made"}, the page shows ${cards} card(s), and the message reads "${outcome}". Write the found, empty, and error sentences in searchBooks, and call it from the submit handler.`
    },
    {
      id: "controls-restored",
      title: "The button and the busy flag are restored afterwards",
      pass: button?.disabled === false && results?.getAttribute("aria-busy") === "false",
      hint: "Enable the button and set aria-busy back to false in a finally block so they are restored after success and failure alike."
    }
  ];
}
