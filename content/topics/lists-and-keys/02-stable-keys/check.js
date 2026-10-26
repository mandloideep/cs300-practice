export default async function check({ document, console, wait }) {
  const keyWarnings = console.filter((entry) => /unique ["']?key["']? prop/i.test(entry.text));
  const rows = document.querySelectorAll(".product-list > li");
  const quantityOf = (title) => document.querySelector(`input[aria-label="Quantity of ${title}"]`);
  const button = document.querySelector(".controls button");

  let followed = false;
  let detail = "the order sheet did not render";
  const apple = quantityOf("Apple");
  if (apple && button) {
    apple.value = "3";
    button.click();
    await wait(50);
    const after = quantityOf("Apple");
    followed = after?.value === "3";
    const holder = [...document.querySelectorAll(".product-list input")].find((input) => input.value === "3");
    detail = followed ? "" : `after the reorder, Apple shows ${after?.value ?? "no input"} and the 3 sits next to ${holder?.getAttribute("aria-label")?.replace("Quantity of ", "") ?? "no product"}`;
    document.querySelectorAll(".product-list input").forEach((input) => {
      input.value = "0";
    });
    document.querySelector(".controls button")?.click();
    await wait(50);
  }

  return [
    {
      id: "six-rows",
      title: "Six rows, each with a quantity field",
      pass: rows.length === 6 && document.querySelectorAll(".product-list input").length === 6,
      hint: "Keep the li, the title, the price, and the number input inside the map callback."
    },
    {
      id: "no-key-warning",
      title: "No missing key warning in the console",
      pass: keyWarnings.length === 0,
      hint: 'React warned: Each child in a list should have a unique "key" prop. Add key={product.id} to the li that the map callback returns.'
    },
    {
      id: "quantity-follows-product",
      title: "A typed quantity stays with its product after reordering",
      pass: followed,
      hint: `The check typed 3 for Apple and changed the order; ${detail}. React is matching rows by position, so use the product's id as the key, not the array index.`
    }
  ];
}
