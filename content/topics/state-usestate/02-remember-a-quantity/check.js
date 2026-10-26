function countIn(card) {
  const match = /In cart: (\d+)/.exec(card?.textContent ?? "");
  return match ? Number(match[1]) : null;
}

export default async function check({ document, inspector, wait }) {
  const cards = inspector.components.filter((component) => component.name === "ProductCard");
  const [first, second] = document.querySelectorAll(".product");
  const before = [countIn(first), countIn(second)];
  first?.querySelector("button")?.click();
  await wait(50);
  const after = [countIn(first), countIn(second)];

  return [
    {
      id: "card-has-state",
      title: "Each ProductCard holds one state value",
      pass: cards.length === 6 && cards.every((card) => card.state.length === 1 && typeof card.state[0].value === "number"),
      hint: `The inspector sees ${cards.length} ProductCard components with ${cards[0]?.state.length ?? 0} state value(s) each. Call useState(0) at the top of ProductCard and unpack it as const [quantity, setQuantity].`
    },
    {
      id: "click-adds-one",
      title: "A click raises that card's quantity by one",
      pass: before[0] !== null && after[0] === before[0] + 1,
      hint:
        before[0] === null
          ? "No card shows In cart: followed by a number. Render <p className=\"product-cart\">In cart: {quantity}</p> under the price."
          : `The first card read ${before[0]} before the click and ${after[0]} after it. The handler should call setQuantity(quantity + 1).`
    },
    {
      id: "cards-independent",
      title: "Other cards keep their own quantity",
      pass: before[1] !== null && after[1] === before[1],
      hint: "Clicking one card changed another. Each ProductCard must call useState itself, inside the component, so that every card has its own value."
    }
  ];
}
