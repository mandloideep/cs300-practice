export default async function check({ document }) {
  const items = [...document.querySelectorAll("#project-list li")];
  const placeholder = document.querySelector("#placeholder");
  const titles = items.map((item) => item.querySelector(".title")?.textContent);
  const categories = items.map((item) => item.querySelector(".category")?.textContent);
  const status = document.querySelector("#status")?.textContent.trim();
  return [
    {
      id: "placeholder-removed",
      title: "The placeholder item is removed",
      pass: placeholder === null,
      hint: "The list still holds the placeholder. Select #placeholder and call remove() on it before the loop."
    },
    {
      id: "one-item-per-project",
      title: "One li per project, and the status line counts them",
      pass: items.length === 3 && status === "3 projects on the page.",
      hint: `The list has ${items.length} item(s) and the status reads "${status}". The loop should append one li per project and the last line should write the count.`
    },
    {
      id: "items-have-parts",
      title: "Each item has a title span, a category span, and the done class when finished",
      pass:
        titles.join("|") === "Profile card|Landing page|Reading list" &&
        categories.join("|") === "HTML|CSS|JavaScript" &&
        items[0]?.classList.contains("done") === true &&
        items[1]?.classList.contains("done") === false,
      hint: "Each li should contain a span.title and a span.category appended in that order, and classList.toggle(\"done\", project.done) should mark only the first project."
    }
  ];
}
