const expected = [
  { title: "Programming II", level: "foundation" },
  { title: "Client-Side Web Development", level: "advanced" },
  { title: "Database Systems", level: "advanced" }
];

export default async function check({ document, inspector }) {
  const courseCards = inspector.components.filter((component) => component.name === "CourseCard");
  const headings = [...document.querySelectorAll("article.card h2")].map((heading) => heading.textContent.trim());
  const levels = [...document.querySelectorAll("article.card p")].map((line) => line.textContent.trim());
  return [
    {
      id: "three-course-cards",
      title: "All three cards are CourseCard components",
      pass: courseCards.length === 3 && document.querySelectorAll("article.card").length === 3,
      hint: `The inspector sees ${courseCards.length} CourseCard components. Replace each remaining article line in App with a <CourseCard /> tag.`
    },
    {
      id: "titles-in-order",
      title: "Each card shows its own title and level",
      pass:
        headings.join("|") === expected.map((course) => course.title).join("|") &&
        levels.join("|") === expected.map((course) => `Level: ${course.level}`).join("|"),
      hint: "The cards should read Programming II (foundation), Client-Side Web Development (advanced), and Database Systems (advanced), in that order. Check that CourseCard uses {title} and {level} instead of fixed text."
    },
    {
      id: "props-reach-cards",
      title: "CourseCard receives title and level as props",
      pass:
        courseCards.length === 3 &&
        courseCards.every((card, index) => card.props.title === expected[index].title && card.props.level === expected[index].level),
      hint: "Select a CourseCard in the inspector tree and read its props. Each tag in App needs title=\"...\" and level=\"...\" attributes."
    }
  ];
}
