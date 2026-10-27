function type(element, text) {
  const isSelect = element instanceof HTMLSelectElement;
  const proto = isSelect ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(element, text);
  element.dispatchEvent(new Event(isSelect ? "change" : "input", { bubbles: true }));
}

async function addProduct(form, title, wait) {
  const field = (name) => form.querySelector(`[name="${name}"]`);
  type(field("title"), title);
  type(field("price"), "2.49");
  type(field("category"), "groceries");
  await wait(50);
  form.requestSubmit();
  await wait(50);
}

export default async function check({ document, wait }) {
  const form = document.querySelector(".add-form");
  const cards = () => [...document.querySelectorAll(".product")];
  const leadCount = () => Number.parseInt(document.querySelector(".lead")?.textContent ?? "", 10);
  const filterButton = (label) =>
    [...document.querySelectorAll(".filter button")].find((button) => button.textContent.trim() === label);

  filterButton("All")?.click();
  await wait(50);
  const before = cards().length;
  const leadBefore = leadCount();
  const title = `Kiwi ${before + 1}`;
  if (form) await addProduct(form, title, wait);
  const after = cards();
  const grew = after.length === before + 1;
  const lastTitle = after.at(-1)?.querySelector("h3")?.textContent.trim();
  const lastPrice = after.at(-1)?.querySelector(".product-price")?.textContent.trim();

  filterButton("Groceries")?.click();
  await wait(50);
  const groceries = cards().map((card) => card.querySelector("h3")?.textContent.trim());
  filterButton("All")?.click();
  await wait(50);

  return [
    {
      id: "list-grows",
      title: "Submitting the form adds a card to the list",
      pass: grew && lastTitle === title && lastPrice === "$2.49" && leadCount() === leadBefore + 1,
      hint:
        !grew
          ? `The check submitted ${title}, the form cleared, and the screen still shows ${before} cards with the lead at ${leadBefore}. items.push changes the array React already holds, so setItems(items) sees the same array and skips the render; call setItems([...items, product]).`
          : `The last card reads "${lastTitle}" at ${lastPrice} and the lead says ${leadCount()}. handleAdd should append the product it receives to a new array.`
    },
    {
      id: "new-product-filters",
      title: "The new product shows up under its category",
      pass: grew && groceries.includes(title),
      hint: !grew
        ? "The list did not grow when the product was added, so there is nothing to filter yet; fix the first check first."
        : `With Groceries chosen the list shows ${groceries.join(", ") || "nothing"}. The product should keep the category the form sent, so the filter finds it.`
    }
  ];
}
