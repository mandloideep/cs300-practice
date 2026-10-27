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
  const message = () => document.querySelector("#message")?.textContent.trim();
  const buttons = () => [...document.querySelectorAll("#results button[data-action='bookmark']")];
  const searchRequests = () =>
    network.filter((request) => {
      try {
        return new URL(request.url).pathname.endsWith("/search.json");
      } catch {
        return false;
      }
    });
  const release = guardSubmits(document);

  const initialMessage = message();
  input.value = "  ";
  form?.requestSubmit();
  await wait(50);
  const emptyMessage = message();

  const before = searchRequests().length;
  input.value = "javascript";
  form?.requestSubmit();
  const loadingMessage = message();
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
  const afterSearch = message();
  const searchShown =
    (latest?.state === "ok" && cards > 0 && afterSearch === `${cards} books found.`) ||
    (latest?.state === "ok" && cards === 0 && afterSearch === "No books found. Try another search.") ||
    (latest !== undefined && latest.state !== "ok" && afterSearch === "We could not load books. Check the API source or the connection, then try again.");

  const first = buttons()[0];
  const id = first?.dataset.id;
  first?.click();
  await wait(50);
  const pressed = buttons().find((button) => button.dataset.id === id)?.getAttribute("aria-pressed") === "true";
  buttons().find((button) => button.dataset.id === id)?.click();
  await wait(50);
  const released = buttons().find((button) => button.dataset.id === id)?.getAttribute("aria-pressed") === "false";

  return [
    {
      id: "initial-render-from-state",
      title: "The first render and the empty query come from state",
      pass: initialMessage === "Search for books to get started." && emptyMessage === "Enter a title or topic first.",
      hint: `On load the message reads "${initialMessage}" and after an empty submit "${emptyMessage}". render() should write messages[state.status], and the empty case should call setState with status error and the sentence.`
    },
    {
      id: "search-through-state",
      title: "A search moves the status through loading to its outcome",
      pass: loadingMessage === "Searching..." && searchShown,
      hint: `Right after the submit the message reads "${loadingMessage}" and afterwards "${afterSearch}". searchBooks should call setState with status loading first, then success, empty, or error.`
    },
    {
      id: "bookmark-through-state",
      title: "A bookmark click updates state.bookmarks and re-renders",
      pass: cards > 0 && pressed && released,
      hint: "The click handler should find the book in state.books, build a new bookmarks array, save it, and call setState({ bookmarks })."
    }
  ];
}
