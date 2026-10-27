export default async function check({ document }) {
  const cards = [...document.querySelectorAll("#results .book-card")];
  const titles = cards.map((card) => card.querySelector("h3")?.textContent);
  const metas = cards.map((card) => card.querySelector(".book-meta")?.textContent);
  const message = document.querySelector("#message")?.textContent.trim();
  return [
    {
      id: "three-cards",
      title: "One card per sample book",
      pass: cards.length === 3,
      hint: `The results region holds ${cards.length} .book-card element(s). renderBooks should create an article.book-card for each book and append it to results.`
    },
    {
      id: "cards-have-parts",
      title: "Each card shows the title and the author line",
      pass:
        titles.join("|") === "Learning JavaScript|Accessible Interfaces|CSS Layout Notebook" &&
        metas.join("|") === "Alex Rivera, 2024|Jordan Lee, 2023|Sam Patel, 2025",
      hint: "Each card should contain an h3 with the title and a p.book-meta with the author, a comma, and the year."
    },
    {
      id: "message-counts",
      title: "The status line counts the books",
      pass: message === "3 books shown.",
      hint: `The status line reads "${message}" but should read "3 books shown.". Set message.textContent at the end of renderBooks.`
    }
  ];
}
