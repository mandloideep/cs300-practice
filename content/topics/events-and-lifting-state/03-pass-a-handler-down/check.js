export default async function check({ document, inspector, wait }) {
  const byName = (name) => inspector.components.find((component) => component.name === name);
  const app = byName("App");
  const filter = byName("CategoryFilter");
  const buttons = () => [...document.querySelectorAll(".filter button")];
  const byLabel = (label) => buttons().find((button) => button.textContent.trim() === label);
  const pressedLabel = () => buttons().find((button) => button.getAttribute("aria-pressed") === "true")?.textContent.trim() ?? null;
  const cards = () => [...document.querySelectorAll(".product")];

  const startLabel = pressedLabel();
  byLabel("Beauty")?.click();
  await wait(50);
  const beautyPressed = pressedLabel();
  const beautyCards = cards();
  const beautyMeta = beautyCards.map((card) => card.querySelector(".product-meta")?.textContent.trim());
  byLabel(startLabel ?? "All")?.click();
  await wait(50);
  const restored = pressedLabel();

  const onSelect = filter?.props.onSelect;
  return [
    {
      id: "handler-passed-down",
      title: "App keeps the state and passes onSelect to CategoryFilter",
      pass: app?.state.length === 1 && filter?.state.length === 0 && typeof onSelect === "string" && onSelect.startsWith("[Function"),
      hint:
        typeof onSelect !== "string"
          ? "CategoryFilter has no onSelect prop. Write handleSelect in App and pass it with onSelect={handleSelect}."
          : "The state should stay in App, with CategoryFilter holding none; the child calls onSelect and lets App call setCategory."
    },
    {
      id: "click-filters-list",
      title: "Pressing Beauty filters the list to the two beauty products",
      pass: beautyPressed === "Beauty" && beautyCards.length === 2 && beautyMeta.every((meta) => meta === "beauty") && restored === (startLabel ?? "All"),
      hint:
        beautyPressed !== "Beauty"
          ? `After the click the pressed button is ${beautyPressed ?? "none"}. The button's onClick should call onSelect(option.id), and handleSelect in App should call setCategory with that value.`
          : `With Beauty pressed the list shows ${beautyCards.length} products (${beautyMeta.join(", ") || "none"}). ProductList should filter its items by the category prop.`
    }
  ];
}
