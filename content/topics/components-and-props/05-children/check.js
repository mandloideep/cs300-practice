export default async function check({ document, inspector }) {
  const named = (name) => inspector.components.filter((component) => component.name === name);
  const cards = [...document.querySelectorAll("article.card")];
  const advising = cards.find((card) => card.querySelector("h2")?.textContent.trim() === "Not sure where to start?");
  return [
    {
      id: "card-shell-used",
      title: "Every course is drawn through the Card shell",
      pass: named("CourseCard").length === 4 && named("Card").length >= 4,
      hint: `The inspector sees ${named("Card").length} Card components. Replace the article tags inside CourseCard with <Card> and </Card>.`
    },
    {
      id: "five-cards",
      title: "Five boxes render with the card style",
      pass: cards.length === 5 && named("Card").length === 5,
      hint: `The page shows ${cards.length} article.card elements. Add a <Card> after the last CourseCard for the advising note.`
    },
    {
      id: "advising-card-content",
      title: "The advising note is placed inside a Card",
      pass: Boolean(advising && /advisor/i.test(advising.querySelector("p")?.textContent ?? "")),
      hint: "Write the h2 and the paragraph between <Card> and </Card>, and make sure Card renders {children} inside its article."
    }
  ];
}
