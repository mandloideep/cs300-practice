const pattern = /^Rendering (.+) with quantity (\d+)$/;

function countIn(card) {
  const match = /In cart: (\d+)/.exec(card?.textContent ?? "");
  return match ? Number(match[1]) : null;
}

function buttonIn(card, label) {
  return [...(card?.querySelectorAll("button") ?? [])].find((button) => button.textContent.includes(label));
}

export default async function check({ document, console, wait }) {
  const logs = () => console.filter((entry) => pattern.test(entry.text));
  const cards = [...document.querySelectorAll(".product")];
  const card = cards[0];
  const title = card?.querySelector("h3")?.textContent.trim();

  const before = logs().length;
  const quantityBefore = countIn(card);
  buttonIn(card, "Add to cart")?.click();
  await wait(50);
  const fresh = logs().slice(before);
  const quantityAfterAdd = countIn(card);
  buttonIn(card, "Remove one")?.click();
  await wait(50);
  const quantityAfterRemove = countIn(card);

  const others = [...new Set(fresh.map((entry) => pattern.exec(entry.text)[1]).filter((name) => name !== title))];
  const loggedQuantity = fresh.length > 0 ? Number(pattern.exec(fresh.at(-1).text)[2]) : null;
  const zeroCard = cards.find((item) => countIn(item) === 0);
  const disabledAtZero = zeroCard ? Boolean(buttonIn(zeroCard, "Remove one")?.disabled) : true;

  return [
    {
      id: "only-clicked-card-renders",
      title: "After a click, only the clicked card logs a render",
      pass: fresh.length > 0 && others.length === 0,
      hint:
        fresh.length === 0
          ? 'Clicking Add to cart logged no Rendering line. Add console.log("Rendering", product.title, "with quantity", quantity) right after the useState line in ProductCard.'
          : `One click on ${title} also logged renders for ${others.join(", ")}. Each card owns its quantity, so setQuantity should re-run only that card; keep useState inside ProductCard.`
    },
    {
      id: "render-sees-new-value",
      title: "The new render logs the new quantity",
      pass: quantityBefore !== null && quantityAfterAdd === quantityBefore + 1 && loggedQuantity === quantityAfterAdd,
      hint:
        loggedQuantity === null
          ? "No Rendering line was logged after the click, so there is no quantity to compare. Add the console.log line first."
          : `The card went from ${quantityBefore} to ${quantityAfterAdd} and the last Rendering line says ${loggedQuantity}. After setQuantity(quantity + 1), the next call of ProductCard should get the new value from useState.`
    },
    {
      id: "remove-one",
      title: "Remove one lowers the quantity and is disabled at zero",
      pass: quantityAfterRemove === quantityBefore && disabledAtZero,
      hint:
        quantityAfterRemove !== quantityBefore
          ? `After Add to cart and Remove one, the card reads ${quantityAfterRemove} instead of ${quantityBefore}. handleRemove should call setQuantity(quantity - 1).`
          : "A card at 0 still has an enabled Remove one button. Give that button disabled={quantity === 0}."
    }
  ];
}
