export default async function check({ document }) {
  const cards = [...document.querySelectorAll("#results .book-card")];
  const numbers = cards.map((card) => card.querySelector(".book-number")?.textContent.trim());
  const titles = cards.map((card) => card.querySelector("h3")?.textContent);
  const message = document.querySelector("#message")?.textContent.trim();
  return [
    {
      id: "three-numbered-cards",
      title: "Three cards, numbered 1 to 3",
      pass: cards.length === 3 && numbers.join("|") === "1|2|3",
      hint: `The results region holds ${cards.length} card(s) numbered ${numbers.join(", ") || "nothing"}. bookCard should return the markup with a p.book-number, and bookList should pass index + 1 as the number.`
    },
    {
      id: "titles-are-text",
      title: "Each card has its title as text in an h3",
      pass: titles.join("|") === "Learning JavaScript|Accessible Interfaces|CSS Layout Notebook",
      hint: "bookList should map every book through bookCard and join the strings with join(\"\"), and renderBooks should assign that string to results.innerHTML."
    },
    {
      id: "message-counts",
      title: "The status line still counts the books",
      pass: message === "3 books shown.",
      hint: `The status line reads "${message}" but should read "3 books shown.".`
    }
  ];
}
