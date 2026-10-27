function guardSubmits(document) {
  const guard = (event) => {
    if (!event.defaultPrevented) event.preventDefault();
  };
  document.addEventListener("submit", guard);
  return () => document.removeEventListener("submit", guard);
}

export default async function check({ document, wait }) {
  const form = document.querySelector("#add-form");
  const input = document.querySelector("#new-title");
  const filters = document.querySelector("#filters");
  const release = guardSubmits(document);
  const items = () => [...document.querySelectorAll("#project-list li")];
  const visibleTitles = () =>
    items()
      .filter((item) => !item.classList.contains("hidden"))
      .map((item) => item.querySelector(".title")?.textContent);

  const carryData = items().length > 0 && items().every((item) => item.dataset.id && item.dataset.category);

  input.value = "Landing page";
  form?.requestSubmit();
  await wait(50);
  const copies = () => items().filter((item) => item.querySelector(".title")?.textContent === "Landing page");
  const addedId = copies().at(-1)?.dataset.id;
  copies().at(-1)?.querySelector("button.remove")?.click();
  await wait(50);
  const remaining = copies();
  const removedTheRightOne = remaining.length === 1 && remaining[0].dataset.id !== addedId && items().length === 3;

  filters?.querySelector('[data-filter="CSS"]')?.click();
  await wait(50);
  const cssOnly = visibleTitles();
  const cssPressed = filters?.querySelector('[data-filter="CSS"]')?.getAttribute("aria-pressed");
  const allReleased = filters?.querySelector('[data-filter="all"]')?.getAttribute("aria-pressed");
  filters?.querySelector('[data-filter="all"]')?.click();
  await wait(50);
  const allVisible = visibleTitles().length;
  release();

  return [
    {
      id: "items-carry-data",
      title: "Every item carries data-id and data-category",
      pass: carryData,
      hint: "Set item.dataset.id and item.dataset.category right after the li is created in renderProjects."
    },
    {
      id: "remove-uses-the-id",
      title: "Remove finds the project by its id, not its title",
      pass: removedTheRightOne,
      hint:
        items().length !== 3
          ? "The check added a second Landing page and removed it; the list should be back to three items. Convert dataset.id with Number before comparing it with project.id."
          : "The original Landing page was removed instead of the copy. Compare Number(item.dataset.id) with project.id in findIndex."
    },
    {
      id: "filter-by-category",
      title: "The category buttons hide the items that do not match",
      pass: cssOnly.length === 1 && cssOnly[0] === "Landing page" && cssPressed === "true" && allReleased === "false" && allVisible === 3,
      hint: `Clicking CSS leaves ${cssOnly.length} item(s) visible and sets its aria-pressed to ${cssPressed}. One listener on #filters should toggle the hidden class from item.dataset.category and press only the clicked button.`
    }
  ];
}
