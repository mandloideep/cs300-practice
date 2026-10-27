function guardSubmits(document) {
  const guard = (event) => {
    if (!event.defaultPrevented) event.preventDefault();
  };
  document.addEventListener("submit", guard);
  return () => document.removeEventListener("submit", guard);
}

export default async function check({ document, wait }) {
  const form = document.querySelector("#search-form");
  const input = document.querySelector("#query");
  const cards = () => [...document.querySelectorAll("#results .book-card")];
  const message = () => document.querySelector("#message")?.textContent.trim();
  const release = guardSubmits(document);

  input.value = "css";
  form?.requestSubmit();
  await wait(50);
  const cssCards = cards().map((card) => card.querySelector("h3")?.textContent);
  const cssMessage = message();

  input.value = "   ";
  form?.requestSubmit();
  await wait(50);
  const emptyMessage = message();
  const focused = document.activeElement === input;

  input.value = "a";
  form?.requestSubmit();
  await wait(50);
  input.value = "";
  release();

  return [
    {
      id: "search-filters",
      title: "Searching for css shows only the CSS book",
      pass: cssCards.length === 1 && cssCards[0] === "CSS Layout Notebook" && cssMessage === "1 books shown.",
      hint: `After searching for css the page shows ${cssCards.length} card(s) and the status reads "${cssMessage}". Filter sampleBooks by title, ignoring case, and call renderBooks with the matches.`
    },
    {
      id: "empty-query-refused",
      title: "An empty query asks for a title and focuses the field",
      pass: emptyMessage === "Enter a title or topic first." && focused,
      hint: `After submitting spaces the status reads "${emptyMessage}". Trim the FormData value, write the message, focus #query, and return before filtering.`
    }
  ];
}
