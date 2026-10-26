export default async function check({ document, inspector }) {
  const cards = [...document.querySelectorAll("article.card")];
  const levelOf = (title) => {
    const card = cards.find((item) => item.querySelector("h2")?.textContent.trim() === title);
    return card ? card.querySelector("p")?.textContent.trim() : null;
  };
  const courseCards = inspector.components.filter((component) => component.name === "CourseCard");
  return [
    {
      id: "four-course-cards",
      title: "Four CourseCard components render",
      pass: courseCards.length === 4 && cards.length === 4,
      hint: `The page shows ${cards.length} cards. Keep the four CourseCard tags in App, including the Web Accessibility Workshop.`
    },
    {
      id: "default-level-shows",
      title: "The workshop card shows the default level",
      pass: levelOf("Web Accessibility Workshop") === "Level: all levels",
      hint: `The workshop card reads "${levelOf("Web Accessibility Workshop") ?? "nothing"}". Give level a default inside the parameter braces: { title, level = "all levels" }.`
    },
    {
      id: "passed-levels-win",
      title: "Cards that receive a level still show it",
      pass:
        levelOf("Programming II") === "Level: foundation" &&
        levelOf("Client-Side Web Development") === "Level: advanced" &&
        levelOf("Database Systems") === "Level: advanced",
      hint: "A default must only fill in a missing prop. If every card says all levels, the default is overwriting the prop instead of sitting in the parameter list."
    }
  ];
}
