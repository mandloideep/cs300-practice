const pattern = /^Added to the cart: (.+)$/;

export default async function check({ document, console, wait }) {
  const added = () => console.filter((entry) => pattern.test(entry.text));
  const titleOf = (entry) => pattern.exec(entry.text)[1];
  const cards = [...document.querySelectorAll(".product")];
  const first = added()[0];
  const burst = first ? added().filter((entry) => entry.time - first.time < 200) : [];
  const burstTitles = new Set(burst.map(titleOf));
  const loggedDuringRender = cards.length > 1 && burstTitles.size >= cards.length;

  const card = cards[0];
  const title = card?.querySelector("h3")?.textContent.trim();
  const before = added().length;
  card?.querySelector("button")?.click();
  await wait(50);
  const fresh = added().slice(before);

  return [
    {
      id: "handler-not-called-during-render",
      title: "Rendering a card logs nothing",
      pass: !loggedDuringRender,
      hint: `The console got a message for every product within a few milliseconds of the first render, before anyone clicked. onClick={handleAdd()} calls the function while React renders the card; pass the function itself with onClick={handleAdd}.`
    },
    {
      id: "click-logs-once",
      title: "One click logs one message naming the product",
      pass: fresh.length === 1 && titleOf(fresh[0]) === title,
      hint:
        fresh.length === 0
          ? "Clicking Add to cart logged nothing. Define handleAdd inside ProductCard and attach it with onClick={handleAdd}, without parentheses."
          : fresh.length > 1
            ? `One click logged ${fresh.length} messages; the handler should log exactly once per click.`
            : `The click on ${title} logged "${fresh[0].text}". The message should name the product on the card that was clicked, so read product.title inside the handler.`
    },
    {
      id: "button-per-card",
      title: "Every card keeps its Add to cart button",
      pass: cards.length === 6 && cards.every((item) => /Add to cart/.test(item.querySelector("button")?.textContent ?? "")),
      hint: "Each ProductCard renders one button that reads Add to cart."
    }
  ];
}
