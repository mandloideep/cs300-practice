export default async function check({ document, inspector, wait }) {
  const filter = inspector.components.find((component) => component.name === "CategoryFilter");
  const buttons = () => [...document.querySelectorAll(".filter button")];
  const byLabel = (label) => buttons().find((button) => button.textContent.trim() === label);
  const pressedLabel = () => buttons().find((button) => button.getAttribute("aria-pressed") === "true")?.textContent.trim() ?? null;
  const cards = () => document.querySelectorAll(".product").length;

  const startLabel = pressedLabel();
  const cardsBefore = cards();
  byLabel("Beauty")?.click();
  await wait(50);
  const afterLabel = pressedLabel();
  const cardsAfter = cards();
  byLabel(startLabel ?? "All")?.click();
  await wait(50);

  return [
    {
      id: "filter-owns-state",
      title: "CategoryFilter holds the chosen category as state",
      pass: Boolean(filter) && filter.state.length === 1 && typeof filter.state[0].value === "string",
      hint: `The inspector sees ${filter ? filter.state.length : "no"} state value(s) on CategoryFilter. Add const [category, setCategory] = useState("all"); at the top of the component.`
    },
    {
      id: "pressed-follows-click",
      title: "Clicking a category marks that button as pressed",
      pass: startLabel !== null && afterLabel === "Beauty",
      hint:
        startLabel === null
          ? "No button has aria-pressed set to true. Give each button aria-pressed={category === option.id}."
          : `After clicking Beauty, the pressed button is ${afterLabel ?? "none"}. The button's onClick should be an arrow function that calls setCategory(option.id).`
    },
    {
      id: "list-ignores-the-filter",
      title: "The list still shows every product: the problem this topic solves",
      pass: cardsBefore === 6 && cardsAfter === 6,
      hint: `With Beauty pressed the list shows ${cardsAfter} products. In this step that stays at 6 on purpose: category lives inside CategoryFilter, where ProductList cannot read it. Step 2 moves it up to App.`
    }
  ];
}
