export default async function check({ document, inspector }) {
  const courseCards = inspector.components.filter((component) => component.name === "CourseCard");
  const cards = [...document.querySelectorAll("article.card")];
  return [
    {
      id: "one-course-card",
      title: "The first card is drawn by a CourseCard component",
      pass: courseCards.length === 1,
      hint:
        courseCards.length === 0
          ? "The inspector does not see a CourseCard yet. Declare function CourseCard above App and replace the first article line with <CourseCard />."
          : `The inspector sees ${courseCards.length} CourseCard components. For this step, replace only the first article; the other two stay as markup until Step 2.`
    },
    {
      id: "three-cards-render",
      title: "Three course cards still render",
      pass: cards.length === 3,
      hint: `The page shows ${cards.length} article.card elements. A refactor should not change the page; check that each card line is either an article or a CourseCard tag, not both.`
    },
    {
      id: "cards-have-headings",
      title: "Every card keeps its heading and level",
      pass: cards.length > 0 && cards.every((card) => card.querySelector("h2") && /Level:/.test(card.textContent)),
      hint: "Each card needs an h2 heading and a Level line. Compare the JSX inside CourseCard with one of the original article lines."
    }
  ];
}
