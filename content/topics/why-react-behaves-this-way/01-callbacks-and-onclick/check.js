export default async function check({ document, console, wait }) {
  const added = () =>
    console.filter((entry) => entry.level === "log" && entry.text.startsWith("Added to the cart:")).map((entry) => entry.text);
  const beforeAnyClick = added().length;
  const cards = [...document.querySelectorAll(".product")];
  const button = (card, label) =>
    [...(card?.querySelectorAll("button") ?? [])].find((candidate) => candidate.textContent.trim() === label);
  button(cards[0], "Add one")?.click();
  button(cards[1], "Add three")?.click();
  await wait(50);
  const after = added().slice(beforeAnyClick);

  return [
    {
      id: "nothing-before-a-click",
      title: "Nothing is added to the cart before a click",
      pass: beforeAnyClick === 0,
      hint: `The console showed ${beforeAnyClick} Added line(s) before any click. onClick must receive a function, so write onClick={() => handleAdd(1)}, not onClick={handleAdd(1)}.`
    },
    {
      id: "two-buttons-per-card",
      title: "Every card has an Add one and an Add three button",
      pass: cards.length === 3 && cards.every((card) => button(card, "Add one") && button(card, "Add three")),
      hint: "Replace the single button with a div className=\"cart-controls\" holding the two buttons."
    },
    {
      id: "each-click-passes-its-quantity",
      title: "Each click adds its own quantity of its own product",
      pass:
        after.length === 2 &&
        after[0] === "Added to the cart: 1 x Essence Mascara Lash Princess" &&
        after[1] === "Added to the cart: 3 x Apple",
      hint: `The checks clicked Add one on the first card and Add three on the second, and the console printed ${JSON.stringify(after)}. handleAdd should take quantity and log "Added to the cart:", quantity, "x", product.title.`
    }
  ];
}
